import { NextRequest } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const serverUrl = searchParams.get('serverUrl');

  if (!serverUrl) {
    return new Response(JSON.stringify({ error: 'serverUrl is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const resp = await axios.get(`${serverUrl}/status`);
    return new Response(JSON.stringify(resp.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Get task status failed.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
