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
      const agentFormilySchema = await transferStandardJSONSchemaToFormilyJSONSchema(agent_config_schema);
      agentFormilySchema.title = agentFormilySchema.title.replace(/Config$/, '')
      if (agentFormilySchema.properties?.chart_major_color) {
        agentFormilySchema.properties.chart_major_color['x-component'] = 'ColorPicker';
        agentFormilySchema.properties.chart_major_color['x-component-props'] = {
          format: 'hex',
        };
      }

      agentsConfigFormilySchemas[agent_id] = agentFormilySchema;
    }
    const additionalConfigFormilySchema = await transferStandardJSONSchemaToFormilyJSONSchema(
      serverScene.additional_config_schema
    );
    let evaluatorsConfigFormilySchemas: FormilyJSONSchema | undefined;
    if (serverScene.evaluators_config_schemas) {
      evaluatorsConfigFormilySchemas = {
        type: 'object',
        'x-decoration': 'FormItem',
        properties: {},
      };
      for (const [evaluator_id, evaluator_config_schema] of Object.entries(serverScene.evaluators_config_schemas)) {
        evaluatorsConfigFormilySchemas.properties![evaluator_id] =
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
