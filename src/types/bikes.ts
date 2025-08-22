export interface BikeComponent {
  id: string;
  type: 'frame' | 'fork' | 'wheels' | 'groupset' | 'cockpit' | 'contact' | 'drivetrain';
  category: string;
  brand: string;
  model: string;
  specifications: Record<string, string | number | boolean | object>;
  weight?: number; // grams
  price?: number;
  installation_date?: string;
  notes?: string;
}

export interface Frame extends BikeComponent {
  type: 'frame';
  specifications: {
    material: 'carbon' | 'aluminum' | 'steel' | 'titanium';
    size: string;
    geometry: {
      stack: number; // mm 
      reach: number; // mm
      top_tube_length: number; // mm
      seat_tube_angle: number; // degrees
      head_tube_angle: number; // degrees
      chainstay_length: number; // mm
      wheelbase: number; // mm
      bottom_bracket_drop: number; // mm
      fork_rake: number; // mm
    };
    aerodynamics: {
      cda_contribution: number; // m²
      wind_tunnel_tested: boolean;
    };
  };
}

export interface Wheels extends BikeComponent {
  type: 'wheels';
  specifications: {
    rim_depth: number; // mm
    rim_width_internal: number; // mm
    rim_width_external: number; // mm
    tire_width: number; // mm
    tire_pressure_front: number; // psi
    tire_pressure_rear: number; // psi
    tire_model: string;
    crr: number; // coefficient of rolling resistance
    aerodynamics: {
      cda_contribution: number; // m²
      yaw_angle_optimized: number; // degrees
    };
    tubeless: boolean;
  };
}

export interface Cockpit extends BikeComponent {
  type: 'cockpit';
  specifications: {
    handlebar: {
      width: number; // mm (center to center)
      reach: number; // mm
      drop: number; // mm
      flare?: number; // degrees for gravel bars
      shape: 'round' | 'compact' | 'ergonomic' | 'aero';
    };
    stem: {
      length: number; // mm
      angle: number; // degrees
      steerer_clamp: number; // mm (25.4, 28.6, 31.8)
    };
    bar_tape_thickness?: number; // mm
  };
}

export interface Contact extends BikeComponent {
  type: 'contact';
  specifications: {
    saddle: {
      width: number; // mm
      length: number; // mm
      rail_material: 'carbon' | 'chromoly' | 'titanium';
      padding_thickness: number; // mm
      cutout: boolean;
      offset: number; // mm (setback)
    };
    seatpost: {
      diameter: number; // mm
      length: number; // mm
      setback: number; // mm
      material: 'carbon' | 'aluminum' | 'steel';
      aero_profile: boolean;
    };
    pedals: {
      system: 'SPD' | 'SPD-SL' | 'Look' | 'Speedplay' | 'Time';
      stack_height: number; // mm
      q_factor: number; // mm
      float: number; // degrees
    };
  };
}

export interface Drivetrain extends BikeComponent {
  type: 'drivetrain';
  specifications: {
    crankset: {
      crank_length: number; // mm
      chainrings: number[]; // teeth count
      bcd: number; // bolt circle diameter
      q_factor: number; // mm
    };
    cassette: {
      speeds: number;
      range: string; // e.g., "11-28", "10-36"
      teeth: number[];
    };
    chain: {
      speeds: number;
      model: string;
    };
    derailleurs: {
      front?: string;
      rear: string;
    };
  };
}

export interface Bike {
  id: string;
  user_id: string;
  name: string;
  type: 'road' | 'tt' | 'gravel' | 'mountain' | 'track';
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  primary: boolean; // main bike
  
  // Components
  components: BikeComponent[];
  
  // Calculated properties from activities
  stats: {
    total_distance: number; // km
    total_time: number; // hours
    total_activities: number;
    avg_power: number; // watts
    avg_speed: number; // km/h
    best_power_20min: number; // watts
    best_power_5min: number; // watts
    best_power_1min: number; // watts
    
    // Performance coefficients calculated from activities
    calculated_cda: number; // m²
    calculated_crr: number;
    calculated_weight: number; // kg (bike + rider)
    
    // Efficiency metrics
    power_to_speed_ratio: number; // W/(km/h)
    climbing_efficiency: number; // VAM/power
    aero_efficiency: number; // speed gain at 40kmh
    
    last_service_date?: string;
    next_service_due?: string;
    service_interval_km: number;
  };
  
  // Maintenance
  maintenance: {
    chain_wear: number; // percentage
    brake_pad_wear: number; // percentage
    tire_wear: number; // percentage
    last_wash_date?: string;
    notes: string[];
  };
  
  created_at: string;
  updated_at: string;
}

export interface BikePerformanceComparison {
  bike_id: string;
  bike_name: string;
  activities_count: number;
  avg_power: number;
  avg_speed: number;
  efficiency_score: number;
  aero_score: number;
  climbing_score: number;
  comfort_score: number;
  total_score: number;
}

export interface ComponentRecommendation {
  component_type: string;
  current_spec: Record<string, string | number>;
  recommended_spec: Record<string, string | number>;
  expected_improvement: {
    aero_watts_saved: number;
    weight_saved: number; // grams
    comfort_improvement: number; // 0-10 scale
    cost_estimate: number;
  };
  reasoning: string;
}

export interface BikeSetupAnalysis {
  bike_id: string;
  overall_score: number; // 0-100
  aerodynamics: {
    score: number;
    cda_estimated: number;
    drag_breakdown: Record<string, number>; // component contributions
    recommendations: ComponentRecommendation[];
  };
  weight: {
    total_weight: number; // grams
    weight_breakdown: Record<string, number>;
    climbing_penalty: number; // seconds per km at 8% grade
    recommendations: ComponentRecommendation[];
  };
  comfort: {
    score: number;
    fit_issues: string[];
    recommendations: ComponentRecommendation[];
  };
  efficiency: {
    drivetrain_efficiency: number; // percentage
    rolling_resistance: number;
    power_transfer_efficiency: number;
    recommendations: ComponentRecommendation[];
  };
}