import { AgentProfile, SceneAgentConfigData } from '@/types/server/config/Agent';
import SceneAgentMetadata from '@/types/server/meta/Agent';

export interface ServerTaskBundleAgentConfig extends SceneAgentConfigData {
  profile: AgentProfile & { id: string };
}

export default interface ServerTaskBundleAgent {
  config: ServerTaskBundleAgentConfig;
  metadata: SceneAgentMetadata;
}
