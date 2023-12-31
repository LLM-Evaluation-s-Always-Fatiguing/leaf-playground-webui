import { NextRequest } from 'next/server';
import WebUITaskBundleTaskInfo from '@/types/api-router/webui/task-bundle/TaskInfo';
import { CreateSceneParams } from '@/types/server/CreateSceneParams';
import Scene from '@/types/server/meta/Scene';
import md5 from 'crypto-js/md5';
import dayjs from 'dayjs';
import fs from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const bundlePath = searchParams.get('bundlePath');

  if (!bundlePath) {
    return new Response(JSON.stringify({ error: 'bundlePath required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const baseFullPath = path.resolve(bundlePath, '.webui');

  try {
    const sceneFilePath = path.join(baseFullPath, 'scene.json');
    const configFilePath = path.join(baseFullPath, 'config.json');
    const taskInfoPath = path.join(baseFullPath, 'task.json');

    const [sceneData, configData, taskInfoData] = await Promise.all([
      fs.readFile(sceneFilePath, { encoding: 'utf8' }),
      fs.readFile(configFilePath, { encoding: 'utf8' }),
      fs.readFile(taskInfoPath, { encoding: 'utf8' }),
    ]);

    return new Response(
      JSON.stringify({
        taskInfo: JSON.parse(taskInfoData),
        scene: JSON.parse(sceneData),
        createSceneParams: JSON.parse(configData),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Error reading bundle info' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function writeFile(filePath: string, data: any) {
  await fs.writeFile(filePath, data, { encoding: 'utf8' });
}

export async function POST(req: NextRequest) {
  try {
    const {
      bundlePath,
      taskId,
      serverUrl,
      scene,
      createSceneParams,
    }: {
      bundlePath: string;
      taskId: string;
      serverUrl: string;
      scene: Scene;
      createSceneParams: CreateSceneParams;
    } = await req.json();

    if (!bundlePath || !taskId || !scene || !createSceneParams) {
      return new Response(
        JSON.stringify({ error: 'bundlePath, taskId, serverUrl, scene and createSceneParams are required.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const baseFullPath = path.resolve(bundlePath, '.webui');
    await fs.mkdir(baseFullPath, { recursive: true });

    const sceneFilePath = path.join(baseFullPath, 'scene.json');
    const configFilePath = path.join(baseFullPath, 'config.json');
    const taskInfoPath = path.join(baseFullPath, 'task.json');

    const roleAgentsMap: Record<string, string[]> = {};
    Object.entries(createSceneParams.scene_obj_config.scene_config_data.roles_config).forEach(
      ([roleName, roleConfig]) => {
        if (roleConfig.agents_config && roleConfig.agents_config.length) {
          roleAgentsMap[roleName] = (roleConfig.agents_config || []).map((c) => c.config_data.profile.name);
        }
      }
    );
    const enableMetricsName: string[] = [];
    Object.entries(createSceneParams.scene_obj_config.scene_config_data.roles_config).forEach(
      ([roleName, roleConfig]) => {
        Object.entries(roleConfig.actions_config).forEach(([actionName, actionConfig]) => {
          Object.entries(actionConfig.metrics_config || {}).forEach(([metricName, metricConfig]) => {
            if (metricConfig.enable) {
              enableMetricsName.push(`${roleName}.${actionName}.${metricName}`);
            }
          });
        });
      }
    );
    const enableEvaluatorsName = createSceneParams.metric_evaluator_objs_config.evaluators.map(
      (e) => e.evaluator_obj.obj
    );

    await Promise.all([
      writeFile(sceneFilePath, JSON.stringify(scene, null, 2)),
      writeFile(configFilePath, JSON.stringify(createSceneParams, null, 2)),
      writeFile(
        taskInfoPath,
        JSON.stringify({
          id: taskId,
          sceneMd5: md5(
            `${scene.scene_metadata.obj_for_import.obj}+${scene.scene_metadata.obj_for_import.module}`
          ).toString(),
          serverUrl,
          bundlePath,
          roleAgentsMap,
          enableMetricsName,
          enableEvaluatorsName,
          time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        } as WebUITaskBundleTaskInfo)
      ),
    ]);

    return new Response(JSON.stringify({ message: 'Files saved successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Error processing request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
