import SceneLog from '@/types/server/Log';

export enum WebsocketMessageOperation {
  CREATE = 'create',
  UPDATE = 'update',
}

export interface WebsocketMessage {
  operation: WebsocketMessageOperation;
  data: SceneLog;
}
