import { SceneObjConfig } from '@/types/server/config/Scene';
import { MetricEvaluatorObjsConfig } from '@/types/server/config/Evaluator';
import SceneAgentConfig from '@/types/server/config/Agent';
import { SceneReporterConfig } from '@/types/server/config/Reporter';

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
