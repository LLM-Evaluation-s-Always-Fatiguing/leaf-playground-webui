import { useMemo, useState } from 'react';
import { SceneRoleDefinition } from '@/types/server/meta/Scene';
import { WebUIRoleMetricConfig } from '@/types/webui/MetricConfig';
import { Card, Checkbox, Collapse, Flex } from 'antd';
import { useTheme } from 'antd-style';
import styled from '@emotion/styled';
import SceneActionConfigCard from '@/components/homepage/SceneConfigBoard/SceneActionConfigCard';
import { generateColorShades } from '@/utils/color/generate-color-shades';

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
  user-select: none;

  .checkboxArea {
    padding-right: 10px;
    align-self: stretch;
    cursor: pointer;
  }

  .info {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    cursor: pointer;

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
  highlightMetrics: string[];
  onConfigChange: (newActionConfig: WebUIRoleMetricConfig) => void;
}

const SceneRoleConfigCard = (props: SceneRoleConfigCardProps) => {
  const theme = useTheme();
  const primaryColorShades = useMemo(() => {
    return generateColorShades(theme.colorPrimary);
  }, [theme.colorPrimary]);

  const [collapsed, setCollapsed] = useState<boolean>(false);

  const { allMetrics, checkedMetrics } = useMemo(() => {
    const allMetrics: string[] = [];
    const checkedMetrics: string[] = [];
    props.roleMetadata.actions.forEach((action) => {
      action.metrics?.forEach((metric) => {
        const metricKey = `${props.roleMetadata.name}.${action.name}.${metric.name}`;
        allMetrics.push(metricKey);
        if (props.config?.actions_config[action.name]?.metrics_config[metric.name]?.enable) {
          checkedMetrics.push(metricKey);
        }
      });
    });
    return { allMetrics, checkedMetrics };
  }, [props.roleMetadata, props.config]);
  const allMetricsChecked = allMetrics.length === checkedMetrics.length;

  const highlighted = useMemo(() => {
    return props.highlightMetrics.some((metric) => {
      return allMetrics.includes(metric);
    });
  }, [props.highlightMetrics, allMetrics]);

  const onCheckAllTrigger = () => {
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
  };

  return (
    <CustomCollapseWrapper>
      <Collapse
        activeKey={collapsed ? undefined : 'main'}
        onChange={() => {
          setCollapsed(!collapsed);
        }}
        collapsible={'icon'}
        size={'small'}
        style={{
          width: '100%',
          ...(checkedMetrics.length > 0
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
        items={[
          {
            key: 'main',
            label: (
              <GroupTitle>
                <div
                  className="checkboxArea"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCheckAllTrigger();
                  }}
                >
                  <Checkbox
                    checked={allMetricsChecked}
                    style={{
                      pointerEvents: 'none',
                    }}
                  />
                </div>
                <div
                  className="info"
                  onClick={() => {
                    onCheckAllTrigger();
                  }}
                >
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
                {props.roleMetadata.actions.map((action, index) => {
                  return (
                    <SceneActionConfigCard
                      key={index}
                      roleName={props.roleMetadata.name}
                      actionDefinition={action}
                      config={props.config ? props.config.actions_config[action.name] : undefined}
                      evaluatorHandledMetrics={props.evaluatorHandledMetrics}
                      highlightMetrics={props.highlightMetrics}
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
