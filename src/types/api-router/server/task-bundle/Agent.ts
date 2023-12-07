import { AgentProfile, SceneAgentConfigData } from '@/types/server/Agent';
import { SceneAgentMetaData } from '@/types/server/Scene';

export interface ServerTaskBundleAgentConfig extends SceneAgentConfigData {
  profile: AgentProfile & { id: string };
}

export default interface ServerTaskBundleAgent {
  config: ServerTaskBundleAgentConfig;
  metadata: SceneAgentMetaData;
}
