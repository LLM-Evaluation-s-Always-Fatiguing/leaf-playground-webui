export interface ServerTaskBundleMetricResult {
  value: number;
  target_agent: string;
}

export default interface ServerTaskBundleMetrics {
  metrics: Record<string, ServerTaskBundleMetricResult[]>;
  human_metrics: Record<string, ServerTaskBundleMetricResult[]>;
}
