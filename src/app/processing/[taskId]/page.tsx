'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SceneLog, { SceneActionLog, SceneLogType, SceneSystemLog, SceneSystemLogEvent } from '@/types/server/Log';
import { SceneTaskStatus } from '@/types/server/SceneTask';
import { WebsocketMessage, WebsocketMessageOperation } from '@/types/server/WebsocketMessage';
import { SceneMetricConfig } from '@/types/server/config/Metric';
import { SceneMetricDefinition } from '@/types/server/meta/Scene';
import { Button, message } from 'antd';
import styled from '@emotion/styled';
import { MdClose, MdPerson3 } from 'react-icons/md';
import JSONViewModal from '@/components/common/JSONViewModal';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import LogMetricDetailModal from '@/components/metric/LogMetricDetailModal';
import ProcessingConsole, { ProcessingConsoleMethods } from '@/components/processing/Console';
import BaseVisualization from '@/components/processing/common/BaseVisualization';
import VisualizationComponentWithExtraProps from '@/components/processing/common/VisualizationComponentWithExtraProps';
import { DefaultProcessingVisualizationComponentProps } from '@/components/processing/def';
import BuddhaLogo from '@/components/processing/specialized/buddha/BuddhaLogo';
import SampleQAVisualization from '@/components/processing/specialized/sample-qa/SampleQAVisualization';
import WhoIsTheSpyVisualization from '@/components/processing/specialized/who-is-the-spy/WhoIsTheSpyVisualization';
import LocalAPI from '@/services/local';
import ServerAPI from '@/services/server';
import useGlobalStore from '@/stores/global';

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
  --try-component-bar-height: 35px;

  width: 45%;
  min-width: 480px;
  height: 100%;
  border-right: 1px solid ${(props) => props.theme.dividerColor};
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;

  .tryComponentTopBar {
    height: var(--try-component-bar-height);
    padding: 0 12px;
    border-bottom: 1px solid ${(props) => props.theme.dividerColor};
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    .closeButton {
      font-size: 21px;
      color: ${(props) => props.theme.colorError};
      cursor: pointer;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
    }
  }

  .visualizationComponentWrapper {
    width: 100%;
    height: 100%;
  }

  .tryComponentTopBar + .visualizationComponentWrapper {
    height: calc(100% - var(--try-component-bar-height));
  }
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
  const agentId = searchParams.get('agentId');

  const globalStore = useGlobalStore();

  const [loading, setLoading] = useState(true);
  const [loadingTip, setLoadingTip] = useState('Loading...');

  const [tryVisualizationName, setTryVisualizationName] = useState<string>();

  const consoleRef = useRef<ProcessingConsoleMethods>(null);

  const wsRef = useRef<WebSocket>();
  const wsOpenRef = useRef(false);

  const [wsConnected, setWSConnected] = useState(false);
  const [logs, setLogs] = useState<SceneActionLog[]>([]);

  const [simulationFinished, setSimulationFinished] = useState(false);
  const [evaluationFinished, setEvaluationFinished] = useState(false);
  const allFinished = simulationFinished && evaluationFinished;
  const controlBarDisplay = allFinished;

  const [operatingLog, setOperatingLog] = useState<SceneLog>();
  const [jsonViewModalData, setJSONViewModalData] = useState<any>();
  const [jsonViewModalOpen, setJSONViewModalOpen] = useState(false);
  const [logMetricDetailModalOpen, setLogMetricDetailModalOpen] = useState(false);
  const [logMetricDetailModalData, setLogMetricDetailModalData] = useState<{
    log: SceneActionLog;
    metrics: SceneMetricDefinition[];
    metricsConfig: Record<string, SceneMetricConfig>;
    humanOnlyEvaluationMode: boolean;
  }>();

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
                    return prev.map((oldLog) => {
                      if (oldLog.id === actionLog.id) {
                        return actionLog;
                      }
                      return oldLog;
                    });
                  });
                  setLogMetricDetailModalData((prev) => {
                    if (prev && prev.log.id === actionLog.id) {
                      return {
                        ...prev,
                        log: actionLog,
                      };
                    }
                    return prev;
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
    switch (tryVisualizationName || globalStore.currentScene?.scene_metadata.scene_definition.name) {
      case 'RAG QA Examine':
      case 'GeneralMCQExamine':
      case 'Mmlu':
      case 'SampleQAVisualization':
        return VisualizationComponentWithExtraProps(SampleQAVisualization, {});
      case 'Buddha':
        return VisualizationComponentWithExtraProps(SampleQAVisualization, {
          askerAvatar: MdPerson3,
          answererAvatar: BuddhaLogo,
        });
      case 'WhoIsTheSpy':
      case '谁是卧底':
      case 'WhoIsTheSpyVisualization':
        return VisualizationComponentWithExtraProps(WhoIsTheSpyVisualization, {});
      default:
        return VisualizationComponentWithExtraProps(BaseVisualization, {
          onTryVisualization: (name) => {
            setTryVisualizationName(name);
          },
        });
    }
  }

  const VisualizationComponent = useMemo(() => {
    return getProcessingVisualizationComponent();
  }, [globalStore.currentScene, globalStore.createSceneParams, tryVisualizationName]);

  return (
    <PageContainer>
      <VisualizationArea>
        {tryVisualizationName && (
          <div className="tryComponentTopBar">
            <div>{tryVisualizationName}</div>
            <div
              className="closeButton"
              onClick={() => {
                setTryVisualizationName(undefined);
              }}
            >
              <MdClose size={'1em'} />
            </div>
          </div>
        )}
        <div className="visualizationComponentWrapper">
          {globalStore.currentScene && globalStore.createSceneParams && (
            <VisualizationComponent
              scene={globalStore.currentScene}
              createSceneParams={globalStore.createSceneParams}
              logs={logs}
              needScrollToLog={(logId) => {
                consoleRef.current?.scrollToLog(logId);
              }}
            />
          )}
        </div>
      </VisualizationArea>
      <ConsoleArea>
        {globalStore.currentScene && globalStore.createSceneParams && (
          <ProcessingConsole
            ref={consoleRef}
            wsConnected={wsConnected}
            simulationFinished={simulationFinished}
            evaluationFinished={evaluationFinished}
            scene={globalStore.currentScene}
            createSceneParams={globalStore.createSceneParams}
            logs={logs}
            targetAgentId={agentId as string}
            onOpenJSONDetail={(log) => {
              setOperatingLog(log);
              setJSONViewModalOpen(true);
            }}
            onOpenMetricDetail={(log, metrics, metricsConfig, humanOnlyEvaluationMode) => {
              setLogMetricDetailModalData({
                log,
                metrics,
                metricsConfig,
                humanOnlyEvaluationMode,
              });
              setLogMetricDetailModalOpen(true);
            }}
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
                  wsRef.current?.send('disconnect');
                  wsRef.current?.close();
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
      <JSONViewModal
        title={operatingLog ? 'Log Detail' : 'Detail Data'}
        open={jsonViewModalOpen}
        jsonObject={jsonViewModalData || operatingLog}
        isSceneLog={!!operatingLog}
        onNeedClose={() => {
          setJSONViewModalOpen(false);
          setJSONViewModalData(undefined);
          setOperatingLog(undefined);
        }}
      />
      <LogMetricDetailModal
        open={logMetricDetailModalOpen}
        editable={true}
        humanOnlyEvaluationMode={logMetricDetailModalData?.humanOnlyEvaluationMode || false}
        serverUrl={serverUrl}
        log={logMetricDetailModalData?.log}
        metrics={logMetricDetailModalData?.metrics}
        metricsConfig={logMetricDetailModalData?.metricsConfig}
        onNeedClose={() => {
          setLogMetricDetailModalOpen(false);
          setLogMetricDetailModalData(undefined);
        }}
        onOpenJSONDetail={(data) => {
          setJSONViewModalData(data);
          setJSONViewModalOpen(true);
        }}
      />
    </PageContainer>
  );
};

export default ProcessingPage;
