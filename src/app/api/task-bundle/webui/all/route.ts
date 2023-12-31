import { NextRequest } from 'next/server';
import WebUITaskBundleTaskInfo from '@/types/api-router/webui/task-bundle/TaskInfo';
import dayjs from 'dayjs';
import fs from 'fs/promises';
import groupBy from 'lodash/groupBy';
import path from 'path';

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
    const dirents = await fs.readdir(bundlesPath, { withFileTypes: true });
    const directories = dirents.filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name);

    const tasks: WebUITaskBundleTaskInfo[] = [];

    for (const dir of directories) {
      const webuiPath = path.join(bundlesPath, dir, '.webui');
      if (
        await fs.stat(webuiPath).then(
          () => true,
          () => false
        )
      ) {
        const taskFilePath = path.join(webuiPath, 'task.json');
        if (
          await fs.stat(taskFilePath).then(
            () => true,
            () => false
          )
        ) {
          const taskData = await fs.readFile(taskFilePath, { encoding: 'utf8' });
          const logsFilePath = path.join(bundlesPath, dir, 'logs.jsonl');
          const taskFinished = await fs.stat(logsFilePath).then(
            () => true,
            () => false
          );
          tasks.push({
            ...JSON.parse(taskData),
            finished: taskFinished,
          });
        }
      }
    }

    tasks.sort((a, b) => {
      return dayjs(b.time).unix() - dayjs(a.time).unix();
    });

    return new Response(JSON.stringify(groupBy(tasks, (task) => task.sceneMd5)), {
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
