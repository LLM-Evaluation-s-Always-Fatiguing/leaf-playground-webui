import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { SceneActionLog } from '@/types/server/common/Log';
import {
  CreateSceneTaskParams,
  getEnabledMetricsFromCreateSceneTaskParams,
} from '@/types/server/config/CreateSceneTaskParams';
import { SceneMetricConfig } from '@/types/server/config/Metric';
import Scene, { SceneMetricDefinition } from '@/types/server/meta/Scene';
import { SceneTaskStatus } from '@/types/server/task/SceneTask';
import { getAllAgentInstanceFrom } from '@/types/webui/AgentInstance';
import { Segmented, Space, Tabs } from 'antd';
import { useTheme } from 'antd-style';
import styled from '@emotion/styled';
import { CellMeasurer, CellMeasurerCache, List } from 'react-virtualized';
import AutoSizer from 'react-virtualized-auto-sizer';
import { IoPauseCircleSharp, IoPlayCircleSharp, IoStopCircleSharp } from 'react-icons/io5';
import ConsoleLogItem from '@/app/processing/components/Console/LogItem';
import { TruncatableParagraphEllipsisStatus } from '@/app/processing/components/Console/TruncatableParagraph';
import CircleFillAutoplayIcon from '@/app/processing/components/common/icons/CircleFillAutoplayIcon';
import HumanEvaluationModeIcon from '@/app/processing/components/common/icons/HumanEvaluationModeIcon';
import NoneEvaluationModeIcon from '@/app/processing/components/common/icons/NoneEvaluationModeIcon';
import StandardEvaluationModeIcon from '@/app/processing/components/common/icons/StandardEvaluationModeIcon';

const Container = styled.div`
  width: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  overflow: hidden;

  .ant-tabs-nav {
    margin-bottom: 0;
  }
`;

const Header = styled.div`
  flex-shrink: 0;
  height: 60px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  font-size: 21px;
  font-weight: 500;
  padding: 0 16px 15px 16px;

  > div {
    flex-grow: 1;
    flex-basis: 1px;
  }

  .connectionStatus {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;

    .indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-right: 8px;
      flex-shrink: 0;
    }

    font-size: 14px;
    font-weight: normal;

    .controlButton {
      width: 32px;
      height: 32px;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      font-size: 21px;
    }
  }

  .titleArea {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }

  .actionsArea {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: stretch;
    position: relative;
    top: 15px;

    .actionButton {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      cursor: pointer;

      padding: 4px;
      border-radius: ${(props) => props.theme.borderRadius}px;

      .iconArea {
        height: 32px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;

        .icon {
          width: 28px;
          height: 28px;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          font-size: 22px;
          color: ${(props) => props.theme.colorTextQuaternary};
        }
      }

      .title {
        margin-top: 5px;
        font-size: 13px;
        line-height: 1;
        font-weight: 500;
        white-space: pre;
        text-align: center;
        color: ${(props) => props.theme.colorTextDisabled};
      }
    }

    .actionButton.hoverable {
      :hover {
        background-color: ${(props) => props.theme.colorBgTextHover};
      }
    }

    .actionButton.selected {
      .icon {
        color: ${(props) => props.theme.colorPrimary};
      }

      .title {
        color: ${(props) => props.theme.colorText};
      }
    }

    .actionButton.normal {
      .icon.selected {
        color: ${(props) => props.theme.colorPrimary};
      }

      .title {
        color: ${(props) => props.theme.colorText};
      }
    }

    .actionButton + .actionButton {
      margin-left: 6px;
    }
  }

  > div {
    flex-shrink: 0;
  }
`;

const LogsArea = styled.div`
  flex-grow: 1;
  overflow: hidden;
`;

