import { Resolver } from '@stoplight/json-ref-resolver';
import { ISchema as FormilyJSONSchema } from '@formily/json-schema';
import cloneDeep from 'lodash/cloneDeep';
import SampleJSONSchemaDef from '@/types/SampleJSONSchemaDef';

const resolver = new Resolver();

export async function deReferenceJSONSchema(standardSchema: any): Promise<any> {
  const deReferencedSchema = cloneDeep((await resolver.resolve(standardSchema)).result);
  delete deReferencedSchema.$defs;
  return deReferencedSchema;
}

function addFormilySchemaSpecial(schema: SampleJSONSchemaDef) {
  const required = schema.required || [];

  if (schema.anyOf && schema.anyOf.length) {
    const noNullAnyOf = schema.anyOf.filter((item: any) => item.type !== 'null');
    switch (noNullAnyOf.length) {
      case 1: // handle xxx | null
        if (noNullAnyOf[0].type !== "object") { // TODO: temp should remove
          Object.assign(schema, noNullAnyOf[0]);
          delete schema.anyOf;
        }
        break;
      default:
        break;
    }
  }

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
      schema['x-decorator'] = 'Card';
      schema['x-decorator-props'] = {
        title: schema.title,
        size: 'small',
        bordered: false,
        style: {
          boxShadow: 'none',
        },
        headStyle: {
          border: 'none',
        },
      };
      if (schema.properties) {
        if (Object.keys(schema.properties).length) {
          Object.entries(schema.properties).forEach(([key, property]: [string, any]) => {
            addFormilySchemaSpecial(property);
            if (required.includes(key) && property.type !== 'object') {
              property.required = true;
            }
          });
        } else {
          schema.default = {};
        }
      }
      break;
    case 'array':
      schema['x-decorator'] = 'FormItem';
      schema['x-component'] = 'ArrayItems';
      schema.properties = {
        add: {
          type: 'void',
          title: `Add entry`,
          'x-component': 'ArrayItems.Addition',
        },
      };
      if (typeof schema.items === 'object') {
        switch (schema.items.type) {
          case 'string':
            schema.items = {
              type: 'void',
              'x-component': 'Flex',
              'x-component-props': {
                style: {
                  width: '100%',
                },
              },
              properties: {
                sort: {
                  type: 'void',
                  'x-decorator': 'FormItem',
                  'x-component': 'ArrayItems.SortHandle',
                },
                input: {
                  type: 'string',
                  'x-decorator': 'FormItem',
                  'x-component': 'Input',
                  'x-decorator-props': {
                    style: {
                      flexGrow: 1,
                      margin: '0 8px',
                    },
                  },
                },
                remove: {
                  type: 'void',
                  'x-decorator': 'FormItem',
                  'x-component': 'ArrayItems.Remove',
                },
              },
            };
            break;
          case 'object':
            break;
          default:
            break;
        }
      } else {
      }
      break;
    default:
      break;
  }
}

export async function transferStandardJSONSchemaToFormilyJSONSchema(standardSchema: any): Promise<FormilyJSONSchema> {
  const result = cloneDeep(await deReferenceJSONSchema(standardSchema));
  addFormilySchemaSpecial(result);
  return result;
}
