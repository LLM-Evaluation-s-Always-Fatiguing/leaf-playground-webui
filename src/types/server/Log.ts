import { SceneMetricRecordDisplayType } from '@/types/server/meta/Scene';

export interface SceneLogRole {
  name: string;
  description: string;
  is_static: boolean;
}

export interface SceneLogProfile {
  id: string;
  name: string;
  role?: SceneLogRole;
}

export interface SceneLogContent {
  type: SceneLogMediaType;
  display_text?: string;
  text: string;
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

export enum SceneLogType {
  SYSTEM = 'system',
  ACTION = 'action',
}

export default interface SceneLog {
  id: string;
  created_at: string;
  log_type: SceneLogType;
  log_msg: string;
}

export enum SceneSystemLogEvent {
  SIMULATION_START = 'simulation_start',
  SIMULATION_FINISHED = 'simulation_finished',
  EVALUATION_FINISHED = 'evaluation_finished',
  EVERYTHING_DONE = 'everything_done',
}

export interface SceneSystemLog extends SceneLog {
  system_event: SceneSystemLogEvent;
}

export interface SceneLogMetricRecord {
  value: any;
  evaluator: string;
  display_type: SceneMetricRecordDisplayType;
  reason?: string;
  is_comparison: boolean;
  target_agent: string;
}

export interface SceneLogHumanMetricRecord extends SceneLogMetricRecord {
  evaluator: 'human';
}

export interface SceneActionLog extends SceneLog {
  references?: SceneLogMessage[];
  response: SceneLogMessage;

  ground_truth?: SceneLogContent;

  action_belonged_chain: string;

  eval_records?: Record<string, SceneLogMetricRecord[]>;
  compare_records: any;
  human_eval_records?: Record<string, SceneLogHumanMetricRecord>;
  human_compare_records: Record<string, SceneLogHumanMetricRecord>;

  [key: string]: any;
}
