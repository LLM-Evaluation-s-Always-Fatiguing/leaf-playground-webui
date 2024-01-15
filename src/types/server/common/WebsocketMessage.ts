import SceneLog from '@/types/server/common/Log';

export enum WebsocketMessageType {
  DATA = 'data',
  EVENT = 'event',
}

export enum WebsocketMessageOperation {
  CREATE = 'create',
  UPDATE = 'update',
}

export interface WebsocketMessage {
  type: WebsocketMessageType;
}

export interface WebsocketDataMessage extends WebsocketMessage {
  type: WebsocketMessageType.DATA;
  operation: WebsocketMessageOperation;
  data: SceneLog;
}

export enum WebsocketEvent {
  WAIT_HUMAN_INPUT = 'wait_human_input',
  DISABLE_HUMAN_INPUT = 'disable_human_input',
}

export interface WebsocketEventMessage extends WebsocketMessage {
  type: WebsocketMessageType.EVENT;
  event: WebsocketEvent;
}
