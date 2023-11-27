import SampleJSONSchemaDef from '@/types/SampleJSONSchemaDef';
import FormilyJSONSchema from '@/types/FormilyJSONSchema';
import DynamicObject from '@/types/server/DynamicObject';

export interface SceneRoleDefinition {
  name: string;
  description: string;
  num_agents: number;
  is_static: boolean;
  type: DynamicObject;
  agent_type: DynamicObject;
}

export interface SceneMetaData {
  name: string;
  description: string;
  role_definitions: SceneRoleDefinition[];
}

export interface SceneAgentMetaData {
  description: string;
  actions: Record<string, string>;
}

export interface ServerScene {
  id: string;
  scene_metadata: SceneMetaData;
  agents_metadata: Record<string, SceneAgentMetaData>;
  role_agents_num: Record<string, number>;
  min_agents_num: number;
  max_agents_num: number;
  scene_info_config_schema: SampleJSONSchemaDef;
  agents_config_schemas: Record<string, SampleJSONSchemaDef>;
  additional_config_schema: SampleJSONSchemaDef;
}

export default interface Scene extends ServerScene {
  sceneInfoConfigFormilySchema: FormilyJSONSchema;
  agentsConfigFormilySchemas: Record<string, FormilyJSONSchema>;
  additionalConfigFormilySchema: FormilyJSONSchema;
}

export interface SceneListItem {
  id: string;
  metadata: SceneMetaData;
}
