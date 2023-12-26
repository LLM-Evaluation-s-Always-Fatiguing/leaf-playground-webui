import DynamicObject from '@/types/server/DynamicObject';

export interface SceneAgentProfile {
  id: string;
  name: string;
  [key: string]: any;
}

export interface SceneAgentBackendConfig {
  [key: string]: any;
}

export interface SceneAgentConfigData {
  profile: SceneAgentProfile;
  chart_major_color?: string;
  ai_backend_config: SceneAgentBackendConfig;
}

export default interface SceneAgentConfig {
  obj_for_import: DynamicObject;
  config_data: SceneAgentConfigData;
}
