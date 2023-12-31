'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SceneLog, { SceneActionLog, SceneLogType, SceneSystemLog, SceneSystemLogEvent } from '@/types/server/Log';
import { SceneTaskStatus } from '@/types/server/SceneTask';
import {
  WebsocketDataMessage,
  WebsocketEvent,
  WebsocketEventMessage,
  WebsocketMessage,
  WebsocketMessageOperation,
  WebsocketMessageType,
} from '@/types/server/WebsocketMessage';
import { SceneMetricConfig } from '@/types/server/config/Metric';
import { SceneMetricDefinition } from '@/types/server/meta/Scene';
import { Button, Modal, message } from 'antd';
import { Input } from '@formily/antd-v5';
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

  .inputBar {
    flex-shrink: 0;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
    background: ${(props) => (props.theme.isDarkMode ? 'rgba(255,255,255,0.15)' : 'white')};

    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    padding: 12px 16px;

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

  const playerMode = !!agentId;

  const globalStore = useGlobalStore();

  const [loading, setLoading] = useState(true);
  const [loadingTip, setLoadingTip] = useState('Loading...');

  const taskStatusRef = useRef<SceneTaskStatus>(SceneTaskStatus.PENDING);
  const [taskStatus, setTaskStatus] = useState<SceneTaskStatus>(SceneTaskStatus.PENDING);
  const [startStatusCheckFinished, setStartStatusCheckFinished] = useState(false);

  const [tryVisualizationName, setTryVisualizationName] = useState<string>();
  const [targetAgentId, setTargetAgentId] = useState<string>(agentId || '');

  const consoleRef = useRef<ProcessingConsoleMethods>(null);

  const wsRef = useRef<WebSocket>();
  const wsOpenRef = useRef(false);

  const [wsConnected, setWSConnected] = useState(false);
  const [logs, setLogs] = useState<SceneActionLog[]>([]);

  const [simulationFinished, setSimulationFinished] = useState(false);
  const [evaluationFinished, setEvaluationFinished] = useState(false);
  const allFinished = simulationFinished && evaluationFinished;
  const controlBarDisplay = !playerMode && allFinished && taskStatus === SceneTaskStatus.FINISHED;

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

  const needInputRef = useRef(false);
  const [needInput, setNeedInput] = useState(false);
  const [inputText, setInputText] = useState<string>();

  const showTaskFinishedForPlayer = () => {
    if (!playerMode) return;
    Modal.success({
      title: 'Task finished',
      content: 'The task has been finished. Now you can close the window.',
    });
  };

  const statusPollingTimerRef = useRef<NodeJS.Timeout>();
  const startStatusPolling = () => {
    if (statusPollingTimerRef.current) {
      clearInterval(statusPollingTimerRef.current);
      statusPollingTimerRef.current = undefined;
    }
    statusPollingTimerRef.current = setInterval(async () => {
      let taskStatusResp = (await ServerAPI.sceneTask.getStatus(taskId)).status;
      try {
        taskStatusResp = (await ServerAPI.sceneTask.status(serverUrl)).status;
      } catch {}
      setTaskStatus(taskStatusResp);
      taskStatusRef.current = taskStatusResp;
    }, 1000);
  };

  const stopStatusPolling = () => {
    if (statusPollingTimerRef.current) {
      clearInterval(statusPollingTimerRef.current);
      statusPollingTimerRef.current = undefined;
    }
  };

  const checkTaskStatusOnStart = async () => {
    try {
      setLoadingTip('Checking task status...');
      let taskStatusResp = (await ServerAPI.sceneTask.getStatus(taskId)).status;
      try {
        taskStatusResp = (await ServerAPI.sceneTask.status(serverUrl)).status;
      } catch {}
      setTaskStatus(taskStatusResp);
      taskStatusRef.current = taskStatusResp;
      switch (taskStatusResp) {
        case SceneTaskStatus.PENDING:
          let wait = true;
          let finalStatus: SceneTaskStatus = taskStatusResp;
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
          if (!playerMode) {
            startStatusPolling();
          }
        case SceneTaskStatus.PAUSED:
          if (playerMode) {
            startStatusPolling();
          }
        case SceneTaskStatus.FINISHED:
          const webuiBundle = await LocalAPI.taskBundle.webui.get(bundlePath!);
          globalStore.updateInfoFromWebUITaskBundle(webuiBundle);
          if (taskStatusResp === SceneTaskStatus.FINISHED) {
            setSimulationFinished(true);
            setEvaluationFinished(true);
            message.success('Task finished!');
            setLoading(false);
            return true;
          } else {
            return true;
          }
        case SceneTaskStatus.INTERRUPTED:
          setLoadingTip('Task closed!');
          message.warning('Task closed!');
          break;
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
      const pass = await checkTaskStatusOnStart();
      setStartStatusCheckFinished(true);
      if (!pass) {
        return;
      }

      globalStore.updatePageTitle(globalStore.currentScene?.scene_metadata.scene_definition.name || '');

      if (taskStatusRef.current === SceneTaskStatus.RUNNING) {
        setLoadingTip('Connecting to server...');
      }
      if (!wsRef.current) {
        wsRef.current = new WebSocket(
          `ws://${serverUrl.replace(/^(http:\/\/|https:\/\/)/, '')}/ws${agentId ? `/human/${agentId}` : ''}`
        );

        wsRef.current.onopen = function () {
          wsOpenRef.current = true;
          setWSConnected(true);
          console.info('WebSocket opened');
          if (taskStatusRef.current === SceneTaskStatus.RUNNING) {
            setLoading(false);
          }
        };

        wsRef.current.onmessage = async (event) => {
          const wsMessage: WebsocketMessage = JSON.parse(JSON.parse(event.data));
          switch (wsMessage.type) {
            case WebsocketMessageType.DATA:
              const wsDataMessage = wsMessage as WebsocketDataMessage;
              console.info('WebSocket Received Data Message:', wsDataMessage);
              const log = wsDataMessage.data;
              switch (wsDataMessage.operation) {
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
                        case SceneSystemLogEvent.SIMULATION_PAUSED:
                          break;
                        case SceneSystemLogEvent.SIMULATION_RESUME:
                          break;
                        case SceneSystemLogEvent.SIMULATION_FAILED:
                          message.error('Simulation failed!');
                          break;
                        case SceneSystemLogEvent.SIMULATION_INTERRUPTED:
                          break;
                        case SceneSystemLogEvent.SIMULATION_FINISHED:
                          setSimulationFinished(true);
                          showTaskFinishedForPlayer();
                          break;
                        case SceneSystemLogEvent.EVALUATION_FINISHED:
                          setEvaluationFinished(true);
                          break;
                        case SceneSystemLogEvent.EVERYTHING_DONE:
                          if (taskStatusRef.current === SceneTaskStatus.INTERRUPTED) {
                            return;
                          }
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
              break;
            case WebsocketMessageType.EVENT:
              const wsEventMessage = wsMessage as WebsocketEventMessage;
              switch (wsEventMessage.event) {
                case WebsocketEvent.WAIT_HUMAN_INPUT:
                  console.info('WebSocket Received Event Message:', wsEventMessage);
                  setNeedInput(true);
                  needInputRef.current = true;
                  break;
                case WebsocketEvent.DISABLE_HUMAN_INPUT:
                  console.info('WebSocket Received Event Message:', wsEventMessage);
                  if (needInputRef.current) {
                    needInputRef.current = false;
                    setNeedInput(false);
                    setInputText(undefined);
                    message.warning('Input has exceeded the time limit!', 3);
                  }
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
      stopStatusPolling();
    };
  }, []);

  useEffect(() => {
    if (!startStatusCheckFinished) return;
    switch (taskStatus) {
      case SceneTaskStatus.PENDING:
      case SceneTaskStatus.RUNNING:
        setLoading(false);
        break;
      case SceneTaskStatus.PAUSED:
        if (playerMode) {
          setLoadingTip('Task Paused...');
          setLoading(true);
        }
        break;
      case SceneTaskStatus.INTERRUPTED:
        setLoadingTip('Task Closed!');
      case SceneTaskStatus.FAILED:
        if (taskStatus === SceneTaskStatus.FAILED) {
          setLoadingTip('Task Failed!');
        }
      case SceneTaskStatus.FINISHED:
        if (taskStatus === SceneTaskStatus.FINISHED) {
          setLoadingTip('Task Finished!');
        }
        setLoading(playerMode);
        stopStatusPolling();
        break;
    }
  }, [taskStatus, playerMode, startStatusCheckFinished]);

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
              targetAgentId={targetAgentId}
              playerMode={playerMode}
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
            taskStatus={taskStatus}
            wsConnected={wsConnected}
            simulationFinished={simulationFinished}
            evaluationFinished={evaluationFinished}
            scene={globalStore.currentScene}
            createSceneParams={globalStore.createSceneParams}
            logs={logs}
            targetAgentId={targetAgentId}
            playerMode={playerMode}
            onTargetAgentChange={(newId) => {
              setTargetAgentId(newId);
            }}
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
            onPause={async () => {
              try {
                setLoadingTip('Pausing task...');
                setLoading(true);
                await ServerAPI.sceneTask.pause(serverUrl);
                setTaskStatus(SceneTaskStatus.PAUSED);
                taskStatusRef.current = SceneTaskStatus.PAUSED;
              } catch (e) {
                message.error('Failed to pause task!');
                console.error(e);
              } finally {
                setLoading(false);
              }
            }}
            onResume={async () => {
              try {
                setLoadingTip('Resuming task...');
                setLoading(true);
                await ServerAPI.sceneTask.resume(serverUrl);
                setTaskStatus(SceneTaskStatus.RUNNING);
                taskStatusRef.current = SceneTaskStatus.RUNNING;
              } catch (e) {
                message.error('Failed to resume task!');
                console.error(e);
              } finally {
                setLoading(false);
              }
            }}
            onInterrupt={() => {
              Modal.confirm({
                title: 'Interrupt task',
                content: 'Once interrupted, the task will be closed and cannot be recovered.',
                onOk: async () => {
                  try {
                    await ServerAPI.sceneTask.interrupt(serverUrl);
                    setTaskStatus(SceneTaskStatus.INTERRUPTED);
                    taskStatusRef.current = SceneTaskStatus.INTERRUPTED;
                  } catch (e) {
                    console.error(e);
                  }
                },
                onCancel() {},
              });
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
        {needInput && (
          <div className="inputBar">
            <Input.TextArea
              autoSize={{
                minRows: 1,
                maxRows: 3,
              }}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
              }}
            />
            <Button
              style={{
                alignSelf: 'flex-end',
                marginLeft: '12px',
              }}
              type={'primary'}
              onClick={() => {
                if (wsRef.current && inputText) {
                  wsRef.current?.send(inputText);
                  needInputRef.current = false;
                  setNeedInput(false);
                  setInputText(undefined);
                }
              }}
            >
              Send
            </Button>
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
