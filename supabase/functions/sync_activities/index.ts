import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
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
  athlete_count: number;
  photo_count: number;
  trainer: boolean;
  commute: boolean;
  manual: boolean;
  private: boolean;
  flagged: boolean;
  gear_id?: string;
  from_accepted_tag: boolean;
  upload_id?: number;
  external_id?: string;
  has_power: boolean;
  average_watts?: number;
  max_watts?: number;
  weighted_average_watts?: number;
  kilojoules?: number;
  device_watts?: boolean;
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
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  console.log(`[${requestId}] Sync activities request started`);

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { user_id, access_token, page = 1, per_page = 20, auto_process = true } = body;

    if (!user_id || !access_token) {
      return new Response(
        JSON.stringify({ error: 'Missing user_id or access_token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[${requestId}] Syncing activities for user ${user_id}, page ${page}, per_page ${per_page}`);

    // Fetch activities from Strava
    const stravaResponse = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${per_page}`,
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!stravaResponse.ok) {
      console.error(`[${requestId}] Strava API error: ${stravaResponse.status} ${stravaResponse.statusText}`);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch activities from Strava',
          status: stravaResponse.status 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const stravaActivities: StravaActivity[] = await stravaResponse.json();
    console.log(`[${requestId}] Fetched ${stravaActivities.length} activities from Strava`);

    const results = {
      total: stravaActivities.length,
      created: 0,
      updated: 0,
      queued_for_processing: 0,
      errors: [] as string[]
    };

    // Process each activity
    for (const stravaActivity of stravaActivities) {
      try {
        console.log(`[${requestId}] Processing activity ${stravaActivity.id}: ${stravaActivity.name}`);

        // Check if activity already exists
        const { data: existingActivity, error: fetchError } = await supabase
          .from('activities')
          .select('id, strava_activity_id, updated_at')
          .eq('user_id', user_id)
          .eq('strava_activity_id', stravaActivity.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error(`[${requestId}] Error checking existing activity:`, fetchError);
          results.errors.push(`Error checking activity ${stravaActivity.id}: ${fetchError.message}`);
          continue;
        }

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
          photo_count: stravaActivity.photo_count,
          trainer: stravaActivity.trainer,
          commute: stravaActivity.commute,
          manual: stravaActivity.manual,
          private: stravaActivity.private,
          gear_id: stravaActivity.gear_id,
          device_name: stravaActivity.device_name || 'Unknown',
          has_power: stravaActivity.has_power || false,
          has_heartrate: stravaActivity.has_heartrate || false,
          updated_at: new Date().toISOString()
        };

        let activityId: string;

        if (existingActivity) {
          // Update existing activity
          const { data: updatedActivity, error: updateError } = await supabase
            .from('activities')
            .update(activityData)
            .eq('id', existingActivity.id)
            .select('id')
            .single();

          if (updateError) {
            console.error(`[${requestId}] Error updating activity:`, updateError);
            results.errors.push(`Error updating activity ${stravaActivity.id}: ${updateError.message}`);
            continue;
          }

          activityId = updatedActivity.id;
          results.updated++;
          console.log(`[${requestId}] Updated activity ${stravaActivity.id}`);
        } else {
          // Create new activity
          const { data: newActivity, error: insertError } = await supabase
            .from('activities')
            .insert(activityData)
            .select('id')
            .single();

          if (insertError) {
            console.error(`[${requestId}] Error inserting activity:`, insertError);
            results.errors.push(`Error inserting activity ${stravaActivity.id}: ${insertError.message}`);
            continue;
          }

          activityId = newActivity.id;
          results.created++;
          console.log(`[${requestId}] Created activity ${stravaActivity.id}`);
        }

        // Add to processing queue if auto_process is enabled and activity has power or HR data
        if (auto_process && (stravaActivity.has_power || stravaActivity.has_heartrate)) {
          try {
            const { error: queueError } = await supabase
              .from('processing_queue')
              .insert({
                user_id: user_id,
                activity_id: activityId,
                strava_activity_id: stravaActivity.id,
                priority: stravaActivity.has_power ? 10 : 5, // Higher priority for power data
                status: 'pending'
              });

            if (queueError && queueError.code !== '23505') { // Ignore duplicate key violations
              console.error(`[${requestId}] Error adding to queue:`, queueError);
              results.errors.push(`Error queuing activity ${stravaActivity.id}: ${queueError.message}`);
            } else if (!queueError) {
              results.queued_for_processing++;
              console.log(`[${requestId}] Queued activity ${stravaActivity.id} for processing`);
            }
          } catch (queueErr) {
            console.error(`[${requestId}] Error adding to processing queue:`, queueErr);
          }
        }

      } catch (activityError) {
        console.error(`[${requestId}] Error processing activity ${stravaActivity.id}:`, activityError);
        results.errors.push(`Error processing activity ${stravaActivity.id}: ${activityError}`);
      }
    }

    console.log(`[${requestId}] Sync completed: ${JSON.stringify(results)}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Activities synced successfully',
        results: results,
        request_id: requestId
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error(`[${requestId}] Sync activities error:`, error);
    
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