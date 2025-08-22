-- ========================================
-- SPRINT 1.1: Sistema de Configuración Parametrizada
-- ========================================

-- Drop existing objects if they exist
DROP TABLE IF EXISTS system_config CASCADE;
DROP FUNCTION IF EXISTS resolve_config CASCADE;
DROP FUNCTION IF EXISTS get_config_with_source CASCADE;

-- Sistema de configuración parametrizada
CREATE TABLE system_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  value text NOT NULL,
  scope text NOT NULL CHECK (scope IN ('global', 'user', 'bicycle', 'fitting')),
  scope_id uuid, -- user_id, bicycle_id, fitting_id or NULL for global
  data_type text NOT NULL CHECK (data_type IN ('string', 'number', 'boolean', 'array')),
  description text,
  unit text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Índices optimizados
CREATE UNIQUE INDEX idx_system_config_key_scope ON system_config(key, scope, scope_id);
CREATE INDEX idx_system_config_key ON system_config(key);
CREATE INDEX idx_system_config_scope_id ON system_config(scope_id);

-- Función de resolución de precedencia
CREATE OR REPLACE FUNCTION resolve_config(
  config_key text,
  fitting_id_param uuid DEFAULT NULL,
  bicycle_id_param uuid DEFAULT NULL,
  user_id_param uuid DEFAULT NULL
) RETURNS text AS $$
DECLARE
  result text;
BEGIN
  -- Precedencia: fitting > bicycle > user > global
  
  -- 1. Fitting level
  IF fitting_id_param IS NOT NULL THEN
    SELECT value INTO result 
    FROM system_config 
    WHERE key = config_key AND scope = 'fitting' AND scope_id = fitting_id_param;
    IF result IS NOT NULL THEN RETURN result; END IF;
  END IF;
  
  -- 2. Bicycle level  
  IF bicycle_id_param IS NOT NULL THEN
    SELECT value INTO result
    FROM system_config 
    WHERE key = config_key AND scope = 'bicycle' AND scope_id = bicycle_id_param;
    IF result IS NOT NULL THEN RETURN result; END IF;
  END IF;
  
  -- 3. User level
  IF user_id_param IS NOT NULL THEN
    SELECT value INTO result
    FROM system_config 
    WHERE key = config_key AND scope = 'user' AND scope_id = user_id_param;
    IF result IS NOT NULL THEN RETURN result; END IF;
  END IF;
  
  -- 4. Global level
  SELECT value INTO result
  FROM system_config 
  WHERE key = config_key AND scope = 'global' AND scope_id IS NULL;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener configuración con fuente
CREATE OR REPLACE FUNCTION get_config_with_source(
  config_key text,
  fitting_id_param uuid DEFAULT NULL,
  bicycle_id_param uuid DEFAULT NULL,
  user_id_param uuid DEFAULT NULL
) RETURNS TABLE (
  resolved_value text,
  active_scope text,
  active_scope_id uuid,
  data_type text,
  description text,
  unit text
) AS $$
BEGIN
  -- Precedencia: fitting > bicycle > user > global
  
  -- 1. Fitting level
  IF fitting_id_param IS NOT NULL THEN
    RETURN QUERY 
    SELECT sc.value, sc.scope, sc.scope_id, sc.data_type, sc.description, sc.unit
    FROM system_config sc
    WHERE sc.key = config_key AND sc.scope = 'fitting' AND sc.scope_id = fitting_id_param;
    IF FOUND THEN RETURN; END IF;
  END IF;
  
  -- 2. Bicycle level  
  IF bicycle_id_param IS NOT NULL THEN
    RETURN QUERY
    SELECT sc.value, sc.scope, sc.scope_id, sc.data_type, sc.description, sc.unit
    FROM system_config sc
    WHERE sc.key = config_key AND sc.scope = 'bicycle' AND sc.scope_id = bicycle_id_param;
    IF FOUND THEN RETURN; END IF;
  END IF;
  
  -- 3. User level
  IF user_id_param IS NOT NULL THEN
    RETURN QUERY
    SELECT sc.value, sc.scope, sc.scope_id, sc.data_type, sc.description, sc.unit
    FROM system_config sc
    WHERE sc.key = config_key AND sc.scope = 'user' AND sc.scope_id = user_id_param;
    IF FOUND THEN RETURN; END IF;
  END IF;
  
  -- 4. Global level
  RETURN QUERY
  SELECT sc.value, sc.scope, sc.scope_id, sc.data_type, sc.description, sc.unit
  FROM system_config sc
  WHERE sc.key = config_key AND sc.scope = 'global' AND sc.scope_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their config" ON system_config
  FOR SELECT USING (
    scope = 'global' OR
    (scope = 'user' AND scope_id = auth.uid()) OR
    (scope = 'bicycle' AND scope_id IN (SELECT id FROM bicycles WHERE user_id = auth.uid())) OR
    (scope = 'fitting' AND scope_id IN (SELECT f.id FROM fittings f JOIN bicycles b ON f.bicycle_id = b.id WHERE b.user_id = auth.uid()))
  );

