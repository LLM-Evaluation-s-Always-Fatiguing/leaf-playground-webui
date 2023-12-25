import React, { useEffect, useMemo, useState } from 'react';
import CustomFullFillAntdModal from '@/components/basic/CustomFullFillAntdModal';
import { SceneMetricDefinition, SceneMetricRecordDisplayType } from '@/types/server/meta/Scene';
import { SceneMetricConfig } from '@/types/server/config/Metric';
import { SceneActionLog, SceneLogHumanMetricRecord } from '@/types/server/Log';
import styled from '@emotion/styled';
import { Button, Collapse, Flex, InputNumber, message, Rate, Tabs, Typography } from 'antd';
import { TbCodeDots } from 'react-icons/tb';
import { getSceneLogGroundTruthDisplayContent, getSceneLogMessageDisplayContent } from '@/utils/scene-log';
import { Radio } from '@formily/antd-v5';
import { Resizable } from 're-resizable';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import ServerAPI from '@/services/server';

const { Paragraph } = Typography;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  width: 100%;
  height: 85vh;
  overflow: hidden;
  border: 1px solid ${(props) => props.theme.colorSplit};
  border-radius: ${(props) => props.theme.borderRadius}px;
`;

const TopArea = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: stretch;
  border-bottom: 1px solid ${(props) => props.theme.colorSplit};
  overflow: hidden;
  flex-shrink: 0;
`;

const ContentItem = styled.div`
  padding: 0 16px 12px 16px;
  box-shadow: 0 3px 9px rgba(0, 0, 0, 0.1);
  background: ${(props) => (props.theme.isDarkMode ? 'rgba(255,255,255,0.08)' : 'white')};
  border-radius: ${(props) => props.theme.borderRadius}px;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  flex-shrink: 0;

  .head {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: 40px;
    color: ${(props) => props.theme.colorTextTertiary};
    font-weight: 500;
  }

  .body {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    flex-shrink: 0;
  }
`;

const PartHeader = styled.div`
  height: 32px;
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: stretch;

  .title {
    padding: 0 18px;
    height: 100%;
    background: ${(props) => props.theme.colorPrimary};
    color: white;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    font-weight: 500;
    border-radius: 0 0 ${(props) => props.theme.borderRadius}px 0;
  }
`;

const ReferencesArea = styled.div`
  width: 50%;
  height: 100%;
  border-right: 1px solid ${(props) => props.theme.colorSplit};
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;

  .content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    overflow: hidden auto;
    padding: 9px 16px;
  }
`;

const ResponseArea = styled.div`
  width: 50%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;

  .content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    overflow: hidden auto;
    padding: 9px 16px;
  }
`;

const BottomArea = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: stretch;
  overflow: hidden;
  flex-grow: 1;
`;

const GroundTruthArea = styled.div`
  width: 50%;
  height: 100%;
  border-right: 1px solid ${(props) => props.theme.colorSplit};
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;

  .content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    overflow: hidden auto;
    padding: 9px 16px;
  }
`;

const MetricsArea = styled.div`
  width: 50%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;

  .ant-tabs-nav {
    margin-bottom: 0 !important;
  }

  .ant-tabs-content {
    height: 100%;
  }

  .ant-tabs-tabpane {
    height: 100%;
  }

  .toolbar {
    height: 40px;
    border-top: 1px solid ${(props) => props.theme.colorSplit};
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    flex-shrink: 0;
    padding: 0 35px;
  }
`;

const MetricDetail = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  padding: 0 16px;
  overflow: hidden auto;

  .metricItem {
    padding: 12px 16px;
    box-shadow: 0 3px 9px rgba(0, 0, 0, 0.1);
    background: ${(props) => (props.theme.isDarkMode ? 'rgba(255,255,255,0.08)' : 'white')};
    border-radius: ${(props) => props.theme.borderRadius}px;

    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;

    .evaluatorArea {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
    }

    .info {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;

      .label {
        width: 80px;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
        margin-right: 10px;
      }

      .value {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
      }

      .reason {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        height: 36px;
      }
    }

    .evaluatorArea + .info {
      margin-top: 8px;
    }
  }
`;

