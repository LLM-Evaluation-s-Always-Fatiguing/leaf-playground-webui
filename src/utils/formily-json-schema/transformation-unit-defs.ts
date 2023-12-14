import FormilyJSONSchema from '@/types/FormilyJSONSchema';

export enum TransformationUnitType {
  PREPROCESSOR = 'PREPROCESSOR',
  SPECIALIZED = 'SPECIALIZED',
  BASIC = 'BASIC',
}

export type IsTransformed = boolean;

/**
 * Transform JSON Schema to Formily Schema
 * @param schema Original JSON Schema which will be directly transformed in place
 * @param level Current level of the node(Top level is 0)
 * @param rootTransform Root transform function, used to transform child nodes if needed
 */
export type TransformCore = (schema: FormilyJSONSchema, level: number, rootTransform: TransformCore) => void;

/**
 * Whether the node needs to be transformed
 */
export type ShouldTransform = (schema: FormilyJSONSchema, level: number) => boolean;

export interface TransformationUnit {
  type: () => TransformationUnitType;
  priority: () => number; // Higher priority means it will be executed first, default is 50
  transformCore: TransformCore;
  shouldTransform: ShouldTransform;
  transform: (schema: FormilyJSONSchema, level: number, rootTransform: TransformCore) => IsTransformed;
}

export abstract class AbstractBasicTransformationUnit implements TransformationUnit {
  type = () => {
    return TransformationUnitType.BASIC;
  };

  priority = () => {
    return 50;
  };

  abstract transformCore(schema: FormilyJSONSchema, level: number, rootTransform: TransformCore): void;

  abstract shouldTransform(schema: FormilyJSONSchema, level: number): boolean;

  transform = (schema: FormilyJSONSchema, level: number, rootTransform: TransformCore): boolean => {
    if (this.shouldTransform(schema, level)) {
      this.transformCore(schema, level, rootTransform);
      return true;
    } else {
      return false;
    }
  };
}

export abstract class AbstractSpecializedTransformationUnit implements TransformationUnit {
  type = () => {
    return TransformationUnitType.SPECIALIZED;
  };

  priority = () => {
    return 75;
  };

  abstract transformCore(schema: FormilyJSONSchema, level: number, rootTransform: TransformCore): void;

  abstract shouldTransform(schema: FormilyJSONSchema, level: number): boolean;

  transform = (schema: FormilyJSONSchema, level: number, rootTransform: TransformCore): boolean => {
    if (this.shouldTransform(schema, level)) {
      this.transformCore(schema, level, rootTransform);
      return true;
    } else {
      return false;
    }
  };
}

export abstract class AbstractPreprocessorTransformationUnit implements TransformationUnit {
  type = () => {
    return TransformationUnitType.PREPROCESSOR;
  };

  priority = () => {
    return 100;
  };

  abstract transformCore(schema: FormilyJSONSchema, level: number, rootTransform: TransformCore): void;

  abstract shouldTransform(schema: FormilyJSONSchema, level: number): boolean;

  transform = (schema: FormilyJSONSchema, level: number, rootTransform: TransformCore): boolean => {
    if (this.shouldTransform(schema, level)) {
      this.transformCore(schema, level, rootTransform);
    }
    return false;
  };
}
