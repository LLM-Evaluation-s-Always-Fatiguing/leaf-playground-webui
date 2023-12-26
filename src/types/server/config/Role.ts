import { SceneActionConfig } from '@/types/server/config/Action';
import SceneAgentConfig from '@/types/server/config/Agent';

export interface SceneRoleConfig {
  actions_config: Record<string, SceneActionConfig>;
  agents_config?: SceneAgentConfig[];
}
