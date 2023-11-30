import LocalAPI from '@/services/local';
import Scene from '@/types/server/Scene';
import RunSceneConfig from '@/types/server/RunSceneConfig';

export async function saveWebUITaskOriginalDataToLocal(taskId: string, scene: Scene, runConfig: RunSceneConfig) {
  const basePath = '/Users/brian/Documents/Git/leaf-playground/tmp';
  await LocalAPI.taskResultBundle.saveInfo(`${basePath}/${taskId}`, taskId, scene, runConfig);
}
