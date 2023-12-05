import { NextRequest } from 'next/server';
import path from 'path';
import { listDict } from '@/app/api/dict/service';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const dictPath = searchParams.get('dictPath');

  if (!dictPath) {
    return Response.json({ error: 'dictPath is required' }, { status: 400 });
  }

  const fullPath = path.resolve(process.cwd(), dictPath);
  try {
    return Response.json(await listDict(fullPath));
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Error reading directory' }, { status: 500 });
  }
}
