import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const dictPath = searchParams.get('dictPath');

  if (!dictPath) {
    return Response.json({ error: 'dictPath is required' }, { status: 400 });
  }

  const fullPath = path.resolve(process.cwd(), dictPath);
  try {
    const direntArr = fs.readdirSync(fullPath, { withFileTypes: true });
    const result = await Promise.all(
      direntArr.map(async (dirent) => {
        if (dirent.isDirectory()) {
          return { name: dirent.name, type: 'DIRECTORY', mimeType: null };
        } else {
          return {
            name: dirent.name,
            fullPath: path.join(fullPath, dirent.name),
            type: 'FILE',
            mimeType: mime.lookup(dirent.name) || 'unknown',
          };
        }
      })
    );
    return Response.json(result);
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Error reading directory' }, { status: 500 });
  }
}
