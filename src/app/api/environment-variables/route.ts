import WebUIAppEnvironmentVariables from '@/types/webui/AppEnvironmentVariables';

const PLAYGROUND_SERVER_BASE_URL = process.env.PLAYGROUND_SERVER_BASE_URL || 'http://127.0.0.1:8000';
const WEB_UI_EXTERNAL_URL = process.env.WEB_UI_EXTERNAL_URL;

const AppEnvironmentVariables: WebUIAppEnvironmentVariables = {
  serverUrl: PLAYGROUND_SERVER_BASE_URL,
  externalUrl: WEB_UI_EXTERNAL_URL,
};

export async function GET() {
  try {
    return new Response(JSON.stringify(AppEnvironmentVariables), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Error get app environment variables.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export const dynamic = 'force-dynamic';
