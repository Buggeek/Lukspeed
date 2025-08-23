import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  const method = req.method;
  console.log(`[${requestId}] Strava webhook request: ${method} ${req.url}`);

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);

    // Handle GET request - Strava webhook verification challenge
    if (method === 'GET') {
      console.log(`[${requestId}] Webhook verification challenge received`);
      
      const challenge = url.searchParams.get('hub.challenge');
      const verifyToken = url.searchParams.get('hub.verify_token');
      const mode = url.searchParams.get('hub.mode');

      console.log(`[${requestId}] Challenge params:`, {
        challenge: challenge?.substring(0, 10) + '...',
        verifyToken: verifyToken?.substring(0, 10) + '...',
        mode
      });

      // Get expected verify token from database
      const { data: subscription, error: subError } = await supabase
        .from('app_dbd0941867_webhook_subscriptions')
        .select('verify_token')
        .eq('status', 'active')
        .single();

      if (subError || !subscription) {
        console.error(`[${requestId}] No active subscription found:`, subError);
        return new Response('No active subscription', { 
          status: 404, 
          headers: corsHeaders 
        });
      }

      if (verifyToken === subscription.verify_token && mode === 'subscribe') {
        console.log(`[${requestId}] Webhook verification successful`);
        return new Response(JSON.stringify({ 'hub.challenge': challenge }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        console.error(`[${requestId}] Webhook verification failed`);
        return new Response('Verification failed', { 
          status: 403, 
          headers: corsHeaders 
        });
      }
    }

    // Handle POST request - Strava webhook event
    if (method === 'POST') {
      console.log(`[${requestId}] Processing webhook event`);

      let body;
      let rawBody: string;
      
      try {
        rawBody = await req.text();
        body = JSON.parse(rawBody);
        console.log(`[${requestId}] Webhook payload:`, body);
      } catch (error) {
        console.error(`[${requestId}] Invalid JSON payload:`, error);
        return new Response('Invalid JSON', { 
          status: 400, 
          headers: corsHeaders 
        });
      }

      // Validate webhook signature (if provided)
      const signature = req.headers.get('strava-signature');
      if (signature) {
        const webhookSecret = Deno.env.get('STRAVA_WEBHOOK_SECRET');
        if (webhookSecret) {
          const crypto = await import('npm:crypto');
          const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(rawBody, 'utf8')
            .digest('hex');
          
          if (signature !== expectedSignature) {
            console.error(`[${requestId}] Invalid webhook signature`);
            return new Response('Invalid signature', { 
              status: 403, 
              headers: corsHeaders 
            });
          }
          console.log(`[${requestId}] Webhook signature validated`);
        }
      }

      // Extract event data
      const {
        aspect_type,
        event_time,
        object_id,
        object_type,
        owner_id,
        subscription_id,
        updates = {}
      } = body;

      // Validate required fields
      if (!aspect_type || !object_type || !object_id || !owner_id) {
        console.error(`[${requestId}] Missing required webhook fields`);
        return new Response('Missing required fields', { 
          status: 400, 
          headers: corsHeaders 
        });
      }

      // Only process activity events for now
      if (object_type !== 'activity') {
        console.log(`[${requestId}] Ignoring non-activity event: ${object_type}`);
        return new Response('OK', { status: 200, headers: corsHeaders });
      }

      // Check if this is a relevant event (create, update)
      if (!['create', 'update'].includes(aspect_type)) {
        console.log(`[${requestId}] Ignoring event type: ${aspect_type}`);
        return new Response('OK', { status: 200, headers: corsHeaders });
      }

      console.log(`[${requestId}] Processing ${aspect_type} event for activity ${object_id} by user ${owner_id}`);

      // Find the subscription
      const { data: subscription, error: subError } = await supabase
        .from('app_dbd0941867_webhook_subscriptions')
        .select('id')
        .eq('strava_subscription_id', subscription_id)
        .single();

      if (subError) {
        console.error(`[${requestId}] Subscription not found:`, subError);
        // Still return 200 to avoid Strava retries
        return new Response('OK', { status: 200, headers: corsHeaders });
      }

      // Store webhook event
      const { data: webhookEvent, error: eventError } = await supabase
        .from('app_dbd0941867_webhook_events')
        .insert({
          subscription_id: subscription.id,
          event_type: aspect_type,
          aspect_type,
          object_type,
          object_id,
          owner_id,
          event_time,
          raw_payload: body,
          status: 'pending'
        })
        .select('id')
        .single();

      if (eventError) {
        console.error(`[${requestId}] Failed to store webhook event:`, eventError);
        return new Response('Internal error', { 
          status: 500, 
          headers: corsHeaders 
        });
      }

      console.log(`[${requestId}] Webhook event stored: ${webhookEvent.id}`);

      // Find user profile with this Strava athlete ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, strava_access_token')
        .eq('strava_athlete_id', owner_id.toString())
        .single();

      if (profileError || !profile) {
        console.log(`[${requestId}] No profile found for Strava athlete ${owner_id}`);
        // Mark event as completed since we can't process it
        await supabase
          .from('app_dbd0941867_webhook_events')
          .update({ 
            status: 'completed', 
            processed: true,
            processed_at: new Date().toISOString(),
            error_message: 'No user profile found'
          })
          .eq('id', webhookEvent.id);
        
        return new Response('OK', { status: 200, headers: corsHeaders });
      }

      console.log(`[${requestId}] Found user profile: ${profile.id}`);

      // Create processing job for activity download and metrics calculation
      const { error: jobError } = await supabase
        .from('app_dbd0941867_webhook_jobs')
        .insert({
          event_id: webhookEvent.id,
          user_id: profile.id,
          activity_id: object_id,
          job_type: 'download_activity',
          priority: aspect_type === 'create' ? 8 : 5, // Higher priority for new activities
          payload: {
            strava_activity_id: object_id,
            strava_athlete_id: owner_id,
            access_token: profile.strava_access_token,
            event_type: aspect_type
          }
        });

      if (jobError) {
        console.error(`[${requestId}] Failed to create processing job:`, jobError);
        return new Response('Internal error', { 
          status: 500, 
          headers: corsHeaders 
        });
      }

      console.log(`[${requestId}] Processing job created for activity ${object_id}`);

      // Trigger async processing (fire and forget)
      try {
        await fetch(`${supabaseUrl}/functions/v1/app_dbd0941867_process_webhook_job`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            event_id: webhookEvent.id,
            user_id: profile.id,
            activity_id: object_id
          })
        });
      } catch (error) {
        console.error(`[${requestId}] Failed to trigger async processing:`, error);
        // Don't fail the webhook response - job will be picked up later
      }

      // Return success immediately to Strava (must be < 2 seconds)
      console.log(`[${requestId}] Webhook processed successfully`);
      return new Response('OK', { 
        status: 200, 
        headers: corsHeaders 
      });
    }

    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });

  } catch (error) {
    console.error(`[${requestId}] Webhook processing error:`, error);
    
    // Always return 200 to Strava to avoid retries for our internal errors
    return new Response('OK', { 
      status: 200, 
      headers: corsHeaders 
    });
  }
});