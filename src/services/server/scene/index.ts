import request from '@/services/server/request';
import Scene, { SceneListItem, ServerScene } from '@/types/server/Scene';
import { transferStandardJSONSchemaToFormilyJSONSchema } from '@/utils/json-schema';
import FormilyJSONSchema from '@/types/FormilyJSONSchema';

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
    let evaluatorsConfigFormilySchemas: Record<string, FormilyJSONSchema> | undefined;
    if (serverScene.evaluators_config_schemas) {
      evaluatorsConfigFormilySchemas = {};
      for (const [evaluator_id, evaluator_config_schema] of Object.entries(serverScene.evaluators_config_schemas)) {
        evaluatorsConfigFormilySchemas[evaluator_id] =
          await transferStandardJSONSchemaToFormilyJSONSchema(evaluator_config_schema);
      }
    }
    return {
      ...serverScene,
      sceneInfoConfigFormilySchema,
      agentsConfigFormilySchemas,
      additionalConfigFormilySchema,
      evaluatorsConfigFormilySchemas,
    };
  },
};

export default sceneAPI;
