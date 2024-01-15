import { NextRequest } from 'next/server';
import request from '@/app/api/server/hub/request';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const projectId = decodeURIComponent(searchParams.get('projectId') || '');
  const filePath = decodeURIComponent(searchParams.get('filePath') || '');

  if (!projectId) {
    return new Response(JSON.stringify({ error: 'projectId is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!filePath) {
    return new Response(JSON.stringify({ error: 'filePath is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const fileContent = await request.get(`/hub/${projectId}/assets/download_image`, {
      params: {
        file_path: filePath,
      },
    });
    const imageData = Buffer.from(fileContent.data.image, 'base64');
    return new Response(imageData, { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Error load project image asset.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
