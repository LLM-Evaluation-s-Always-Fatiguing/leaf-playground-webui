import ServerAPI from '@/services/server';
import HomePage from '@/app/homepage';

export default async function Page() {
  const scenesResp = await ServerAPI.scene.getScenes();
  return <HomePage scenes={scenesResp.scenes} />;
}
