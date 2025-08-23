import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
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
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error(`[${requestId}] Invalid JSON body:`, error);
      return new Response('Invalid JSON body', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    const { code, state } = body;

    if (!code) {
      console.error(`[${requestId}] Missing authorization code`);
      return new Response('Missing authorization code', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    console.log(`[${requestId}] Exchanging code for tokens`, { 
      codeLength: code.length, 
      state 
    });

    // Exchange code for tokens with Strava
    const clientId = Deno.env.get('STRAVA_CLIENT_ID');
    const clientSecret = Deno.env.get('STRAVA_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      console.error(`[${requestId}] Missing Strava credentials`);
      return new Response('Server configuration error', { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error(`[${requestId}] Strava token exchange failed:`, {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText
      });
      return new Response(`Strava token exchange failed: ${errorText}`, { 
        status: tokenResponse.status, 
        headers: corsHeaders 
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create anonymous user session
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
    
    if (authError) {
      console.error(`[${requestId}] Failed to create user session:`, authError);
      return new Response(`Failed to create user session: ${authError.message}`, { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    console.log(`[${requestId}] User session created`, { userId: authData.user?.id });

    // Create or update profile with Strava data
    const profileData = {
      id: authData.user!.id,
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

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(profileData, { onConflict: 'id' });

    if (profileError) {
      console.error(`[${requestId}] Failed to create/update profile:`, profileError);
      return new Response(`Failed to create profile: ${profileError.message}`, { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    console.log(`[${requestId}] Profile created/updated successfully`);

    // Return the complete response with session data
    const response = {
      success: true,
      user: authData.user,
      session: authData.session,
      athlete: tokenData.athlete,
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
    return new Response(`Internal server error: ${error.message}`, { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});