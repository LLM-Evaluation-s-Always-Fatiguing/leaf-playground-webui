import { ISchema } from '@formily/json-schema/esm/types';

declare type SchemaProperties<
  Decorator,
  Component,
  DecoratorProps,
  ComponentProps,
  Pattern,
  Display,
  Validator,
  Message,
> = Record<
  string,
  FormilyJSONSchema<Decorator, Component, DecoratorProps, ComponentProps, Pattern, Display, Validator, Message>
>;

export default interface FormilyJSONSchema<
  Decorator = any,
  Component = any,
  DecoratorProps = any,
  ComponentProps = any,
  Pattern = any,
  Display = any,
  Validator = any,
  Message = any,
  ReactionField = any,
> extends ISchema<
    Decorator,
    Component,
    DecoratorProps,
    ComponentProps,
    Pattern,
    Display,
    Validator,
    Message,
    ReactionField
  > {
  properties?: SchemaProperties<
    Decorator,
    Component,
    DecoratorProps,
    ComponentProps,
    Pattern,
    Display,
    Validator,
    Message
  >;

  transformedBy?: string[];

  [key: string]: any;
}
