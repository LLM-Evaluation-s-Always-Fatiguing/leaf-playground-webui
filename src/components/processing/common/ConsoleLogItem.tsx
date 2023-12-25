import styled from '@emotion/styled';
import { SceneActionLog } from '@/types/server/Log';
import React, { useEffect, useMemo } from 'react';
import { Button, Tooltip } from 'antd';
import { TbCodeDots } from 'react-icons/tb';
import TruncatableParagraph, {
  TruncatableParagraphEllipsisStatus,
} from '@/components/processing/common/TruncatableParagraph';
import { getSceneLogMessageDisplayContent } from '@/utils/scene-log';
import { SceneMetricDefinition } from '@/types/server/meta/Scene';
import { SceneMetricConfig } from '@/types/server/config/Metric';
import { HumanMetricMark } from '@/components/processing/common/icons/HumanMetricMark';
import { MdEditNote } from 'react-icons/md';
import { EvaluatorMark } from '@/components/homepage/icons/EvaluatorMark';

const Container = styled.div`
  margin: 9px 16px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  flex-shrink: 0;
`;

const MainContainer = styled.div`
  padding: 0 16px 12px 16px;
  box-shadow: 0 3px 9px rgba(0, 0, 0, 0.1);
  background: ${(props) => (props.theme.isDarkMode ? 'rgba(255,255,255,0.08)' : 'white')};
  border-radius: ${(props) => props.theme.borderRadius}px;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  flex-shrink: 0;
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 40px;
  color: ${(props) => props.theme.colorTextTertiary};
  font-weight: 500;
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  flex-shrink: 0;
`;

const MetricArea = styled.div`
  padding: 8px 16px 12px 16px;
  border-radius: 0 0 ${(props) => props.theme.borderRadius}px ${(props) => props.theme.borderRadius}px;
  background: ${(props) => props.theme.colorFillSecondary};

  .header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: 30px;
    font-weight: 500;
  }

  .metrics {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;

    .metric {
      min-width: calc(100% / 4 - 6px);
      margin-right: 6px;
      margin-bottom: 3px;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      pointer-events: auto;

      .label {
        font-weight: 500;
      }

      .value {
        margin-left: 6px;
      }

      .reason {
        margin-left: 4px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
      }
    }
  }
`;

interface ConsoleLogItemProps {
  log: SceneActionLog;
  evaluationMode: boolean;
  metrics: SceneMetricDefinition[];
  metricsConfig: Record<string, SceneMetricConfig>;
  ellipsisStatus: TruncatableParagraphEllipsisStatus;
  onEllipsisStatusChange: (status: TruncatableParagraphEllipsisStatus) => void;
  needMeasure: () => void;
  onOpenJSONDetail: (log: SceneActionLog) => void;
  onOpenMetricDetail: (
    log: SceneActionLog,
    metrics: SceneMetricDefinition[],
    metricsConfig: Record<string, SceneMetricConfig>
  ) => void;
}

const ConsoleLogItem = ({
  log,
  evaluationMode,
  metrics,
  metricsConfig,
  ellipsisStatus,
  onEllipsisStatusChange,
  needMeasure,
  onOpenJSONDetail,
  onOpenMetricDetail,
}: ConsoleLogItemProps) => {
  useEffect(() => {
    needMeasure();
  }, [log, ellipsisStatus, evaluationMode]);

  const enabledMetrics = useMemo(() => {
    return metrics.filter((metric) => {
      return metricsConfig[metric.name]?.enable;
    });
  }, [metrics, metricsConfig]);

  const hasMetrics = enabledMetrics.length > 0;

  return (
    <Container>
      <MainContainer>
        <Header>
          <div>{log.log_msg}</div>
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
              onOpenJSONDetail(log);
            }}
          />
        </Header>
        <Body>
          <TruncatableParagraph
            maxLine={3}
            ellipsisStatus={ellipsisStatus}
            onEllipsisStatusChange={(newStatus) => {
              onEllipsisStatusChange(newStatus);
              needMeasure();
            }}
          >
            <strong>
              {`${log.response.sender.name} --> [${log.response.receivers.map((r) => r.name).join(', ')}]: `}
            </strong>
            {getSceneLogMessageDisplayContent(log.response)}
          </TruncatableParagraph>
        </Body>
      </MainContainer>
      {hasMetrics && evaluationMode && (
        <MetricArea>
          <div className="header">
            <div>Metrics:</div>
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
              icon={<MdEditNote size={'1em'} />}
              onClick={() => {
                onOpenMetricDetail(log, metrics, metricsConfig);
              }}
            />
          </div>
          <div className="metrics">
            {enabledMetrics.map((metric, index) => {
              const metricKey = `${log.action_belonged_chain}.${metric.name}`;
              const humanRecord = log.human_eval_records?.[metricKey];
              const evaluatorRecord = Array.isArray(log.eval_records?.[metricKey])
                ? log.eval_records[metricKey][log.eval_records[metricKey].length - 1]
                : undefined;
              const record = humanRecord || evaluatorRecord;
              const valueStr = record?.value !== undefined ? record.value.toString() : '-';
              const recordReason = record?.reason;
              return (
                <div key={index} className="metric">
                  <div className="label">{metric.name}:</div>
                  <div className="value">{valueStr}</div>
                  {(!!record) &&
                    <Tooltip title={recordReason}>
                      <div className={'reason'}>{humanRecord ? <HumanMetricMark /> : <EvaluatorMark />}</div>
                    </Tooltip>
                  }
                </div>
              );
            })}
          </div>
        </MetricArea>
      )}
    </Container>
  );
};

export default ConsoleLogItem;
