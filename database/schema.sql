-- ========================
-- ESQUEMA AJUSTADO LUKSPEED v1.0
-- ========================

-- Tabla de usuarios
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT,
    avatar_url TEXT,
    strava_id TEXT UNIQUE,
    strava_access_token TEXT,
    strava_refresh_token TEXT,
    strava_token_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Perfil del ciclista
CREATE TABLE cyclist_profiles (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    height_cm REAL,
    inseam_cm REAL,
    torso_cm REAL,
    arm_length_cm REAL,
    cycling_experience TEXT CHECK (cycling_experience IN ('beginner', 'intermediate', 'advanced')),
    flexibility TEXT CHECK (flexibility IN ('low', 'medium', 'high')),
    primary_goal TEXT CHECK (primary_goal IN ('racing', 'endurance', 'comfort')),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Bicicletas
CREATE TABLE bicycles (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    strava_gear_id TEXT,
    brand TEXT,
    model TEXT,
    type TEXT CHECK (type IN ('road', 'mtb', 'gravel')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Fittings
CREATE TABLE fittings (
    id UUID PRIMARY KEY,
    bicycle_id UUID REFERENCES bicycles(id),
    saddle_height_mm REAL,
    saddle_setback_mm REAL,
    saddle_angle_deg REAL,
    handlebar_reach_mm REAL,
    handlebar_drop_mm REAL,
    crank_length_mm REAL,
    frame_stack_mm REAL,
    frame_reach_mm REAL,
    saddle_model TEXT,
    handlebar_model TEXT,
    is_active BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Configuraciones de componentes
CREATE TABLE component_configurations (
    id UUID PRIMARY KEY,
    bicycle_id UUID REFERENCES bicycles(id),
    fitting_id UUID REFERENCES fittings(id),
    component_type TEXT CHECK (component_type IN ('helmet', 'jersey', 'wheel', 'tire', 'sensor', 'others')),
    brand TEXT,
    model TEXT,
    pressure_psi REAL,
    width_mm REAL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- Join table para fittings y componentes (normalización futura)
CREATE TABLE fitting_components (
    fitting_id UUID REFERENCES fittings(id),
    component_id UUID REFERENCES component_configurations(id),
    PRIMARY KEY (fitting_id, component_id)
);

-- Actividades
CREATE TABLE activities (
    id BIGINT PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    bicycle_id UUID REFERENCES bicycles(id),
    fitting_id UUID REFERENCES fittings(id),
    name TEXT,
    type TEXT,
    distance_m REAL,
    moving_time_s INTEGER,
    elapsed_time_s INTEGER,
    total_elevation_gain_m REAL,
    average_speed_ms REAL,
    max_speed_ms REAL,
    average_power REAL,
    max_power REAL,
    normalized_power REAL,
    average_heartrate REAL,
    max_heartrate REAL,
    calories REAL,
    has_aerosensor_data BOOLEAN DEFAULT FALSE,
    ambient_conditions_json JSONB,
    start_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Data punto a punto
CREATE TABLE activity_data_points (
    id BIGSERIAL PRIMARY KEY,
    activity_id BIGINT REFERENCES activities(id),
    timestamp TIMESTAMP,
    power REAL,
    heart_rate REAL,
    cadence REAL,
    speed REAL,
    altitude REAL,
    distance REAL,
    temperature REAL,
    left_right_balance REAL,
    left_power REAL,
    right_power REAL,
    created_at TIMESTAMP DEFAULT now(),
    UNIQUE(activity_id, timestamp)
);

-- Condiciones ambientales
CREATE TABLE environmental_conditions (
    id UUID PRIMARY KEY,
    activity_id BIGINT REFERENCES activities(id),
    wind_speed_ms REAL,
    barometric_pressure_Pa REAL,
    temperature_c REAL,
    humidity_percent REAL,
    air_density_kgm3 REAL,
    recorded_at TIMESTAMP
);

-- Historial de peso
CREATE TABLE weight_history (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    weight_kg REAL,
    recorded_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- Recomendaciones generadas
CREATE TABLE recommendations (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    activity_id BIGINT REFERENCES activities(id),
    fitting_id UUID REFERENCES fittings(id),
    source TEXT CHECK (source IN ('FitAI', 'fitter_manual')),
    recommendation_json JSONB,
    generated_at TIMESTAMP DEFAULT now(),
    accepted BOOLEAN,
    notes TEXT
);

-- Índices sugeridos
CREATE INDEX idx_activity_user_id ON activities(user_id);
CREATE INDEX idx_data_point_activity_id ON activity_data_points(activity_id);
CREATE INDEX idx_environmental_conditions_activity_id ON environmental_conditions(activity_id);