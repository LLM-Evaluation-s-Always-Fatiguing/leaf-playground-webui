import { SceneObjConfig } from '@/types/server/config/Scene';
import { MetricEvaluatorObjsConfig } from '@/types/server/config/Evaluator';

export interface CreateSceneParams {
  scene_obj_config: SceneObjConfig;
  metric_evaluator_objs_config: MetricEvaluatorObjsConfig;
}
