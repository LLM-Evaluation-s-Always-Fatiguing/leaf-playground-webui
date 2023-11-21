import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const filePath = searchParams.get('filePath');

  if (!filePath) {
    return new Response(JSON.stringify({ error: 'filePath is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const fullPath = path.resolve(process.cwd(), filePath);
  try {
    const fileContent = fs.readFileSync(fullPath);
    const mimeType = mime.lookup(fullPath) || 'application/octet-stream';

    return new Response(fileContent, { status: 200, headers: { 'Content-Type': mimeType } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Error reading file' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
