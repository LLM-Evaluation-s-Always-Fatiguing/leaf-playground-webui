import request from '@/services/server/request';

import { transferStandardJSONSchemaToFormilyJSONSchema } from '@/utils/json-schema';
import Scene, { ServerScene } from '@/types/server/meta/Scene';
import SceneAgentMetadata from '@/types/server/meta/Agent';

async function asyncReduce<T, U>(
  array: T[],
  reducer: (accumulator: U, value: T, index: number, array: T[]) => Promise<U>,
  initialValue: U
): Promise<U> {
  let accumulator: U = initialValue;

  for (let index = 0; index < array.length; index++) {
    accumulator = await reducer(accumulator, array[index], index, array);
  }

  return accumulator;
}

const sceneAPI = {
  async getScenes(): Promise<Scene[]> {
    const originScene: ServerScene[] = (await request.get('/')).data;
    return Promise.all(
      originScene.map(async (origin) => {
        const sceneMetadataConfigSchemaTransformResult = await transferStandardJSONSchemaToFormilyJSONSchema(
          origin.scene_metadata.config_schema
        );
        delete sceneMetadataConfigSchemaTransformResult.formilySchema.properties?.roles_config;
        if (Array.isArray(sceneMetadataConfigSchemaTransformResult.formilySchema.required)) {
          sceneMetadataConfigSchemaTransformResult.formilySchema.required =
            sceneMetadataConfigSchemaTransformResult.formilySchema.required.filter((item) => item !== 'roles_config');
        }
        return {
          scene_metadata: {
            ...origin.scene_metadata,
            config_schema: sceneMetadataConfigSchemaTransformResult.derefSchema,
            configSchema: sceneMetadataConfigSchemaTransformResult.formilySchema,
          },
          agents_metadata: await asyncReduce(
            Object.entries(origin.agents_metadata),
            async (final, [key, agentsMetadata], index) => {
              final[key] = await Promise.all(
                agentsMetadata.map(async (agentMetadata) => {
                  const agentMetadataConfigSchemaTransformResult = agentMetadata.config_schema
                    ? await transferStandardJSONSchemaToFormilyJSONSchema(agentMetadata.config_schema)
                    : undefined;
                  delete agentMetadataConfigSchemaTransformResult?.formilySchema.properties?.profile?.properties?.role;
                  if (agentMetadataConfigSchemaTransformResult?.formilySchema.properties?.chart_major_color) {
                    (agentMetadataConfigSchemaTransformResult?.formilySchema.properties.chart_major_color)[
                      'x-component'
                    ] = 'ColorPicker';
                  }
                  if (agentMetadataConfigSchemaTransformResult?.formilySchema.properties?.profile?.properties?.id) {
                    (agentMetadataConfigSchemaTransformResult?.formilySchema.properties.profile?.properties.id)[
                      'x-component-props'
                    ] = {
                      disabled: true,
                    };
                  }
                  return {
                    ...agentMetadata,
                    config_schema: agentMetadataConfigSchemaTransformResult?.derefSchema,
                    configSchema: agentMetadataConfigSchemaTransformResult?.formilySchema,
                  };
                })
              );
              return final;
            },
            {} as Record<string, SceneAgentMetadata[]>
          ),
          evaluators_metadata: await Promise.all(
            origin.evaluators_metadata.map(async (serverEvaluatorMetadata) => {
              const evaluatorMetadataConfigSchemaTransformResult = await transferStandardJSONSchemaToFormilyJSONSchema(
                serverEvaluatorMetadata.config_schema
              );
              return {
                ...serverEvaluatorMetadata,
                config_schema: evaluatorMetadataConfigSchemaTransformResult.derefSchema,
                configSchema: evaluatorMetadataConfigSchemaTransformResult.formilySchema,
              };
            })
          ),
        } as Scene;
      })
    );
  },
};

export default sceneAPI;
