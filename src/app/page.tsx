'use client';

import { useEffect, useState } from 'react';
import { SceneListItem } from '@/types/server/Scene';
import styled from '@emotion/styled';
import { Card, Spin } from 'antd';
import SceneListComponent from '@/components/scene/SceneListComponent';
import ServerAPI from '@/services/server';

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

const PageContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;

  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: stretch;
`;

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [scenes, setScenes] = useState<SceneListItem[]>([]);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number>(0);

  const loadScenes = async () => {
    try {
      setLoading(true);
      const scenesResp = await ServerAPI.scene.getScenes();
      setScenes(scenesResp.scenes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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
                }}
              />
            );
          })}
        </div>
        {loading && (
          <div className="loadingOverlay">
            <Spin spinning />
          </div>
        )}
      </ScenesArea>

    </PageContainer>
  );
}
