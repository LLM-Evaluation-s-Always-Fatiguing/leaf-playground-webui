export type JSONSchemaType = 'string' | 'number' | 'integer' | 'object' | 'array' | 'boolean' | 'null';

export default interface SampleJSONSchema {
  $schema?: string;
  $id?: string;
  title?: string;
  description?: string;
  type?: JSONSchemaType | JSONSchemaType[];
  properties?: Record<string, SampleJSONSchema>;
  items?: SampleJSONSchema | SampleJSONSchema[];
  required?: string[];
  enum?: any[];
  default?: any;
  format?: string;

  [key: string]: any;
}
