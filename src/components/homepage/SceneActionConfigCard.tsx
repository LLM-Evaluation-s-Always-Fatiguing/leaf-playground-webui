import { SceneActionDefinition, SceneMetricRecordDisplayType } from '@/types/server/meta/Scene';
import { Card, Checkbox, Flex, InputNumber, Popover, Rate } from 'antd';
import styled from '@emotion/styled';
import { useTheme } from 'antd-style';
import { Radio } from '@formily/antd-v5';
import { WebUIActionMetricConfig } from '@/types/webui/MetricConfig';
import { generateColorShades } from '@/utils/color/generate-color-shades';
import { useMemo } from 'react';
import { PiDetectiveFill } from 'react-icons/pi';

const GroupTitle = styled.div`
  padding: 5px 0;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  overflow: hidden;

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
      white-space: pre-line;
    }
  }
`;

const MetricItem = styled.div<{ secondaryPrimaryColor: string }>`
  min-width: 50%;
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
  }
`;

function getMetricDisplayValueExample(displayType: SceneMetricRecordDisplayType) {
  switch (displayType) {
    case SceneMetricRecordDisplayType.BooleanRadio:
      return (
        <Radio.Group
          disabled
          options={[
            { label: 'False', value: false },
            { label: 'True', value: true },
          ]}
        />
      );
    case SceneMetricRecordDisplayType.NumberInput:
      return <InputNumber value={0} disabled />;
    case SceneMetricRecordDisplayType.FiveStarsRate:
      return <Rate disabled />;
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
    <Card
      size={'small'}
      style={{
        maxWidth: '25%',
        minWidth: '320px',
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
        <GroupTitle>
          <div
            className="checkboxArea"
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
          const enabled = props.config?.metrics_config[metric.name]?.enable || false
          return (
            <Popover
              key={index}
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
              <MetricItem secondaryPrimaryColor={primaryColorShades[4]}>
                <div className={`${highlighted ? 'highlight' : ''} ${evaluatorHandled ? 'handled' : ''}`}>
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
                    {`${metric.name} (${metric.is_comparison ? 'Comparison Metric' : 'Metric'})`}
                  </Checkbox>
                </div>
                {enabled && evaluatorHandled && (
                  <PiDetectiveFill
                    size={'14px'}
                    style={{
                      color: theme.colorPrimary,
                    }}
                  />
                )}
              </MetricItem>
            </Popover>
          );
        })}
      </Flex>
    </Card>
  );
};

export default SceneActionConfigCard;
