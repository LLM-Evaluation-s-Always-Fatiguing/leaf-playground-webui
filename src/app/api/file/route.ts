import { NextRequest } from 'next/server';
import dayjs from 'dayjs';
import fs from 'fs/promises';
import mime from 'mime-types';
import path from 'path';
import { FILE_API_BACKUP_DIR } from '@/project-settings/api';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const filePath = decodeURIComponent(searchParams.get('filePath') || '');

  if (!filePath) {
    return new Response(JSON.stringify({ error: 'filePath is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const fileContent = await fs.readFile(filePath);
    const mimeType = mime.lookup(filePath) || 'application/octet-stream';

    return new Response(fileContent, { status: 200, headers: { 'Content-Type': mimeType } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Error reading file' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const filePath = searchParams.get('filePath');

  if (!filePath) {
    return new Response(JSON.stringify({ error: 'filePath is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const mimeType = req.headers.get('Content-Type') || 'application/octet-stream';

  try {
    const parentDir = path.dirname(filePath);
    await fs.mkdir(parentDir, { recursive: true });

    let backupPath = null;
    if (
      await fs.stat(filePath).then(
        () => true,
        () => false
      )
    ) {
      const backupDir = path.join(
        path.dirname(filePath),
        FILE_API_BACKUP_DIR,
        dayjs().format('YYYY-MM-DD_HH-mm-ss-SSS')
      );
      await fs.mkdir(backupDir, { recursive: true });
      backupPath = path.join(backupDir, path.basename(filePath));
      await fs.copyFile(filePath, backupPath);
    }

    const buffer = await req.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(buffer), { encoding: mimeType === 'text/plain' ? 'utf8' : undefined });

    return new Response(
      JSON.stringify({ message: 'File written successfully', ...(backupPath ? { backupPath } : {}) }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Error writing file' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
