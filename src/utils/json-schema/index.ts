import FormilySchemaTransformer from '@/utils/formily-json-schema/formily-schema';

const transformer = new FormilySchemaTransformer();

export async function transferStandardJSONSchemaToFormilyJSONSchema(standardSchema: any) {
  return await transformer.transform(standardSchema);
}
