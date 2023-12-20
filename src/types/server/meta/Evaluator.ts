import DynamicObject from '@/types/server/DynamicObject';
import SampleJSONSchema from '@/types/SampleJSONSchema';
import FormilyJSONSchema from '@/types/FormilyJSONSchema';

export interface ServerEvaluatorMetadata {
  cls_name: string;
  description: string;
  obj_for_import: DynamicObject;
  config_schema: SampleJSONSchema;
  metrics: string[];
}

export default interface EvaluatorMetadata extends ServerEvaluatorMetadata {
  configSchema: FormilyJSONSchema;
}
