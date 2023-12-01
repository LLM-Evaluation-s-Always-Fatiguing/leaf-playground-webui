'use client';

import { Card } from 'antd';
import SceneAgentConfig from '@/types/server/Agent';
import styled from '@emotion/styled';
import { FiPlus } from 'react-icons/fi';
import { FaCheck } from 'react-icons/fa6';
import { RiRobot2Fill } from 'react-icons/ri';
import { MdClose, MdOutlineSettings } from 'react-icons/md';
import { useMemo } from 'react';
import { useTheme } from 'antd-style';
import FormilyJSONSchema from '@/types/FormilyJSONSchema';

const AddContent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 32px;
  color: ${(props) => props.theme.colorPrimary};
`;

const AgentContent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 16px 12px 0 12px;
  overflow: hidden;
  position: relative;

  .avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    font-size: 28px;
    background: ${(props) => props.theme.colorFillSecondary};
    color: ${(props) => props.theme.colorPrimary};
  }

  .name {
    align-self: stretch;
    font-size: 18px;
    font-weight: 500;
    margin-top: 8px;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .infoArea {
    align-self: stretch;
    margin-top: 8px;
    flex-grow: 1;
    overflow: hidden auto;
  }

  .connectionStatus {
    align-self: stretch;
    flex-shrink: 0;
    height: 40px;
    margin-top: 8px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }

  .editButton {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 40px;
    height: 40px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    font-size: 21px;
    color: ${(props) => props.theme.colorPrimary};
    cursor: pointer;
  }

  .deleteButton {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 40px;
    height: 40px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    font-size: 21px;
    color: ${(props) => props.theme.colorError};
    cursor: pointer;
    visibility: hidden;
  }

  :hover {
    .deleteButton {
      visibility: visible;
    }
  }
`;

interface AgentCardProps {
  role: 'agent' | 'add';
  sceneAgentConfig?: SceneAgentConfig;
  agentsConfigFormilySchemas: Record<string, FormilyJSONSchema>;
  onAddNewClick?: () => void;
  onEditButtonClick?: () => void;
  onDeleteButtonClick?: () => void;
}

const AgentCard = (props: AgentCardProps) => {
  const theme = useTheme();

  const isAddCard = props.role === 'add';

  const requiredBackendConfigs = useMemo(() => {
    if (!props.sceneAgentConfig) return [];
    return (props.agentsConfigFormilySchemas[props.sceneAgentConfig.agent_id].properties?.ai_backend_config.required ||
      []) as string[];
  }, [props.sceneAgentConfig, props.agentsConfigFormilySchemas]);

  const displayKV = Object.entries(props.sceneAgentConfig?.agent_config_data.ai_backend_config || {}).filter(([key]) =>
    requiredBackendConfigs.includes(key)
  );

  return (
    <Card
      hoverable={props.role === 'agent'}
      style={
        isAddCard
          ? {
              borderStyle: 'dashed',
            }
          : {}
      }
      bodyStyle={{
        width: 180,
        height: 260,
        cursor: isAddCard ? 'pointer' : 'default',
        padding: 0,
      }}
      onClick={() => {
        if (isAddCard) {
          props.onAddNewClick?.();
        }
      }}
    >
      {isAddCard ? (
        <AddContent className="addArea">
          <FiPlus />
        </AddContent>
      ) : (
        <AgentContent>
          <div
            className="avatar"
            style={
              props.sceneAgentConfig?.agent_config_data.chart_major_color
                ? {
                    color: props.sceneAgentConfig.agent_config_data.chart_major_color,
                  }
                : {}
            }
          >
            <RiRobot2Fill size={'1em'} />
          </div>
          <div className="name">{props.sceneAgentConfig?.agent_config_data.profile.name}</div>
          <div className="infoArea">
            {displayKV.map((kv, index) => {
              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 500,
                    }}
                  >
                    {kv[0]}
                  </div>
                  <div>{kv[1]}</div>
                </div>
              );
            })}
          </div>
          <div className="connectionStatus">
            <FaCheck
              style={{
                color: theme.colorSuccess,
              }}
            />
            <div
              style={{
                marginLeft: '3px',
                color: theme.colorSuccess,
                fontWeight: 500,
              }}
            >
              Connected
            </div>
          </div>
          <div
            className="editButton"
            onClick={() => {
              props.onEditButtonClick?.();
            }}
          >
            <MdOutlineSettings size={'1em'} />
          </div>
          <div
            className="deleteButton"
            onClick={() => {
              props.onDeleteButtonClick?.();
            }}
          >
            <MdClose size={'1em'} />
          </div>
        </AgentContent>
      )}
    </Card>
  );
};

export default AgentCard;
