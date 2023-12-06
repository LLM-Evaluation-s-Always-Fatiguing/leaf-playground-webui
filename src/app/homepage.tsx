'use client';

import React, { useEffect, useState } from 'react';
import Scene, { SceneListItem } from '@/types/server/Scene';
import styled from '@emotion/styled';
import { Spin, message } from 'antd';
import SceneListComponent from '@/components/scene/SceneListComponent';
import ServerAPI from '@/services/server';
import SceneInfoBoard from '@/components/homepage/SceneInfoBoard';
import SceneConfigBoard from '@/components/homepage/SceneConfigBoard';
import useGlobalStore from '@/stores/global';
import ServerInfo from '@/types/server/ServerInfo';
import WebUITaskBundleTaskInfo from '@/types/api-router/webui/task-bundle/TaskInfo';
import LocalAPI from '@/services/local';
import LoadingOverlay from "@/components/common/LoadingOverlay";

const ScenesArea = styled.div`
  width: 24%;
  min-width: 260px;
  max-width: 340px;
  position: relative;
  border-right: 1px solid ${(props) => props.theme.dividerColor};

  .content {
    width: 100%;
    height: 100%;
    overflow: hidden auto;
    padding: 16px 12px;
  }
`;

const OperationArea = styled.div`
  flex-grow: 1;
  width: 76%;
  min-width: 680px;
  overflow: hidden auto;
  position: relative;
`;

const PageContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;

  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: stretch;
`;

interface HomePageProps {
  serverInfo: ServerInfo;
  scenes: SceneListItem[];
  taskHistory: Record<string, WebUITaskBundleTaskInfo[]>;
}

export default function HomePage(props: HomePageProps) {
  const globalStore = useGlobalStore();

  const [taskHistory, setTaskHistory] = useState<Record<string, WebUITaskBundleTaskInfo[]>>(props.taskHistory);

  const [scenesLoading, setScenesLoading] = useState(false);
  const [scenes, setScenes] = useState<SceneListItem[]>(props.scenes);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number>(0);

  const [sceneDetailLoading, setSceneDetailLoading] = useState(false);
  const [selectedSceneDetail, setSelectedSceneDetail] = useState<Scene>();
  const [started, setStarted] = useState(false);

  const loadSelectedSceneDetail = async () => {
    if (!scenes[selectedSceneIndex]) return;
    try {
      setSceneDetailLoading(true);
      const scene = await ServerAPI.scene.get(scenes[selectedSceneIndex].id);
      globalStore.updateCurrentScene(scene);
      setSelectedSceneDetail(scene);
    } catch (e) {
      console.error(e);
      message.error('Failed to load scene detail');
    } finally {
      setSceneDetailLoading(false);
    }
  };

  const loadScenes = async () => {
    try {
      setScenesLoading(true);
      const scenesResp = await ServerAPI.scene.getScenes();
      setScenes(scenesResp.scenes);
    } catch (e) {
      console.error(e);
      message.error('Failed to load scenes');
    } finally {
      setScenesLoading(false);
    }
  };

  const loadTaskHistory = async () => {
    try {
      const taskHistory = await LocalAPI.taskBundle.webui.getAll(props.serverInfo.paths.save_root);
      setTaskHistory(taskHistory);
    } catch (e) {
      console.error(e);
      message.error('Failed to load task history');
    }
  };

  useEffect(() => {
    globalStore.clearTaskState();
    loadScenes();
    loadTaskHistory();
  }, []);

  return (
    <PageContainer>
      <ScenesArea>
        <div className="content">
          {scenes.map((scene, index) => {
            return (
              <SceneListComponent
                key={scene.id}
                scene={scene}
                selected={selectedSceneIndex === index}
                onClick={() => {
                  setSelectedSceneIndex(index);
                  setSelectedSceneDetail(undefined);
                }}
              />
            );
          })}
        </div>
        <LoadingOverlay spinning={scenesLoading} />
      </ScenesArea>
      <OperationArea>
        {started && selectedSceneDetail ? (
          <SceneConfigBoard
            key={scenes[selectedSceneIndex].id}
            scene={selectedSceneDetail}
            taskHistory={taskHistory[scenes[selectedSceneIndex].id] || []}
          />
        ) : (
          <SceneInfoBoard
            scene={scenes[selectedSceneIndex]}
            onStartClick={async () => {
              await loadSelectedSceneDetail();
              setStarted(true);
            }}
          />
        )}
        <LoadingOverlay spinning={sceneDetailLoading} />
      </OperationArea>
    </PageContainer>
  );
}
