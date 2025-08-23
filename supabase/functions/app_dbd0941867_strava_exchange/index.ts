import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Strava token exchange started`, {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  });

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log(`[${requestId}] CORS preflight request`);
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  if (req.method !== 'POST') {
    console.error(`[${requestId}] Method not allowed: ${req.method}`);
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    // Parse request body with timeout
    let body;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      body = await req.json();
      clearTimeout(timeoutId);
      
      console.log(`[${requestId}] Request body parsed successfully`, {
        hasCode: !!body.code,
        hasState: !!body.state
      });
    } catch (error) {
      console.error(`[${requestId}] Invalid JSON body:`, error);
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON body',
        message: error.message 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { code, state } = body;

    if (!code) {
      console.error(`[${requestId}] Missing authorization code`);
      return new Response(JSON.stringify({
        error: 'Missing authorization code',
        message: 'El código de autorización es requerido'
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`[${requestId}] Starting token exchange with Strava`, { 
      codeLength: code.length, 
      state: state?.substring(0, 10) + '...' 
    });

    // Get Strava credentials from environment
    const clientId = Deno.env.get('STRAVA_CLIENT_ID') || '43486';
    const clientSecret = Deno.env.get('STRAVA_CLIENT_SECRET');

    if (!clientSecret) {
      console.error(`[${requestId}] Missing Strava client secret`);
      return new Response(JSON.stringify({
        error: 'Server configuration error',
        message: 'Configuración del servidor incompleta'
      }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`[${requestId}] Exchanging code with Strava API`, {
      clientId: clientId,
      hasClientSecret: !!clientSecret
    });

    // Exchange code for tokens with Strava API
    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
      }),
    });

    console.log(`[${requestId}] Strava API response`, {
      status: tokenResponse.status,
      statusText: tokenResponse.statusText,
      ok: tokenResponse.ok
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error(`[${requestId}] Strava token exchange failed:`, {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText
      });
      
      return new Response(JSON.stringify({
        error: 'Strava token exchange failed',
        message: `Error ${tokenResponse.status}: ${errorText}`,
        details: {
          status: tokenResponse.status,
          statusText: tokenResponse.statusText
        }
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const tokenData = await tokenResponse.json();
    console.log(`[${requestId}] Token exchange successful`, {
      athleteId: tokenData.athlete?.id,
      hasAccessToken: !!tokenData.access_token,
      hasRefreshToken: !!tokenData.refresh_token,
      expiresAt: tokenData.expires_at
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error(`[${requestId}] Missing Supabase configuration`);
      return new Response(JSON.stringify({
        error: 'Server configuration error',
        message: 'Base de datos no configurada'
      }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create anonymous user session
    console.log(`[${requestId}] Creating user session`);
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
    
    if (authError || !authData.user) {
      console.error(`[${requestId}] Failed to create user session:`, authError);
      return new Response(JSON.stringify({
        error: 'Failed to create user session',
        message: `Error creando sesión: ${authError?.message}`,
        details: authError
      }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`[${requestId}] User session created successfully`, { 
      userId: authData.user.id 
    });

    // Create or update profile with Strava data
    const profileData = {
      id: authData.user.id,
      email: tokenData.athlete?.email || `athlete${tokenData.athlete?.id}@strava.local`,
      full_name: `${tokenData.athlete?.firstname || ''} ${tokenData.athlete?.lastname || ''}`.trim() || 'Strava User',
      strava_athlete_id: tokenData.athlete?.id?.toString(),
      strava_access_token: tokenData.access_token,
      strava_refresh_token: tokenData.refresh_token,
      strava_token_expires_at: tokenData.expires_at ? new Date(tokenData.expires_at * 1000).toISOString() : null,
      auth_provider: 'strava',
      created_at: new Date().toISOString(),
      onboarding_completed: true
    };

    console.log(`[${requestId}] Creating user profile`, {
      userId: authData.user.id,
      athleteId: tokenData.athlete?.id
    });

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(profileData, { onConflict: 'id' });

    if (profileError) {
      console.error(`[${requestId}] Failed to create/update profile:`, profileError);
      return new Response(JSON.stringify({
        error: 'Failed to create profile',
        message: `Error creando perfil: ${profileError.message}`,
        details: profileError
      }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`[${requestId}] Profile created/updated successfully`);

    // Return the complete response with session data
    const response = {
      success: true,
      message: 'Autenticación exitosa con Strava',
      user: authData.user,
      session: authData.session,
      athlete: {
        id: tokenData.athlete?.id,
        firstname: tokenData.athlete?.firstname,
        lastname: tokenData.athlete?.lastname,
        email: tokenData.athlete?.email
      },
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: tokenData.expires_at
    };

    console.log(`[${requestId}] Token exchange completed successfully`);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error(`[${requestId}] Unexpected error:`, error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: `Error interno del servidor: ${error.message}`,
      details: error.stack,
      request_id: requestId
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});