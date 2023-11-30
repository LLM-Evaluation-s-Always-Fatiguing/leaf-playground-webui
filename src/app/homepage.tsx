'use client';

import { useEffect, useState } from 'react';
import Scene, { SceneListItem } from '@/types/server/Scene';
import styled from '@emotion/styled';
import { Spin, message } from 'antd';
import SceneListComponent from '@/components/scene/SceneListComponent';
import ServerAPI from '@/services/server';
import SceneInfoBoard from '@/components/homepage/SceneInfoBoard';
import SceneConfigBoard from '@/components/homepage/SceneConfigBoard';
import useGlobalStore from '@/stores/global';

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

  .loadingOverlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    z-index: 3;
  }
`;

const OperationArea = styled.div`
  flex-grow: 1;
  width: 76%;
  min-width: 680px;
  overflow: hidden auto;
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
  scenes: SceneListItem[];
}

export default function HomePage(props: HomePageProps) {
  const globalStore = useGlobalStore();

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

  useEffect(() => {
    loadScenes();
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
        {scenesLoading && (
          <div className="loadingOverlay">
            <Spin spinning />
          </div>
        )}
      </ScenesArea>
      <OperationArea>
        {started && selectedSceneDetail ? (
          <SceneConfigBoard key={scenes[selectedSceneIndex].id} scene={selectedSceneDetail} />
        ) : (
          <SceneInfoBoard
            scene={scenes[selectedSceneIndex]}
            onStartClick={async () => {
              await loadSelectedSceneDetail();
              setStarted(true);
            }}
          />
        )}
      </OperationArea>
    </PageContainer>
  );
}
