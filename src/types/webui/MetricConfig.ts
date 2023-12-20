export interface WebUIMetricConfig {
  enable: boolean
}

export interface WebUIActionMetricConfig {
  metrics_config: Record<string, WebUIMetricConfig>
}

export interface WebUIRoleMetricConfig {
  actions_config: Record<string, WebUIActionMetricConfig>;
}
