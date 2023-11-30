import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import dayjs from 'dayjs';
import RunSceneConfig from '@/types/server/RunSceneConfig';
import Scene from '@/types/server/Scene';

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

    const sceneData = fs.readFileSync(sceneFilePath, { encoding: 'utf8' });
    const configData = fs.readFileSync(configFilePath, { encoding: 'utf8' });
    const taskInfoData = fs.readFileSync(taskInfoPath, { encoding: 'utf8' });

    return new Response(
      JSON.stringify({
        taskInfo: JSON.parse(taskInfoData),
        scene: JSON.parse(sceneData),
        config: JSON.parse(configData),
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

function writeFile(filePath: string, data: any) {
  fs.writeFileSync(filePath, data, { encoding: 'utf8' });
}

export async function POST(req: NextRequest) {
  try {
    const {
      bundlePath,
      taskId,
      scene,
      runConfig,
    }: {
      bundlePath: string;
      taskId: string;
      scene: Scene;
      runConfig: RunSceneConfig;
    } = await req.json();

    if (!bundlePath || !taskId || !scene || !runConfig) {
      return new Response(JSON.stringify({ error: 'bundlePath, taskId, scene and runConfig are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const baseFullPath = path.resolve(bundlePath, '.webui');
    if (!fs.existsSync(baseFullPath)) {
      fs.mkdirSync(baseFullPath, { recursive: true });
    }

    const sceneFilePath = path.join(baseFullPath, 'scene.json');
    writeFile(sceneFilePath, JSON.stringify(scene, null, 2));

    const configFilePath = path.join(baseFullPath, 'config.json');
    writeFile(configFilePath, JSON.stringify(runConfig, null, 2));

    const taskInfoPath = path.join(baseFullPath, 'task.json');
    writeFile(
      taskInfoPath,
      JSON.stringify({
        id: taskId,
        sceneId: scene.id,
        bundlePath: bundlePath,
        agentsName: runConfig.scene_agents_config_data.map((c) => c.agent_config_data.profile.name),
        time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      })
    );

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
