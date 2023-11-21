import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { FILE_API_BACKUP_DIR } from '@/project-settings/api';

function deleteLeafBackupDirectories(dirPath: string) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath, { withFileTypes: true }).forEach((dirent) => {
      const currentPath = path.join(dirPath, dirent.name);
      if (dirent.isDirectory()) {
        if (dirent.name === FILE_API_BACKUP_DIR) {
          fs.rmSync(currentPath, { recursive: true });
        } else {
          deleteLeafBackupDirectories(currentPath);
        }
      }
    });
  }
}

export async function POST(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const dirPath = searchParams.get('dirPath');

  if (!dirPath) {
    return new Response(JSON.stringify({ error: 'dirPath is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const fullPath = path.resolve(process.cwd(), dirPath);

  try {
    deleteLeafBackupDirectories(fullPath);

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
