import request from '@/services/server/request';
import Scene, { SceneListItem, ServerScene } from '@/types/server/Scene';
import { transferStandardJSONSchemaToFormilyJSONSchema } from '@/utils/json-schema';
import { ISchema as FormilyJSONSchema } from '@formily/json-schema';

const sceneAPI = {
  async getScenes(): Promise<{
    scenes: SceneListItem[];
  }> {
    return (await request.get('/')).data;
  },
  async get(id: string): Promise<Scene> {
    const serverScene: ServerScene = (await request.get(`/scene/${id}`)).data;
    const sceneInfoConfigFormilySchema = await transferStandardJSONSchemaToFormilyJSONSchema(
      serverScene.scene_info_config_schema
    );
    const agentsConfigFormilySchemas: Record<string, FormilyJSONSchema> = {};
    for (const [agent_id, agent_config_schema] of Object.entries(serverScene.agents_config_schemas)) {
      agentsConfigFormilySchemas[agent_id] = await transferStandardJSONSchemaToFormilyJSONSchema(agent_config_schema);
    }
    const additionalConfigFormilySchema = await transferStandardJSONSchemaToFormilyJSONSchema(
      serverScene.additional_config_schema
    );
    return {
      id: serverScene.id,
      scene_metadata: serverScene.scene_metadata,
      agents_metadata: serverScene.agents_metadata,
      role_agents_num: serverScene.role_agents_num,
      scene_info_config_schema: serverScene.scene_info_config_schema,
      agents_config_schemas: serverScene.agents_config_schemas,
      additional_config_schema: serverScene.additional_config_schema,
      sceneInfoConfigFormilySchema,
      agentsConfigFormilySchemas,
      additionalConfigFormilySchema,
    };
  },
};

export default sceneAPI;