CREATE POLICY "Users can manage their config" ON system_config
  FOR ALL USING (
    (scope = 'user' AND scope_id = auth.uid()) OR
    (scope = 'bicycle' AND scope_id IN (SELECT id FROM bicycles WHERE user_id = auth.uid())) OR
    (scope = 'fitting' AND scope_id IN (SELECT f.id FROM fittings f JOIN bicycles b ON f.bicycle_id = b.id WHERE b.user_id = auth.uid()))
  );

-- ========================================
-- INSERTAR TODAS LAS CONFIGURACIONES (130+)
-- ========================================

-- 1. AUTENTICACIÓN Y TOKENS (US-001)
INSERT INTO system_config (key, value, scope, scope_id, data_type, description, unit) VALUES
('auth.token_expiry_warning_hours', '48', 'global', NULL, 'number', 'Horas antes del vencimiento para mostrar advertencia de token Strava', 'h'),
('auth.refresh_before_expiry_min', '10', 'global', NULL, 'number', 'Minutos antes del vencimiento para refrescar token automáticamente', 'min'),
('auth.max_retry_attempts', '3', 'global', NULL, 'number', 'Número máximo de reintentos para autenticación', 'attempts'),
('auth.retry_backoff_seconds', '30', 'global', NULL, 'number', 'Tiempo de espera entre reintentos', 's'),
('auth.session_timeout_hours', '24', 'global', NULL, 'number', 'Tiempo de vida de la sesión de usuario', 'h');

-- 2. INGESTA Y CALIDAD DE DATOS (US-002)
INSERT INTO system_config (key, value, scope, scope_id, data_type, description, unit) VALUES
('ingest.fit_min_file_size_kb', '50', 'global', NULL, 'number', 'Tamaño mínimo de archivo .fit para procesar', 'kB'),
('ingest.fit_max_file_size_mb', '25', 'global', NULL, 'number', 'Tamaño máximo de archivo .fit permitido', 'MB'),
('ingest.data_gap_max_seconds', '3', 'global', NULL, 'number', 'Brecha máxima permitida entre puntos de datos', 's'),
('ingest.batch_size', '100', 'global', NULL, 'number', 'Número de actividades a procesar en lote', 'items'),
('ingest.processing_timeout_minutes', '15', 'global', NULL, 'number', 'Tiempo límite para procesar una actividad', 'min');

