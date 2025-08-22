export interface TimelineDataPoint {
  timestamp: number; // seconds from start
  power: number; // watts
  speed: number; // km/h
  cadence: number; // rpm
  heartrate: number; // bpm
  altitude: number; // meters
  acceleration: number; // m/s²
  torque: number; // N⋅m
  efficiency: number; // m/s per watt
  distance: number; // cumulative meters
}

export interface TimelineSegment {
  id: number;
  startTime: number; // seconds
  endTime: number; // seconds
  type: 'spike' | 'acceleration' | 'deceleration' | 'steady';
  avgPower: number;
  avgSpeed: number;
  maxAcceleration: number;
  description: string;
  color: string;
}

export interface TimelineConfig {
  smoothing: {
    shortWindow: number; // seconds
    longWindow: number; // seconds
  };
  thresholds: {
    accelerationSpike: number; // m/s²
    lowEfficiency: number; // m/s per watt
  };
  display: {
    colors: {
      power: string;
      speed: string;
      cadence: string;
      heartrate: string;
      altitude: string;
    };
    axes: {
      power: 'left' | 'right';
      speed: 'left' | 'right';
      cadence: 'left' | 'right';
      heartrate: 'left' | 'right';
    };
  };
  zoom: {
    defaultRange: number; // 0-1
    minRange: number;
    maxRange: number;
  };
}

export interface ChannelVisibility {
  power: boolean;
  speed: boolean;
  cadence: boolean;
  heartrate: boolean;
  altitude: boolean;
  acceleration: boolean;
  torque: boolean;
  efficiency: boolean;
}

export interface TimelineAlert {
  timestamp: number;
  type: 'acceleration_spike' | 'low_efficiency' | 'data_gap' | 'power_drop';
  severity: 'low' | 'medium' | 'high';
  message: string;
  value?: number;
  threshold?: number;
}

export interface ActivityMetrics {
  activityId: string;
  duration: number; // seconds
  totalDistance: number; // meters
  averages: {
    power: number;
    speed: number;
    cadence: number;
    heartrate: number;
  };
  peaks: {
    power: number;
    speed: number;
    acceleration: number;
    torque: number;
  };
  derived: {
    averageEfficiency: number;
    totalElevationGain: number;
    segmentCount: number;
    alertCount: number;
  };
}

export interface SmoothingOptions {
  enabled: boolean;
  windowSize: number; // seconds
  method: 'moving_average' | 'gaussian' | 'savgol';
}

export interface ZoomState {
  start: number; // 0-1 ratio
  end: number; // 0-1 ratio
  centerTime?: number; // seconds
  duration?: number; // seconds
}

export interface TimelineView {
  id: string;
  name: string;
  channels: ChannelVisibility;
  smoothing: SmoothingOptions;
  zoom: ZoomState;
  showSegments: boolean;
  showAlerts: boolean;
}

export const DEFAULT_TIMELINE_CONFIG: TimelineConfig = {
  smoothing: {
    shortWindow: 5,
    longWindow: 15
  },
  thresholds: {
    accelerationSpike: 2.0,
    lowEfficiency: 0.05
  },
  display: {
    colors: {
      power: '#ff6b35',
      speed: '#004e89', 
      cadence: '#009639',
      heartrate: '#ff0040',
      altitude: '#6a994e'
    },
    axes: {
      power: 'left',
      speed: 'right',
      cadence: 'right',
      heartrate: 'left'
    }
  },
  zoom: {
    defaultRange: 1.0,
    minRange: 0.01,
    maxRange: 1.0
  }
};

export const DEFAULT_CHANNEL_VISIBILITY: ChannelVisibility = {
  power: true,
  speed: true,
  cadence: false,
  heartrate: false,
  altitude: true,
  acceleration: false,
  torque: false,
  efficiency: false
};