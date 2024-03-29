'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FormilyJSONSchema from '@/types/common/FormilyJSONSchema';
import SceneLog, { SceneActionLog, SceneLogType, SceneSystemLog, SceneSystemLogEvent } from '@/types/server/common/Log';
import {
  WebsocketDataMessage,
  WebsocketEvent,
  WebsocketEventMessage,
  WebsocketMessage,
  WebsocketMessageOperation,
  WebsocketMessageType,
} from '@/types/server/common/WebsocketMessage';
import { SceneMetricConfig } from '@/types/server/config/Metric';
import { SceneMetricDefinition } from '@/types/server/meta/Scene';
import { SceneTaskStatus } from '@/types/server/task/SceneTask';
import { Button, Modal, message } from 'antd';
import styled from '@emotion/styled';
import { Resizable } from 're-resizable';
import { MdClose, MdPerson3 } from 'react-icons/md';
import LoadingOverlay from '@/components/loading/LoadingOverlay';
import JSONViewModal from '@/components/modals/JSONViewModal';
import LogMetricDetailModal from '@/components/modals/LogMetricDetailModal';
import ProcessingConsole, { ProcessingConsoleMethods } from '@/app/processing/components/Console';
import BaseVisualization from '@/app/processing/components/common/BaseVisualization';
import UserInputDrawer from '@/app/processing/components/common/UserInputDrawer';
import VisualizationComponentWithExtraProps from '@/app/processing/components/common/VisualizationComponentWithExtraProps';
import { DefaultProcessingVisualizationComponentProps } from '@/app/processing/components/def';
import BuddhaLogo from '@/app/processing/components/specialized/buddha/BuddhaLogo';
import SampleQAVisualization from '@/app/processing/components/specialized/sample-qa/SampleQAVisualization';
import WhoIsTheSpyVisualization from '@/app/processing/components/specialized/who-is-the-spy/WhoIsTheSpyVisualization';
import ServerAPI from '@/services/server';
import useGlobalStore from '@/stores/global';
import { transferStandardJSONSchemaToFormilyJSONSchema } from '@/utils/json-schema';
import { getFullServerWebSocketURL } from '@/utils/websocket';

const PageContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto hidden;
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

  .inputTipArea {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: 45px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    background: ${(props) => props.theme.colorPrimary};
    color: white;
    cursor: pointer;
  }