-- 3. CALIDAD DE COBERTURA DE DATOS (US-002/004)
INSERT INTO system_config (key, value, scope, scope_id, data_type, description, unit) VALUES
('quality.min_power_coverage_pct', '70', 'global', NULL, 'number', 'Cobertura mínima de datos de potencia requerida', '%'),
('quality.min_speed_coverage_pct', '90', 'global', NULL, 'number', 'Cobertura mínima de datos de velocidad requerida', '%'),
('quality.min_cadence_coverage_pct', '60', 'global', NULL, 'number', 'Cobertura mínima de datos de cadencia requerida', '%'),
('quality.min_hr_coverage_pct', '60', 'global', NULL, 'number', 'Cobertura mínima de datos de frecuencia cardíaca requerida', '%'),
('quality.min_altitude_coverage_pct', '80', 'global', NULL, 'number', 'Cobertura mínima de datos de altitud requerida', '%'),
('quality.min_temperature_coverage_pct', '50', 'global', NULL, 'number', 'Cobertura mínima de datos de temperatura requerida', '%'),
('quality.outlier_z_threshold', '3.0', 'global', NULL, 'number', 'Umbral Z para detectar valores atípicos', 'z');

-- 4. AGREGACIÓN Y VISUALIZACIÓN (US-003)
INSERT INTO system_config (key, value, scope, scope_id, data_type, description, unit) VALUES
('agg.window_np_seconds', '30', 'global', NULL, 'number', 'Ventana de tiempo para cálculo de potencia normalizada', 's'),
('viz.smooth_window_short', '5', 'global', NULL, 'number', 'Ventana de suavizado corta para visualizaciones', 's'),
('viz.smooth_window_long', '15', 'global', NULL, 'number', 'Ventana de suavizado larga para visualizaciones', 's'),
('agg.by_distance_bins', '[10,100,1000]', 'global', NULL, 'array', 'Bins de distancia para agregaciones', 'm'),
('agg.by_time_bins', '[60,300,900]', 'global', NULL, 'array', 'Bins de tiempo para agregaciones', 's'),
('viz.chart_points_max', '2000', 'global', NULL, 'number', 'Número máximo de puntos en gráficos', 'points');

-- 5. TERRENO Y CLASIFICACIÓN (US-005/011)
INSERT INTO system_config (key, value, scope, scope_id, data_type, description, unit) VALUES
('class.flat_grade_abs_max_pct', '0.5', 'global', NULL, 'number', 'Gradiente máximo absoluto para considerar terreno plano', '%'),
('class.rolling_grade_min_pct', '0.5', 'global', NULL, 'number', 'Gradiente mínimo para considerar terreno ondulado', '%'),
('class.rolling_grade_max_pct', '3.0', 'global', NULL, 'number', 'Gradiente máximo para considerar terreno ondulado', '%'),
('class.climbing_grade_min_pct', '3.0', 'global', NULL, 'number', 'Gradiente mínimo para considerar subida', '%'),
('class.descent_grade_max_pct', '-2.0', 'global', NULL, 'number', 'Gradiente máximo para considerar bajada', '%'),
('class.segment_min_distance_m', '500', 'global', NULL, 'number', 'Distancia mínima para considerar un segmento', 'm');

-- 6. ESTIMACIÓN AERODINÁMICA (US-008)
INSERT INTO system_config (key, value, scope, scope_id, data_type, description, unit) VALUES
('est.cda_grade_abs_max_pct', '1.5', 'global', NULL, 'number', 'Gradiente máximo absoluto para estimación CdA', '%'),
('est.crr_grade_abs_max_pct', '0.3', 'global', NULL, 'number', 'Gradiente máximo absoluto para estimación Crr', '%'),
('est.cda_min_speed_mps', '7.0', 'global', NULL, 'number', 'Velocidad mínima para estimación CdA válida', 'm/s'),
('est.transmission_efficiency', '0.975', 'global', NULL, 'number', 'Eficiencia de transmisión asumida', '-'),
('est.trim_percentile', '5', 'global', NULL, 'number', 'Percentil a recortar en estimaciones', '%'),
('est.min_data_points', '100', 'global', NULL, 'number', 'Puntos mínimos para estimación confiable', 'points');

