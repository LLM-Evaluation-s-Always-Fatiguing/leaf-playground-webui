import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import groupBy from 'lodash/groupBy';
import dayjs from 'dayjs';
import TaskInfo from '@/types/api-router/TaskInfo';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const bundlesPath = searchParams.get('bundlesPath');

  if (!bundlesPath) {
    return new Response(JSON.stringify({ error: 'bundlesPath required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const directories = fs
      .readdirSync(bundlesPath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    const tasks: TaskInfo[] = [];

    for (const dir of directories) {
      const webuiPath = path.join(bundlesPath, dir, '.webui');
      if (fs.existsSync(webuiPath)) {
        const taskFilePath = path.join(webuiPath, 'task.json');
        if (fs.existsSync(taskFilePath)) {
          const taskData = fs.readFileSync(taskFilePath, { encoding: 'utf8' });
          tasks.push(JSON.parse(taskData));
        }
      }
    }

    tasks.sort((a, b) => {
      return dayjs(b.time).unix() - dayjs(a.time).unix();
    });

    return new Response(JSON.stringify(groupBy(tasks, (task) => task.sceneId)), {
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
