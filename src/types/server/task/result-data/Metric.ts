export interface SceneTaskResultDataMetricResult {
  value: number;
  target_agent: string;
}

export default interface SceneTaskResultDataMetrics {
  metrics: Record<string, SceneTaskResultDataMetricResult[]>;
  human_metrics: Record<string, SceneTaskResultDataMetricResult[]>;
  merged_metrics: Record<string, SceneTaskResultDataMetricResult[]>;
}
