import { SceneActionDefinition, SceneMetricRecordDisplayType } from '@/types/server/meta/Scene';
import { Card, Checkbox, Flex, InputNumber, Popover, Rate } from 'antd';
import styled from '@emotion/styled';
import { useTheme } from 'antd-style';
import { Radio } from '@formily/antd-v5';
import { WebUIActionMetricConfig } from '@/types/webui/MetricConfig';
import { generateColorShades } from '@/utils/color/generate-color-shades';
import { useMemo } from 'react';
import { EvaluatorMark } from '@/components/homepage/icons/EvaluatorMark';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { MetricIcon } from '@/components/homepage/icons/MetricIcon';
import { CompareMetricIcon } from '@/components/homepage/icons/CompareMetricIcon';

const Container = styled.div`
  margin: 6px;
  max-width: calc(100% / 3 - 12px);
  min-width: 320px;
  @media only screen and (max-width: 1340px) {
    max-width: calc(100% / 2 - 12px);
  }

  @media only screen and (max-width: 1000px) {
    max-width: calc(100% - 12px);
  }
`;

const GroupTitle = styled.div`
  padding: 5px 0;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  overflow: hidden;
  cursor: pointer;
  user-select: none;

  .checkboxArea {
    flex-shrink: 0;
    padding-right: 10px;
    align-self: stretch;
  }

  .info {
    max-width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-self: stretch;

    .title {
      font-size: 14px;
      line-height: 22px;
      font-weight: 500;
    }

    .desc {
      font-size: 12px !important;
      font-weight: normal;
      white-space: pre-wrap;
    }
  }
`;

const MetricItem = styled.div<{ secondaryPrimaryColor: string }>`
  min-width: calc(50% - 12px);
  margin-right: 12px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  .highlight {
    text-shadow: 0 0 5px ${(props) => props.secondaryPrimaryColor};

    .ant-checkbox-wrapper {
      color: ${(props) => props.theme.colorPrimary} !important;
    }
  }

  .handled {
    .ant-checkbox-wrapper {
      color: ${(props) => props.theme.colorPrimary} !important;
    }
  }

  .question {
    margin-right: 6px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }

  .question.highlight {
    color: ${(props) => props.theme.colorPrimary};
  }

  .question.handled {
    color: ${(props) => props.theme.colorPrimary};
  }
`;

const MetricTipContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;

  .description {
  }

  .componentWrapper {
    margin-top: 6px;
    white-space: pre;
    pointer-events: none !important;
  }
