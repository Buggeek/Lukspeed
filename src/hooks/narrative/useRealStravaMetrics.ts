import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/hooks/useAuth';
import { NarrativeMetric } from '@/types/narrative';
import { StravaSyncService } from '@/services/StravaSync';

const supabaseUrl = 'https://tebrbispkzjtlilpquaz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlYnJiaXNwa3pqdGxpbHBxdWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMzU1MzYsImV4cCI6MjA3MDYxMTUzNn0.fc45UJE8HIPvUODdQVMFNL2uDQCOD27gLWk24ghtaws';

const supabase = createClient(supabaseUrl, supabaseKey);

export function useRealStravaMetrics() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<NarrativeMetric[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'completed'>('idle');
  
  useEffect(() => {
    if (!user) return;
    
    loadRealMetrics();
  }, [user]);
  
  const loadRealMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Cargando métricas reales del usuario...');
      
      // 1. Verificar si hay actividades sincronizadas
      const { data: activities, error: activitiesError } = await supabase
        .from('app_dbd0941867_activities')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false })
        .limit(30);
      
      if (activitiesError) {
        console.error('❌ Error consultando actividades:', activitiesError);
        throw activitiesError;
      }
      
      console.log(`📊 Encontradas ${activities?.length || 0} actividades en BD`);
      
      if (!activities || activities.length === 0) {
        console.log('🔄 No hay actividades, iniciando sincronización...');
        // Triggear sincronización inicial
        await triggerInitialSync();
        return;
      }
      
      console.log('✅ Generando métricas narrativas desde datos reales...');
      
      // 2. Generar métricas narrativas desde datos reales
      const narrativeMetrics = generateNarrativeMetrics(activities);
      
      setMetrics(narrativeMetrics);
      console.log(`✅ ${narrativeMetrics.length} métricas narrativas generadas`);
      
    } catch (error) {
      console.error('❌ Error cargando métricas reales:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      
      // Fallback a datos demo
      console.log('🔄 Fallback a métricas demo...');
      const fallbackMetrics = generateFallbackMetrics();
      setMetrics(fallbackMetrics);
      
    } finally {
      setIsLoading(false);
    }
  };
  
  const triggerInitialSync = async () => {
    try {
      setSyncStatus('syncing');
      const syncService = new StravaSyncService();
      
      console.log('🔄 Iniciando sincronización inicial con Strava...');
      
      const synced = await syncService.syncInitialActivities(user.id, 30);
      
      console.log(`✅ Sincronizadas ${synced.length} actividades`);
      setSyncStatus('completed');
      
      // Recargar métricas
      setTimeout(() => loadRealMetrics(), 2000);
      
    } catch (error) {
      console.error('❌ Error en sincronización inicial:', error);
      setError('Error conectando con Strava. Verifica tu conexión.');
      setSyncStatus('idle');
      
      // Fallback a datos demo
      const fallbackMetrics = generateFallbackMetrics();
      setMetrics(fallbackMetrics);
    }
  };
  
  const generateNarrativeMetrics = (activities: any[]): NarrativeMetric[] => {
    if (activities.length === 0) return generateFallbackMetrics();
    
    const latest = activities[0];
    const historical = activities.slice(1);
    
    console.log(`📊 Generando narrativas para actividad: ${latest.name}`);
    
    return [
      // FTP Real
      {
        id: 'ftp',
        type: 'power',
        title: 'Fuerza Ciclista',
        icon: '⚡',
        value: latest.estimated_ftp?.toString() || '0',
        unit: 'W',
        change: calculateFTPChange(latest, historical),
        interpretation: generateFTPInterpretation(latest.estimated_ftp, calculateFTPChange(latest, historical)),
        context: generateFTPContext(latest.estimated_ftp),
        history: getFTPHistory(activities),
        trend: calculateTrend(getFTPHistory(activities)),
        recommendation: generateFTPRecommendation(latest.estimated_ftp, calculateFTPChange(latest, historical))
      },
      
      // CdA Real
      {
        id: 'aerodynamics',
        type: 'aerodynamics',
        title: 'Eficiencia Aerodinámica',
        icon: '🌪️',
        value: latest.estimated_cda?.toFixed(3) || '0.320',
        unit: 'm²',
        change: calculateCdAChange(latest, historical),
        interpretation: generateCdAInterpretation(latest.estimated_cda, calculateCdAChange(latest, historical)),
        context: generateCdAContext(latest.estimated_cda),
        history: getCdAHistory(activities),
        trend: calculateTrend(getCdAHistory(activities)),
        recommendation: generateCdARecommendation(latest.estimated_cda, calculateCdAChange(latest, historical))
      },
      
      // Eficiencia Real
      {
        id: 'efficiency', 
        type: 'technique',
        title: 'Técnica de Pedaleo',
        icon: '🔄',
        value: latest.mechanical_efficiency?.toFixed(1) || '85.0',
        unit: '%',
        change: calculateEfficiencyChange(latest, historical),
        interpretation: generateEfficiencyInterpretation(latest.mechanical_efficiency, calculateEfficiencyChange(latest, historical)),
        context: generateEfficiencyContext(latest.mechanical_efficiency),
        history: getEfficiencyHistory(activities),
        trend: calculateTrend(getEfficiencyHistory(activities)),
        recommendation: generateEfficiencyRecommendation(latest.mechanical_efficiency, calculateEfficiencyChange(latest, historical))
      },
      
      // Consistencia Real
      {
        id: 'consistency',
        type: 'technique', 
        title: 'Consistencia Técnica',
        icon: '📊',
        value: (100 - (latest.cadence_variability || 15)).toFixed(1),
        unit: '%',
        change: -calculateCadenceVariabilityChange(latest, historical),
        interpretation: generateConsistencyInterpretation(latest.cadence_variability),
        context: generateConsistencyContext(latest.cadence_variability),
        history: getConsistencyHistory(activities),
        trend: calculateTrend(getConsistencyHistory(activities)),
        recommendation: generateConsistencyRecommendation(latest.cadence_variability)
      }
    ];
  };
  
  // Cálculos de cambios
  const calculateFTPChange = (latest: any, historical: any[]): number => {
    if (!historical.length || !latest.estimated_ftp) return 0;
    
    const previousFTP = historical.find(a => a.estimated_ftp > 0)?.estimated_ftp;
    if (!previousFTP) return 0;
    
    return ((latest.estimated_ftp - previousFTP) / previousFTP) * 100;
  };
  
  const calculateCdAChange = (latest: any, historical: any[]): number => {
    if (!historical.length || !latest.estimated_cda) return 0;
    
    const previousCdA = historical.find(a => a.estimated_cda > 0)?.estimated_cda;
    if (!previousCdA) return 0;
    
    return ((latest.estimated_cda - previousCdA) / previousCdA) * 100;
  };
  
  const calculateEfficiencyChange = (latest: any, historical: any[]): number => {
    if (!historical.length || !latest.mechanical_efficiency) return 0;
    
    const previousEfficiency = historical.find(a => a.mechanical_efficiency > 0)?.mechanical_efficiency;
    if (!previousEfficiency) return 0;
    
    return ((latest.mechanical_efficiency - previousEfficiency) / previousEfficiency) * 100;
  };
  
  const calculateCadenceVariabilityChange = (latest: any, historical: any[]): number => {
    if (!historical.length || !latest.cadence_variability) return 0;
    
    const previousVariability = historical.find(a => a.cadence_variability > 0)?.cadence_variability;
    if (!previousVariability) return 0;
    
    return ((latest.cadence_variability - previousVariability) / previousVariability) * 100;
  };
  
  // Generadores de historiales
  const getFTPHistory = (activities: any[]): number[] => {
    return activities
      .filter(a => a.estimated_ftp > 0)
      .slice(0, 10)
      .map(a => a.estimated_ftp)
      .reverse();
  };
  
  const getCdAHistory = (activities: any[]): number[] => {
    return activities
      .filter(a => a.estimated_cda > 0)
      .slice(0, 10)
      .map(a => a.estimated_cda)
      .reverse();
  };
  
  const getEfficiencyHistory = (activities: any[]): number[] => {
    return activities
      .filter(a => a.mechanical_efficiency > 0)
      .slice(0, 10)
      .map(a => a.mechanical_efficiency)
      .reverse();
  };
  
  const getConsistencyHistory = (activities: any[]): number[] => {
    return activities
      .filter(a => a.cadence_variability > 0)
      .slice(0, 10)
      .map(a => 100 - a.cadence_variability)
      .reverse();
  };
  
  const calculateTrend = (history: number[]): 'up' | 'down' | 'stable' => {
    if (history.length < 2) return 'stable';
    
    const recent = history.slice(-3).reduce((sum, val) => sum + val, 0) / Math.min(3, history.length);
    const older = history.slice(0, -3).reduce((sum, val) => sum + val, 0) / Math.max(1, history.length - 3);
    
    const change = (recent - older) / older * 100;
    
    if (change > 2) return 'up';
    if (change < -2) return 'down';
    return 'stable';
  };
  
  // Generadores de interpretaciones
  const generateFTPInterpretation = (ftp: number, change: number): string => {
    if (change > 5) return "Tu motor está significativamente más fuerte";
    if (change > 2) return "Tu motor está más fuerte";
    if (change < -5) return "Tu motor ha perdido algo de fuerza";
    if (change < -2) return "Tu motor necesita trabajo";
    return "Tu motor se mantiene estable";
  };
  
  const generateFTPContext = (ftp: number): string => {
    if (ftp > 350) return "Potencia de élite mundial";
    if (ftp > 300) return "Potencia de competidor avanzado";
    if (ftp > 250) return "Potencia de ciclista experimentado";
    if (ftp > 200) return "Potencia de ciclista recreativo";
    return "Potencia en desarrollo";
  };
  
  const generateFTPRecommendation = (ftp: number, change: number): string => {
    if (change > 5) return "Mantén el entrenamiento actual, va excelente";
    if (change < -5) return "Enfócate en intervalos de potencia y descanso";
    if (ftp < 200) return "Bloques de base aeróbica y tempo";
    if (ftp < 300) return "Intervalos Sweet Spot y threshold";
    return "Trabajo de VO2max y neuromuscular";
  };
  
  const generateCdAInterpretation = (cda: number, change: number): string => {
    if (change < -3) return "Cortas el viento mucho mejor";
    if (change < -1) return "Cortas el viento mejor";
    if (change > 3) return "Tu aerodinámica empeoró";
    if (change > 1) return "Tu aerodinámica necesita trabajo";
    return "Tu aerodinámica se mantiene";
  };
  
  const generateCdAContext = (cda: number): string => {
    if (cda < 0.25) return "Aerodinámica excelente";
    if (cda < 0.30) return "Aerodinámica muy buena";
    if (cda < 0.35) return "Aerodinámica buena";
    if (cda < 0.40) return "Aerodinámica mejorable";
    return "Aerodinámica necesita trabajo";
  };
  
  const generateCdARecommendation = (cda: number, change: number): string => {
    if (cda > 0.35) return "Trabajar posición: brazos más juntos, espalda plana";
    if (cda > 0.30) return "Ajustar altura del manillar y posición";
    if (change > 2) return "Revisar qué cambió en tu posición";
    return "Mantener posición aerodinámica actual";
  };
  
  const generateEfficiencyInterpretation = (efficiency: number, change: number): string => {
    if (change > 3) return "Tu técnica mejoró notablemente";
    if (change > 1) return "Tu técnica está mejorando";
    if (change < -3) return "Tu técnica empeoró";
    if (change < -1) return "Tu técnica necesita atención";
    return "Tu técnica se mantiene consistente";
  };
  
  const generateEfficiencyContext = (efficiency: number): string => {
    if (efficiency > 90) return "Técnica excelente";
    if (efficiency > 85) return "Técnica muy buena";
    if (efficiency > 80) return "Técnica buena";
    if (efficiency > 75) return "Técnica mejorable";
    return "Técnica necesita trabajo";
  };
  
  const generateEfficiencyRecommendation = (efficiency: number, change: number): string => {
    if (efficiency < 80) return "Trabajo de técnica: cadencia y suavidad";
    if (efficiency < 85) return "Intervalos de cadencia alta y baja";
    if (change < -2) return "Revisar fatiga y forma de pedaleo";
    return "Mantener trabajo técnico actual";
  };
  
  const generateConsistencyInterpretation = (variability: number): string => {
    if (variability < 10) return "Tu pedaleo es muy consistente";
    if (variability < 15) return "Tu pedaleo es consistente";
    if (variability < 20) return "Tu pedaleo es algo irregular";
    if (variability < 25) return "Tu pedaleo necesita más consistencia";
    return "Tu pedaleo es muy irregular";
  };
  
  const generateConsistencyContext = (variability: number): string => {
    if (variability < 10) return "Consistencia excelente";
    if (variability < 15) return "Consistencia muy buena";
    if (variability < 20) return "Consistencia buena";
    if (variability < 25) return "Consistencia mejorable";
    return "Consistencia necesita trabajo";
  };
  
  const generateConsistencyRecommendation = (variability: number): string => {
    if (variability > 20) return "Drills de cadencia constante y metronomo";
    if (variability > 15) return "Trabajo de técnica y cadencia";
    if (variability > 10) return "Mantener enfoque en suavidad";
    return "Mantener consistencia actual";
  };
  
  // Datos de fallback (demo)
  const generateFallbackMetrics = (): NarrativeMetric[] => {
    return [
      {
        id: 'ftp',
        type: 'power',
        title: 'Fuerza Ciclista',
        icon: '⚡',
        value: '295',
        unit: 'W',
        change: 2.4,
        interpretation: "Tu motor está más fuerte",
        context: "Potencia de ciclista experimentado",
        history: [285, 288, 292, 295],
        trend: 'up',
        recommendation: "Intervalos Sweet Spot para romper meseta"
      },
      {
        id: 'aerodynamics',
        type: 'aerodynamics',
        title: 'Eficiencia Aerodinámica',
        icon: '🌪️',
        value: '0.318',
        unit: 'm²',
        change: -1.9,
        interpretation: "Cortas el viento mejor",
        context: "Aerodinámica buena",
        history: [0.335, 0.328, 0.322, 0.318],
        trend: 'up',
        recommendation: "Mantener posición aerodinámica actual"
      },
      {
        id: 'efficiency',
        type: 'technique',
        title: 'Técnica de Pedaleo',
        icon: '🔄',
        value: '87.3',
        unit: '%',
        change: 1.8,
        interpretation: "Tu técnica está mejorando",
        context: "Técnica muy buena",
        history: [84.2, 85.1, 86.5, 87.3],
        trend: 'up',
        recommendation: "Mantener trabajo técnico actual"
      },
      {
        id: 'consistency',
        type: 'technique',
        title: 'Consistencia Técnica',
        icon: '📊',
        value: '82.7',
        unit: '%',
        change: 3.2,
        interpretation: "Tu pedaleo es más consistente",
        context: "Consistencia buena",
        history: [78.1, 79.8, 81.2, 82.7],
        trend: 'up',
        recommendation: "Mantener enfoque en suavidad"
      }
    ];
  };
  
  return {
    metrics,
    isLoading,
    error,
    syncStatus,
    refresh: loadRealMetrics,
    isRealData: Boolean(metrics && !error && syncStatus !== 'syncing')
  };
}