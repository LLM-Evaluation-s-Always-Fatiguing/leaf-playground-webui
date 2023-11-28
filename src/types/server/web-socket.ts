import SceneLog from '@/types/server/Log';

export enum ServerWebSocketMessageType {
  LOG = 'log',
  METRIC = 'metric',
  End = 'ending',
}

export interface ServerWebSocketMessage {
  type: ServerWebSocketMessageType;
  data: any;
}

export interface ServerWebSocketLogMessage extends ServerWebSocketMessage {
  data: SceneLog;
}

export interface ServerWebSocketEndMessage extends ServerWebSocketMessage {
  data: {
    save_dir: string;
  };
}
