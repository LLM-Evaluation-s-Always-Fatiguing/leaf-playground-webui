import React, { useMemo } from 'react';
import CustomFullFillAntdModal from '@/components/basic/CustomFullFillAntdModal';
import { SceneMetricDefinition, SceneMetricRecordDisplayType } from '@/types/server/meta/Scene';
import { SceneMetricConfig } from '@/types/server/config/Metric';
import { SceneActionLog } from '@/types/server/Log';
import styled from '@emotion/styled';
import { Button, InputNumber, Rate, Tabs } from 'antd';
import { TbCodeDots } from 'react-icons/tb';
import { getSceneLogMessageDisplayContent } from '@/utils/scene-log';
import { Radio } from '@formily/antd-v5';

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

const ReferencesArea = styled.div`
  height: 45%;
  border-bottom: 1px solid ${(props) => props.theme.colorSplit};
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;

  .header {
    height: 32px;
    flex-shrink: 0;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: stretch;

    .titleArea {
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
  }

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
  height: 25%;
  border-bottom: 1px solid ${(props) => props.theme.colorSplit};
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;

  .header {
    height: 32px;
    flex-shrink: 0;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: stretch;

    .titleArea {
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
  }

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

const MetricsArea = styled.div`
  height: 30%;
`;

const MetricDetail = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  padding: 9px 16px;
  overflow: hidden auto;

  .metricItem {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: stretch;

    .evaluatorArea {
      width: 15%;
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: flex-start;
    }

    .info {
      margin-left: 12px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;

      .componentArea {
        pointer-events: none !important;
      }

      .reason {
      }
    }
  }
`;

function getMetricDisplayValueExample(displayType: SceneMetricRecordDisplayType, value: any) {
  switch (displayType) {
    case SceneMetricRecordDisplayType.BooleanRadio:
      return (
        <Radio.Group
          options={[
            { label: 'False', value: false },
            { label: 'True', value: true },
          ]}
          value={value}
        />
      );
    case SceneMetricRecordDisplayType.NumberInput:
      return <InputNumber value={value} />;
    case SceneMetricRecordDisplayType.FiveStarsRate:
      return <Rate value={value} />;
  }
}

interface LogMetricDetailModalProps {
  open: boolean;
  editable: boolean;
  log?: SceneActionLog;
  metrics?: SceneMetricDefinition[];
  metricsConfig?: Record<string, SceneMetricConfig>;
  onLogUpdated: (log: SceneActionLog) => void;
  onNeedClose: () => void;
  onOpenJSONDetail: (log: SceneActionLog) => void;
}

const LogMetricDetailModal = (props: LogMetricDetailModalProps) => {
  const enabledMetrics = useMemo(() => {
    return (props.metrics || []).filter((metric) => {
      return props.metricsConfig?.[metric.name]?.enable;
    });
  }, [props.metrics, props.metricsConfig]);

  return (
    <CustomFullFillAntdModal
      open={props.open}
      width={'max(960px, 65vw)'}
      destroyOnClose
      centered
      footer={null}
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
        <ReferencesArea>
          <div className="header">
            <div className="titleArea">References</div>
          </div>
          <div className="content">
            {(props.log?.references || []).map((reference, index) => {
              return (
                <ContentItem key={index}>
                  <div className={'head'}>
                    <div>{props.log?.log_msg}</div>
                  </div>
                  <div className={'body'}>{getSceneLogMessageDisplayContent(reference)}</div>
                </ContentItem>
              );
            })}
          </div>
        </ReferencesArea>
        <ResponseArea>
          <div className="header">
            <div className="titleArea">Response</div>
          </div>
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
                    props.onOpenJSONDetail(props.log);
                  }}
                />
              </div>
              {props.log && <div className={'body'}>{getSceneLogMessageDisplayContent(props.log.response)}</div>}
            </ContentItem>
          </div>
        </ResponseArea>
        <MetricsArea>
          <Tabs
            defaultActiveKey={enabledMetrics[0]?.name}
            size={'small'}
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
                    {(props.log?.eval_records?.[`${props.log?.action_belonged_chain}.${metric.name}`] || []).map(
                      (record, index) => {
                        return (
                          <div className="metricItem" key={index}>
                            <div className="evaluatorArea">{record.evaluator}</div>
                            <div className="info">
                              <div className="componentArea">
                                {metric.record_display_type
                                  ? getMetricDisplayValueExample(metric.record_display_type, record.value)
                                  : record.value.toString()}
                              </div>
                              <div className="reason">{record.reason || '-'}</div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </MetricDetail>
                ),
              };
            })}
          />
        </MetricsArea>
      </Container>
    </CustomFullFillAntdModal>
  );
};

export default LogMetricDetailModal;
