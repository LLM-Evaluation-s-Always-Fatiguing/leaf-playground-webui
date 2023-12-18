import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import { CreateSceneParams } from '@/types/server/CreateSceneParams';
import Scene from '@/types/server/meta/Scene';
import WebUITaskBundle from '@/types/api-router/webui/task-bundle';

interface GlobalState {
  pageTitle?: string;
  currentScene?: Scene;
  createSceneParams?: CreateSceneParams;
  taskId?: string;
  bundlePath?: string;
  updatePageTitle: (pageTitle: string) => void;
  clearPageTitle: () => void;
  updateCurrentScene: (scene: Scene) => void;
  updateCreateSceneParams: (createSceneParams: CreateSceneParams) => void;
  updateTaskId: (taskId: string) => void;
  updateTaskResultSavedDir: (bundlePath: string) => void;
  updateInfoAfterSceneTaskCreated: (
    bundlePath: string,
    taskId: string,
    scene: Scene,
    createSceneParams: CreateSceneParams
  ) => void;
  updateInfoFromWebUITaskBundle: (bundle: WebUITaskBundle) => void;
  clearTaskState: () => void;
}

const useGlobalStore = create<GlobalState>()(
  immer(
    devtools((set) => ({
      pageTitle: undefined,
      createSceneParams: undefined,
      create: undefined,
      taskId: undefined,
      bundlePath: undefined,
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
      updateCreateSceneParams: (createSceneParams) =>
        set((state) => {
          state.createSceneParams = createSceneParams;
        }),
      updateTaskId: (taskId) =>
        set((state) => {
          state.taskId = taskId;
        }),
      updateTaskResultSavedDir: (bundlePath) =>
        set((state) => {
          state.bundlePath = bundlePath;
        }),
      updateInfoAfterSceneTaskCreated: (bundlePath, taskId, scene, createSceneParams) =>
        set((state) => {
          state.bundlePath = bundlePath;
          state.taskId = taskId;
          state.currentScene = scene;
          state.createSceneParams = createSceneParams;
        }),
      updateInfoFromWebUITaskBundle: (bundle) =>
        set((state) => {
          state.bundlePath = bundle.taskInfo.bundlePath;
          state.taskId = bundle.taskInfo.id;
          state.currentScene = bundle.scene;
          state.createSceneParams = bundle.runConfig;
        }),
      clearTaskState: () =>
        set((state) => {
          state.currentScene = undefined;
          state.createSceneParams = undefined;
          state.taskId = undefined;
          state.bundlePath = undefined;
        }),
    }))
  )
);

export default useGlobalStore;
