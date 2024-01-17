import LocalAPI from '@/services/local';

export async function getFullServerWebSocketURL(url: string): Promise<string> {
  const appEnv = await LocalAPI.environment.get();
  const serverUrl = appEnv.serverUrl;
  const isSecure = serverUrl.startsWith('https');
  return `${isSecure ? 'wss' : 'ws'}://${serverUrl.replace(/^(http:\/\/|https:\/\/)/, '')}${url}`;
}