-- 7. MATCHING Y COMPARABILIDAD (US-011)
INSERT INTO system_config (key, value, scope, scope_id, data_type, description, unit) VALUES
('match.delta_speed_max_kmh', '2', 'global', NULL, 'number', 'Delta máximo de velocidad para matching de segmentos', 'km/h'),
('match.delta_temp_max_c', '5', 'global', NULL, 'number', 'Delta máximo de temperatura para matching', '°C'),
('match.delta_altitude_max_m', '200', 'global', NULL, 'number', 'Delta máximo de altitud para matching', 'm'),
('match.min_pairs_required', '3', 'global', NULL, 'number', 'Mínimo de pares requeridos para comparación válida', 'pares'),
('match.min_pair_duration_s', '120', 'global', NULL, 'number', 'Duración mínima de segmento para matching', 's'),
('match.similarity_threshold', '0.8', 'global', NULL, 'number', 'Umbral de similitud para matching automático', '-');

-- 8. NORMALIZACIÓN Y REFERENCIAS (US-012)
INSERT INTO system_config (key, value, scope, scope_id, data_type, description, unit) VALUES
('norm.ref_temp_c', '20', 'global', NULL, 'number', 'Temperatura de referencia para normalización', '°C'),
('norm.ref_altitude_m', '0', 'global', NULL, 'number', 'Altitud de referencia para normalización', 'm'),
('norm.ref_pressure_pa', '101325', 'global', NULL, 'number', 'Presión de referencia para normalización', 'Pa'),
('norm.air_density_ref', '1.225', 'global', NULL, 'number', 'Densidad del aire de referencia', 'kg/m³');

-- 9. ALERTAS DE EFICIENCIA (US-010)
INSERT INTO system_config (key, value, scope, scope_id, data_type, description, unit) VALUES
('eff.efficiency_drop_warn_pct', '-5', 'global', NULL, 'number', 'Caída de eficiencia para alerta amarilla', '%'),
('eff.efficiency_drop_high_pct', '-10', 'global', NULL, 'number', 'Caída de eficiencia para alerta roja', '%'),
('cda.delta_warn_pct', '3', 'global', NULL, 'number', 'Delta CdA para alerta amarilla', '%'),
('cda.delta_high_pct', '6', 'global', NULL, 'number', 'Delta CdA para alerta roja', '%'),
('crr.warn_threshold', '0.007', 'global', NULL, 'number', 'Umbral Crr para alerta amarilla', '-'),
('crr.high_threshold', '0.009', 'global', NULL, 'number', 'Umbral Crr para alerta roja', '-');

-- 10. ESTADÍSTICAS Y SIGNIFICANCIA (US-010)
INSERT INTO system_config (key, value, scope, scope_id, data_type, description, unit) VALUES
('stats.z_warn', '1.0', 'global', NULL, 'number', 'Z-score para nivel de advertencia', 'z'),
('stats.z_significant', '1.96', 'global', NULL, 'number', 'Z-score para significancia estadística', 'z'),
('stats.z_high', '2.58', 'global', NULL, 'number', 'Z-score para alta significancia', 'z'),
('stats.confidence_level', '0.95', 'global', NULL, 'number', 'Nivel de confianza para intervalos', '-'),
('baseline.window_days_short', '30', 'global', NULL, 'number', 'Ventana corta para baseline estadístico', 'd'),
('baseline.window_days_long', '90', 'global', NULL, 'number', 'Ventana larga para baseline estadístico', 'd');

-- 11. DERIVADAS Y MÉTRICAS INSTANTÁNEAS (US-003)
INSERT INTO system_config (key, value, scope, scope_id, data_type, description, unit) VALUES
('deriv.min_cadence_for_torque_rpm', '30', 'global', NULL, 'number', 'Cadencia mínima para cálculo de torque', 'rpm'),
('deriv.accel_spike_percentile', '95', 'global', NULL, 'number', 'Percentil para detectar picos de aceleración', 'pctl'),
('deriv.brake_spike_threshold_ms2', '-1.0', 'global', NULL, 'number', 'Umbral para detectar frenadas bruscas', 'm/s²'),
('deriv.grade_smooth_window', '10', 'global', NULL, 'number', 'Ventana de suavizado para gradiente', 's'),
('deriv.power_smooth_window', '3', 'global', NULL, 'number', 'Ventana de suavizado para potencia instantánea', 's');

