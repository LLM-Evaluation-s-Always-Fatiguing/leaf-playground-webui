import EvaluatorMetadata from '@/types/server/meta/Evaluator';
import { Card, Tooltip } from 'antd';
import styled from '@emotion/styled';
import { useTheme } from 'antd-style';
import { MetricEvaluatorObjConfig } from '@/types/server/config/Evaluator';
import { FluentBotSparkle20Filled } from '@/components/evaluator/EvaluatorAvatar';
import { FluentSparkle20Filled } from '@/components/homepage/EvaluatorMark';
import { MdOutlineSettings } from 'react-icons/md';

const Content = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  overflow: hidden;
  position: relative;

  .metadataArea {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    padding: 16px 12px 0 12px;

    .avatar {
      width: 60px;
      height: 60px;
      flex-shrink: 0;
      border-radius: 50%;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      font-size: 28px;
      background: ${(props) => props.theme.colorFillSecondary};
      color: ${(props) => props.theme.colorFill};
    }

    .infoArea {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      margin-left: 8px;
      color: ${(props) => props.theme.colorTextDisabled};

      .name {
        font-size: 17px;
        font-weight: 500;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
      }

      .description {
        margin-top: 0;
        font-size: 14px;
        line-height: 1.2;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  .footer {
    margin-top: 20px;
    height: 40px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    position: relative;
    background: ${(props) => props.theme.colorFillQuaternary};
    padding: 0 16px;

    .configStatus {
      height: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      gap: 6px;
      color: ${(props) => props.theme.colorTextDisabled};

      :hover {
        font-weight: 500;
        color: ${(props) => props.theme.colorPrimary} !important;
      }
    }

    .configStatus.enabled {
      color: ${(props) => props.theme.colorText};
    }

    .enableBG {
      position: absolute;
      right: 0;
      bottom: 0;
      height: 100%;
      width: 40px;
      opacity: 0.3;
      z-index: 2;

      :after {
        content: '';
        position: absolute;
        right: 0;
        bottom: 0;
        width: 0;
        height: 0;
        border-left: 40px solid transparent;
        border-bottom: 40px solid ${(props) => props.theme.colorPrimary};
      }
    }

    .enableDecoration {
      position: absolute;
      right: 0;
      bottom: -6px;
      font-size: 21px;
      color: white;
      z-index: 3;
    }
  }
`;

interface EvaluatorCardProps {
  enable: boolean;
  metadata: EvaluatorMetadata;
  config?: MetricEvaluatorObjConfig;
  onEnable?: (metadata: EvaluatorMetadata, config?: MetricEvaluatorObjConfig) => void;
  onDisable?: () => void;
  onEditConfig?: (metadata: EvaluatorMetadata, config: MetricEvaluatorObjConfig) => void;
  onHover?: () => void;
  onHoverLeave?: () => void;
}

const EvaluatorCard = (props: EvaluatorCardProps) => {
  const theme = useTheme();
  const noNeedConfig =
    !props.metadata.config_schema.properties || Object.keys(props.metadata.config_schema.properties).length === 0;
  const configured = !!props.config;

  return (
    <Card
      hoverable
      style={{
        padding: 0,
        overflow: 'hidden',
        border: 'none',
      }}
      bodyStyle={{
        width: 320,
        height: 136,
        cursor: 'pointer',
        padding: 0,
        borderRadius: '8px',
        ...(props.enable
          ? {
              border: `1px solid ${theme.colorPrimary}`,
            }
          : {}),
      }}
      onMouseEnter={() => {
        props.onHover?.();
      }}
      onMouseLeave={() => {
        props.onHoverLeave?.();
      }}
      onClick={() => {
        if (props.enable) {
          props.onDisable?.();
        } else {
          if (configured) {
            props.onEnable?.(props.metadata, props.config!);
          } else {
            if (noNeedConfig) {
              props.onEnable?.(props.metadata, {
                evaluator_obj: props.metadata.obj_for_import,
                evaluator_config_data: {},
              });
            } else {
              props.onEnable?.(props.metadata);
            }
          }
        }
      }}
    >
      <Content>
        <div className="metadataArea">
          <div
            className="avatar"
            style={
              props.enable
                ? {
                    color: theme.colorPrimary,
                  }
                : {}
            }
          >
            <FluentBotSparkle20Filled />
          </div>
          <div className="infoArea">
            <div
              className="name"
              style={
                props.enable
                  ? {
                      color: theme.colorText,
                    }
                  : {}
              }
            >
              {props.metadata.cls_name}
            </div>
            <Tooltip title={props.metadata.description}>
              <div
                className="description"
                style={
                  props.enable
                    ? {
                        color: theme.colorTextSecondary,
                      }
                    : {}
                }
              >
                {props.metadata.description}
              </div>
            </Tooltip>
          </div>
        </div>
        <div className="footer">
          <div
            className={`configStatus ${props.enable ? 'enabled' : ''}`}
            style={
              !noNeedConfig && configured
                ? {}
                : {
                    pointerEvents: 'none',
                  }
            }
            onClick={(e) => {
              e.stopPropagation();
              props.onEditConfig?.(props.metadata, props.config!);
            }}
          >
            {noNeedConfig ? 'No manual config required.' : configured ? 'Configured' : 'Click to configure'}
            {!noNeedConfig && configured && <MdOutlineSettings />}
          </div>
          <div className="enableDecoration">
            <FluentSparkle20Filled />
          </div>
          {props.enable && (
            <div
              className="enableBG"
              style={
                props.enable
                  ? {
                      opacity: 1,
                    }
                  : {}
              }
            ></div>
          )}
        </div>
      </Content>
    </Card>
  );
};

export default EvaluatorCard;
