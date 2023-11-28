import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import { RunSceneConfig } from '@/types/server/web-socket';
import Scene from '@/types/server/Scene';

interface GlobalState {
  currentScene?: Scene;
  runSceneConfig?: RunSceneConfig;
  updateCurrentScene: (scene: Scene) => void;
  updateRunSceneConfig: (runSceneConfig: RunSceneConfig) => void;
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
    }))
  )
);

export default useGlobalStore;
