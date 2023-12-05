import { NextRequest } from 'next/server';
import { exec as execCallback } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import os from 'os';

const exec = promisify(execCallback);

export async function POST(req: NextRequest) {
  const { dictPath } = await req.json();

  try {
    await fs.access(dictPath);

    const stats = await fs.lstat(dictPath);
    if (!stats.isDirectory()) {
      throw new Error('Provided path is not a directory');
    }

    const platform = os.platform();
    let command;

    if (platform === 'win32') {
      // Windows
      command = `start explorer "${dictPath}"`;
    } else if (platform === 'darwin') {
      // macOS
      command = `open "${dictPath}"`;
    } else if (platform === 'linux') {
      // Linux
      command = `xdg-open "${dictPath}"`;
    } else {
      throw new Error('Unsupported operating system');
    }

    await exec(command);
    return new Response(JSON.stringify({ message: 'Directory opened' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unknown error occurred' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
