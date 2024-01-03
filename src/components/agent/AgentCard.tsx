'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import SceneAgentConfig from '@/types/server/config/Agent';
import SceneAgentMetadata from '@/types/server/meta/Agent';
import { Card } from 'antd';
import { useTheme } from 'antd-style';
import styled from '@emotion/styled';
import { FaCheck } from 'react-icons/fa6';
import { FiPlus } from 'react-icons/fi';
import { IoMdPerson } from 'react-icons/io';
import { MdClose, MdOutlineErrorOutline, MdOutlineSettings } from 'react-icons/md';
import { RiRobot2Fill } from 'react-icons/ri';
import { copyToClipboard } from '@/utils/clipboard';

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
    margin-top: 0;
    flex-grow: 1;
    overflow: hidden auto;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
  }

  .gameLinkArea {
    margin-top: 20px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;

    .copyLink {
      color: ${(props) => props.theme.colorLink};
      cursor: pointer;

      :hover {
        color: ${(props) => props.theme.colorLinkHover};
      }
    }
  }

  .youMark {
    flex-shrink: 0;
    font-weight: 500;
    font-size: 16px;
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
  displayMode?: boolean;
  sceneAgentConfig?: SceneAgentConfig;
  sceneAgentMeta?: SceneAgentMetadata;
  showConnectionStatus?: boolean;
  joinLink?: string;
  connected?: boolean;
  youMark?: boolean;
  onAddNewClick?: () => void;
  onEditButtonClick?: () => void;
  onDeleteButtonClick?: () => void;
}

const AgentCard = (props: AgentCardProps) => {
  const theme = useTheme();

  const isAddCard = props.role === 'add';
  const displayMode = !!props.displayMode;

  const requiredBackendConfigs = useMemo(() => {
    if (!props.sceneAgentConfig) return [];
    return (props.sceneAgentMeta?.configSchema?.properties?.ai_backend_config?.required || []) as string[];
  }, [props.sceneAgentConfig, props.sceneAgentMeta]);

  const displayKV = Object.entries(props.sceneAgentConfig?.config_data.ai_backend_config || {}).filter(([key]) =>
    requiredBackendConfigs.includes(key)
  );

  const isHuman = !!props.sceneAgentMeta?.is_human;

  return (
    <Card
      hoverable={props.role === 'agent'}
      style={
        isAddCard
          ? {
              borderStyle: 'dashed',
            }
          : props.youMark
            ? props.sceneAgentConfig?.config_data.chart_major_color
              ? {
                  borderColor: props.sceneAgentConfig.config_data.chart_major_color,
                }
              : {}
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
              props.sceneAgentConfig?.config_data.chart_major_color
                ? {
                    color: props.sceneAgentConfig.config_data.chart_major_color,
                  }
                : {}
            }
          >
            {isHuman ? <IoMdPerson size={'1.1em'} /> : <RiRobot2Fill size={'1em'} />}
          </div>
          <div
            className="name"
            style={
              props.youMark
                ? props.sceneAgentConfig?.config_data.chart_major_color
                  ? {
                      color: props.sceneAgentConfig.config_data.chart_major_color,
                    }
                  : {}
                : {}
            }
          >
            {props.sceneAgentConfig?.config_data.profile.name}
          </div>
          <div className="infoArea">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                wordBreak: 'break-all',
              }}
            >
              {props.sceneAgentMeta?.cls_name}
            </div>
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
          {props.joinLink && !props.connected && (
            <div className="gameLinkArea">
              <Link rel="stylesheet" href={props.joinLink} target={'_blank'}>
                Join Game
              </Link>
              <div
                className="copyLink"
                onClick={() => {
                  copyToClipboard(props.joinLink!);
                }}
              >
                （ Copy Link ）
              </div>
            </div>
          )}
          {props.youMark && (
            <div
              className="youMark"
              style={
                props.youMark
                  ? props.sceneAgentConfig?.config_data.chart_major_color
                    ? {
                        color: props.sceneAgentConfig.config_data.chart_major_color,
                      }
                    : {}
                  : {}
              }
            >
              You
            </div>
          )}
          {!displayMode && props.showConnectionStatus && (
            <div className="connectionStatus">
              {!isHuman || props.connected ? (
                <FaCheck
                  style={{
                    color: theme.colorSuccess,
                  }}
                />
              ) : (
                <MdOutlineErrorOutline
                  style={{
                    color: theme.colorError,
                  }}
                />
              )}
              <div
                style={{
                  marginLeft: '3px',
                  color: !isHuman || props.connected ? theme.colorSuccess : theme.colorError,
                  fontWeight: 500,
                }}
              >
                {!isHuman || props.connected ? 'Connected' : 'Waiting...'}
              </div>
            </div>
          )}
          {!displayMode && !props.showConnectionStatus && (
            <div className="connectionStatus">
              <div
                style={{
                  marginLeft: '3px',
                  fontWeight: 500,
                }}
              >
                {isHuman ? 'Human' : 'AI'}
              </div>
            </div>
          )}
          {!props.showConnectionStatus && (
            <div
              className="editButton"
              onClick={() => {
                props.onEditButtonClick?.();
              }}
            >
              <MdOutlineSettings size={'1em'} />
            </div>
          )}
          {!displayMode && !props.showConnectionStatus && (
            <div
              className="deleteButton"
              onClick={() => {
                props.onDeleteButtonClick?.();
              }}
            >
              <MdClose size={'1em'} />
            </div>
          )}
        </AgentContent>
      )}
    </Card>
  );
};

export default AgentCard;
