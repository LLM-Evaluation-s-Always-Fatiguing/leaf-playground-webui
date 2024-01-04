import * as dgram from 'dgram';

const getLocalIpAddress = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const socket = dgram.createSocket('udp4');

    socket.on('error', (err) => {
      socket.close();
      reject(`Error: ${err}`);
    });

    socket.connect(80, "8.8.8.8", () => {
      try {
        const localIp = socket.address().address;
        socket.close();
        resolve(localIp);
      } catch (err) {
        socket.close();
        reject(`Error: ${err}`);
      }
    });
  });
};


export async function GET() {
  try {
    return new Response(await getLocalIpAddress(), { status: 200, headers: { 'Content-Type': 'text/plain' } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Error get IP' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export const dynamic = 'force-dynamic'
