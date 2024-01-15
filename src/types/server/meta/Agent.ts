import FormilyJSONSchema from '@/types/common/FormilyJSONSchema';
import SampleJSONSchema from '@/types/common/SampleJSONSchema';
import DynamicObject from '@/types/server/meta/DynamicObject';

export interface ServerSceneAgentMetadata {
  cls_name: string;
  description: string;
  config_schema?: SampleJSONSchema;
  obj_for_import: DynamicObject;
  is_human: boolean;
}

export default interface SceneAgentMetadata extends ServerSceneAgentMetadata {
  configSchema?: FormilyJSONSchema;
}
