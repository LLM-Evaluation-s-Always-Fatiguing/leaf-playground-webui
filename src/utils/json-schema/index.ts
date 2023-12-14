import FormilyJSONSchema from '@/types/FormilyJSONSchema';
import FormilySchemaTransformer from '@/utils/formily-json-schema/formily-schema';

const transformer = new FormilySchemaTransformer();

export async function transferStandardJSONSchemaToFormilyJSONSchema(standardSchema: any): Promise<FormilyJSONSchema> {
  return await transformer.transform(standardSchema);
}
