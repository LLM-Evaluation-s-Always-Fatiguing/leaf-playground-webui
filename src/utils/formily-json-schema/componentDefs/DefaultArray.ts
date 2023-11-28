import FormilyJSONSchema from '@/types/FormilyJSONSchema';
import type { TransformCore } from '../formily-schema';
import { AbstractComponentDef } from '@/utils/formily-json-schema/abstract-component-def';

export class DefaultArrayComponentDef extends AbstractComponentDef {
  shouldTransform(schema: FormilyJSONSchema, level: number): boolean {
    return schema.type == 'array';
  }

  transformCore(schema: FormilyJSONSchema, level: number, rootTransform: TransformCore): void {
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
      let originItemSchema = schema.items;
      rootTransform(originItemSchema as FormilyJSONSchema, level + 1, rootTransform);

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
            ...originItemSchema,
            ...{
              'x-decorator': 'FormItem',
              'x-decorator-props': {
                style: {
                  flexGrow: 1,
                  margin: '0 8px',
                },
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
    }
  }
}
