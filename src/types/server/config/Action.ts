import { SceneMetricConfig } from '@/types/server/config/Metric';

export interface SceneActionConfig {
  metrics_config: Record<string, SceneMetricConfig>;
}