`;

function getMetricDisplayValueExample(displayType: SceneMetricRecordDisplayType) {
  switch (displayType) {
    case SceneMetricRecordDisplayType.BooleanRadio:
      return (
        <Radio.Group
          options={[
            { label: 'True', value: true },
            { label: 'False', value: false },
          ]}
        />
      );
    case SceneMetricRecordDisplayType.NumberInput:
      return <InputNumber value={0} style={{ width: '140px' }} />;
    case SceneMetricRecordDisplayType.FiveStarsRate:
      return <Rate />;
  }
}

interface SceneActionConfigCardProps {
  roleName: string;
  actionDefinition: SceneActionDefinition;
  config?: WebUIActionMetricConfig;
  evaluatorHandledMetrics?: string[];
  highlightMetrics: string[];
  onConfigChange: (config: WebUIActionMetricConfig) => void;
}

const SceneActionConfigCard = (props: SceneActionConfigCardProps) => {
  const theme = useTheme();
  const primaryColorShades = useMemo(() => {
    return generateColorShades(theme.colorPrimary);
  }, [theme.colorPrimary]);

  const checkedMetricsCount = useMemo(() => {
    return (props.actionDefinition.metrics || []).filter((metric) => {
      return props.config?.metrics_config[metric.name]?.enable || false;
    }).length;
  }, [props.actionDefinition.metrics, props.config]);
  const { allMetrics, checkedMetrics } = useMemo(() => {
    const allMetrics: string[] = [];
    const checkedMetrics: string[] = [];
    props.actionDefinition.metrics?.forEach((metric) => {
      const metricKey = `${props.roleName}.${props.actionDefinition.name}.${metric.name}`;
      allMetrics.push(metricKey);
      if (props.config?.metrics_config[metric.name]?.enable) {
        checkedMetrics.push(metricKey);
      }
    });
    return { allMetrics, checkedMetrics };
  }, [props.actionDefinition.metrics, props.config]);
  const allMetricsChecked = allMetrics.length === checkedMetrics.length;

  const highlighted = useMemo(() => {
    return props.highlightMetrics.some((metric) => {
      return allMetrics.includes(metric);
    });
  }, [props.highlightMetrics, allMetrics]);

  return (
    <Container>
      <Card
        size={'small'}
        style={{
          width: '100%',
          ...(checkedMetricsCount > 0
            ? {
                border: `1px solid ${allMetricsChecked ? primaryColorShades[5] : primaryColorShades[2]}`,
              }
            : {}),
          ...(highlighted
            ? {
                border: `1px solid ${primaryColorShades[3]}`,
              }
            : {}),
        }}
        title={
          <GroupTitle
            onClick={(e) => {
              e.stopPropagation();
              if (allMetricsChecked) {
                const newConfig: WebUIActionMetricConfig = {
                  metrics_config: {},
                };
                props.onConfigChange(newConfig);
              } else {
                const newConfig: WebUIActionMetricConfig = {
                  metrics_config: {},
                };
                props.actionDefinition.metrics?.forEach((metric) => {
                  newConfig.metrics_config[metric.name] = {
                    enable: true,
                  };
                });
                props.onConfigChange(newConfig);
              }
            }}
          >
            <div className="checkboxArea">
              <Checkbox
                checked={allMetricsChecked}
                style={{
                  pointerEvents: 'none',
                }}
              />
            </div>
            <div className="info">
              <div className="title">{props.actionDefinition.name} Action</div>
              <div className="desc">{props.actionDefinition.description}</div>
            </div>
          </GroupTitle>
        }
      >
        <Flex justify={'flex-start'} align={'flex-start'} wrap={'wrap'}>
          {(props.actionDefinition.metrics || []).map((metric, index) => {
            const metricKey = `${props.roleName}.${props.actionDefinition.name}.${metric.name}`;
            const highlighted = props.highlightMetrics.includes(metricKey);
            const evaluatorHandled = props.evaluatorHandledMetrics?.includes(metricKey) || highlighted;
            const enabled = props.config?.metrics_config[metric.name]?.enable || false;
            return (
              <MetricItem key={index} secondaryPrimaryColor={primaryColorShades[4]}>
                <div className={`${highlighted ? 'highlight' : ''} ${enabled && evaluatorHandled ? 'handled' : ''}`}>
                  <Checkbox
                    checked={enabled}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      const newConfig: WebUIActionMetricConfig = { metrics_config: {}, ...props.config };
                      newConfig.metrics_config[metric.name] = {
                        enable: checked,
                      };
                      props.onConfigChange(newConfig);
                    }}
                  >
                    <Flex align={'center'}>
                      {metric.is_comparison ? <CompareMetricIcon /> : <MetricIcon />}
                      {`${metric.name}`}
                    </Flex>
                  </Checkbox>
                </div>
                <Popover
                  title={`${metric.name} (${metric.is_comparison ? 'Comparison Metric' : 'Metric'})`}
                  content={
                    <MetricTipContent>
                      <div className="description">{metric.description}</div>
                      {!metric.is_comparison && metric.record_display_type && (
                        <div className="componentWrapper">
                          Display Component:{'   '}
                          {getMetricDisplayValueExample(metric.record_display_type)}
                        </div>
                      )}
                    </MetricTipContent>
                  }
                >
                  <div
                    className={`question ${highlighted ? 'highlight' : ''} ${
                      enabled && evaluatorHandled ? 'handled' : ''
                    }`}
                  >
                    <AiOutlineQuestionCircle />
                  </div>
                </Popover>
                {((enabled && evaluatorHandled) || highlighted) && (
                  <EvaluatorMark
                    style={{
                      color: theme.colorPrimary,
                      fontSize: '14px',
                    }}
                  />
                )}
              </MetricItem>
            );
          })}
        </Flex>
      </Card>
    </Container>
  );
};

export default SceneActionConfigCard;
