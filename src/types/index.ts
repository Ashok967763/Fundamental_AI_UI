export interface Config {
  id: string;
  name: string;
  last_run: {
    status: 'success' | 'failure';
    date: string;
  };
  efficiency: number;
  growth_quality: number;
  semantic_score: number;
  evaluation: string;
}

export interface Run {
  id: string;
  config_id: string;
  date: string;
  efficiency: number;
  evaluation_result: 'Good' | 'Bad';
}

export interface PerformanceData {
  date: string;
  efficiency: number;
}

export interface ConfigDetail {
  id: string;
  name: string;
  performance_data: PerformanceData[];
  recent_runs: Run[];
}

export interface DashboardOverview {
  configs: Config[];
  summary: {
    total_configs: number;
    success_rate: number;
    average_efficiency: number;
    average_growth_quality: number;
    average_semantic_score: number;
  };
}
