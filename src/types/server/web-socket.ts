import SceneLog from '@/types/server/Log';

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
