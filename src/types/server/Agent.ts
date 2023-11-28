import FormilyJSONSchema from "@/types/FormilyJSONSchema";

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

export default interface SceneAgentConfig {
  agent_id: string;
  agent_config_data: AgentConfigData;
}

export interface SceneAgentDefinition {
  agent_id: string;
  name: string;
  schema: FormilyJSONSchema;
}
