import os from 'os';

const getLocalIpAddress = () => {
  const networkInterfaces = os.networkInterfaces();

  for (const interfaceName in networkInterfaces) {
    const networkInterface = networkInterfaces[interfaceName];

    if (networkInterface) {
      for (const interfaceInfo of networkInterface) {
        const { family, address, internal } = interfaceInfo;
        if (family === 'IPv4' && address !== '127.0.0.1' && !internal) {
          return address;
        }
      }
    }
  }

  return '127.0.0.1';
};


export async function GET() {
  try {
    return new Response(getLocalIpAddress(), { status: 200, headers: { 'Content-Type': 'text/plain' } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Error get IP' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
