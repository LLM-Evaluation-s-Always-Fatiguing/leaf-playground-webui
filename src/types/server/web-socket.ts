import SceneLog from '@/types/server/Log';
import { SceneAdditionalConfig, SceneInfoConfig } from '@/types/server/Scene';
import SceneAgentConfig from '@/types/server/Agent';

export enum ServerWebSocketMessageType {
  LOG = 'log',
  METRIC = 'metric',
}

export interface ServerWebSocketMessage {
  type: ServerWebSocketMessageType;
  data: any;
}

export interface ServerWebSocketLogMessage {
  type: ServerWebSocketMessageType;
  data: SceneLog;
}

export interface RunSceneConfig {
  id: string;
  scene_info_config_data: SceneInfoConfig;
  additional_config_data: SceneAdditionalConfig;
  scene_agents_config_data: SceneAgentConfig[];
}
