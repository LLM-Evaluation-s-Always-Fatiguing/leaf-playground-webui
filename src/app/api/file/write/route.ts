import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import dayjs from 'dayjs';
import { FILE_API_BACKUP_DIR } from '@/project-settings/api';

export async function POST(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const filePath = searchParams.get('filePath');

  if (!filePath) {
    return new Response(JSON.stringify({ error: 'filePath is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const fullPath = path.resolve(process.cwd(), filePath);
  const mimeType = req.headers.get('Content-Type') || 'application/octet-stream';

  try {
    let backupPath = null;
    if (fs.existsSync(fullPath)) {
      const backupDir = path.join(
        path.dirname(fullPath),
        FILE_API_BACKUP_DIR,
        dayjs().format('YYYY-MM-DD_HH-mm-ss-SSS')
      );
      fs.mkdirSync(backupDir, { recursive: true });
      backupPath = path.join(backupDir, path.basename(fullPath));
      fs.copyFileSync(fullPath, backupPath);
    }

    const buffer = await req.arrayBuffer();
    fs.writeFileSync(fullPath, Buffer.from(buffer), { encoding: mimeType === 'text/plain' ? 'utf8' : undefined });

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
