import os from 'os';

const getLocalIp = (): string => {
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    if (iface) {
      for (let i = 0; i < iface.length; i++) {
        const alias = iface[i];
        if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
          return alias.address;
        }
      }
    }
  }
  return '127.0.0.1';
};

export async function GET() {
  try {
    return new Response(getLocalIp(), { status: 200, headers: { 'Content-Type': 'text/plain' } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Error get IP' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