function getMetricDisplayComponent(
  displayType: SceneMetricRecordDisplayType,
  value: any,
  onChange?: (value: any) => void
) {
  switch (displayType) {
    case SceneMetricRecordDisplayType.BooleanRadio:
      return (
        <Radio.Group
          options={[
            { label: 'True', value: true },
            { label: 'False', value: false },
          ]}
          value={value}
          onChange={(e) => {
            onChange?.(e.target.value);
          }}
        />
      );
    case SceneMetricRecordDisplayType.NumberInput:
      return (
        <InputNumber
          value={value}
          style={{
            width: '140px',
          }}
          onChange={(value) => {
            onChange?.(value);
          }}
        />
      );
    case SceneMetricRecordDisplayType.FiveStarsRate:
      return (
        <Rate
          value={value}
          onChange={(value) => {
            onChange?.(value);
          }}
        />
      );
  }
}

interface LogMetricDetailModalProps {
  open: boolean;
  editable: boolean;
  serverUrl: string;
  log?: SceneActionLog;
  metrics?: SceneMetricDefinition[];
  metricsConfig?: Record<string, SceneMetricConfig>;
  onNeedClose: () => void;
  onOpenJSONDetail: (json: any) => void;
}

const LogMetricDetailModal = (props: LogMetricDetailModalProps) => {
  const [loading, setLoading] = useState(false);
  const [loadingTip, setLoadingTip] = useState<string>();
  const [newHumanMetrics, setNewHumanMetrics] = useState<Record<string, SceneLogHumanMetricRecord>>({});
  const hasChange = Object.keys(newHumanMetrics).length > 0;

  const enabledMetrics = useMemo(() => {
    return (props.metrics || []).filter((metric) => {
      return props.metricsConfig?.[metric.name]?.enable;
    });
  }, [props.metrics, props.metricsConfig]);

  const reset = () => {
    setLoading(false);
    setLoadingTip(undefined);
    setNewHumanMetrics({});
  };

  useEffect(() => {
    if (props.open) {
      reset();
    }
  }, [props.open]);

  return (
    <CustomFullFillAntdModal
      open={props.open}
      width={'max(1280px, 80vw)'}
      destroyOnClose
      centered
      footer={hasChange ? undefined : null}
      okText={'Save'}
      onOk={async () => {
        if (!props.log) return;
        try {
          setLoadingTip('Saving...');
          setLoading(true);
          for (const metricName of Object.keys(newHumanMetrics)) {
            const metricKey = `${props.log?.action_belonged_chain}.${metricName}`;
            const metric = enabledMetrics.find((m) => m.name === metricName);
            if (metric) {
              if (metric.is_comparison) {
                await ServerAPI.sceneTask.updateLogHumanCompareMetricRecord(props.serverUrl, {
                  log_id: props.log.id,
                  metric_name: metricKey,
                  value: [],
                  reason: newHumanMetrics[metricName].reason,
                });
              } else {
                await ServerAPI.sceneTask.updateLogHumanMetricRecord(props.serverUrl, {
                  log_id: props.log.id,
                  metric_name: metricKey,
                  value: newHumanMetrics[metricName].value,
                  display_type: metric.record_display_type!,
                  target_agent: props.log.response.sender.id,
                  reason: newHumanMetrics[metricName].reason,
                });
              }
            }
          }
          message.success('Log metrics saved');
          setNewHumanMetrics({});
          setLoading(false);
        } catch (e) {
          console.error(e);
          message.error('Failed to save log metrics');
          setLoading(false);
        }
      }}
      onCancel={() => {
        props.onNeedClose();
      }}
      title={'Log Metric Detail'}
      styles={{
        body: {
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          padding: '6px 8px 0 8px',
        },
      }}
    >
      <Container>
        <LoadingOverlay spinning={loading} tip={loadingTip} />
        <Resizable
          defaultSize={{
            width: '100%',
            height: '55%',
          }}
          enable={{
            top: false,
            right: false,
            bottom: true,
            left: false,
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            topLeft: false,
          }}
        >
          <TopArea>
            <ReferencesArea>
              <PartHeader>
                <div className="title">References</div>
              </PartHeader>
              <div className="content">
                {(props.log?.references || []).map((reference, index) => {
                  return (
                    <ContentItem key={index}>
                      <div className={'head'}>
                        <div>{`${reference.sender.name} --> [${reference.receivers
                          .map((r) => r.name)
                          .join(', ')}]: `}</div>
                        <Button
                          size="small"
                          type="text"
                          style={{
                            fontSize: '18px',
                            lineHeight: 1,
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                          icon={<TbCodeDots size={'1em'} />}
                          onClick={() => {
                            if (!props.log) return;
                            props.onOpenJSONDetail(reference);
                          }}
                        />
                      </div>
                      <div className={'body'}>{getSceneLogMessageDisplayContent(reference, true)}</div>
                    </ContentItem>
                  );
                })}
              </div>
            </ReferencesArea>
            <ResponseArea>
              <PartHeader>
                <div className="title">Response</div>
              </PartHeader>
              <div className="content">
                <ContentItem>
                  <div className={'head'}>
                    <div>{props.log?.log_msg}</div>
                    <Button
                      size="small"
                      type="text"
                      style={{
                        fontSize: '18px',
                        lineHeight: 1,
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      icon={<TbCodeDots size={'1em'} />}
                      onClick={() => {
                        if (!props.log) return;
                        props.onOpenJSONDetail(props.log.response);
                      }}
                    />
                  </div>
                  {props.log && (
                    <div className={'body'}>{getSceneLogMessageDisplayContent(props.log.response, true)}</div>
                  )}
                </ContentItem>
              </div>
            </ResponseArea>
          </TopArea>
        </Resizable>
        <BottomArea>
          <GroundTruthArea>
            <PartHeader>
              <div className="title">Ground Truth</div>
            </PartHeader>
            <div className="content">
              <ContentItem>
                <div className={'head'}>
                  <div />
                  {props.log?.ground_truth && (
                    <Button
                      size="small"
                      type="text"
                      style={{
                        fontSize: '18px',
                        lineHeight: 1,
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      icon={<TbCodeDots size={'1em'} />}
                      onClick={() => {
                        if (!props.log) return;
                        props.onOpenJSONDetail(props.log.ground_truth);
                      }}
                    />
                  )}
                </div>
                {props.log && (
                  <div className={'body'}>
                    {props.log.ground_truth ? getSceneLogGroundTruthDisplayContent(props.log.ground_truth, true) : ''}
                  </div>
                )}
              </ContentItem>
            </div>
          </GroundTruthArea>
          <MetricsArea>
            <Tabs
              defaultActiveKey={enabledMetrics[0]?.name}
              size={'small'}
              style={{
                height: '100%',
              }}
              items={enabledMetrics.map((metric, index) => {
                return {
                  key: `${metric.name}`,
                  label: (
                    <div
                      style={{
                        padding: '0 8px',
                      }}
                    >{`${metric.name}`}</div>
                  ),
                  children: (
                    <MetricDetail>
                      <Collapse
                        defaultActiveKey={['human', 'evaluators']}
                        size={'small'}
                        collapsible={'icon'}
                        ghost
                        items={[
                          {
                            key: 'human',
                            label: 'Human:',
                            children: (
                              <div className={'metricItem'}>
                                <div className="info">
                                  <div className="value">
                                    <div className="label">Value:</div>
                                    {metric.record_display_type
                                      ? getMetricDisplayComponent(
                                          metric.record_display_type,
                                          newHumanMetrics[metric.name]?.value !== undefined
                                            ? newHumanMetrics[metric.name]?.value
                                            : props.log?.human_eval_records?.[
                                                `${props.log?.action_belonged_chain}.${metric.name}`
                                              ]?.value,
                                          (newValue) => {
                                            setNewHumanMetrics((prev) => {
                                              if (!props.log) return prev;
                                              const newMetrics = { ...prev };
                                              const metricKey = `${props.log?.action_belonged_chain}.${metric.name}`;
                                              if (!newMetrics[metric.name]) {
                                                newMetrics[metric.name] = {
                                                  value: newValue,
                                                  evaluator: 'human',
                                                  display_type: metric.record_display_type!,
                                                  reason: metric.is_comparison
                                                    ? props.log.human_compare_records?.[metricKey]?.reason
                                                    : props.log.human_eval_records?.[metricKey]?.reason,
                                                  is_comparison: metric.is_comparison,
                                                  target_agent: props.log!.response.sender.id,
                                                };
                                              } else {
                                                newMetrics[metric.name] = {
                                                  ...newMetrics[metric.name],
                                                  value: newValue,
                                                };
                                              }
                                              return newMetrics;
                                            });
                                          }
                                        )
                                      : props.log?.human_eval_records?.[
                                          `${props.log?.action_belonged_chain}.${metric.name}`
                                        ]?.value.toString()}
                                  </div>
                                  <div className="reason">
                                    <div className="label">Reason:</div>
                                    <Paragraph
                                      style={{
                                        marginTop: 0,
                                        marginBottom: 0,
                                        flexGrow: 1,
                                      }}
                                      editable={{
                                        onChange: (value) => {
                                          setNewHumanMetrics((prev) => {
                                            if (!props.log) return prev;
                                            const newMetrics = { ...prev };
                                            const metricKey = `${props.log?.action_belonged_chain}.${metric.name}`;
                                            if (!newMetrics[metric.name]) {
                                              newMetrics[metric.name] = {
                                                value: metric.is_comparison
                                                  ? props.log.human_compare_records?.[metricKey]?.value
                                                  : props.log.human_eval_records?.[metricKey]?.value,
                                                evaluator: 'human',
                                                display_type: metric.record_display_type!,
                                                reason: value,
                                                is_comparison: metric.is_comparison,
                                                target_agent: props.log!.response.sender.id,
                                              };
                                            } else {
                                              newMetrics[metric.name] = {
                                                ...newMetrics[metric.name],
                                                reason: value,
                                              };
                                            }
                                            return newMetrics;
                                          });
                                        },
                                        text:
                                          newHumanMetrics[metric.name]?.reason ||
                                          props.log?.human_eval_records?.[
                                            `${props.log?.action_belonged_chain}.${metric.name}`
                                          ]?.reason,
                                      }}
                                    >
                                      {newHumanMetrics[metric.name]?.reason ||
                                        props.log?.human_eval_records?.[
                                          `${props.log?.action_belonged_chain}.${metric.name}`
                                        ]?.reason ||
                                        ''}
                                    </Paragraph>
                                  </div>
                                </div>
                              </div>
                            ),
                          },
                          {
                            key: 'evaluators',
                            label: 'Evaluators:',
                            children: (
                              <Flex vertical gap={10}>
                                {(
                                  props.log?.eval_records?.[`${props.log?.action_belonged_chain}.${metric.name}`] || []
                                ).map((record, index) => {
                                  return (
                                    <div key={index} className={'metricItem'}>
                                      <div className="evaluatorArea">{record.evaluator}</div>
                                      <div className="info">
                                        <div
                                          className="value"
                                          style={{
                                            pointerEvents: 'none',
                                          }}
                                        >
                                          <div className="label">Value:</div>
                                          {metric.record_display_type
                                            ? getMetricDisplayComponent(metric.record_display_type, record.value)
                                            : record.value.toString()}
                                        </div>
                                        <div className="reason">
                                          <div className="label">Reason:</div>
                                          {record.reason || '-'}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </Flex>
                            ),
                          },
                        ]}
                      />
                    </MetricDetail>
                  ),
                };
              })}
            />
          </MetricsArea>
        </BottomArea>
      </Container>
    </CustomFullFillAntdModal>
  );
};

export default LogMetricDetailModal;
