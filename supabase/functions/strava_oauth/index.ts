import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

const STRAVA_CLIENT_ID = '43486';
const STRAVA_CLIENT_SECRET = 'fcc023f20b271ba15bd45eb219a5fecbbcf4b752';

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Strava OAuth request:`, req.method, req.url);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (action === 'get_auth_url') {
      // Generate Strava OAuth URL
      const { user_token, redirect_uri } = await req.json();
      
      const stravaAuthUrl = new URL('https://www.strava.com/oauth/authorize');
      stravaAuthUrl.searchParams.set('client_id', STRAVA_CLIENT_ID);
      stravaAuthUrl.searchParams.set('response_type', 'code');
      stravaAuthUrl.searchParams.set('redirect_uri', redirect_uri || 'http://localhost:5173/auth/callback');
      stravaAuthUrl.searchParams.set('approval_prompt', 'force');
      stravaAuthUrl.searchParams.set('scope', 'read,activity:read_all,profile:read_all');
      stravaAuthUrl.searchParams.set('state', user_token); // Pass user token as state

      console.log(`[${requestId}] Generated auth URL`);

      return new Response(JSON.stringify({ 
        auth_url: stravaAuthUrl.toString() 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (action === 'exchange_token') {
      // Exchange authorization code for access token
      const { code, state } = await req.json();
      
      console.log(`[${requestId}] Exchanging code for token`);

      const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: STRAVA_CLIENT_ID,
          client_secret: STRAVA_CLIENT_SECRET,
          code,
          grant_type: 'authorization_code'
        })
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error(`[${requestId}] Token exchange failed:`, errorText);
        throw new Error(`Strava token exchange failed: ${tokenResponse.status}`);
      }

      const tokenData = await tokenResponse.json();
      console.log(`[${requestId}] Token exchange successful for athlete:`, tokenData.athlete.id);

      // Get user from state (JWT token)
      const { data: { user }, error: userError } = await supabase.auth.getUser(state);
      
      if (userError || !user) {
        console.error(`[${requestId}] Invalid user token:`, userError);
        throw new Error('Invalid user token');
      }

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const isFirstTime = !existingProfile;

      // Upsert user profile with Strava data
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          strava_id: tokenData.athlete.id,
          strava_access_token: tokenData.access_token,
          strava_refresh_token: tokenData.refresh_token,
          strava_expires_at: new Date(tokenData.expires_at * 1000).toISOString(),
          first_name: tokenData.athlete.firstname,
          last_name: tokenData.athlete.lastname,
          email: user.email,
          gender: tokenData.athlete.sex === 'M' ? 'male' : tokenData.athlete.sex === 'F' ? 'female' : 'other',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (profileError) {
        console.error(`[${requestId}] Profile upsert error:`, profileError);
        throw new Error('Failed to save user profile');
      }

      console.log(`[${requestId}] User profile updated successfully`);

      return new Response(JSON.stringify({ 
        success: true, 
        athlete: tokenData.athlete,
        requires_onboarding: isFirstTime,
        user_id: user.id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (action === 'refresh_token') {
      // Refresh access token
      const { user_id } = await req.json();
      
      console.log(`[${requestId}] Refreshing token for user:`, user_id);

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('strava_refresh_token')
        .eq('user_id', user_id)
        .single();

      if (error || !profile?.strava_refresh_token) {
        throw new Error('No refresh token found');
      }

      const refreshResponse = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: STRAVA_CLIENT_ID,
          client_secret: STRAVA_CLIENT_SECRET,
          refresh_token: profile.strava_refresh_token,
          grant_type: 'refresh_token'
        })
      });

      if (!refreshResponse.ok) {
        throw new Error(`Token refresh failed: ${refreshResponse.status}`);
      }

      const refreshData = await refreshResponse.json();

      // Update tokens in database
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          strava_access_token: refreshData.access_token,
          strava_refresh_token: refreshData.refresh_token,
          strava_expires_at: new Date(refreshData.expires_at * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user_id);

      if (updateError) {
        throw new Error('Failed to update tokens');
      }

      console.log(`[${requestId}] Token refresh successful`);

      return new Response(JSON.stringify({ 
        success: true,
        access_token: refreshData.access_token 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(`[${requestId}] Error:`, error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});