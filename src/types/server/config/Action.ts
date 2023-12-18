import { MetricConfig } from '@/types/server/config/MetricConfig';

export interface ActionConfig {
  metrics_config: Record<string, MetricConfig>;
}
