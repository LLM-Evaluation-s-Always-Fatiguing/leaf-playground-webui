import { Resolver } from '@stoplight/json-ref-resolver';
import { ISchema as FormilyJSONSchema } from '@formily/json-schema';
import cloneDeep from 'lodash/cloneDeep';
import { FormilySchemaTransformer } from '@/utils/formily-json-schema/formily-schema';

const resolver = new Resolver();

export async function deReferenceJSONSchema(standardSchema: any): Promise<any> {
  const deReferencedSchema = cloneDeep((await resolver.resolve(standardSchema)).result);
  delete deReferencedSchema.$defs;
  return deReferencedSchema;
}

const transformer = new FormilySchemaTransformer();

export async function transferStandardJSONSchemaToFormilyJSONSchema(standardSchema: any): Promise<FormilyJSONSchema> {
  const deReferencedSchema = cloneDeep(await deReferenceJSONSchema(standardSchema));
  const result = await transformer.transform(deReferencedSchema);
  return result;
}
