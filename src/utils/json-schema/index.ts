import { Resolver } from '@stoplight/json-ref-resolver';
import { ISchema as FormilyJSONSchema } from '@formily/json-schema';
import cloneDeep from 'lodash/cloneDeep';
import SampleJSONSchemaDef from '@/types/SampleJSONSchemaDef';

const resolver = new Resolver();

export async function deReferenceJSONSchema(standardSchema: any): Promise<any> {
  const processSchema = cloneDeep(standardSchema);
  const deReferencedSchema = await resolver.resolve(processSchema);
  return deReferencedSchema.result;
}

function addFormilySchemaSpecial(schema: SampleJSONSchemaDef) {
  const required = schema.required || [];
  switch (schema.type) {
    case 'string':
      schema['x-decorator'] = 'FormItem';
      if (schema.enum) {
        schema['x-component'] = 'Select';
      } else {
        schema['x-component'] = 'Input';
      }
      break;
    case 'number':
    case 'integer':
      schema['x-decorator'] = 'FormItem';
      schema['x-component'] = 'NumberPicker';
      break;
    case 'boolean':
      schema['x-decorator'] = 'FormItem';
      schema['x-component'] = 'Switch';
      break;
    case 'object':
      if (schema.properties && Object.keys(schema.properties).length) {
        Object.entries(schema.properties).forEach(([key, property]: [string, any]) => {
          addFormilySchemaSpecial(property);
          if (required.includes(key)) {
            property.required = true;
          }
        });
      }
    default:
      if (schema.anyOf && schema.anyOf.length) {
        const noNullAnyOf = schema.anyOf.filter((item: any) => item.type !== 'null');
        switch (noNullAnyOf.length) {
          case 1: // handle xxx | null
            schema.type = noNullAnyOf[0].type;
            addFormilySchemaSpecial(schema);
            break;
          default:
            break;
        }
      }
      break;
  }
}

export async function transferStandardJSONSchemaToFormilyJSONSchema(standardSchema: any): Promise<FormilyJSONSchema> {
  const deReferencedSchema = cloneDeep(await deReferenceJSONSchema(standardSchema));
  addFormilySchemaSpecial(deReferencedSchema);
  return deReferencedSchema;
}
