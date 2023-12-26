import HomePage from '@/app/homepage';
import LocalAPI from '@/services/local';
import ServerAPI from '@/services/server';

export default async function Page() {
  const serverInfo = await ServerAPI.info();
  const taskHistory = await LocalAPI.taskBundle.webui.getAll(serverInfo.paths.result_dir);
  const scenes = await ServerAPI.scene.getScenes();
  return <HomePage serverInfo={serverInfo} scenes={scenes} taskHistory={taskHistory} />;
}