-- 12. HR-POWER DECOUPLING (US-010)
INSERT INTO system_config (key, value, scope, scope_id, data_type, description, unit) VALUES
('hrp.decoupling_warn_pct', '5', 'global', NULL, 'number', 'Desacoplamiento HR-Power para advertencia', '%'),
('hrp.decoupling_high_pct', '8', 'global', NULL, 'number', 'Desacoplamiento HR-Power crítico', '%'),
('hrp.analysis_window_minutes', '20', 'global', NULL, 'number', 'Ventana de análisis para desacoplamiento', 'min'),
('hrp.min_duration_minutes', '60', 'global', NULL, 'number', 'Duración mínima para análisis válido', 'min');

-- 13. ZONAS DE POTENCIA (US-004)
INSERT INTO system_config (key, value, scope, scope_id, data_type, description, unit) VALUES
('zones.power_z1_max_pct', '55', 'global', NULL, 'number', 'Porcentaje FTP máximo para Zona 1', '%'),
('zones.power_z2_max_pct', '75', 'global', NULL, 'number', 'Porcentaje FTP máximo para Zona 2', '%'),
('zones.power_z3_max_pct', '90', 'global', NULL, 'number', 'Porcentaje FTP máximo para Zona 3', '%'),
('zones.power_z4_max_pct', '105', 'global', NULL, 'number', 'Porcentaje FTP máximo para Zona 4', '%'),
('zones.power_z5_max_pct', '120', 'global', NULL, 'number', 'Porcentaje FTP máximo para Zona 5', '%'),
('zones.hr_z1_max_pct', '68', 'global', NULL, 'number', 'Porcentaje FCmáx máximo para Zona HR 1', '%');

-- 14. FTP Y PERFORMANCE (US-004)
INSERT INTO system_config (key, value, scope, scope_id, data_type, description, unit) VALUES
('perf.ftp_estimate_min_duration_s', '1200', 'global', NULL, 'number', 'Duración mínima para estimación FTP', 's'),
('perf.ftp_test_duration_s', '1200', 'global', NULL, 'number', 'Duración estándar para test FTP (20min)', 's'),
('perf.critical_power_durations', '[300,1200,3600]', 'global', NULL, 'array', 'Duraciones para curva de potencia crítica', 's'),
('perf.vo2max_estimate_min_duration_s', '480', 'global', NULL, 'number', 'Duración mínima para estimación VO2max', 's');

-- 15. LÍMITES OPERATIVOS Y SISTEMA
INSERT INTO system_config (key, value, scope, scope_id, data_type, description, unit) VALUES
('export.max_file_size_mb', '200', 'global', NULL, 'number', 'Tamaño máximo para archivos de exportación', 'MB'),
('export.max_activities_batch', '500', 'global', NULL, 'number', 'Máximo de actividades por lote de exportación', 'items'),
('logs.retention_days', '90', 'global', NULL, 'number', 'Días de retención para logs del sistema', 'd'),
('cache.ttl_seconds', '300', 'global', NULL, 'number', 'Tiempo de vida de cache por defecto', 's'),
('webhook.retry_delays_s', '[5,30,300]', 'global', NULL, 'array', 'Delays para reintentos de webhooks', 's'),
('api.rate_limit_per_minute', '100', 'global', NULL, 'number', 'Límite de requests por minuto por usuario', 'req/min');

