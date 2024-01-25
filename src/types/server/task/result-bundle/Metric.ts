export interface SceneTaskResultBundleMetricResult {
  value: number;
  target_agent: string;
}

export default interface SceneTaskResultBundleMetrics {
  metrics: Record<string, SceneTaskResultBundleMetricResult[]>;
  human_metrics: Record<string, SceneTaskResultBundleMetricResult[]>;
  merged_metrics: Record<string, SceneTaskResultBundleMetricResult[]>;
}
