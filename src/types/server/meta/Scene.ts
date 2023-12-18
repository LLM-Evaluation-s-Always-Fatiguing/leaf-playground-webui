import SampleJSONSchema from '@/types/SampleJSONSchema';
import FormilyJSONSchema from '@/types/FormilyJSONSchema';
import DynamicObject from '@/types/server/DynamicObject';
import SceneAgentMetadata, { ServerSceneAgentMetadata } from '@/types/server/meta/Agent';

export interface ServerSceneEnvVarDefinition {
  name: string;
  description: string;
  current_value: any;
}

export interface ServerActionSignatureParameterDefinition {
  name: string;
  annotation?: any;
}

export interface ServerActionSignatureDefinition {
  name: string;
  description: string;
  annotation?: any;
  signature: ServerActionSignatureParameterDefinition;
}

export enum ServerMetricValueDType {
  SCALAR = 'scalar',
  VECTOR = 'vector',
  NESTED_SCALAR = 'nested_scalar',
  NESTED_VECTOR = 'nested_vector',
}

export interface ServerMetricDefinition {
  name: string;
  description: string;
  record_dtype: ServerMetricValueDType;
  metric_dtype: ServerMetricValueDType;
  expect_resp_msg_type: any;
  aggregation_methods: Record<string, any>;
  is_comparison: boolean;
}

export interface ServerSceneActionDefinition {
  name: string;
  description: string;
  signature: ServerActionSignatureDefinition;
  metrics?: ServerMetricDefinition[];
}

export interface ServerSceneRoleDefinition {
  name: string;
  description: string;
  actions: ServerSceneActionDefinition[];
  num_agents_range: [number, number];
  is_static: boolean;
}

export interface ServerSceneDefinition {
  name: string;
  description: string;
  env_vars: ServerSceneEnvVarDefinition[];
  roles: ServerSceneRoleDefinition[];
}

export interface ServerSceneMetadata {
  scene_definition: ServerSceneDefinition;
  config_schema: SampleJSONSchema;
  obj_for_import: DynamicObject;
}

export interface SceneMetadata extends ServerSceneMetadata {
  configSchema: FormilyJSONSchema;
}

export interface ServerScene {
  scene_metadata: ServerSceneMetadata;
  agents_metadata: Record<string, ServerSceneAgentMetadata[]>;
  evaluators_metadata: any;
}

export default interface Scene extends ServerScene {
  scene_metadata: SceneMetadata;
  agents_metadata: Record<string, SceneAgentMetadata[]>;
}
