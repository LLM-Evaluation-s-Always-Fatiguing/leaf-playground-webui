import { NextRequest } from 'next/server';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { paths }: { paths: string[] } = await req.json();

    if (!Array.isArray(paths) || !paths.every((p) => typeof p === 'string')) {
      return new Response(JSON.stringify({ error: 'Invalid input' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const concatenatedPath = path.join(...paths);

    return new Response(JSON.stringify({ result: concatenatedPath }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
