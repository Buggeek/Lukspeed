import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ConfigExplanation {
  key: string;
  resolved_value: string;
  active_source?: {
    scope: string;
    scope_id?: string;
    description?: string;
    unit?: string;
    data_type: string;
  };
  explanation: string;
  precedence_order: string[];
  context: {
    user_id?: string;
    bicycle_id?: string;
    fitting_id?: string;
  };
  timestamp: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ConfigExplanation | { error: string; details?: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { key, user_id, bicycle_id, fitting_id } = req.query;
  
  if (!key || typeof key !== 'string') {
    return res.status(400).json({ error: 'key parameter is required and must be a string' });
  }
  
  try {
    // Obtener configuración con fuente usando la función PostgreSQL
    const { data: configWithSource, error: sourceError } = await supabase.rpc(
      'get_config_with_source',
      {
        config_key: key,
        fitting_id_param: fitting_id as string || null,
        bicycle_id_param: bicycle_id as string || null,
        user_id_param: user_id as string || null
      }
    );
    
    if (sourceError) {
      throw sourceError;
    }
    
    if (!configWithSource || configWithSource.length === 0) {
      return res.status(404).json({ 
        error: 'Configuration not found',
        details: `No configuration found for key: ${key}`
      });
    }
    
    const config = configWithSource[0];
    
    // Obtener todas las configuraciones para esta key para análisis completo
    const { data: allConfigs, error: configError } = await supabase
      .from('system_config')
      .select('*')
      .eq('key', key)
      .order('created_at', { ascending: true });
    
    if (configError) {
      throw configError;
    }
    
    // Generar explicación detallada
    const explanation = generateExplanation(key, config, allConfigs || []);
    
    const response: ConfigExplanation = {
      key,
      resolved_value: config.resolved_value,
      active_source: {
        scope: config.active_scope,
        scope_id: config.active_scope_id,
        description: config.description,
        unit: config.unit,
        data_type: config.data_type
      },
      explanation,
      precedence_order: ['fitting', 'bicycle', 'user', 'global'],
      context: {
        user_id: user_id as string,
        bicycle_id: bicycle_id as string,
        fitting_id: fitting_id as string
      },
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Error explaining config:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function generateExplanation(
  key: string,
  activeConfig: Record<string, unknown>,
  allConfigs: Record<string, unknown>[]
): string {
  const scopeDescriptions = {
    fitting: 'configuración específica del fitting activo',
    bicycle: 'configuración específica de la bicicleta',
    user: 'configuración personalizada del usuario',
    global: 'configuración global del sistema'
  };
  
  const activeScope = activeConfig.active_scope;
  const activeValue = activeConfig.resolved_value;
  const unit = activeConfig.unit ? ` ${activeConfig.unit}` : '';
  
  let explanation = `La configuración "${key}" tiene un valor de "${activeValue}${unit}".`;
  
  explanation += `\n\nEste valor proviene de la ${scopeDescriptions[activeScope as keyof typeof scopeDescriptions] || 'fuente desconocida'}.`;
  
  if (activeConfig.description) {
    explanation += `\n\nDescripción: ${activeConfig.description}`;
  }
  
  // Análizar precedencia y configuraciones disponibles
  const configsByScope = allConfigs.reduce((acc, config) => {
    acc[config.scope] = acc[config.scope] || [];
    acc[config.scope].push(config);
    return acc;
  }, {} as Record<string, any[]>);
  
  const precedenceOrder = ['fitting', 'bicycle', 'user', 'global'];
  const availableScopes = precedenceOrder.filter(scope => configsByScope[scope]);
  
  if (availableScopes.length > 1) {
    explanation += `\n\nConfiguración disponible en ${availableScopes.length} niveles:`;
    
    for (const scope of precedenceOrder) {
      if (configsByScope[scope]) {
        const config = configsByScope[scope][0];
        const isActive = scope === activeScope;
        const status = isActive ? '✓ ACTIVO' : '○ Disponible';
        const scopeDesc = scopeDescriptions[scope as keyof typeof scopeDescriptions];
        
        explanation += `\n- ${status} ${scope.toUpperCase()}: "${config.value}${config.unit ? ` ${config.unit}` : ''}" (${scopeDesc})`;
      }
    }
    
    explanation += `\n\nEl sistema utiliza el orden de precedencia: fitting > bicycle > user > global.`;
    explanation += ` La configuración de nivel "${activeScope}" tiene prioridad y está siendo aplicada.`;
  } else {
    explanation += `\n\nEsta configuración solo está definida a nivel ${activeScope}.`;
  }
  
  if (activeConfig.data_type === 'array') {
    try {
      const arrayValue = JSON.parse(activeValue);
      explanation += `\n\nEste parámetro es un array con ${arrayValue.length} elementos: ${arrayValue.join(', ')}.`;
    } catch {
      explanation += `\n\nEste parámetro es un array.`;
    }
  } else if (activeConfig.data_type === 'boolean') {
    explanation += `\n\nEste es un parámetro booleano (verdadero/falso).`;
  } else if (activeConfig.data_type === 'number') {
    explanation += `\n\nEste es un parámetro numérico.`;
  }
  
  return explanation;
}