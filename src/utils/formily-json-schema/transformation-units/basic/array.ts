import FormilyJSONSchema from '@/types/FormilyJSONSchema';
import type { TransformCore } from '../../transformation-unit-defs';
import { AbstractBasicTransformationUnit } from "../../transformation-unit-defs";

export default class BasicArrayTransformationUnit extends AbstractBasicTransformationUnit {
  shouldTransform(schema: FormilyJSONSchema, level: number): boolean {
    return schema.type == 'array';
  }

  transformCore(schema: FormilyJSONSchema, level: number, rootTransform: TransformCore): void {
    schema['x-decorator'] = 'FormItem';
    schema['x-component'] = 'ArrayItems';

    if (typeof schema.items === 'object') {
      const itemsSchema = schema.items as FormilyJSONSchema;

      if (itemsSchema.type === 'string' && Array.isArray(itemsSchema.enum)) {
        schema['x-decorator'] = 'FormItem';
        schema['x-component'] = 'Checkbox.Group';
        schema.enum = itemsSchema.enum.map((item) => {
          return {
            label: item,
            value: item,
          };
        });
      } else {
        schema.properties = {
          add: {
            type: 'void',
            title: `Add entry`,
            'x-component': 'ArrayItems.Addition',
          },
        };
        rootTransform(itemsSchema, level + 1, rootTransform);
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
              ...itemsSchema,
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
}
