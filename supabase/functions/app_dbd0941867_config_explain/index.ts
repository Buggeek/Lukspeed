import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  console.log(`[${requestId}] Config explain request started`);

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const key = url.searchParams.get('key');
    const user_id = url.searchParams.get('user_id');
    const bicycle_id = url.searchParams.get('bicycle_id');
    const fitting_id = url.searchParams.get('fitting_id');

    if (!key) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameter: key' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[${requestId}] Explaining config key: ${key}`);

    // Get resolved value using the resolve_config function
    const { data: resolvedValue, error: resolveError } = await supabase.rpc('resolve_config', {
      config_key: key,
      fitting_id_param: fitting_id || null,
      bicycle_id_param: bicycle_id || null,
      user_id_param: user_id || null
    });

    if (resolveError) {
      console.error(`[${requestId}] Error resolving config:`, resolveError);
      return new Response(
        JSON.stringify({ error: 'Failed to resolve configuration', details: resolveError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all configurations for this key to show precedence
    const { data: allConfigs, error: allConfigsError } = await supabase
      .from('system_config')
      .select('*')
      .eq('key', key)
      .order('created_at', { ascending: false });

    if (allConfigsError) {
      console.error(`[${requestId}] Error fetching all configs:`, allConfigsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch configuration details', details: allConfigsError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine which configuration is active based on precedence
    let activeConfig = null;
    const precedenceOrder = ['fitting', 'bicycle', 'user', 'global'];
    
    for (const scope of precedenceOrder) {
      const config = allConfigs?.find(c => {
        if (c.scope === scope) {
          switch (scope) {
            case 'fitting':
              return c.scope_id === fitting_id;
            case 'bicycle':
              return c.scope_id === bicycle_id;
            case 'user':
              return c.scope_id === user_id;
            case 'global':
              return c.scope_id === null;
            default:
              return false;
          }
        }
        return false;
      });
      
      if (config && config.value === resolvedValue) {
        activeConfig = config;
        break;
      }
    }

    // If no exact match found, try to find the global config
    if (!activeConfig) {
      activeConfig = allConfigs?.find(c => c.scope === 'global' && c.scope_id === null);
    }

    const response = {
      success: true,
      key: key,
      resolved_value: resolvedValue,
      parsed_value: parseValue(resolvedValue, activeConfig?.data_type),
      active_source: activeConfig ? {
        scope: activeConfig.scope,
        scope_id: activeConfig.scope_id,
        description: activeConfig.description,
        unit: activeConfig.unit,
        data_type: activeConfig.data_type
      } : null,
      all_configurations: allConfigs || [],
      precedence_order: precedenceOrder,
      context: {
        user_id: user_id || null,
        bicycle_id: bicycle_id || null,
        fitting_id: fitting_id || null
      },
      explanation: generateExplanation(key, resolvedValue, activeConfig, precedenceOrder),
      request_id: requestId
    };

    console.log(`[${requestId}] Config explanation completed for key: ${key}`);

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error(`[${requestId}] Config explain error:`, error);
    
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        request_id: requestId
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function parseValue(value: string, dataType?: string): any {
  try {
    switch (dataType) {
      case 'number':
        return parseFloat(value);
      case 'boolean':
        return value === 'true';
      case 'array':
        return JSON.parse(value);
      default:
        return value;
    }
  } catch {
    return value;
  }
}

function generateExplanation(key: string, value: string, activeConfig: any, precedenceOrder: string[]): string {
  let explanation = `Configuration key "${key}" resolves to "${value}"`;
  
  if (activeConfig) {
    explanation += ` from ${activeConfig.scope} scope`;
    if (activeConfig.description) {
      explanation += `. ${activeConfig.description}`;
    }
    if (activeConfig.unit) {
      explanation += ` (Unit: ${activeConfig.unit})`;
    }
  }
  
  explanation += `\n\nPrecedence order: ${precedenceOrder.join(' > ')}`;
  explanation += '\nThis means settings at fitting level override bicycle level, which overrides user level, which overrides global defaults.';
  
  return explanation;
}