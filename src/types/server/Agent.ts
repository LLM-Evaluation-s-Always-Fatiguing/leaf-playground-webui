import { ISchema as FormilyJSONSchema } from '@formily/json-schema/esm/types';

export interface AgentProfile {
  name: string;

  [key: string]: any;
}

export interface AgentBackendConfig {
  [key: string]: any;
}

export interface AgentConfigData {
  profile: AgentProfile;
  ai_backend_config: AgentBackendConfig;
}

export default interface SceneAgentConfigData {
  agent_id: string;
  agent_config_data: AgentConfigData;
}

export interface SceneAgentDefinition {
  agent_id: string;
  name: string;
  schema: FormilyJSONSchema;
}
