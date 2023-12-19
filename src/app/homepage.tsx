'use client';

import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { message } from 'antd';
import SceneListComponent from '@/components/scene/SceneListComponent';
import ServerAPI from '@/services/server';
import SceneInfoBoard from '@/components/homepage/SceneInfoBoard';
import SceneConfigBoard from '@/components/homepage/SceneConfigBoard';
import useGlobalStore from '@/stores/global';
import WebUITaskBundleTaskInfo from '@/types/api-router/webui/task-bundle/TaskInfo';
import LocalAPI from '@/services/local';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import ServerInfo from '@/types/server/meta/ServerInfo';
import Scene from '@/types/server/meta/Scene';
import md5 from 'crypto-js/md5';

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
  scenes: Scene[];
  taskHistory: Record<string, WebUITaskBundleTaskInfo[]>;
}

export default function HomePage(props: HomePageProps) {
  const globalStore = useGlobalStore();

  const [taskHistory, setTaskHistory] = useState<Record<string, WebUITaskBundleTaskInfo[]>>(props.taskHistory);

  const [scenesLoading, setScenesLoading] = useState(false);
  const [scenes, setScenes] = useState<Scene[]>(props.scenes);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number>(0);

  const selectedScene = scenes[selectedSceneIndex];
  const [started, setStarted] = useState(false);

  const loadScenes = async () => {
    try {
      setScenesLoading(true);
      const scenes = await ServerAPI.scene.getScenes();
      setScenes(scenes);
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
                key={scene.scene_metadata.scene_definition.name}
                scene={scene}
                selected={selectedSceneIndex === index}
                onClick={() => {
                  setSelectedSceneIndex(index);
                }}
              />
            );
          })}
        </div>
        <LoadingOverlay spinning={scenesLoading} />
      </ScenesArea>
      <OperationArea>
        {started && selectedScene ? (
          <SceneConfigBoard
            key={selectedScene.scene_metadata.scene_definition.name}
            scene={selectedScene}
            taskHistory={
              taskHistory[
                md5(
                  `${selectedScene.scene_metadata.obj_for_import.obj}+${selectedScene.scene_metadata.obj_for_import.module}`
                ).toString()
              ] || []
            }
          />
        ) : (
          <SceneInfoBoard
            scene={scenes[selectedSceneIndex]}
            onStartClick={async () => {
              setStarted(true);
            }}
          />
        )}
        <LoadingOverlay spinning={false} />
      </OperationArea>
    </PageContainer>
  );
}
