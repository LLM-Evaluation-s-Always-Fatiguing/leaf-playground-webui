import SceneAgentConfig from '@/types/server/config/Agent';
import { MetricEvaluatorObjsConfig } from '@/types/server/config/Evaluator';
import { SceneReporterConfig } from '@/types/server/config/Reporter';
import { SceneObjConfig } from '@/types/server/config/Scene';

export interface CreateSceneParams {
  scene_obj_config: SceneObjConfig;
  metric_evaluator_objs_config: MetricEvaluatorObjsConfig;
  reporter_obj_config: SceneReporterConfig;
  work_dir: string;
}

export function getRoleAgentConfigsMapFromCreateSceneParams(createSceneParams: CreateSceneParams) {
  const roleConfig = createSceneParams.scene_obj_config.scene_config_data.roles_config;
  const roleAgentConfigsMap: Record<string, SceneAgentConfig[]> = {};
  Object.keys(roleConfig).forEach((roleName) => {
    if (roleConfig[roleName].agents_config) {
      roleAgentConfigsMap[roleName] = roleConfig[roleName].agents_config!;
    }
  });
  return roleAgentConfigsMap;
}

export function getEnabledMetricsFromCreateSceneParams(createSceneParams: CreateSceneParams) {
  const enabledMetrics: string[] = [];
  Object.entries(createSceneParams.scene_obj_config.scene_config_data.roles_config).forEach(
    ([roleName, roleConfig]) => {
      Object.entries(roleConfig.actions_config).forEach(([actionName, actionConfig]) => {
        if (actionConfig.metrics_config) {
          Object.entries(actionConfig.metrics_config).forEach(([metricName, metricConfig]) => {
            if (metricConfig.enable) {
              enabledMetrics.push(`${roleName}.${actionName}.${metricName}`);
            }
          });
        }
      });
    }
  );
  return enabledMetrics;
}
