import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import RunSceneConfig from '@/types/server/RunSceneConfig';
import Scene from '@/types/server/Scene';
import { SceneAgentFullFilledConfig } from '@/types/server/Agent';

interface GlobalState {
  pageTitle?: string;
  currentScene?: Scene;
  runSceneConfig?: RunSceneConfig;
  taskId?: string;
  bundlePath?: string;
  agentFullFilledConfigs?: SceneAgentFullFilledConfig[];
  updatePageTitle: (pageTitle: string) => void;
  clearPageTitle: () => void;
  updateCurrentScene: (scene: Scene) => void;
  updateRunSceneConfig: (runSceneConfig: RunSceneConfig) => void;
  updateTaskId: (taskId: string) => void;
  updateTaskResultSavedDir: (bundlePath: string) => void;
  updateAgentFullFilledConfigs: (agentFullFilledConfigs: SceneAgentFullFilledConfig[]) => void;
  updateInfoAfterSceneTaskCreated: (
    bundlePath: string,
    taskId: string,
    scene: Scene,
    runConfig: RunSceneConfig,
    agentFullFilledConfigs: SceneAgentFullFilledConfig[]
  ) => void;
  clearTaskState: () => void;
}

const useGlobalStore = create<GlobalState>()(
  immer(
    devtools((set) => ({
      pageTitle: undefined,
      currentScene: undefined,
      runSceneConfig: undefined,
      taskId: undefined,
      bundlePath: undefined,
      agentFullFilledConfigs: undefined,
      updatePageTitle: (pageTitle: string) =>
        set((state) => {
          state.pageTitle = pageTitle;
        }),
      clearPageTitle: () =>
        set((state) => {
          state.pageTitle = undefined;
        }),
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
      updateTaskResultSavedDir: (bundlePath) =>
        set((state) => {
          state.bundlePath = bundlePath;
        }),
      updateAgentFullFilledConfigs: (agentFullFilledConfigs) =>
        set((state) => {
          state.agentFullFilledConfigs = agentFullFilledConfigs;
        }),
      updateInfoAfterSceneTaskCreated: (bundlePath, taskId, scene, runConfig, agentFullFilledConfigs) =>
        set((state) => {
          state.bundlePath = bundlePath;
          state.taskId = taskId;
          state.currentScene = scene;
          state.runSceneConfig = runConfig;
          state.agentFullFilledConfigs = agentFullFilledConfigs;
        }),
      clearTaskState: () =>
        set((state) => {
          state.currentScene = undefined;
          state.runSceneConfig = undefined;
          state.taskId = undefined;
          state.bundlePath = undefined;
          state.agentFullFilledConfigs = undefined;
        }),
    }))
  )
);

export default useGlobalStore;
