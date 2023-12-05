import { NextRequest } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import dayjs from 'dayjs';
import Scene from '@/types/server/Scene';
import RunSceneConfig from '@/types/server/RunSceneConfig';
import { ServerTaskBundleAgentConfig } from "@/types/api-router/server/task-bundle/Agent";

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
    const agentsFilePath = path.join(baseFullPath, 'agents.json');
    const taskInfoPath = path.join(baseFullPath, 'task.json');

    const [sceneData, configData, agentsData, taskInfoData] = await Promise.all([
      fs.readFile(sceneFilePath, { encoding: 'utf8' }),
      fs.readFile(configFilePath, { encoding: 'utf8' }),
      readAgentsData(agentsFilePath, bundlePath),
      fs.readFile(taskInfoPath, { encoding: 'utf8' }),
    ]);

    return new Response(
      JSON.stringify({
        taskInfo: JSON.parse(taskInfoData),
        scene: JSON.parse(sceneData),
        runConfig: JSON.parse(configData),
        agentConfigs: JSON.parse(agentsData),
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

async function readAgentsData(webUIAgentsFilePath: string, bundlePath: string) {
  try {
    return await fs.readFile(webUIAgentsFilePath, { encoding: 'utf8' });
  } catch (e) {
    const serverAgentsFilePath = path.join(bundlePath, 'agents.json');
    const serverAgentsData = await fs.readFile(serverAgentsFilePath, { encoding: 'utf8' });
    const serverAgents = JSON.parse(serverAgentsData);
    return JSON.stringify(Object.keys(serverAgents).map((a) => serverAgents[a].config));
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
      scene,
      runConfig,
      agentConfigs,
    }: {
      bundlePath: string;
      taskId: string;
      scene: Scene;
      runConfig: RunSceneConfig;
      agentConfigs: ServerTaskBundleAgentConfig[];
    } = await req.json();

    if (!bundlePath || !taskId || !scene || !runConfig) {
      return new Response(JSON.stringify({ error: 'bundlePath, taskId, scene and runConfig are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const baseFullPath = path.resolve(bundlePath, '.webui');
    await fs.mkdir(baseFullPath, { recursive: true });

    const sceneFilePath = path.join(baseFullPath, 'scene.json');
    const configFilePath = path.join(baseFullPath, 'config.json');
    const agentsFilePath = path.join(baseFullPath, 'agents.json');
    const taskInfoPath = path.join(baseFullPath, 'task.json');

    await Promise.all([
      writeFile(sceneFilePath, JSON.stringify(scene, null, 2)),
      writeFile(configFilePath, JSON.stringify(runConfig, null, 2)),
      writeFile(agentsFilePath, JSON.stringify(agentConfigs, null, 2)),
      writeFile(
        taskInfoPath,
        JSON.stringify({
          id: taskId,
          sceneId: scene.id,
          bundlePath: bundlePath,
          agentsName: runConfig.scene_agents_config_data.map((c) => c.agent_config_data.profile.name),
          time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        })
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
