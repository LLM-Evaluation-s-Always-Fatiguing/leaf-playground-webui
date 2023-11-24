export type JSONSchemaType = 'string' | 'number' | 'integer' | 'object' | 'array' | 'boolean' | 'null';

export default interface SampleJSONSchemaDef {
  $schema?: string;
  $id?: string;
  title?: string;
  description?: string;
  type?: JSONSchemaType | JSONSchemaType[];
  properties?: Record<string, SampleJSONSchemaDef>;
  items?: SampleJSONSchemaDef | SampleJSONSchemaDef[];
  required?: string[];
  enum?: any[];
  default?: any;
  format?: string;

  [key: string]: any;
}
