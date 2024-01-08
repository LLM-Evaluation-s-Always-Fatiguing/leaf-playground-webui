import { NextRequest } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  const {
    serverUrl,
  }: {
    serverUrl: string;
  } = await req.json();

  if (!serverUrl) {
    return new Response(JSON.stringify({ error: 'serverUrl is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const resp = await axios.post(`${serverUrl}/resume`);
    return new Response(JSON.stringify(resp.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Resume task failed.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