`;

const VisualizationArea = styled.div`
  --try-component-bar-height: 35px;

  width: 100%;
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
  flex-grow: 1;
  min-width: 30%;
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
  const agentId = searchParams?.get('agent');

  const playerMode = !!agentId;

  const globalStore = useGlobalStore();

  const whileLoopMarkRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [loadingTip, setLoadingTip] = useState('Loading...');

  const [taskServerAlive, setTaskServerAlive] = useState<boolean>(false);

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

  const [simulationStarted, setSimulationStarted] = useState(false);
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
  const [inputDataSchema, setInputDataSchema] = useState<FormilyJSONSchema>();
  const [inputDrawerOpen, setInputDrawerOpen] = useState(false);

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
      const taskStatusResp = (await ServerAPI.sceneTask.status(taskId)).status;
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

      const taskStatusResp = (await ServerAPI.sceneTask.status(taskId)).status;
      setTaskStatus(taskStatusResp);
      taskStatusRef.current = taskStatusResp;

      switch (taskStatusResp) {
        case SceneTaskStatus.PENDING:
          whileLoopMarkRef.current = true;
          setLoadingTip('Preparing scene resources...');
          let finalStatus: SceneTaskStatus = taskStatusResp;
          while (whileLoopMarkRef.current) {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            const taskStatusResp = await ServerAPI.sceneTask.status(taskId);
            finalStatus = taskStatusResp.status;
            if (taskStatusResp.status !== SceneTaskStatus.PENDING) {
              whileLoopMarkRef.current = false;
            }
          }
          setTaskStatus(finalStatus);
          taskStatusRef.current = finalStatus;
          if (finalStatus === SceneTaskStatus.INTERRUPTED || finalStatus === SceneTaskStatus.FAILED) {
            setLoadingTip('Task failed!');
            message.error('Task failed!');
            return false;
          }
        case SceneTaskStatus.RUNNING:
        case SceneTaskStatus.PAUSED:
          startStatusPolling();
        case SceneTaskStatus.FINISHED:
          await globalStore.syncTaskStateFromServer(taskId);
          if (taskStatusResp === SceneTaskStatus.FINISHED) {
            setSimulationFinished(true);
            setEvaluationFinished(true);
            message.success('Task finished!');
          }
          return true;
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
      if (!taskId) {
        message.error('Task ID is not valid!');
        router.replace('/');
        return;
      }
      const pass = await checkTaskStatusOnStart();
      if (!pass) {
        setStartStatusCheckFinished(true);
        return;
      }

      let checkTaskServerResp = await ServerAPI.sceneTask.checkTaskServer(taskId);
      if (!checkTaskServerResp && taskStatusRef.current === SceneTaskStatus.RUNNING) {
        setLoadingTip('Waiting scene server online...');
        whileLoopMarkRef.current = true;
        while (whileLoopMarkRef.current) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          checkTaskServerResp = await ServerAPI.sceneTask.checkTaskServer(taskId);
          if (checkTaskServerResp) {
            setTaskServerAlive(checkTaskServerResp);
            whileLoopMarkRef.current = false;
          }
        }
      }
      setTaskServerAlive(checkTaskServerResp);
      if (!checkTaskServerResp) {
        message.error(
          'The task server is now closed, making it impossible to make further changes to the task result!',
          10
        );
      }
      setStartStatusCheckFinished(true);

      globalStore.updatePageTitle((state) => {
        return `${state.currentProject?.metadata.scene_metadata.scene_definition.name || ''} Task`;
      });

      if (taskStatusRef.current === SceneTaskStatus.RUNNING) {
        setLoadingTip('Connecting to server...');
      }
      const wsUrl = await getFullServerWebSocketURL(
        agentId ? `/task/${taskId}/human/${agentId}/ws` : `/task/${taskId}/logs/ws`
      );
      if (!wsRef.current) {
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = function () {
          wsOpenRef.current = true;
          setWSConnected(true);
          console.info('WebSocket opened');
          if (taskStatusRef.current === SceneTaskStatus.RUNNING) {
            setLoadingTip('Waiting simulation start...');
          }
        };

        wsRef.current.onmessage = async (event) => {
          const wsMessage: WebsocketMessage = JSON.parse(event.data);
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
                          if (taskStatusRef.current === SceneTaskStatus.RUNNING) {
                            setLoading(false);
                          }
                          setSimulationStarted(true);
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
                          setTaskStatus(SceneTaskStatus.FINISHED);
                          taskStatusRef.current = SceneTaskStatus.FINISHED;
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
                  consoleRef.current?.setAutoPlay(true);
                  setNeedInput(true);
                  if (wsEventMessage.data_schema) {
                    const result = await transferStandardJSONSchemaToFormilyJSONSchema(wsEventMessage.data_schema);
                    setInputDataSchema(result.formilySchema);
                  } else {
                    setInputDataSchema(undefined);
                  }
                  setInputDrawerOpen(true);
                  needInputRef.current = true;
                  break;
                case WebsocketEvent.DISABLE_HUMAN_INPUT:
                  console.info('WebSocket Received Event Message:', wsEventMessage);
                  if (needInputRef.current) {
                    needInputRef.current = false;
                    setNeedInput(false);
                    setInputDataSchema(undefined);
                    setInputDrawerOpen(false);
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
          wsRef.current = undefined;
        };
      }
    };

    prepare();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = undefined;
      }
      whileLoopMarkRef.current = false;
      stopStatusPolling();
    };
  }, []);

  useEffect(() => {
    if (!startStatusCheckFinished) return;
    switch (taskStatus) {
      case SceneTaskStatus.PENDING:
        break;
      case SceneTaskStatus.RUNNING:
        if (!simulationStarted) {
          setLoadingTip('Wait simulation start...');
          setLoading(true);
        } else {
          setLoading(false);
        }
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
  }, [taskStatus, playerMode, startStatusCheckFinished, simulationStarted]);

  const goToResult = () => {
    router.replace(`/result/${taskId}`);
  };

  function getProcessingVisualizationComponent(): React.ComponentType<DefaultProcessingVisualizationComponentProps> {
    switch (tryVisualizationName || globalStore.currentProject?.metadata.scene_metadata.scene_definition.name) {
      case 'RAG QA Examine':
      case 'GeneralMCQExamine':
      case 'Mmlu':
      case 'SampleQAVisualization':
        return VisualizationComponentWithExtraProps(SampleQAVisualization, {});
      case 'Buddha':
      case 'BuddhistScripturesEval':
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
  }, [globalStore.currentProject, globalStore.createSceneTaskParams, tryVisualizationName]);

  return (
    <PageContainer
      style={
        needInput && !inputDrawerOpen
          ? {
              paddingBottom: '45px',
            }
          : {}
      }
    >
      <Resizable
        defaultSize={{
          width: '50%',
          height: '100%',
        }}
        minWidth={'30%'}
        maxWidth={'70%'}
        enable={{
          top: false,
          right: true,
          bottom: false,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false,
        }}
        onResize={() => {
          consoleRef.current?.measureAllRows();
        }}
      >
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
            {globalStore.currentProject && globalStore.createSceneTaskParams && (
              <VisualizationComponent
                project={globalStore.currentProject}
                scene={globalStore.currentProject.metadata}
                createSceneTaskParams={globalStore.createSceneTaskParams}
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
      </Resizable>
      <ConsoleArea>
        {globalStore.currentProject && globalStore.createSceneTaskParams && (
          <ProcessingConsole
            ref={consoleRef}
            startStatusCheckFinished={startStatusCheckFinished}
            taskServerAlive={taskServerAlive}
            taskStatus={taskStatus}
            wsConnected={wsConnected}
            simulationFinished={simulationFinished}
            evaluationFinished={evaluationFinished}
            scene={globalStore.currentProject.metadata}
            createSceneTaskParams={globalStore.createSceneTaskParams}
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
                await ServerAPI.sceneTask.pause(taskId);
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
                await ServerAPI.sceneTask.resume(taskId);
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
                    await ServerAPI.sceneTask.interrupt(taskId);
                    setTaskStatus(SceneTaskStatus.INTERRUPTED);
                    taskStatusRef.current = SceneTaskStatus.INTERRUPTED;
                    if (wsRef.current) {
                      wsRef.current?.close();
                      wsRef.current = undefined;
                    }
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
                  setLoadingTip('Moving to result...');
                  setLoading(true);
                  wsRef.current?.send('disconnect');
                  wsRef.current?.close();
                  goToResult();
                }}
              >
                To Result
              </Button>
            )}
          </div>
        )}
      </ConsoleArea>
      {needInput && !inputDrawerOpen && (
        <div
          className="inputTipArea"
          onClick={() => {
            setInputDrawerOpen(true);
          }}
        >
          <div>Continue to {inputDataSchema?.title || 'User Input'}</div>
        </div>
      )}
      <UserInputDrawer
        open={inputDrawerOpen}
        schema={
          inputDataSchema || {
            title: 'User Input',
            type: 'object',
            properties: {
              input: {
                title: 'Input',
                'x-decorator': 'FormItem',
                'x-component': 'Input',
              },
            },
          }
        }
        onSubmit={(data: any) => {
          if (wsRef.current) {
            wsRef.current?.send(inputDataSchema ? JSON.stringify(data) : data.input);
            needInputRef.current = false;
            setNeedInput(false);
            setInputDrawerOpen(false);
            consoleRef.current?.setAutoPlay(true);
          }
        }}
        onNeedClose={() => {
          setInputDrawerOpen(false);
        }}
      />
      <LoadingOverlay spinning={loading} tip={loadingTip} />
      <JSONViewModal
        title={operatingLog ? 'Log Detail' : 'Detail Data'}
        open={jsonViewModalOpen}
        jsonObject={jsonViewModalData || operatingLog}
        isSceneLog={!!operatingLog}
        projectId={globalStore.currentProject?.id}
        onNeedClose={() => {
          setJSONViewModalOpen(false);
          setJSONViewModalData(undefined);
          setOperatingLog(undefined);
        }}
      />
      {globalStore.currentProject && (
        <LogMetricDetailModal
          open={logMetricDetailModalOpen}
          editable={true}
          humanOnlyEvaluationMode={logMetricDetailModalData?.humanOnlyEvaluationMode || false}
          projectId={globalStore.currentProject.id}
          taskId={taskId}
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
      )}
    </PageContainer>
  );
};

export default ProcessingPage;
