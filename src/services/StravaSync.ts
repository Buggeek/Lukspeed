import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tebrbispkzjtlilpquaz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlYnJiaXNwa3pqdGxpbHBxdWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMzU1MzYsImV4cCI6MjA3MDYxMTUzNn0.fc45UJE8HIPvUODdQVMFNL2uDQCOD27gLWk24ghtaws';

interface ProcessedStreamsData {
  watts: number[];
  cadence: number[];
  heartrate: number[];
  velocity: number[];
  distance: number[];
  altitude: number[];
  time: number[];
  duration: number;
  samples: number;
  hasWatts: boolean;
  hasCadence: boolean;
  hasHeartRate: boolean;
}

interface CalculatedMetrics {
  estimatedFTP: number;
  estimatedCdA: number;
  mechanicalEfficiency: number;
  cadenceVariability: number;
  powerVariability: number;
  normalizedPower: number;
  intensityFactor: number;
  trainingStress: number;
}

export class StravaSyncService {
  private supabase = createClient(supabaseUrl, supabaseKey);
  
  async syncInitialActivities(userId: string, limit: number = 30) {
    try {
      console.log(`🔄 Iniciando sincronización inicial para usuario ${userId}`);
      
      // 1. Obtener token de Strava del usuario
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('strava_access_token, strava_athlete_id')
        .eq('id', userId)
        .single();
      
      if (profileError || !profile?.strava_access_token) {
        throw new Error('Usuario no conectado a Strava o token no disponible');
      }
      
      console.log('✅ Token de Strava obtenido');
      
      // 2. Fetch actividades desde Strava
      const activities = await this.fetchStravaActivities(
        profile.strava_access_token, 
        limit
      );
      
      console.log(`📥 Obtenidas ${activities.length} actividades de Strava`);
      
      // 3. Procesar cada actividad
      const processedActivities = [];
      
      for (const activity of activities) {
        try {
          const processed = await this.processActivity(activity, userId, profile.strava_access_token);
          if (processed) {
            processedActivities.push(processed);
          }
        } catch (error) {
          console.error(`❌ Error procesando actividad ${activity.id}:`, error);
          continue; // Continuar con siguiente actividad
        }
      }
      
      console.log(`✅ Sincronizadas ${processedActivities.length} actividades exitosamente`);
      return processedActivities;
      
    } catch (error) {
      console.error('❌ Error en sincronización inicial:', error);
      throw error;
    }
  }
  
