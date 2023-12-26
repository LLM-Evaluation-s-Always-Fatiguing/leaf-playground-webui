import FormilyJSONSchema from '@/types/FormilyJSONSchema';
import SampleJSONSchema from '@/types/SampleJSONSchema';
import DynamicObject from '@/types/server/DynamicObject';

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
