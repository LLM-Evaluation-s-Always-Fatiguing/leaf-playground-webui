import { NextRequest } from 'next/server';
import fs from 'fs/promises';
import { listDict } from '@/app/api/dict/service';
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

  const baseFullPath = bundlePath;

  try {
    const sceneFilePath = baseFullPath + '/scene.json';
    const logsFilePath = baseFullPath + '/logs.jsonl';
    const agentsFilePath = baseFullPath + '/agents.json';
    const metricsFilePath = baseFullPath + '/metrics.jsonl';
    const chartsDictPath = baseFullPath + '/charts';

    const [scene, logs, agents, metrics, chartJSONFiles] = await Promise.all([
      fs.readFile(sceneFilePath, { encoding: 'utf-8' }),
      fs.readFile(logsFilePath, { encoding: 'utf-8' }),
      fs.readFile(agentsFilePath, { encoding: 'utf-8' }),
      fs.readFile(metricsFilePath, { encoding: 'utf-8' }),
      listDict(chartsDictPath),
    ]);

    const chartFiles = chartJSONFiles.filter((item) => item.fullPath.endsWith('.json'));
    const chartOptionObjectStrings = await Promise.all(
      chartFiles.map((chartJson) => fs.readFile(chartJson.fullPath, { encoding: 'utf-8' }))
    );
    const charts = chartOptionObjectStrings.map((chartJSONStr, index) => {
      return {
        name: path.basename(chartFiles[index].name, path.extname(chartFiles[index].name)),
        fullPath: chartFiles[index].fullPath,
        vegaSpec: JSON.parse(chartJSONStr),
      };
    });

    return new Response(
      JSON.stringify({
        scene: JSON.parse(scene),
        logs: parseJSONL(logs),
        agents: JSON.parse(agents),
        metrics: parseJSONL(metrics),
        charts,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Error reading bundle' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

function parseJSONL(jsonLStr: string) {
  return jsonLStr
    .replace(/\n*$/, '')
    .split(/\n/)
    .filter((line) => line.trim())
    .map((jsonStr) => JSON.parse(jsonStr));
}
