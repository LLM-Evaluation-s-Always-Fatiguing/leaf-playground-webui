import { SceneAdditionalConfig, SceneInfoConfig } from '@/types/server/Scene';
import SceneAgentConfig from '@/types/server/Agent';
import EvaluatorConfig from '@/types/server/Evaluator';

export default interface RunSceneConfig {
  id: string;
  scene_info_config_data: SceneInfoConfig;
  additional_config_data: SceneAdditionalConfig;
  scene_agents_config_data: SceneAgentConfig[];
  scene_evaluators_config_data: EvaluatorConfig[] | null;
}
