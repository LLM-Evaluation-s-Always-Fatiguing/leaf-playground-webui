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
import SampleQAVisualization from '@/components/processing/specialized/sample-qa/SampleQAVisualization';
import { DefaultProcessingVisualizationComponentProps } from '@/components/processing/def';
import VisualizationComponentWithExtraProps from '@/components/processing/common/VisualizationComponentWithExtraProps';
import useGlobalStore from '@/stores/global';
import { useRouter, useSearchParams } from 'next/navigation';
import { message, Spin } from 'antd';
import LocalAPI from '@/services/local';
import ProcessingConsole from '@/components/processing/common/Console';
import ServerAPI from '@/services/server';
import { SceneTaskStatus } from '@/types/server/Scene';
import BuddhaLogo from '@/components/processing/specialized/buddha/BuddhaLogo';
import { MdPerson3 } from 'react-icons/md';

const PageContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: stretch;
  position: relative;

  .loadingArea {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    backdrop-filter: blur(10px);
    z-index: 50;
  }
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

const ProcessingPage = ({
  params,
}: {
  params: {
    taskId: string;
  };
}) => {
  const taskId = params.taskId;
  const router = useRouter();
  const searchParams = useSearchParams();
  const bundlePath = searchParams.get('bundlePath');

  const globalStore = useGlobalStore();

  const [loading, setLoading] = useState(true);
  const [loadingTip, setLoadingTip] = useState('Loading...');

  const [autoPlay, setAutoPlay] = useState(true);

  const wsRef = useRef<WebSocket>();
  const wsOpenRef = useRef(false);

  const [wsConnected, setWSConnected] = useState(false);
  const [logs, setLogs] = useState<SceneLog[]>([]);

  const checkTaskStatus = async () => {
    try {
      setLoadingTip('Checking task status...');
      const taskStatusResp = await ServerAPI.sceneTask.getStatus(taskId);
      switch (taskStatusResp.status) {
        case SceneTaskStatus.PENDING:
        case SceneTaskStatus.RUNNING:
        case SceneTaskStatus.PAUSED:
        case SceneTaskStatus.FINISHED:
          const taskDetail = await LocalAPI.taskResultBundle.getInfo(bundlePath!);
          globalStore.updateTaskId(taskId);
          globalStore.updateTaskResultSavedDir(bundlePath!);
          globalStore.updateCurrentScene(taskDetail.scene);
          globalStore.updateRunSceneConfig(taskDetail.runConfig);
          globalStore.updateAgentFullFilledConfigs(taskDetail.agentFullFilledConfigs);
          globalStore.updatePageTitle(taskDetail.scene.scene_metadata.name);
          if (taskStatusResp.status === SceneTaskStatus.FINISHED) {
            setLoadingTip('Task finished!');
            message.success('Task finished!');
            router.replace(`/result/${taskId}?bundlePath=${encodeURIComponent(bundlePath!)}`);
          } else {
            return true;
          }
          break;
        case SceneTaskStatus.INTERRUPTED:
        case SceneTaskStatus.FAILED:
          setLoadingTip('Task failed!');
          message.error('Task failed!');
          break;
        default:
          break;
      }
      return false;
    } catch (e) {
      console.error(e);
      message.error('Scene task reconnect failed!');
    }
  };

  useEffect(() => {
    const prepare = async () => {
      if (!taskId || !bundlePath) {
        message.error('TaskID BundlePath is not valid!');
        router.replace('/');
        return;
      }
      if (!globalStore.runSceneConfig) {
        const pass = await checkTaskStatus();
        if (!pass) {
          return;
        }
      }

      globalStore.updatePageTitle(globalStore.currentScene?.scene_metadata.name || '');

      setLoadingTip('Connecting to server...');
      if (!wsRef.current) {
        wsRef.current = new WebSocket(`ws://127.0.0.1:8000/task/ws/${taskId}`);

        wsRef.current.onopen = function () {
          wsOpenRef.current = true;
          setWSConnected(true);
          console.log('WebSocket opened');
          setLoading(false);
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
              await LocalAPI.dict.open(endMessage.data.save_dir);
              message.success('Result dict opened.');
              globalStore.updateTaskResultSavedDir(endMessage.data.save_dir);
              router.replace(`/result/${taskId}?bundlePath=${encodeURIComponent(endMessage.data.save_dir)}`);
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
    };

    prepare();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = undefined;
      }
    };
  }, []);

  function getProcessingVisualizationComponent(): React.FC<DefaultProcessingVisualizationComponentProps> {
    switch (globalStore.currentScene?.scene_metadata.name) {
      case 'RAG QA Examine':
      case 'GeneralMCQExamine':
        return VisualizationComponentWithExtraProps(SampleQAVisualization, {});
      case 'Buddha':
        return VisualizationComponentWithExtraProps(SampleQAVisualization, {
          askerAvatar: MdPerson3,
          answererAvatar: BuddhaLogo,
        });
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
        <ProcessingConsole wsConnected={wsConnected} logs={logs} />
      </ConsoleArea>
      {loading && (
        <div className="loadingArea">
          <Spin spinning={true} tip={loadingTip}>
            <div style={{ width: '240px' }} />
          </Spin>
        </div>
      )}
    </PageContainer>
  );
};

export default ProcessingPage;