interface ProcessingConsoleProps {
  startStatusCheckFinished: boolean;
  taskServerAlive: boolean;
  taskStatus: SceneTaskStatus;
  wsConnected: boolean;
  simulationFinished: boolean;
  evaluationFinished: boolean;
  scene: Scene;
  createSceneTaskParams: CreateSceneTaskParams;
  logs: SceneActionLog[];
  targetAgentId: string;
  playerMode: boolean;
  onTargetAgentChange: (agentId: string) => void;
  onOpenJSONDetail: (log: SceneActionLog) => void;
  onOpenMetricDetail: (
    log: SceneActionLog,
    metrics: SceneMetricDefinition[],
    metricsConfig: Record<string, SceneMetricConfig>,
    humanOnlyEvaluationMode: boolean
  ) => void;

  onPause: () => void;
  onResume: () => void;
  onInterrupt: () => void;
}

export type ProcessingConsoleMethods = {
  scrollToLog: (logId: string) => void;
  setAutoPlay: (autoPlay: boolean) => void;
  measureAllRows: () => void;
};

const ProcessingConsole = forwardRef<ProcessingConsoleMethods, ProcessingConsoleProps>((props, ref) => {
  const theme = useTheme();

  const logListMeasurerCache = useMemo(() => {
    return new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight: 120,
    });
  }, []);
  useEffect(() => {
    logListMeasurerCache.clearAll();
  }, [props.targetAgentId]);
  const listRef = useRef<List>(null);

  const [autoPlay, setAutoPlay] = useState(true);
  const [evaluationMode, setEvaluationMode] = useState(false);
  const [humanOnlyEvaluationMode, setHumanOnlyEvaluationMode] = useState(false);
  const hasEnabledMetric =
    !props.targetAgentId && getEnabledMetricsFromCreateSceneTaskParams(props.createSceneTaskParams).length > 0;
  const [highlightedLogId, setHighlightedLogId] = useState<string>();

  const displayLogs = useMemo(() => {
    if (!props.targetAgentId) {
      return props.logs;
    }
    return props.logs.filter(
      (log) =>
        log.response.sender.id === props.targetAgentId ||
        log.response.receivers.map((r) => r.id).includes(props.targetAgentId || '')
    );
  }, [props.logs, props.targetAgentId]);

  const [logItemEllipsisCache, setLogItemEllipsisCache] = React.useState<
    Record<string, TruncatableParagraphEllipsisStatus>
  >({});

  const logItemRenderer = ({ key, index, style, parent }: any) => {
    if (index >= displayLogs.length) {
      return (
        <CellMeasurer key={key} cache={logListMeasurerCache} parent={parent} columnIndex={0} rowIndex={index}>
          {({ registerChild }) => (
            <div ref={registerChild as any} style={style}>
              <div
                style={{
                  width: '100%',
                  height: '30px',
                  flexShrink: 0,
                }}
              />
            </div>
          )}
        </CellMeasurer>
      );
    }
    const log = displayLogs[index];
    const [logRoleName, logActionName] = log.action_belonged_chain ? log.action_belonged_chain.split('.') : [];
    const metrics =
      props.scene.scene_metadata.scene_definition.roles
        .find((r) => r.name === logRoleName)
        ?.actions.find((a) => a.name === logActionName)?.metrics || [];
    const metricsConfig =
      props.createSceneTaskParams.scene_obj_config.scene_config_data.roles_config[logRoleName]?.actions_config[
        logActionName
      ]?.metrics_config || {};
    return (
      <CellMeasurer key={key} cache={logListMeasurerCache} parent={parent} columnIndex={0} rowIndex={index}>
        {({ measure, registerChild }) => (
          <div ref={registerChild as any} style={style}>
            <ConsoleLogItem
              log={log}
              evaluationMode={evaluationMode}
              humanOnlyEvaluationMode={humanOnlyEvaluationMode}
              metrics={metrics}
              metricsConfig={metricsConfig}
              highlighted={highlightedLogId === log.id}
              ellipsisStatus={logItemEllipsisCache[index] || TruncatableParagraphEllipsisStatus.WaitDetect}
              onEllipsisStatusChange={(newStatus) => {
                setLogItemEllipsisCache((prev) => {
                  return {
                    ...prev,
                    [index]: newStatus,
                  };
                });
              }}
              needMeasure={() => {
                setTimeout(() => {
                  try {
                    measure();
                  } catch {}
                }, 0);
              }}
              onOpenJSONDetail={(log) => {
                props.onOpenJSONDetail(log);
              }}
              onOpenMetricDetail={(log, metrics, metricsConfig) => {
                props.onOpenMetricDetail(log, metrics, metricsConfig, humanOnlyEvaluationMode);
              }}
            />
          </div>
        )}
      </CellMeasurer>
    );
  };

  useEffect(() => {
    if (autoPlay && listRef.current) {
      listRef.current.scrollToRow(props.logs.length - 1);
    }
  }, [props.logs, autoPlay, props.targetAgentId]);

  const logsAreaMouseDownRef = useRef(false);

  useEffect(() => {
    const onMouseUp = () => {
      setTimeout(() => {
        logsAreaMouseDownRef.current = false;
      }, 400);
    };
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const allAgents = useMemo(() => {
    return getAllAgentInstanceFrom(props.scene, props.createSceneTaskParams);
  }, [props.scene, props.createSceneTaskParams]);

  const processStatusStr = props.wsConnected
    ? props.simulationFinished && props.evaluationFinished
      ? 'All Done'
      : props.simulationFinished
        ? 'Evaluating...'
        : 'Simulating...'
    : '';

  const statusTip = useMemo(() => {
    switch (props.taskStatus) {
      case SceneTaskStatus.FAILED:
        return 'Task Failed';
      case SceneTaskStatus.PAUSED:
        return 'Task Paused';
      case SceneTaskStatus.INTERRUPTED:
        return 'Task Closed';
      default:
        break;
    }
    return '';
  }, [props.taskStatus]);

  const cancelHighlightTimer = useRef<NodeJS.Timeout>();
  const scrollToLog = (logId: string) => {
    setAutoPlay(false);
    const index = props.logs.findIndex((log) => log.id === logId);
    if (index < 0) {
      return;
    }
    if (listRef.current) {
      listRef.current.scrollToRow(index);
      setTimeout(() => {
        if (cancelHighlightTimer.current) {
          clearTimeout(cancelHighlightTimer.current);
        }
        setHighlightedLogId(logId);
        cancelHighlightTimer.current = setTimeout(() => {
          setHighlightedLogId(undefined);
        }, 800);
      }, 0);
    }
  };

  const measureAllRows = () => {
    logListMeasurerCache.clearAll();
    listRef.current?.measureAllRows();
  };

  useImperativeHandle(ref, () => {
    return {
      scrollToLog,
      setAutoPlay,
      measureAllRows,
    };
  });

  return (
    <Container>
      <Header>
        <div className="connectionStatus">
          {props.startStatusCheckFinished && (
            <>
              <div
                className="indicator"
                style={{
                  background: props.taskServerAlive && props.wsConnected ? theme.colorSuccess : theme.colorError,
                }}
              />
              {props.taskServerAlive ? (
                props.wsConnected ? (
                  <span>Server Connected( {statusTip || processStatusStr} )</span>
                ) : (
                  <span>Server Disconnected</span>
                )
              ) : (
                <span>Server Closed</span>
              )}
              {!props.playerMode &&
                props.taskServerAlive &&
                (props.taskStatus === SceneTaskStatus.RUNNING || props.taskStatus === SceneTaskStatus.PAUSED) && (
                  <>
                    <div
                      className={'controlButton'}
                      style={{
                        color: theme.colorPrimary,
                      }}
                      onClick={() => {
                        if (props.taskStatus === SceneTaskStatus.PAUSED) {
                          props.onResume();
                        } else {
                          props.onPause();
                        }
                      }}
                    >
                      {props.taskStatus === SceneTaskStatus.PAUSED ? (
                        <IoPlayCircleSharp size={'1em'} />
                      ) : (
                        <IoPauseCircleSharp size={'1em'} />
                      )}
                    </div>
                    <div
                      className={'controlButton'}
                      onClick={() => {
                        props.onInterrupt();
                      }}
                    >
                      <IoStopCircleSharp size={'1em'} style={{ color: theme.colorError }} />
                    </div>
                  </>
                )}
            </>
          )}
        </div>
        <div className={'titleArea'}>
          <span>Console</span>
          {!!props.logs.length && (
            <span
              style={{
                fontSize: '14px',
              }}
            >
              （{props.logs.length} Logs）
            </span>
          )}
        </div>
        <div className="actionsArea">
          <div
            className={`actionButton hoverable ${autoPlay ? 'selected' : ''}`}
            onClick={() => {
              setAutoPlay(!autoPlay);
            }}
          >
            <div className="iconArea">
              <div className="icon">
                <CircleFillAutoplayIcon />
              </div>
            </div>
            <div className="title">Auto Play</div>
          </div>
          {hasEnabledMetric && (
            <div className={`actionButton ${evaluationMode ? 'normal' : ''}`}>
              <div className="iconArea">
                <Segmented
                  disabled={!props.taskServerAlive}
                  value={evaluationMode ? (humanOnlyEvaluationMode ? 'human' : 'standard') : 'none'}
                  onChange={(value) => {
                    switch (value) {
                      case 'human':
                        setHumanOnlyEvaluationMode(true);
                        setEvaluationMode(true);
                        break;
                      case 'standard':
                        setHumanOnlyEvaluationMode(false);
                        setEvaluationMode(true);
                        break;
                      default:
                        setHumanOnlyEvaluationMode(false);
                        setEvaluationMode(false);
                    }
                  }}
                  options={[
                    {
                      label: (
                        <div className={`icon ${!humanOnlyEvaluationMode && !evaluationMode ? 'selected' : ''}`}>
                          <NoneEvaluationModeIcon />
                        </div>
                      ),
                      value: 'none',
                    },
                    {
                      label: (
                        <div className={`icon ${humanOnlyEvaluationMode && evaluationMode ? 'selected' : ''}`}>
                          <HumanEvaluationModeIcon />
                        </div>
                      ),
                      value: 'human',
                    },
                    {
                      label: (
                        <div className={`icon ${!humanOnlyEvaluationMode && evaluationMode ? 'selected' : ''}`}>
                          <StandardEvaluationModeIcon />
                        </div>
                      ),
                      value: 'standard',
                    },
                  ]}
                />
              </div>
              <div className="title">{`Evaluation Mode${humanOnlyEvaluationMode ? `(Human)` : ``}`}</div>
            </div>
          )}
        </div>
      </Header>
      <Tabs
        type="card"
        activeKey={props.targetAgentId}
        onChange={(newActiveKey) => {
          props.onTargetAgentChange(newActiveKey === 'All' ? '' : newActiveKey);
        }}
        items={[
          ...(props.playerMode
            ? []
            : [
                {
                  label: 'All',
                  key: '',
                },
              ]),
          ...allAgents
            .filter((agent) => {
              if (props.playerMode) {
                return agent.config.config_data.profile.id === props.targetAgentId;
              }
              return true;
            })
            .map((a) => {
              return {
                label: (
                  <Space>
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: a.config.config_data.chart_major_color,
                      }}
                    />
                    {`${a.config.config_data.profile.name}`}
                  </Space>
                ),
                key: a.config.config_data.profile.id,
              };
            }),
        ]}
      />
      <LogsArea
        onWheelCapture={() => {
          setAutoPlay(false);
        }}
        onMouseDownCapture={() => {
          logsAreaMouseDownRef.current = true;
        }}
      >
        <AutoSizer>
          {({ height, width }) => (
            <List
              ref={listRef}
              width={width}
              height={height}
              style={{
                padding: '12px 0',
              }}
              deferredMeasurementCache={logListMeasurerCache}
              rowCount={displayLogs.length + 1}
              rowHeight={logListMeasurerCache.rowHeight}
              rowRenderer={logItemRenderer}
              overscanRowCount={5}
              onScroll={() => {
                if (logsAreaMouseDownRef.current) {
                  setAutoPlay(false);
                }
              }}
            />
          )}
        </AutoSizer>
      </LogsArea>
    </Container>
  );
});

ProcessingConsole.displayName = 'ChildComponent';

export default ProcessingConsole;
