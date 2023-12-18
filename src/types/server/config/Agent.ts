import DynamicObject from "@/types/server/DynamicObject";

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
  obj_for_import: DynamicObject;
  config_data: SceneAgentConfigData;
}
