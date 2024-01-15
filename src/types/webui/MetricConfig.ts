import { CreateSceneTaskParams } from '@/types/server/config/CreateSceneTaskParams';
import Scene from '@/types/server/meta/Scene';

export interface WebUIMetricConfig {
  enable: boolean;
}

export interface WebUIActionMetricConfig {
  metrics_config: Record<string, WebUIMetricConfig>;
}

export interface WebUIRoleMetricConfig {
  actions_config: Record<string, WebUIActionMetricConfig>;
}

export function getWebUIMetricsConfigFromCreateSceneTaskParams(scene: Scene, createSceneTaskParams: CreateSceneTaskParams) {
  const webUIMetricsConfig: Record<string, WebUIRoleMetricConfig> = {};
  scene.scene_metadata.scene_definition.roles.forEach((role) => {
    if ((role.actions || []).length > 0) {
      webUIMetricsConfig[role.name] = {
        actions_config: {},
      };
      role.actions.forEach((action) => {
        if ((action.metrics || []).length > 0) {
          webUIMetricsConfig[role.name].actions_config[action.name] = {
            metrics_config: {},
          };
          action.metrics?.forEach((metric) => {
            webUIMetricsConfig[role.name].actions_config[action.name].metrics_config[metric.name] = {
              enable:
                createSceneTaskParams.scene_obj_config.scene_config_data.roles_config[role.name].actions_config[action.name]
                  .metrics_config?.[metric.name].enable || false,
            };
          });
        }
      });
    }
  });
  return webUIMetricsConfig;
}
