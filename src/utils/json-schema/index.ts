import FormilyJSONSchema from '@/types/FormilyJSONSchema';
import { FormilySchemaTransformer } from '@/utils/formily-json-schema/formily-schema';

const transformer = new FormilySchemaTransformer();

export async function transferStandardJSONSchemaToFormilyJSONSchema(standardSchema: any): Promise<FormilyJSONSchema> {
  const result = await transformer.transform(standardSchema);
  return result;
}
