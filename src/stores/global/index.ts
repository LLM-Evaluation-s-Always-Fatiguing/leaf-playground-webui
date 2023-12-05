import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import RunSceneConfig from '@/types/server/RunSceneConfig';
import Scene from '@/types/server/Scene';
import { ServerTaskBundleAgentConfig } from '@/types/api-router/server/task-bundle/Agent';
import WebUITaskBundle from '@/types/api-router/webui/task-bundle';

interface GlobalState {
  pageTitle?: string;
  currentScene?: Scene;
  runSceneConfig?: RunSceneConfig;
  taskId?: string;
  bundlePath?: string;
  agentConfigs?: ServerTaskBundleAgentConfig[];
  updatePageTitle: (pageTitle: string) => void;
  clearPageTitle: () => void;
  updateCurrentScene: (scene: Scene) => void;
  updateRunSceneConfig: (runSceneConfig: RunSceneConfig) => void;
  updateTaskId: (taskId: string) => void;
  updateTaskResultSavedDir: (bundlePath: string) => void;
  updateAgentFullFilledConfigs: (agentConfigs: ServerTaskBundleAgentConfig[]) => void;
  updateInfoAfterSceneTaskCreated: (
    bundlePath: string,
    taskId: string,
    scene: Scene,
    runConfig: RunSceneConfig,
    agentConfigs: ServerTaskBundleAgentConfig[]
  ) => void;
  updateInfoFromWebUITaskBundle: (bundle: WebUITaskBundle) => void;
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
      agentConfigs: undefined,
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
      updateAgentFullFilledConfigs: (agentConfigs) =>
        set((state) => {
          state.agentConfigs = agentConfigs;
        }),
      updateInfoAfterSceneTaskCreated: (bundlePath, taskId, scene, runConfig, agentConfigs) =>
        set((state) => {
          state.bundlePath = bundlePath;
          state.taskId = taskId;
          state.currentScene = scene;
          state.runSceneConfig = runConfig;
          state.agentConfigs = agentConfigs;
        }),
      updateInfoFromWebUITaskBundle: (bundle) =>
        set((state) => {
          state.bundlePath = bundle.taskInfo.bundlePath;
          state.taskId = bundle.taskInfo.id;
          state.currentScene = bundle.scene;
          state.runSceneConfig = bundle.runConfig;
          state.agentConfigs = bundle.agentConfigs;
        }),
      clearTaskState: () =>
        set((state) => {
          state.currentScene = undefined;
          state.runSceneConfig = undefined;
          state.taskId = undefined;
          state.bundlePath = undefined;
          state.agentConfigs = undefined;
        }),
    }))
  )
);

export default useGlobalStore;
