import ServerAPI from '@/services/server';
import HomePage from '@/app/homepage';
import LocalAPI from '@/services/local';

export default async function Page() {
  const serverInfo = await ServerAPI.info();
  const taskHistory = await LocalAPI.taskBundle.webui.getAll(serverInfo.paths.save_root);
  const scenes = await ServerAPI.scene.getScenes();
  return <HomePage serverInfo={serverInfo} scenes={scenes} taskHistory={taskHistory} />;
}
