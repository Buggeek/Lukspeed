export interface ActivityData {
  id: string;
  date: string;
  ftp?: FTPData;
  cda?: AerodynamicsData;
  technique?: TechniqueData;
  efficiency?: EfficiencyData;
}

export interface FTPData {
  current: number;
  average: number;
  best: number;
  history: number[];
  change?: number;
}

export interface AerodynamicsData {
  current: number;
  average: number;
  best: number;
  history: number[];
  change?: number;
}

export interface TechniqueData {
  consistency: number;
  average: number;
  best: number;
  history: number[];
  change?: number;
}

export interface EfficiencyData {
  current: number;
  average: number;
  best: number;
  history: number[];
  change?: number;
}

export interface MetricNarrative {
  type: 'power' | 'aerodynamics' | 'technique' | 'efficiency';
  icon: string;
  title: string;
  value: string;
  unit: string;
  change: number;
  interpretation: string;
  context: string;
  history: number[];
  actionable?: string;
  colorScheme: string;
}

export interface PerformanceInsight {
  id: string;
  type: 'improvement' | 'concern' | 'milestone' | 'trend';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
}