import { AgentProfile, SceneAgentConfigData } from '@/types/server/Agent';

export interface ServerTaskBundleAgentConfig extends SceneAgentConfigData {
  profile: AgentProfile & { id: string };
}

export default interface ServerTaskBundleAgent {
  config: ServerTaskBundleAgentConfig;
}
