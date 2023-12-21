'use client';

import styled from '@emotion/styled';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import SceneLog, { SceneActionLog, SceneLogType, SceneSystemLog, SceneSystemLogEvent } from '@/types/server/Log';
import SampleQAVisualization from '@/components/processing/specialized/sample-qa/SampleQAVisualization';
import { DefaultProcessingVisualizationComponentProps } from '@/components/processing/def';
import VisualizationComponentWithExtraProps from '@/components/processing/common/VisualizationComponentWithExtraProps';
import useGlobalStore from '@/stores/global';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, message } from 'antd';
import LocalAPI from '@/services/local';
import ProcessingConsole from '@/components/processing/common/Console';
import ServerAPI from '@/services/server';
import { SceneTaskStatus } from '@/types/server/SceneTask';
import BuddhaLogo from '@/components/processing/specialized/buddha/BuddhaLogo';
import { MdPerson3 } from 'react-icons/md';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { WebsocketMessage, WebsocketMessageOperation } from '@/types/server/WebsocketMessage';
import scene from '@/services/server/scene';

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

  border-right: 1px solid ${(props) => props.theme.dividerColor};
`;

const ConsoleArea = styled.div`
  width: calc(100% - 45% - 1px);
  min-width: 680px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;

  .controlBar {
    flex-shrink: 0;
    height: 55px;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
    background: ${(props) => (props.theme.isDarkMode ? 'rgba(255,255,255,0.15)' : 'white')};

    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    padding: 0 16px;

    position: relative;

    z-index: 5;
  }
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
  const serverUrl = searchParams.get('serverUrl') as string;
  const bundlePath = searchParams.get('bundlePath');

  const globalStore = useGlobalStore();

  const [loading, setLoading] = useState(true);
  const [loadingTip, setLoadingTip] = useState('Loading...');

  const wsRef = useRef<WebSocket>();
  const wsOpenRef = useRef(false);

  const [wsConnected, setWSConnected] = useState(false);
  const [logs, setLogs] = useState<SceneActionLog[]>([]);

  const [simulationFinished, setSimulationFinished] = useState(false);
  const [evaluationFinished, setEvaluationFinished] = useState(false);
  const allFinished = simulationFinished && evaluationFinished;
  const controlBarDisplay = allFinished;

  const checkTaskStatus = async () => {
    try {
      setLoadingTip('Checking task status...');
      const taskStatusResp = await ServerAPI.sceneTask.getStatus(taskId);
      switch (taskStatusResp.status) {
        case SceneTaskStatus.PENDING:
          let wait = true;
          let finalStatus: SceneTaskStatus = taskStatusResp.status;
          while (wait) {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            const taskStatusResp = await ServerAPI.sceneTask.getStatus(taskId);
            finalStatus = taskStatusResp.status;
            if (taskStatusResp.status !== SceneTaskStatus.PENDING) {
              wait = false;
            }
          }
          if (finalStatus === SceneTaskStatus.INTERRUPTED || finalStatus === SceneTaskStatus.FAILED) {
            setLoadingTip('Task failed!');
            message.error('Task failed!');
            return false;
          }
          return true;
        case SceneTaskStatus.RUNNING:
        case SceneTaskStatus.PAUSED:
        case SceneTaskStatus.FINISHED:
          const webuiBundle = await LocalAPI.taskBundle.webui.get(bundlePath!);
          globalStore.updateInfoFromWebUITaskBundle(webuiBundle);
          if (taskStatusResp.status === SceneTaskStatus.FINISHED) {
            setSimulationFinished(true);
            setEvaluationFinished(true);
            message.success('Task finished!');
            setLoading(false);
            return true;
          } else {
            return true;
          }
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
      if (!taskId || !bundlePath || !serverUrl) {
        message.error('TaskID BundlePath is not valid!');
        router.replace('/');
        return;
      }
      const pass = await checkTaskStatus();
      if (!pass) {
        return;
      }

      globalStore.updatePageTitle(globalStore.currentScene?.scene_metadata.scene_definition.name || '');

      setLoadingTip('Connecting to server...');
      if (!wsRef.current) {
        wsRef.current = new WebSocket(`ws://${serverUrl.replace(/^(http:\/\/|https:\/\/)/, '')}/ws`);

        wsRef.current.onopen = function () {
          wsOpenRef.current = true;
          setWSConnected(true);
          console.info('WebSocket opened');
          setLoading(false);
        };

        wsRef.current.onmessage = async (event) => {
          const wsMessage: WebsocketMessage = JSON.parse(JSON.parse(event.data));
          console.info('WebSocket Received Message:', wsMessage);
          const log = wsMessage.data;
          switch (wsMessage.operation) {
            case WebsocketMessageOperation.CREATE:
              switch (log.log_type) {
                case SceneLogType.ACTION:
                  const actionLog = log as SceneActionLog;
                  setLogs((prev) => {
                    return [...prev, actionLog];
                  });
                  break;
                case SceneLogType.SYSTEM:
                  const systemLog = log as SceneSystemLog;
                  switch (systemLog.system_event) {
                    case SceneSystemLogEvent.SIMULATION_START:
                      break;
                    case SceneSystemLogEvent.SIMULATION_FINISHED:
                      setSimulationFinished(true);
                      break;
                    case SceneSystemLogEvent.EVALUATION_FINISHED:
                      setEvaluationFinished(true);
                      break;
                    case SceneSystemLogEvent.EVERYTHING_DONE:
                      message.success('Task Finished!');
                      setSimulationFinished(true);
                      setEvaluationFinished(true);
                      wsRef.current?.close();
                      break;
                  }
                  break;
                default:
                  break;
              }
              break;
            case WebsocketMessageOperation.UPDATE:
              switch (log.log_type) {
                case SceneLogType.ACTION:
                  const actionLog = log as SceneActionLog;
                  setLogs((prev) => {
                    const oldIndex = prev.findIndex((oldLog) => oldLog.id === actionLog.id);
                    const newLogs = [...prev];
                    if (oldIndex >= 0) {
                      newLogs[oldIndex] = actionLog;
                    }
                    return newLogs;
                  });
                  break;
                case SceneLogType.SYSTEM:
                  break;
                default:
                  break;
              }
              break;
          }
        };

        wsRef.current.onerror = (error) => {
          console.error('WebSocket Error:', error);
        };

        wsRef.current.onclose = () => {
          wsOpenRef.current = false;
          setWSConnected(false);
          console.info('WebSocket closed.');
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

  const goToResult = () => {
    if (globalStore.bundlePath) {
      router.replace(`/result/${taskId}?bundlePath=${encodeURIComponent(globalStore.bundlePath)}`);
    }
  };

  function getProcessingVisualizationComponent(): React.FC<DefaultProcessingVisualizationComponentProps> {
    switch (globalStore.currentScene?.scene_metadata.scene_definition.name) {
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
  }, [globalStore.currentScene, globalStore.createSceneParams]);

  return (
    <PageContainer>
      <VisualizationArea>
        <VisualizationComponent logs={logs} />
      </VisualizationArea>
      <ConsoleArea>
        {globalStore.currentScene && globalStore.createSceneParams && (
          <ProcessingConsole
            onLogUpdated={(log) => {  }}
            wsConnected={wsConnected}
            simulationFinished={simulationFinished}
            evaluationFinished={evaluationFinished}
            scene={globalStore.currentScene}
            createSceneParams={globalStore.createSceneParams}
            logs={logs}
          />
        )}
        {controlBarDisplay && (
          <div className="controlBar">
            {allFinished && (
              <Button
                type="primary"
                onClick={async () => {
                  setLoadingTip('Saving task result...');
                  setLoading(true);
                  await ServerAPI.sceneTask.save(serverUrl);
                  goToResult();
                }}
              >
                Complete evaluation and generate report
              </Button>
            )}
          </div>
        )}
      </ConsoleArea>
      <LoadingOverlay spinning={loading} tip={loadingTip} />
    </PageContainer>
  );
};

export default ProcessingPage;
