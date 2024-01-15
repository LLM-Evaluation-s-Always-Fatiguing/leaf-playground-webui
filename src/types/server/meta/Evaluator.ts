import FormilyJSONSchema from '@/types/common/FormilyJSONSchema';
import SampleJSONSchema from '@/types/common/SampleJSONSchema';
import DynamicObject from '@/types/server/meta/DynamicObject';

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
