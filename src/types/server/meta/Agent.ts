import FormilyJSONSchema from '@/types/FormilyJSONSchema';
import SampleJSONSchema from '@/types/SampleJSONSchema';
import DynamicObject from '@/types/server/DynamicObject';

export interface ServerSceneAgentMetadata {
  cls_name: string;
  description: string;
  config_schema?: SampleJSONSchema;
  obj_for_import: DynamicObject;
}

export default interface SceneAgentMetadata extends ServerSceneAgentMetadata {
  configSchema?: FormilyJSONSchema;
}
