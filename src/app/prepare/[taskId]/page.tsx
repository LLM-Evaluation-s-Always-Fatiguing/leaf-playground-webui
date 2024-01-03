'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getRoleAgentConfigsMapFromCreateSceneParams } from '@/types/server/CreateSceneParams';
import { WebsocketMessage } from '@/types/server/WebsocketMessage';
import { Card, Collapse, Flex, Space, message } from 'antd';
import styled from '@emotion/styled';
import AgentCard from '@/components/agent/AgentCard';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import SceneInfoBoard from '@/components/homepage/SceneInfoBoard';
import LocalAPI from '@/services/local';
import ServerAPI from '@/services/server';
import useGlobalStore from '@/stores/global';

const PageContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: stretch;
  position: relative;

  .loadingArea {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    backdrop-filter: blur(10px);
    z-index: 50;
  }
`;

const InfoArea = styled.div`
  width: 50%;
  border-right: 1px solid ${(props) => props.theme.dividerColor};
`;

const AgentsArea = styled.div`
  width: 50%;
`;

const CustomCollapseWrapper = styled.div`
  .ant-collapse {
    border-radius: 0;
    border: none;

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

const ProcessingPage = ({
  params,
}: {
  params: {
    taskId: string;
  };
}) => {
  const taskId = params.taskId;
  const router = useRouter();
  const searchParams = useSearchParams();
  const serverUrl = searchParams.get('serverUrl');
  const bundlePath = searchParams.get('bundlePath');
  const hostBaseUrl = searchParams.get('hostBaseUrl');
  const agentId = searchParams.get('agentId');

  const globalStore = useGlobalStore();

  const pageVisible = useRef(true);
  const [loading, setLoading] = useState(true);
  const [loadingTip, setLoadingTip] = useState('Loading...');
  const [agentConnectedMap, setAgentConnectedMap] = useState<Record<string, boolean>>({});
  const wsRef = useRef<WebSocket>();
  const wsOpenRef = useRef(false);
  const [wsConnected, setWSConnected] = useState(false);

  const pageFinished = useRef(false);

  const checkAgentsStatus = async () => {
    try {
      let wait = true;
      while (wait) {
        if (pageFinished.current || !pageVisible.current) {
          wait = false;
          return;
        }
        const agentConnectedStatusResp = await ServerAPI.sceneTask.getAgentConnectedStatus(serverUrl || '');
        setAgentConnectedMap(agentConnectedStatusResp);
        const allConnected = Object.entries(agentConnectedStatusResp).every(([agentId, connected]) => connected);
        if (!allConnected) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
        } else {
          router.push(
            `/processing/${taskId}?serverUrl=${encodeURIComponent(serverUrl!)}&bundlePath=${encodeURIComponent(
              bundlePath!
            )}${agentId ? `&agentId=${encodeURIComponent(agentId)}` : ''}`
          );
          pageFinished.current = true;
        }
      }
    } catch (e) {
      console.error(e);
      message.error('Check agents connection status failed!');
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      pageVisible.current = document.visibilityState === 'visible';
      if (pageVisible.current) {
        checkAgentsStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const prepare = async () => {
      if (!taskId || !bundlePath || !serverUrl) {
        message.error('Page params is not valid!');
        router.replace('/');
        return;
      }
      try {
        setLoadingTip('Connecting to server...');
        const webuiBundle = await LocalAPI.taskBundle.webui.get(bundlePath!);
        globalStore.updateInfoFromWebUITaskBundle(webuiBundle);
        globalStore.updatePageTitle(globalStore.currentScene?.scene_metadata.scene_definition.name || '');
        if (agentId && !wsRef.current) {
          wsRef.current = new WebSocket(`ws://${serverUrl.replace(/^(http:\/\/|https:\/\/)/, '')}/ws/human/${agentId}`);

          wsRef.current.onopen = function () {
            wsOpenRef.current = true;
            setWSConnected(true);
            console.info('WebSocket opened');
            setLoading(false);
          };

          wsRef.current.onmessage = async (event) => {
            const wsMessage: WebsocketMessage = JSON.parse(JSON.parse(event.data));
            console.info('WebSocket Received Message:', wsMessage);
          };

          wsRef.current.onerror = (error) => {
            console.error('WebSocket Error:', error);
          };

          wsRef.current.onclose = () => {
            wsOpenRef.current = false;
            setWSConnected(false);
            console.info('WebSocket closed.');
            if (pageFinished.current) return;
            pageFinished.current = true;
            message.error(
              "The connection to the server has failed. It's possible that it's currently in use. Please refresh your page and give it another shot.",
              5
            );
            setLoadingTip('Connect failed.');
            setLoading(true);
          };
        }
        setLoading(false);
      } catch (e) {
        console.error(e);
      }
      checkAgentsStatus();
    };

    prepare();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = undefined;
      }
    };
  }, []);

  const scene = globalStore.currentScene;
  const roleAgentConfigsMap = globalStore.createSceneParams
    ? getRoleAgentConfigsMapFromCreateSceneParams(globalStore.createSceneParams)
    : {};

  return (
    <PageContainer>
      <LoadingOverlay spinning={loading} tip={loadingTip} />
      {!loading && !!scene && (
        <>
          <InfoArea>
            <SceneInfoBoard scene={globalStore.currentScene} displayMode={true} onStartClick={async () => {}} />
          </InfoArea>
          <AgentsArea>
            <Card
              title={
                <Flex align={'center'}>
                  <div
                    style={{
                      fontSize: 16,
                    }}
                  >
                    Agents Connection Status
                  </div>
                </Flex>
              }
              bordered={false}
              style={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyItems: 'stretch',
              }}
              headStyle={{
                padding: '0 15px',
              }}
              bodyStyle={{
                padding: 0,
                overflow: 'hidden auto',
              }}
            >
              <CustomCollapseWrapper>
                <Collapse
                  defaultActiveKey={scene.scene_metadata.scene_definition.roles.map((r) => r.name)}
                  items={scene.scene_metadata.scene_definition.roles
                    .filter((r) => !r.is_static)
                    .map((role, index) => {
                      const maxAgents =
                        role.num_agents_range[1] > 0 ? role.num_agents_range[1] : Number.MAX_SAFE_INTEGER;
                      return {
                        key: role.name,
                        label: `${role.name} Agents`,
                        children: (
                          <Space wrap={true}>
                            {(roleAgentConfigsMap[role.name] || []).map((agentConfig, index) => {
                              const agentsMetadata = scene.agents_metadata[role.name];
                              const sceneAgentMeta = agentsMetadata.find(
                                (m) => m.obj_for_import.obj === agentConfig.obj_for_import.obj
                              );
                              const joinLink = `${hostBaseUrl}/prepare/${taskId}?serverUrl=${encodeURIComponent(
                                serverUrl!
                              )}&bundlePath=${encodeURIComponent(bundlePath!)}&hostBaseUrl=${encodeURIComponent(
                                hostBaseUrl!
                              )}&agentId=${encodeURIComponent(agentConfig.config_data.profile.id)}`;
                              const you = agentConfig.config_data.profile.id === agentId;
                              return (
                                <AgentCard
                                  key={index}
                                  role={'agent'}
                                  showConnectionStatus={true}
                                  joinLink={sceneAgentMeta?.is_human ? joinLink : undefined}
                                  connected={you ? wsConnected : agentConnectedMap[agentConfig.config_data.profile.id]}
                                  youMark={you}
                                  sceneAgentMeta={sceneAgentMeta}
                                  sceneAgentConfig={agentConfig}
                                  onEditButtonClick={() => {}}
                                  onDeleteButtonClick={() => {}}
                                />
                              );
                            })}
                          </Space>
                        ),
                      };
                    })}
                />
              </CustomCollapseWrapper>
            </Card>
          </AgentsArea>
        </>
      )}
    </PageContainer>
  );
};

export default ProcessingPage;