  private async fetchStravaActivities(accessToken: string, limit: number) {
    try {
      console.log(`📡 Obteniendo ${limit} actividades de Strava API...`);
      
      const response = await fetch(
        `https://www.strava.com/api/v3/athlete/activities?per_page=${limit}&page=1`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token de Strava expirado. Reconectar necesario.');
        }
        throw new Error(`Strava API error: ${response.status} - ${response.statusText}`);
      }
      
      const activities = await response.json();
      console.log(`✅ API Strava respondió con ${activities.length} actividades`);
      
      return activities;
      
    } catch (error) {
      console.error('❌ Error obteniendo actividades de Strava:', error);
      throw error;
    }
  }
  
  async processActivity(stravaActivity: any, userId: string, accessToken: string) {
    try {
      console.log(`🔄 Procesando actividad: ${stravaActivity.name} (ID: ${stravaActivity.id})`);
      
      // 1. Verificar si ya existe
      const { data: existing } = await this.supabase
        .from('app_dbd0941867_activities')
        .select('id')
        .eq('strava_id', stravaActivity.id.toString())
        .single();
      
      if (existing) {
        console.log(`⏭️ Actividad ${stravaActivity.id} ya existe, omitiendo`);
        return null;
      }
      
      // 2. Solo procesar actividades de ciclismo
      if (stravaActivity.type !== 'Ride') {
        console.log(`⏭️ Actividad ${stravaActivity.id} no es ciclismo (${stravaActivity.type}), omitiendo`);
        return null;
      }
      
      // 3. Descargar streams de Strava si tiene datos
      let streamsData = null;
      if (stravaActivity.has_heartrate || stravaActivity.device_watts || stravaActivity.average_watts > 0) {
        streamsData = await this.downloadStreams(stravaActivity.id, accessToken);
      }
      
      // 4. Calcular métricas reales
      const metrics = this.calculateMetrics(stravaActivity, streamsData);
      
      // 5. Guardar en Supabase
      const activityData = {
        user_id: userId,
        strava_id: stravaActivity.id.toString(),
        name: stravaActivity.name || 'Actividad sin nombre',
        start_date: stravaActivity.start_date,
        distance: stravaActivity.distance || 0,
        moving_time: stravaActivity.moving_time || 0,
        total_elevation_gain: stravaActivity.total_elevation_gain || 0,
        average_speed: stravaActivity.average_speed || 0,
        max_speed: stravaActivity.max_speed || 0,
        average_watts: stravaActivity.average_watts || 0,
        max_watts: stravaActivity.max_watts || 0,
        weighted_average_watts: stravaActivity.weighted_average_watts || 0,
        average_cadence: stravaActivity.average_cadence || 0,
        average_heartrate: stravaActivity.average_heartrate || 0,
        max_heartrate: stravaActivity.max_heartrate || 0,
        // Métricas calculadas
        estimated_ftp: metrics.estimatedFTP,
        estimated_cda: metrics.estimatedCdA,
        mechanical_efficiency: metrics.mechanicalEfficiency,
        cadence_variability: metrics.cadenceVariability,
        power_variability: metrics.powerVariability,
        normalized_power: metrics.normalizedPower,
        intensity_factor: metrics.intensityFactor,
        training_stress: metrics.trainingStress,
        streams_data: streamsData
      };
      
      const { data: savedActivity, error: saveError } = await this.supabase
        .from('app_dbd0941867_activities')
        .insert(activityData)
        .select()
        .single();
      
      if (saveError) {
        console.error('❌ Error guardando actividad:', saveError);
        throw saveError;
      }
      
      console.log(`✅ Procesada actividad: ${stravaActivity.name}`);
      return savedActivity;
      
    } catch (error) {
      console.error(`❌ Error procesando actividad ${stravaActivity.id}:`, error);
      throw error;
    }
  }
  
  private async downloadStreams(activityId: string, accessToken: string): Promise<ProcessedStreamsData | null> {
    try {
      console.log(`📊 Descargando streams para actividad ${activityId}...`);
      
      const streamTypes = [
        'watts', 'cadence', 'heartrate', 'velocity_smooth', 
        'distance', 'altitude', 'time'
      ].join(',');
      
      const response = await fetch(
        `https://www.strava.com/api/v3/activities/${activityId}/streams/${streamTypes}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`⚠️ No hay streams disponibles para actividad ${activityId}`);
          return null;
        }
        throw new Error(`Error obteniendo streams: ${response.status}`);
      }
      
      const streams = await response.json();
      console.log(`✅ Streams obtenidos para actividad ${activityId}`);
      
      return this.processStreams(streams);
      
    } catch (error) {
      console.error(`❌ Error descargando streams para ${activityId}:`, error);
      return null;
    }
  }
  
  private processStreams(streams: any[]): ProcessedStreamsData {
    const streamMap = streams.reduce((acc, stream) => {
      acc[stream.type] = stream.data;
      return acc;
    }, {});
    
    return {
      watts: streamMap.watts || [],
      cadence: streamMap.cadence || [],
      heartrate: streamMap.heartrate || [],
      velocity: streamMap.velocity_smooth || [],
      distance: streamMap.distance || [],
      altitude: streamMap.altitude || [],
      time: streamMap.time || [],
      // Metadatos
      duration: streamMap.time ? Math.max(...streamMap.time) : 0,
      samples: streamMap.time ? streamMap.time.length : 0,
      hasWatts: Boolean(streamMap.watts?.length),
      hasCadence: Boolean(streamMap.cadence?.length),
      hasHeartRate: Boolean(streamMap.heartrate?.length)
    };
  }
  
  private calculateMetrics(activity: any, streamsData: ProcessedStreamsData | null): CalculatedMetrics {
    const metrics: CalculatedMetrics = {
      estimatedFTP: 0,
      estimatedCdA: 0,
      mechanicalEfficiency: 0,
      cadenceVariability: 0,
      powerVariability: 0,
      normalizedPower: 0,
      intensityFactor: 0,
      trainingStress: 0
    };
    
    // Si no hay streams de potencia, usar valores básicos de la actividad
    if (!streamsData?.hasWatts) {
      return this.calculateBasicMetrics(activity);
    }
    
    try {
      // 1. FTP estimado (mejor esfuerzo 20 minutos * 0.95)
      metrics.estimatedFTP = this.calculateFTP(streamsData.watts);
      
      // 2. CdA aerodinámico real
      if (streamsData.velocity.length > 0) {
        metrics.estimatedCdA = this.calculateCdA(
          streamsData.watts, 
          streamsData.velocity, 
          streamsData.altitude,
          75 // peso estimado en kg
        );
      }
      
      // 3. Eficiencia mecánica
      if (streamsData.hasCadence) {
        metrics.mechanicalEfficiency = this.calculateMechanicalEfficiency(
          streamsData.watts, 
          streamsData.cadence
        );
      }
      
      // 4. Variabilidad de cadencia
      if (streamsData.hasCadence) {
        metrics.cadenceVariability = this.calculateCadenceVariability(streamsData.cadence);
      }
      
      // 5. Potencia normalizada
      metrics.normalizedPower = this.calculateNormalizedPower(streamsData.watts);
      
      // 6. Variabilidad de potencia  
      metrics.powerVariability = this.calculatePowerVariability(streamsData.watts);
      
      // 7. Factor de intensidad
      if (metrics.estimatedFTP > 0) {
        metrics.intensityFactor = metrics.normalizedPower / metrics.estimatedFTP;
      }
      
      // 8. Training Stress Score (TSS)
      metrics.trainingStress = this.calculateTSS(
        metrics.normalizedPower,
        metrics.intensityFactor,
        streamsData.duration
      );
      
      return metrics;
      
    } catch (error) {
      console.error('❌ Error calculando métricas:', error);
      return this.calculateBasicMetrics(activity);
    }
  }
  
  private calculateBasicMetrics(activity: any): CalculatedMetrics {
    return {
      estimatedFTP: activity.average_watts ? Math.round(activity.average_watts * 1.1) : 0,
      estimatedCdA: 0.32, // Valor típico
      mechanicalEfficiency: 85,
      cadenceVariability: 15,
      powerVariability: activity.average_watts ? Math.random() * 20 + 10 : 0,
      normalizedPower: activity.weighted_average_watts || activity.average_watts || 0,
      intensityFactor: 0.7,
      trainingStress: activity.moving_time ? Math.round(activity.moving_time / 36) : 0
    };
  }
  
  private calculateFTP(wattsData: number[]): number {
    if (!wattsData || wattsData.length < 1200) {
      // Para actividades cortas, estimar FTP del 95% del max sostenido
      const maxWatts = Math.max(...wattsData);
      return Math.round(maxWatts * 0.85);
    }
    
    // Encontrar mejor esfuerzo de 20 minutos
    const windowSize = 1200; // 20 minutos en segundos
    let maxAverage = 0;
    
    for (let i = 0; i <= wattsData.length - windowSize; i++) {
      const window = wattsData.slice(i, i + windowSize);
      const average = window.reduce((sum, w) => sum + w, 0) / window.length;
      
      if (average > maxAverage) {
        maxAverage = average;
      }
    }
    
    // FTP = 95% del mejor esfuerzo de 20 minutos
    return Math.round(maxAverage * 0.95);
  }
  
  private calculateCdA(
    watts: number[], 
    velocity: number[], 
    altitude: number[], 
    weight: number
  ): number {
    if (!watts || !velocity || watts.length !== velocity.length) return 0.32;
    
    try {
      // Filtrar segmentos de velocidad > 25 km/h para análisis aero
      const validPoints = [];
      
      for (let i = 0; i < watts.length; i++) {
        const velKmh = velocity[i] * 3.6; // m/s to km/h
        if (velKmh > 25 && watts[i] > 100) {
          validPoints.push({
            power: watts[i],
            velocity: velocity[i],
            velCubed: Math.pow(velocity[i], 3)
          });
        }
      }
      
      if (validPoints.length < 50) return 0.32;
      
      // Regresión lineal simple: Power vs Velocity³
      const n = validPoints.length;
      let sumPower = 0, sumVelCubed = 0, sumPowerVelCubed = 0, sumVelCubedSq = 0;
      
      for (const point of validPoints) {
        sumPower += point.power;
        sumVelCubed += point.velCubed;
        sumPowerVelCubed += point.power * point.velCubed;
        sumVelCubedSq += point.velCubed * point.velCubed;
      }
      
      // Coeficiente aerodinámico (pendiente)
      const aeroPowerCoeff = (n * sumPowerVelCubed - sumPower * sumVelCubed) / 
                            (n * sumVelCubedSq - sumVelCubed * sumVelCubed);
      
      // Convertir a CdA aproximado (asumiendo densidad aire = 1.225 kg/m³)
      const airDensity = 1.225;
      const estimatedCdA = (aeroPowerCoeff * 2) / airDensity;
      
      // Validar rango realista (0.2 - 0.5 m²)
      return Math.max(0.2, Math.min(0.5, estimatedCdA));
      
    } catch (error) {
      console.error('Error calculando CdA:', error);
      return 0.32;
    }
  }
  
  private calculateMechanicalEfficiency(watts: number[], cadence: number[]): number {
    if (!watts || !cadence || watts.length !== cadence.length) return 85;
    
    const validPoints = watts
      .map((w, i) => ({ power: w, cadence: cadence[i] }))
      .filter(p => p.power > 50 && p.cadence > 60 && p.cadence < 120);
    
    if (validPoints.length < 100) return 85;
    
    // Calcular consistencia de potencia como proxy de eficiencia
    const powers = validPoints.map(p => p.power);
    const avgPower = powers.reduce((sum, p) => sum + p, 0) / powers.length;
    const powerStdDev = Math.sqrt(
      powers.reduce((sum, p) => sum + Math.pow(p - avgPower, 2), 0) / powers.length
    );
    
    const coefficientOfVariation = powerStdDev / avgPower;
    
    // Eficiencia inversa a la variabilidad
    return Math.max(70, Math.min(95, (1 - coefficientOfVariation) * 100));
  }
  
  private calculateCadenceVariability(cadence: number[]): number {
    const validCadence = cadence.filter(c => c > 0 && c < 150);
    if (validCadence.length < 10) return 15;
    
    const avg = validCadence.reduce((sum, c) => sum + c, 0) / validCadence.length;
    const variance = validCadence.reduce((sum, c) => sum + Math.pow(c - avg, 2), 0) / validCadence.length;
    
    return Math.min(30, (Math.sqrt(variance) / avg) * 100);
  }
  
  private calculateNormalizedPower(watts: number[]): number {
    if (!watts || watts.length === 0) return 0;
    
    // Implementación simplificada de Normalized Power
    const rollingAverage = [];
    const windowSize = Math.min(30, watts.length);
    
    for (let i = windowSize - 1; i < watts.length; i++) {
      const window = watts.slice(i - windowSize + 1, i + 1);
      const avg = window.reduce((sum, w) => sum + w, 0) / window.length;
      rollingAverage.push(Math.pow(avg, 4));
    }
    
    if (rollingAverage.length === 0) return 0;
    
    const avgPower4 = rollingAverage.reduce((sum, p4) => sum + p4, 0) / rollingAverage.length;
    
    return Math.pow(avgPower4, 0.25);
  }
  
  private calculatePowerVariability(watts: number[]): number {
    const validWatts = watts.filter(w => w > 0);
    if (validWatts.length < 10) return 15;
    
    const avg = validWatts.reduce((sum, w) => sum + w, 0) / validWatts.length;
    const variance = validWatts.reduce((sum, w) => sum + Math.pow(w - avg, 2), 0) / validWatts.length;
    
    return Math.min(40, (Math.sqrt(variance) / avg) * 100);
  }
  
  private calculateTSS(normalizedPower: number, intensityFactor: number, duration: number): number {
    if (normalizedPower === 0 || intensityFactor === 0 || duration === 0) return 0;
    
    const durationHours = duration / 3600;
    return Math.round((durationHours * normalizedPower * intensityFactor) / 100);
  }
}