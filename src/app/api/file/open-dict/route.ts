import { NextRequest } from 'next/server';
import { exec as execCallback } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import os from 'os';

const exec = promisify(execCallback);

export async function POST(req: NextRequest) {
  const { directoryPath } = await req.json();

  try {
    if (!fs.existsSync(directoryPath)) {
      throw new Error('Path does not exist');
    }

    const stats = fs.lstatSync(directoryPath);
    if (!stats.isDirectory()) {
      throw new Error('Provided path is not a directory');
    }

    const platform = os.platform();
    let command;

    if (platform === 'win32') {
      // Windows
      command = `explorer "${directoryPath}"`;
    } else if (platform === 'darwin') {
      // macOS
      command = `open "${directoryPath}"`;
    } else if (platform === 'linux') {
      // Linux
      command = `xdg-open "${directoryPath}"`;
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
