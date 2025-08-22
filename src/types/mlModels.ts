export interface MLModelConfig {
  model_name: string;
  version: string;
  algorithm: 'linear_regression' | 'polynomial' | 'exponential_decay' | 'k_means';
  parameters: Record<string, any>;
  training_data_size: number;
  accuracy_metrics: {
    mse?: number; // Mean Squared Error
    r_squared?: number; // Coefficient of determination
    mae?: number; // Mean Absolute Error
  };
}

export interface RegressionModel extends MLModelConfig {
  coefficients: number[];
  intercept: number;
  feature_names: string[];
  confidence_intervals: {
    [feature: string]: {
      lower: number;
      upper: number;
    };
  };
}

export interface FTPPredictionModel extends RegressionModel {
  algorithm: 'linear_regression';
  input_features: {
    power_20min: number;
    power_60min: number;
    heart_rate_avg: number;
    training_history_days: number;
    recent_tss_avg: number;
  };
  prediction: {
    ftp_estimate: number;
    confidence: number;
    improvement_rate: number; // watts per week
    next_test_recommended: string; // date
  };
}

export interface FatigueModel extends MLModelConfig {
  algorithm: 'exponential_decay';
  decay_factors: {
    short_term: number; // ATL decay
    long_term: number; // CTL decay
    recovery: number; // recovery rate
  };
  fatigue_prediction: {
    current_fatigue: number; // 0-1 scale
    recovery_time_hours: number;
    optimal_training_load: number; // TSS
    burnout_risk: 'low' | 'medium' | 'high';
  };
}

export interface ZoneDetectionModel extends MLModelConfig {
  algorithm: 'k_means';
  cluster_centers: number[]; // zone boundaries
  cluster_quality: {
    silhouette_score: number;
    inertia: number;
    stability: number;
  };
  zone_classification: {
    automatic_zones: TrainingZone[];
    drift_detection: {
      drift_detected: boolean;
      drift_magnitude: number;
      recalibration_needed: boolean;
    };
  };
}

export interface PerformancePrediction {
  model: MLModelConfig;
  prediction_horizon_days: number;
  predictions: {
    ftp_trajectory: {
      date: string;
      predicted_ftp: number;
      confidence: number;
    }[];
    performance_peaks: {
      date: string;
      expected_performance: number;
      event_type: 'race' | 'test' | 'breakthrough';
    }[];
    training_adaptations: {
      adaptation_type: 'aerobic' | 'anaerobic' | 'neuromuscular';
      timeline_weeks: number;
      confidence: number;
    }[];
  };
}

export interface MLInsight {
  insight_id: string;
  type: 'trend' | 'anomaly' | 'recommendation' | 'prediction';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  data_points: any[];
  confidence: number;
  actionable: boolean;
  action_items?: string[];
  created_at: string;
  expires_at?: string;
}

export interface TrainingRecommendationEngine {
  user_profile: {
    current_ftp: number;
    training_history: number; // months
    goals: string[];
    constraints: {
      time_per_week: number; // hours
      intensity_tolerance: number; // 1-10 scale
      recovery_needs: number; // 1-10 scale
    };
  };
  recommendation_logic: {
    periodization_model: 'linear' | 'undulating' | 'block';
    adaptation_targets: {
      aerobic: number; // percentage focus
      anaerobic: number;
      neuromuscular: number;
    };
    recovery_optimization: boolean;
  };
  generated_recommendations: TrainingRecommendation[];
}

export interface ModelPerformanceMetrics {
  model_id: string;
  evaluation_period: {
    start_date: string;
    end_date: string;
  };
  accuracy_metrics: {
    prediction_accuracy: number; // percentage
    false_positive_rate: number;
    false_negative_rate: number;
    precision: number;
    recall: number;
    f1_score: number;
  };
  drift_detection: {
    statistical_drift: boolean;
    performance_drift: boolean;
    concept_drift: boolean;
    retrain_recommended: boolean;
  };
  feature_importance: {
    [feature_name: string]: number; // importance score
  };
}

import type { TrainingZone, TrainingRecommendation } from './powerAnalysis';