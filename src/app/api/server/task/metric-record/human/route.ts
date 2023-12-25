import { NextRequest } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  const {
    serverUrl,
    params,
  }: {
    serverUrl: string;
    params: any;
  } = await req.json();

  if (!serverUrl || !params) {
    return new Response(JSON.stringify({ error: 'serverUrl and params are required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const resp = await axios.post(`${serverUrl}/record/eval/update`, params);
    return new Response(JSON.stringify(resp.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Update record failed.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