-- 16. BIKE FITTING Y TOLERANCIAS (US-007)
INSERT INTO system_config (key, value, scope, scope_id, data_type, description, unit) VALUES
('fit.delta_saddle_height_warn_mm', '5', 'global', NULL, 'number', 'Delta altura sillín para advertencia', 'mm'),
('fit.delta_saddle_height_high_mm', '10', 'global', NULL, 'number', 'Delta altura sillín crítico', 'mm'),
('fit.delta_setback_warn_mm', '5', 'global', NULL, 'number', 'Delta setback sillín para advertencia', 'mm'),
('fit.delta_setback_high_mm', '10', 'global', NULL, 'number', 'Delta setback sillín crítico', 'mm'),
('fit.delta_handlebar_drop_warn_mm', '10', 'global', NULL, 'number', 'Delta drop manillar para advertencia', 'mm'),
('fit.saddle_angle_range_deg', '[-3,3]', 'global', NULL, 'array', 'Rango ángulo sillín permitido', 'deg'),
('fit.stem_length_range_mm', '[70,130]', 'global', NULL, 'array', 'Rango longitud potencia permitido', 'mm');

-- 17. BIOMECÁNICA Y ANTROPOMETRÍA
INSERT INTO system_config (key, value, scope, scope_id, data_type, description, unit) VALUES
('bio.cadence_optimal_range', '[80,100]', 'global', NULL, 'array', 'Rango óptimo de cadencia', 'rpm'),
('bio.leg_length_measurement_precision_mm', '2', 'global', NULL, 'number', 'Precisión requerida medición pierna', 'mm'),
('bio.torso_measurement_precision_mm', '5', 'global', NULL, 'number', 'Precisión requerida medición torso', 'mm'),
('bio.flexibility_score_max', '10', 'global', NULL, 'number', 'Puntuación máxima flexibilidad', 'score');

-- 18. WEATHER Y CONDICIONES AMBIENTALES
INSERT INTO system_config (key, value, scope, scope_id, data_type, description, unit) VALUES
('weather.wind_speed_high_threshold_mps', '8', 'global', NULL, 'number', 'Velocidad viento alta para alertas', 'm/s'),
('weather.temp_extreme_low_c', '0', 'global', NULL, 'number', 'Temperatura extrema baja', '°C'),
('weather.temp_extreme_high_c', '35', 'global', NULL, 'number', 'Temperatura extrema alta', '°C'),
('weather.humidity_high_threshold_pct', '80', 'global', NULL, 'number', 'Humedad alta para alertas', '%');

-- 19. MACHINE LEARNING Y PREDICCIÓN
INSERT INTO system_config (key, value, scope, scope_id, data_type, description, unit) VALUES
('ml.training_data_min_activities', '50', 'global', NULL, 'number', 'Mínimo actividades para entrenar modelos', 'activities'),
('ml.prediction_confidence_threshold', '0.7', 'global', NULL, 'number', 'Confianza mínima para predicciones', '-'),
('ml.model_retrain_frequency_days', '30', 'global', NULL, 'number', 'Frecuencia reentrenamiento modelos', 'd'),
('ml.feature_importance_threshold', '0.1', 'global', NULL, 'number', 'Umbral importancia features', '-');

-- 20. INTEGRACIÓN Y SINCRONIZACIÓN
INSERT INTO system_config (key, value, scope, scope_id, data_type, description, unit) VALUES
('sync.strava_activities_per_batch', '50', 'global', NULL, 'number', 'Actividades Strava por lote', 'activities'),
('sync.full_sync_frequency_hours', '24', 'global', NULL, 'number', 'Frecuencia sincronización completa', 'h'),
('sync.incremental_sync_frequency_minutes', '15', 'global', NULL, 'number', 'Frecuencia sincronización incremental', 'min'),
('sync.max_concurrent_downloads', '5', 'global', NULL, 'number', 'Máximo descargas concurrentes', 'downloads');

-- Actualizar timestamps
UPDATE system_config SET updated_at = now();

-- Comentario final
COMMENT ON TABLE system_config IS 'Sistema de configuración parametrizada con precedencia jerárquica: fitting > bicycle > user > global';