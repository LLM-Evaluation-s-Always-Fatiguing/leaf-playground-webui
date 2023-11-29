import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import RunSceneConfig from '@/types/server/RunSceneConfig';
import Scene from '@/types/server/Scene';

interface GlobalState {
  currentScene?: Scene;
  runSceneConfig?: RunSceneConfig;
  taskId?: string;
  taskResultSavedDir?: string;
  updateCurrentScene: (scene: Scene) => void;
  updateRunSceneConfig: (runSceneConfig: RunSceneConfig) => void;
  updateTaskId: (taskId: string) => void;
  updateTaskResultSavedDir: (taskResultSavedDir: string) => void;
}

const useGlobalStore = create<GlobalState>()(
  immer(
    devtools((set) => ({
      currentScene: undefined,
      runSceneConfig: undefined,
      updateCurrentScene: (scene) =>
        set((state) => {
          state.currentScene = scene;
        }),
      updateRunSceneConfig: (runSceneConfig) =>
        set((state) => {
          state.runSceneConfig = runSceneConfig;
        }),
      updateTaskId: (taskId) =>
        set((state) => {
          state.taskId = taskId;
        }),
      updateTaskResultSavedDir: (taskResultSavedDir) =>
        set((state) => {
          state.taskResultSavedDir = taskResultSavedDir;
        }),
    }))
  )
);

export default useGlobalStore;
