import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  sport_type: string;
  start_date: string;
  start_date_local: string;
  timezone: string;
  utc_offset: number;
  start_latlng?: [number, number];
  end_latlng?: [number, number];
  location_city?: string;
  location_state?: string;
  location_country?: string;
  achievement_count: number;
  kudos_count: number;
  comment_count: number;
  trainer: boolean;
  commute: boolean;
  manual: boolean;
  private: boolean;
  gear_id?: string;
  has_power: boolean;
  average_watts?: number;
  max_watts?: number;
  weighted_average_watts?: number;
  kilojoules?: number;
  has_heartrate: boolean;
  average_heartrate?: number;
  max_heartrate?: number;
  average_speed?: number;
  max_speed?: number;
  average_cadence?: number;
  average_temp?: number;
}

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Webhook job processor started`);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error(`[${requestId}] Invalid JSON body:`, error);
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { event_id, user_id, activity_id } = body;

    if (!event_id || !user_id || !activity_id) {
      console.error(`[${requestId}] Missing required parameters`);
      return new Response(JSON.stringify({ error: 'Missing parameters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`[${requestId}] Processing webhook job for activity ${activity_id}, user ${user_id}`);

    // Get the next pending job for this event
    const { data: job, error: jobError } = await supabase
      .from('app_dbd0941867_webhook_jobs')
      .select('*')
      .eq('event_id', event_id)
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (jobError || !job) {
      console.log(`[${requestId}] No pending job found for event ${event_id}`);
      return new Response(JSON.stringify({ message: 'No pending jobs' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`[${requestId}] Processing job ${job.id} of type ${job.job_type}`);

    // Mark job as processing
    await supabase
      .from('app_dbd0941867_webhook_jobs')
      .update({
        status: 'processing',
        started_at: new Date().toISOString()
      })
      .eq('id', job.id);

    try {
      // Get user profile with Strava tokens
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('strava_access_token, strava_refresh_token, strava_token_expires_at')
        .eq('id', user_id)
        .single();

      if (profileError || !profile?.strava_access_token) {
        throw new Error('User profile or Strava token not found');
      }

      console.log(`[${requestId}] Retrieved user profile and tokens`);

      // Check if token needs refresh
      let accessToken = profile.strava_access_token;
      if (profile.strava_token_expires_at) {
        const expiresAt = new Date(profile.strava_token_expires_at);
        const now = new Date();
        
        if (expiresAt <= now) {
          console.log(`[${requestId}] Access token expired, refreshing...`);
          
          const refreshResponse = await fetch('https://www.strava.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              client_id: Deno.env.get('STRAVA_CLIENT_ID') || '43486',
              client_secret: Deno.env.get('STRAVA_CLIENT_SECRET'),
              refresh_token: profile.strava_refresh_token,
              grant_type: 'refresh_token'
            })
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            accessToken = refreshData.access_token;
            
            // Update tokens in database
            await supabase
              .from('profiles')
              .update({
                strava_access_token: refreshData.access_token,
                strava_refresh_token: refreshData.refresh_token,
                strava_token_expires_at: new Date(refreshData.expires_at * 1000).toISOString()
              })
              .eq('id', user_id);
            
            console.log(`[${requestId}] Token refreshed successfully`);
          } else {
            throw new Error('Failed to refresh Strava token');
          }
        }
      }

      if (job.job_type === 'download_activity') {
        console.log(`[${requestId}] Downloading activity ${activity_id} from Strava`);

        // Fetch activity from Strava API
        const activityResponse = await fetch(
          `https://www.strava.com/api/v3/activities/${activity_id}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json'
            }
          }
        );

        if (!activityResponse.ok) {
          if (activityResponse.status === 404) {
            console.log(`[${requestId}] Activity ${activity_id} not found (possibly private or deleted)`);
            
            // Mark job as completed since activity doesn't exist
            await supabase
              .from('app_dbd0941867_webhook_jobs')
              .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
                error_message: 'Activity not found or private'
              })
              .eq('id', job.id);

            return new Response(JSON.stringify({ message: 'Activity not found' }), {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
          
          throw new Error(`Strava API error: ${activityResponse.status} ${activityResponse.statusText}`);
        }

        const stravaActivity: StravaActivity = await activityResponse.json();
        console.log(`[${requestId}] Downloaded activity: ${stravaActivity.name}`);

        // Check if activity already exists in our database
        const { data: existingActivity, error: fetchError } = await supabase
          .from('app_dbd0941867_activities')
          .select('id')
          .eq('user_id', user_id)
          .eq('strava_activity_id', stravaActivity.id)
          .single();

        // Prepare activity data
        const activityData = {
          user_id: user_id,
          strava_activity_id: stravaActivity.id,
          name: stravaActivity.name,
          description: stravaActivity.name,
          sport_type: stravaActivity.sport_type || stravaActivity.type,
          activity_type: stravaActivity.type,
          start_date: stravaActivity.start_date,
          start_date_local: stravaActivity.start_date_local,
          timezone: stravaActivity.timezone,
          utc_offset: stravaActivity.utc_offset,
          distance: Math.round(stravaActivity.distance),
          moving_time: stravaActivity.moving_time,
          elapsed_time: stravaActivity.elapsed_time,
          total_elevation_gain: Math.round(stravaActivity.total_elevation_gain || 0),
          average_speed: stravaActivity.average_speed,
          max_speed: stravaActivity.max_speed,
          average_watts: stravaActivity.average_watts,
          max_watts: stravaActivity.max_watts,
          weighted_average_watts: stravaActivity.weighted_average_watts,
          kilojoules: stravaActivity.kilojoules,
          average_heartrate: stravaActivity.average_heartrate,
          max_heartrate: stravaActivity.max_heartrate,
          average_cadence: stravaActivity.average_cadence,
          average_temp: stravaActivity.average_temp,
          start_latitude: stravaActivity.start_latlng?.[0],
          start_longitude: stravaActivity.start_latlng?.[1],
          end_latitude: stravaActivity.end_latlng?.[0],
          end_longitude: stravaActivity.end_latlng?.[1],
          location_city: stravaActivity.location_city,
          location_state: stravaActivity.location_state,
          location_country: stravaActivity.location_country,
          achievement_count: stravaActivity.achievement_count,
          kudos_count: stravaActivity.kudos_count,
          comment_count: stravaActivity.comment_count,
          trainer: stravaActivity.trainer,
          commute: stravaActivity.commute,
          manual: stravaActivity.manual,
          private: stravaActivity.private,
          gear_id: stravaActivity.gear_id,
          has_power: stravaActivity.has_power || false,
          has_heartrate: stravaActivity.has_heartrate || false,
          sync_status: 'webhook',
          updated_at: new Date().toISOString()
        };

        if (existingActivity) {
          // Update existing activity
          const { error: updateError } = await supabase
            .from('app_dbd0941867_activities')
            .update(activityData)
            .eq('id', existingActivity.id);

          if (updateError) {
            throw new Error(`Failed to update activity: ${updateError.message}`);
          }

          console.log(`[${requestId}] Updated existing activity ${stravaActivity.id}`);
        } else {
          // Create new activity
          const { error: insertError } = await supabase
            .from('app_dbd0941867_activities')
            .insert(activityData);

          if (insertError) {
            throw new Error(`Failed to insert activity: ${insertError.message}`);
          }

          console.log(`[${requestId}] Created new activity ${stravaActivity.id}`);
        }

        // Mark job as completed
        await supabase
          .from('app_dbd0941867_webhook_jobs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', job.id);

        // Mark webhook event as processed
        await supabase
          .from('app_dbd0941867_webhook_events')
          .update({
            status: 'completed',
            processed: true,
            processed_at: new Date().toISOString()
          })
          .eq('id', event_id);

        console.log(`[${requestId}] Webhook job completed successfully`);
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Job processed successfully',
        job_id: job.id 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error(`[${requestId}] Job processing error:`, error);

      // Increment retry count
      const newRetryCount = (job.retry_count || 0) + 1;
      const maxRetries = job.max_retries || 5;

      if (newRetryCount >= maxRetries) {
        // Mark as failed after max retries
        await supabase
          .from('app_dbd0941867_webhook_jobs')
          .update({
            status: 'failed',
            retry_count: newRetryCount,
            error_message: error.message,
            completed_at: new Date().toISOString()
          })
          .eq('id', job.id);

        console.log(`[${requestId}] Job failed after ${maxRetries} retries`);
      } else {
        // Schedule for retry with exponential backoff
        const retryDelay = Math.min(Math.pow(2, newRetryCount) * 1000, 30000); // Max 30 seconds
        const retryAt = new Date(Date.now() + retryDelay);

        await supabase
          .from('app_dbd0941867_webhook_jobs')
          .update({
            status: 'pending',
            retry_count: newRetryCount,
            error_message: error.message,
            scheduled_at: retryAt.toISOString(),
            started_at: null
          })
          .eq('id', job.id);

        console.log(`[${requestId}] Job scheduled for retry ${newRetryCount}/${maxRetries} in ${retryDelay}ms`);
      }

      return new Response(JSON.stringify({ 
        error: 'Job processing failed', 
        message: error.message,
        retry_count: newRetryCount 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error(`[${requestId}] Webhook job processor error:`, error);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});