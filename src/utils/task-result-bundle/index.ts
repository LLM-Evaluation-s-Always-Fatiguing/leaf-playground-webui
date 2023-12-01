import LocalAPI from '@/services/local';
import Scene from '@/types/server/Scene';
import RunSceneConfig from '@/types/server/RunSceneConfig';

export async function saveWebUITaskOriginalDataToLocal(
  saveDir: string,
  taskId: string,
  scene: Scene,
  runConfig: RunSceneConfig
) {
  await LocalAPI.taskResultBundle.saveInfo(saveDir, taskId, scene, runConfig);
}
