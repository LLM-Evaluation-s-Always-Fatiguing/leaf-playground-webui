'use client';

import styled from '@emotion/styled';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ServerWebSocketLogMessage,
  ServerWebSocketMessage,
  ServerWebSocketMessageType,
} from '@/types/server/web-socket';
import SceneLog from '@/types/server/Log';
import GeneralMCQExamineVisualization from '@/components/processing/specialized/general-mcq-examine/GeneralMCQExamineVisualization';
import { DefaultProcessingVisualizationComponentProps } from '@/components/processing/def';
import VisualizationComponentWithExtraProps from '@/components/processing/common/VisualizationComponentWithExtraProps';
import useGlobalStore from '@/stores/global';
import { useRouter } from 'next/navigation';
import { message } from 'antd';
import BuddhaVisualization from '@/components/processing/specialized/buddha/BuddhaVisualization';

const PageContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: stretch;
`;

const VisualizationArea = styled.div`
  width: 45%;
  min-width: 480px;
  height: 100%;
`;

const ProcessingPage = () => {
  const router = useRouter();
  const globalStore = useGlobalStore();

  const wsRef = useRef<WebSocket>();
  const wsOpenRef = useRef(false);

  const [logs, setLogs] = useState<SceneLog[]>([]);

  useEffect(() => {
    if (!globalStore.runSceneConfig) {
      message.error('No run scene config!');
      router.replace('/');
    }

    if (!wsRef.current) {
      wsRef.current = new WebSocket('ws://127.0.0.1:8000/run_scene');

      wsRef.current.onopen = function () {
        wsOpenRef.current = true;
        console.log('WebSocket opened');
        this.send(JSON.stringify(globalStore.runSceneConfig));
      };

      wsRef.current.onmessage = (event) => {
        const message: ServerWebSocketMessage = JSON.parse(JSON.parse(event.data));
        console.log('WebSocket Received Message:', message);
        if (message.type === ServerWebSocketMessageType.LOG) {
          const logMessage = message as ServerWebSocketLogMessage;
          setLogs((prev) => {
            return [...prev, message.data];
          });
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket Error:', error);
      };

      wsRef.current.onclose = () => {
        wsOpenRef.current = false;
        console.log('WebSocket closed.');
      };
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = undefined;
      }
    };
  }, []);

  function getProcessingVisualizationComponent(): React.FC<DefaultProcessingVisualizationComponentProps> {
    switch (globalStore.currentScene?.scene_metadata.name) {
      case 'GeneralMCQExamine':
        return VisualizationComponentWithExtraProps(GeneralMCQExamineVisualization, {});
      case 'Buddha':
        return VisualizationComponentWithExtraProps(BuddhaVisualization, {});
      default:
        return () => false;
    }
  }

  const VisualizationComponent = useMemo(() => {
    return getProcessingVisualizationComponent();
  }, [globalStore.currentScene, globalStore.runSceneConfig]);

  return (
    <PageContainer>
      <VisualizationArea>
        <VisualizationComponent logs={logs} />
      </VisualizationArea>
    </PageContainer>
  );
};

export default ProcessingPage;
