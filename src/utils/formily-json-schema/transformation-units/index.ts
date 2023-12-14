import { BasicAllOfTransformationUnit } from './basic/all-of';
import BasicArrayTransformationUnit from './basic/array';
import BasicObjectTransformationUnit from './basic/object';
import BasicBooleanTransformationUnit from './basic/boolean';
import BasicNumberTransformationUnit from './basic/number';
import BasicStringTransformationUnit from './basic/string';
import { RemoveTitleTempSuffixPreprocessor } from './preprocessor/remove-title-temp-suffix';
import { TopObjectTransformationUnit } from './specialized/top-object';
import { NullableBasicTypeAnyOfTransformationUnit } from './specialized/nullable-basic-type-any-of';
import { EmptyObjectNoConfigRequiredTransformationUnit } from './specialized/empty-object-no-config-required';

export const SystemTransformationUnits = [
  // Preprocessor
  new RemoveTitleTempSuffixPreprocessor(),

  // Specialized
  new TopObjectTransformationUnit(),
  new EmptyObjectNoConfigRequiredTransformationUnit(),
  new NullableBasicTypeAnyOfTransformationUnit(),

  // Basic
  new BasicAllOfTransformationUnit(),
  new BasicArrayTransformationUnit(),
  new BasicObjectTransformationUnit(),
  new BasicBooleanTransformationUnit(),
  new BasicNumberTransformationUnit(),
  new BasicStringTransformationUnit(),
];
