import { CreateSceneTaskParams } from '@/types/server/config/CreateSceneTaskParams';
import Project from '@/types/server/meta/Project';
import { message } from 'antd';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import ServerAPI from '@/services/server';

interface GlobalState {
  pageTitle?: string;
  currentProject?: Project;
  createSceneTaskParams?: CreateSceneTaskParams;
  taskId?: string;
}

interface GlobalActions {
  updatePageTitle: (pageTitleFn: (state: GlobalState) => string) => void;
  clearPageTitle: () => void;
  updateCurrentProject: (project: Project) => void;
  updateCreateSceneTaskParams: (createSceneTaskParams: CreateSceneTaskParams) => void;
  updateTaskId: (taskId: string) => void;
  updateInfoAfterSceneTaskCreated: (
    project: Project,
    createSceneTaskParams: CreateSceneTaskParams,
    taskId: string
  ) => void;
  syncTaskStateFromServer: (taskId: string) => Promise<void>;
  clearTaskState: () => void;
}

const useGlobalStore = create<GlobalState & GlobalActions>()(
  immer(
    devtools((set, get) => ({
      pageTitle: undefined,
      currentProject: undefined,
      createSceneTaskParams: undefined,
      taskId: undefined,
      updatePageTitle: (pageTitleFn) =>
        set((state) => {
          state.pageTitle = pageTitleFn(get());
        }),
      clearPageTitle: () =>
        set((state) => {
          state.pageTitle = undefined;
        }),
      updateCurrentProject: (project) =>
        set((state) => {
          state.currentProject = project;
        }),
      updateCreateSceneTaskParams: (createSceneTaskParams) =>
        set((state) => {
          state.createSceneTaskParams = createSceneTaskParams;
        }),
      updateTaskId: (taskId) =>
        set((state) => {
          state.taskId = taskId;
        }),
      updateInfoAfterSceneTaskCreated: (project, createSceneTaskParams, taskId) =>
        set((state) => {
          state.currentProject = project;
          state.createSceneTaskParams = createSceneTaskParams;
          state.taskId = taskId;
        }),
      syncTaskStateFromServer: async (taskId) => {
        try {
          const createSceneTaskParams = await ServerAPI.sceneTask.payload(taskId);
          const projectDetail = await ServerAPI.project.detail(createSceneTaskParams.project_id);
          set((state) => {
            state.currentProject = projectDetail;
            state.createSceneTaskParams = createSceneTaskParams;
            state.taskId = taskId;
          });
        } catch (e) {
          message.error(`Sync task state from server failed.`);
          console.error(e);
        }
      },
      clearTaskState: () =>
        set((state) => {
          state.currentProject = undefined;
          state.createSceneTaskParams = undefined;
          state.taskId = undefined;
        }),
    }))
  )
);

export default useGlobalStore;
