import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Strava sync request:`, req.method, req.url);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { user_id, action } = await req.json();
    console.log(`[${requestId}] Action: ${action}, User: ${user_id}`);

    // Get user profile with Strava tokens
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('strava_access_token, strava_id')
      .eq('user_id', user_id)
      .single();

    if (profileError || !profile?.strava_access_token) {
      throw new Error('User not connected to Strava');
    }

    const stravaHeaders = {
      'Authorization': `Bearer ${profile.strava_access_token}`,
      'Content-Type': 'application/json'
    };

    if (action === 'import_bikes') {
      console.log(`[${requestId}] Importing bikes from Strava`);

      // Get athlete's gear (bikes)
      const gearResponse = await fetch(`https://www.strava.com/api/v3/athlete`, {
        headers: stravaHeaders
      });

      if (!gearResponse.ok) {
        throw new Error(`Failed to fetch athlete data: ${gearResponse.status}`);
      }

      const athleteData = await gearResponse.json();
      const bikes = athleteData.bikes || [];

      console.log(`[${requestId}] Found ${bikes.length} bikes`);

      // Import each bike
      const importedBikes = [];
      for (const bike of bikes) {
        const { data: existingBike } = await supabase
          .from('bikes')
          .select('id')
          .eq('strava_gear_id', bike.id)
          .eq('user_id', user_id)
          .single();

        if (!existingBike) {
          const { data: newBike, error: bikeError } = await supabase
            .from('bikes')
            .insert({
              user_id,
              strava_gear_id: bike.id,
              name: bike.name,
              brand: bike.brand_name,
              model: bike.model_name,
              bike_type: 'road',
              is_primary: bike.primary || false,
              is_active: true
            })
            .select()
            .single();

          if (!bikeError && newBike) {
            importedBikes.push(newBike);
            console.log(`[${requestId}] Imported bike: ${bike.name}`);
          }
        }
      }

      return new Response(JSON.stringify({ 
        success: true, 
        imported_bikes: importedBikes.length 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (action === 'import_activities') {
      console.log(`[${requestId}] Starting activity import`);

      // Initialize sync status
      await supabase
        .from('sync_status')
        .upsert({
          user_id,
          status: 'importing',
          started_at: new Date().toISOString(),
          total_activities: 0,
          processed_activities: 0,
          failed_activities: 0
        }, {
          onConflict: 'user_id'
        });

      // Get activities from Strava (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const after = Math.floor(sixMonthsAgo.getTime() / 1000);

      let page = 1;
      let totalImported = 0;
      let hasMoreActivities = true;

      while (hasMoreActivities && page <= 10) { // Limit to 10 pages
        console.log(`[${requestId}] Fetching page ${page}`);

        const activitiesResponse = await fetch(
          `https://www.strava.com/api/v3/athlete/activities?after=${after}&page=${page}&per_page=50`,
          { headers: stravaHeaders }
        );

        if (!activitiesResponse.ok) {
          throw new Error(`Failed to fetch activities: ${activitiesResponse.status}`);
        }

        const activities = await activitiesResponse.json();
        
        if (activities.length === 0) {
          hasMoreActivities = false;
          break;
        }

        console.log(`[${requestId}] Processing ${activities.length} activities from page ${page}`);

        // Update sync status
        await supabase
          .from('sync_status')
          .update({
            total_activities: totalImported + activities.length,
            current_activity: `Procesando página ${page}...`
          })
          .eq('user_id', user_id);

        // Process each activity
        for (const activity of activities) {
          try {
            // Check if activity already exists
            const { data: existingActivity } = await supabase
              .from('activities')
              .select('id')
              .eq('strava_activity_id', activity.id)
              .single();

            if (!existingActivity) {
              // Find matching bike
              let bikeId = null;
              if (activity.gear_id) {
                const { data: bike } = await supabase
                  .from('bikes')
                  .select('id')
                  .eq('strava_gear_id', activity.gear_id)
                  .eq('user_id', user_id)
                  .single();
                bikeId = bike?.id || null;
              }

              // Insert activity
              await supabase
                .from('activities')
                .insert({
                  user_id,
                  bike_id: bikeId,
                  strava_activity_id: activity.id,
                  name: activity.name,
                  activity_type: activity.type,
                  start_date: activity.start_date,
                  distance: activity.distance,
                  moving_time: activity.moving_time,
                  elapsed_time: activity.elapsed_time,
                  total_elevation_gain: activity.total_elevation_gain,
                  average_watts: activity.average_watts,
                  max_watts: activity.max_watts,
                  weighted_power: activity.weighted_power,
                  average_heartrate: activity.average_heartrate,
                  max_heartrate: activity.max_heartrate,
                  average_speed: activity.average_speed,
                  max_speed: activity.max_speed,
                  sync_status: 'completed'
                });

              totalImported++;
            }

            // Update progress
            if (totalImported % 10 === 0) {
              await supabase
                .from('sync_status')
                .update({
                  processed_activities: totalImported,
                  current_activity: `${activity.name} (${totalImported} actividades)`
                })
                .eq('user_id', user_id);
            }

          } catch (error) {
            console.error(`[${requestId}] Error processing activity ${activity.id}:`, error);
            
            await supabase
              .from('sync_status')
              .update({
                failed_activities: 1 // Increment failed count
              })
              .eq('user_id', user_id);
          }
        }

        page++;
      }

      // Complete sync
      await supabase
        .from('sync_status')
        .update({
          status: 'completed',
          processed_activities: totalImported,
          completed_at: new Date().toISOString(),
          current_activity: `Sincronización completa: ${totalImported} actividades`
        })
        .eq('user_id', user_id);

      console.log(`[${requestId}] Activity import completed: ${totalImported} activities`);

      return new Response(JSON.stringify({ 
        success: true, 
        imported_activities: totalImported 
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
    
    // Update sync status on error
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      
      const { user_id } = await req.json();
      if (user_id) {
        await supabase
          .from('sync_status')
          .update({
            status: 'error',
            error_message: error.message,
            completed_at: new Date().toISOString()
          })
          .eq('user_id', user_id);
      }
    } catch (e) {
      console.error(`[${requestId}] Failed to update sync status:`, e);
    }

    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});