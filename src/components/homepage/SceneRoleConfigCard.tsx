import { SceneRoleDefinition } from '@/types/server/meta/Scene';
import { Card, Checkbox, Collapse, Flex } from 'antd';
import styled from '@emotion/styled';
import SceneActionConfigCard from '@/components/homepage/SceneActionConfigCard';
import { WebUIRoleMetricConfig } from '@/types/webui/MetricConfig';
import { useMemo } from 'react';
import { generateColorShades } from '@/utils/color/generate-color-shades';
import { useTheme } from 'antd-style';

const CustomCollapseWrapper = styled.div`
  width: 100%;

  .ant-collapse {
    border-radius: 0;
    border: 1px solid ${(props) => props.theme.colorBorderSecondary};

    .ant-collapse-item {
      border-radius: 0;
      border-left: none;
      border-right: none;
      border-color: ${(props) => props.theme.colorBorderSecondary};

      .ant-collapse-header {
        flex-direction: row-reverse !important;
        align-items: center !important;

        .ant-collapse-header-text + .ant-collapse-extra {
          margin-right: 8px;
        }
      }

      .ant-collapse-content {
        border-color: ${(props) => props.theme.colorBorderSecondary};
      }
    }

    > .ant-collapse-item:last-child {
      border-bottom: none;
    }
  }
`;

const GroupTitle = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;

  .checkboxArea {
    padding-right: 10px;
    align-self: stretch;
  }

  .info {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;

    .title {
      font-size: 14px;
      line-height: 22px;
      font-weight: 500;
    }

    .desc {
      font-size: 12px !important;
      font-weight: normal;
    }
  }
`;

interface SceneRoleConfigCardProps {
  roleMetadata: SceneRoleDefinition;
  config?: WebUIRoleMetricConfig;
  evaluatorHandledMetrics?: string[];
  onConfigChange: (newActionConfig: WebUIRoleMetricConfig) => void;
}

const SceneRoleConfigCard = (props: SceneRoleConfigCardProps) => {
  const theme = useTheme();
  const primaryColorShades = useMemo(() => {
    return generateColorShades(theme.colorPrimary);
  }, [theme.colorPrimary]);

  const { metrics, checkedMetrics } = useMemo(() => {
    const metrics: string[] = [];
    const checkedMetrics: string[] = [];
    props.roleMetadata.actions.forEach((action) => {
      action.metrics?.forEach((metric) => {
        const metricKey = `${props.roleMetadata.name}.${action.name}.${metric.name}`;
        metrics.push(metricKey);
        if (props.config?.actions_config[action.name]?.metrics_config[metric.name]?.enable) {
          checkedMetrics.push(metricKey);
        }
      });
    });
    return { metrics, checkedMetrics };
  }, [props.roleMetadata, props.config]);
  const allMetricsChecked = metrics.length === checkedMetrics.length;

  return (
    <CustomCollapseWrapper>
      <Collapse
        defaultActiveKey={['main']}
        size={'small'}
        style={{
          width: '100%',
          ...(checkedMetrics.length > 0
            ? {
                border: `1px solid ${allMetricsChecked ? primaryColorShades[5] : primaryColorShades[2]}`,
              }
            : {}),
        }}
        items={[
          {
            key: 'main',
            label: (
              <GroupTitle>
                <div
                  className="checkboxArea"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (allMetricsChecked) {
                      const newConfig = {
                        actions_config: {},
                      };
                      props.onConfigChange(newConfig);
                    } else {
                      const newConfig: WebUIRoleMetricConfig = {
                        actions_config: {},
                      };
                      props.roleMetadata.actions.forEach((action) => {
                        newConfig.actions_config[action.name] = {
                          metrics_config: {},
                        };
                        action.metrics?.forEach((metric) => {
                          newConfig.actions_config[action.name].metrics_config[metric.name] = {
                            enable: true,
                          };
                        });
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
                  <div className={'title'}>{props.roleMetadata.name} Role</div>
                  <div className="desc">{props.roleMetadata.description}</div>
                </div>
              </GroupTitle>
            ),
            children: (
              <Flex
                justify={'flex-start'}
                align={'flex-start'}
                wrap={'wrap'}
                style={{
                  width: '100%',
                }}
              >
                {props.roleMetadata.actions.map((action) => {
                  return (
                    <SceneActionConfigCard
                      actionDefinition={action}
                      config={props.config ? props.config.actions_config[action.name] : undefined}
                      evaluatorHandledMetrics={props.evaluatorHandledMetrics}
                      onConfigChange={(newActionConfig) => {
                        const newConfig: WebUIRoleMetricConfig = { actions_config: {}, ...props.config };
                        newConfig.actions_config[action.name] = newActionConfig;
                        props.onConfigChange(newConfig);
                      }}
                    />
                  );
                })}
              </Flex>
            ),
          },
        ]}
      />
    </CustomCollapseWrapper>
  );
};

export default SceneRoleConfigCard;
