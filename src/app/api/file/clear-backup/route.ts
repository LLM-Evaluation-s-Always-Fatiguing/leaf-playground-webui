import { NextRequest } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { FILE_API_BACKUP_DIR } from '@/project-settings/api';

async function deleteLeafBackupDirectories(dictPath: string) {
  if (
    await fs.stat(dictPath).then(
      () => true,
      () => false
    )
  ) {
    const dirents = await fs.readdir(dictPath, { withFileTypes: true });
    for (const dirent of dirents) {
      const currentPath = path.join(dictPath, dirent.name);
      if (dirent.isDirectory()) {
        if (dirent.name === FILE_API_BACKUP_DIR) {
          await fs.rm(currentPath, { recursive: true });
        } else {
          await deleteLeafBackupDirectories(currentPath);
        }
      }
    }
  }
}

export async function POST(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const dictPath = searchParams.get('dictPath');

  if (!dictPath) {
    return new Response(JSON.stringify({ error: 'dictPath is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const fullPath = path.resolve(process.cwd(), dictPath);

  try {
    await deleteLeafBackupDirectories(fullPath);

    return new Response(JSON.stringify({ message: 'All leaf-backup directories cleared.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Error clearing backup directories' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
