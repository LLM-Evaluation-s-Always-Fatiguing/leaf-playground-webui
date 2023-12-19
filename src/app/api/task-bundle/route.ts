import { NextRequest } from 'next/server';
import fs from 'fs/promises';

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
    const sceneConfigFilePath = baseFullPath + '/scene_config.json';
    const logsFilePath = baseFullPath + '/logs.jsonl';

    const [sceneObjConfig, logs] = await Promise.all([
      fs.readFile(sceneConfigFilePath, { encoding: 'utf-8' }),
      fs.readFile(logsFilePath, { encoding: 'utf-8' }),
    ]);

    return new Response(
      JSON.stringify({
        sceneObjConfig: JSON.parse(sceneObjConfig),
        logs: parseJSONL(logs),
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
