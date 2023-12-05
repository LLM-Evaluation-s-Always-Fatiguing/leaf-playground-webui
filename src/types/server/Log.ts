import DynamicObject from '@/types/server/DynamicObject';

export interface SceneLogRole {
  name: string;
  description: string;
  is_static: boolean;
  agent_type?: DynamicObject;
}

export interface SceneLogProfile {
  id: string;
  name: string;
  role?: SceneLogRole;
}

export interface SceneLogContent {
  type: SceneLogMediaType;
  display_text?: string;
}

export interface SceneLogTextContent extends SceneLogContent {
  text: string;
}

export interface SceneLogJSONContent extends SceneLogContent {
  data: Record<string, any>;
}

export interface SceneLogImageContent extends SceneLogContent {}

export interface SceneLogAudioContent extends SceneLogContent {}

export interface SceneLogVideoContent extends SceneLogContent {}

export interface SceneLogMessage {
  sender: SceneLogProfile;
  content: SceneLogContent;
  receivers: SceneLogProfile[];
  created_at: string;
}

export enum SceneLogMediaType {
  TEXT = 'text',
  JSON = 'json',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
}

export default interface SceneLog {
  index: number;
  created_at: string;
  references?: SceneLogMessage[];
  response: SceneLogMessage;
  ground_truth?: SceneLogContent;
  eval_result?: Record<string, boolean | number | string>;
  narrator?: string;
}
