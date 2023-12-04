import FormilyJSONSchema from '@/types/FormilyJSONSchema';

export interface AgentProfile {
  name: string;

  [key: string]: any;
}

export interface AgentBackendConfig {
  [key: string]: any;
}

export interface SceneAgentConfigData {
  profile: AgentProfile;
  chart_major_color?: string;
  ai_backend_config: AgentBackendConfig;
}

export default interface SceneAgentConfig {
  agent_id: string;
  agent_config_data: SceneAgentConfigData;
}

export interface SceneAgentDefinition {
  agent_id: string;
  name: string;
  schema: FormilyJSONSchema;
}

export interface SceneAgentFullFilledConfig extends SceneAgentConfigData {
  profile: AgentProfile & { id: string };
}
