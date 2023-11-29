'use client';

import styled from '@emotion/styled';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ServerWebSocketEndMessage,
  ServerWebSocketLogMessage,
  ServerWebSocketMessage,
  ServerWebSocketMessageType,
} from '@/types/server/web-socket';
import SceneLog from '@/types/server/Log';
import GeneralMCQExamineVisualization from '@/components/processing/specialized/general-mcq-examine/GeneralMCQExamineVisualization';
import { DefaultProcessingVisualizationComponentProps } from '@/components/processing/def';
import VisualizationComponentWithExtraProps from '@/components/processing/common/VisualizationComponentWithExtraProps';
import useGlobalStore from '@/stores/global';
import { useRouter, useSearchParams } from 'next/navigation';
import { message } from 'antd';
import BuddhaVisualization from '@/components/processing/specialized/buddha/BuddhaVisualization';
import LocalAPI from '@/services/local';
import ProcessingConsole from '@/components/processing/common/Console';

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

const ConsoleArea = styled.div`
  width: calc(100% - 45% - 1px);
  min-width: 680px;
  height: 100%;
`;

const ProcessingPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const globalStore = useGlobalStore();

  const taskId = searchParams.get('taskId');

  const wsRef = useRef<WebSocket>();
  const wsOpenRef = useRef(false);

  const [wsConnected, setWSConnected] = useState(false);
  const [logs, setLogs] = useState<SceneLog[]>([]);

  useEffect(() => {
    if (!globalStore.runSceneConfig || !taskId) {
      message.error('Wrong state!');
      router.replace('/');
      return;
    }

    if (!wsRef.current) {
      wsRef.current = new WebSocket(`ws://127.0.0.1:8000/task/ws/${taskId}`);

      wsRef.current.onopen = function () {
        wsOpenRef.current = true;
        setWSConnected(true);
        console.log('WebSocket opened');
        this.send(JSON.stringify(globalStore.runSceneConfig));
      };

      wsRef.current.onmessage = async (event) => {
        const wsMessage: ServerWebSocketMessage = JSON.parse(JSON.parse(event.data));
        console.log('WebSocket Received Message:', wsMessage);
        switch (wsMessage.type) {
          case ServerWebSocketMessageType.LOG:
            const logMessage = wsMessage as ServerWebSocketLogMessage;
            setLogs((prev) => {
              return [...prev, logMessage.data];
            });
            break;
          case ServerWebSocketMessageType.End:
            const endMessage = wsMessage as ServerWebSocketEndMessage;
            message.success('Task Finished!');
            wsRef.current?.close();
            await LocalAPI.file.openDict(endMessage.data.save_dir);
            message.success('Result dict opened.');
            globalStore.updateTaskResultSavedDir(endMessage.data.save_dir);
            router.replace(`/result/${taskId}?taskResultSavedDir=${encodeURIComponent(endMessage.data.save_dir)}`);
            break;
          default:
            break;
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket Error:', error);
      };

      wsRef.current.onclose = () => {
        wsOpenRef.current = false;
        setWSConnected(false);
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
      <ConsoleArea>
        <ProcessingConsole wsConnected={wsConnected} />
      </ConsoleArea>
    </PageContainer>
  );
};

export default ProcessingPage;
