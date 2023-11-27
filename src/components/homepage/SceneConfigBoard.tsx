'use client';

import Scene from '@/types/server/Scene';
import styled from '@emotion/styled';
import { Button, Card, Collapse, message, Space } from 'antd';
import { Form } from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { useMemo, useState } from 'react';
import SelectAgentModal from '@/components/agent/SelectAgentModal';
import FormilyDefaultSchemaField from '@/components/formily/FormilyDefaultSchemaField';
import CreateOrUpdateAgentModal from '@/components/agent/CreateOrUpdateAgentModal';
import SceneAgentConfigData, { SceneAgentDefinition } from '@/types/server/Agent';
import AgentCard from '@/components/agent/AgentCard';
import totalSceneConfig from '@/utils/temp/scene-config';
import { useRouter } from 'next/navigation';

const Container = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
`;

const Content = styled.div`
  flex-grow: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  overflow: hidden auto;
`;

const Footer = styled.div`
  flex-shrink: 0;
  width: 100%;
  height: 85px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;

  padding: 0 20px;

  border-top: 1px solid ${(props) => props.theme.dividerColor};
`;

interface SceneConfigBoardProps {
  scene: Scene;
}

const SceneConfigBoard = (props: SceneConfigBoardProps) => {
  const router = useRouter();

  const sceneForm = useMemo(() => {
    return createForm({
      validateFirst: true,
    });
  }, []);
  const sceneAdditionalForm = useMemo(() => {
    return createForm({
      validateFirst: true,
      initialValues: {
        dataset_config: {
          path: 'AsakusaRinne/gaokao_bench',
          name: '2010-2022_History_MCQs',
          split: 'dev',
          question_column: 'question',
          golden_answer_column: 'answer',
        },
      },
    });
  }, []);

  const [selectAgentModalOpen, setSelectAgentModalOpen] = useState(false);
  const [sceneAgentConfigs, setSceneAgentConfigs] = useState<SceneAgentConfigData[]>([]);
  const [operatingAgentDefinition, setOperatingAgentDefinition] = useState<SceneAgentDefinition>();
  const [operatingAgentConfigIndex, setOperatingAgentConfigIndex] = useState(-1);
  const [createOrUpdateAgentModalOpen, setCreateOrUpdateAgentModalOpen] = useState(false);

  const minAgentsCount = useMemo(() => {
    const noStaticRolesCount = props.scene.scene_metadata.role_definitions
      .filter((d) => !d.is_static)
      .map((d) => props.scene.role_agents_num[d.name]);
    return noStaticRolesCount.reduce((total, current) => {
      return total + (current === -1 ? 1 : current);
    }, 0);
  }, [props.scene]);

  const maxAgentsCount = useMemo(() => {
    const noStaticRolesCount = props.scene.scene_metadata.role_definitions
      .filter((d) => !d.is_static)
      .map((d) => props.scene.role_agents_num[d.name]);
    let maxAgentsCount = noStaticRolesCount.some((c) => c === -1) ? -1 : 0;
    if (maxAgentsCount >= 0) {
      maxAgentsCount = noStaticRolesCount.reduce((total, current) => {
        return total + current;
      }, 0);
    }
    return maxAgentsCount;
  }, [props.scene]);

  console.log(props.scene);
  return (
    <>
      <Container>
        <Content>
          <Space direction={'vertical'}>
            <Card
              title={'Scene Parameters'}
              bodyStyle={{
                padding: 0,
                overflow: 'hidden',
              }}
            >
              <Collapse
                defaultActiveKey={['basic', 'additional']}
                style={{
                  borderRadius: 0,
                  border: 'none',
                }}
                items={[
                  {
                    key: 'basic',
                    label: 'Basic',
                    children: (
                      <Form
                        form={sceneForm}
                        labelCol={5}
                        wrapperCol={16}
                        onAutoSubmit={console.log}
                        onAutoSubmitFailed={console.log}
                      >
                        <FormilyDefaultSchemaField schema={props.scene.sceneInfoConfigFormilySchema} />
                      </Form>
                    ),
                    style: {
                      borderRadius: 0,
                      borderLeft: 'none',
                      borderRight: 'none',
                    },
                  },
                  {
                    key: 'additional',
                    label: 'Additional',
                    children: (
                      <Form
                        form={sceneAdditionalForm}
                        labelCol={5}
                        wrapperCol={16}
                        onAutoSubmit={console.log}
                        onAutoSubmitFailed={console.log}
                      >
                        <FormilyDefaultSchemaField schema={props.scene.additionalConfigFormilySchema} />
                      </Form>
                    ),
                    style: {
                      borderRadius: 0,
                      border: 'none',
                    },
                  },
                ]}
              />
            </Card>
            <Card title={`Agent List (At least ${minAgentsCount} agent${minAgentsCount > 1 ? 's' : ''})`}>
              <Space>
                {(maxAgentsCount <= 0 || sceneAgentConfigs.length <= maxAgentsCount) && (
                  <AgentCard
                    role={'add'}
                    agentsConfigFormilySchemas={props.scene.agentsConfigFormilySchemas}
                    onAddNewClick={() => {
                      setSelectAgentModalOpen(true);
                    }}
                  />
                )}
                {sceneAgentConfigs.map((agentConfig, index) => {
                  return (
                    <AgentCard
                      key={index}
                      role={'agent'}
                      agentsConfigFormilySchemas={props.scene.agentsConfigFormilySchemas}
                      sceneAgentConfigData={agentConfig}
                    />
                  );
                })}
              </Space>
            </Card>
          </Space>
        </Content>
        <Footer>
          <Button
            size={'large'}
            type={'primary'}
            style={{
              minWidth: '120px',
              fontSize: '18px',
              lineHeight: '1.2',
            }}
            onClick={async () => {
              try {
                // sceneForm.validate();
                await sceneAdditionalForm.validate();
                if (sceneAgentConfigs.length < minAgentsCount) {
                  message.error(`At least ${minAgentsCount} agent${minAgentsCount > 1 ? 's' : ''} are required.`);
                  return;
                }
                const sceneConfig = {
                  environments: {},
                  ...sceneForm.values
                };
                const additionalConfig = sceneAdditionalForm.values;
                const finalConfig = {
                  id: props.scene.id,
                  scene_info_config_data: sceneConfig,
                  scene_agents_config_data: sceneAgentConfigs,
                  additional_config_data: additionalConfig,
                };
                console.log(finalConfig);
                totalSceneConfig.config = finalConfig;
                router.push('/processing');
              } catch (e) {
                console.error(e);
              }
            }}
          >
            Start
          </Button>
        </Footer>
      </Container>
      <SelectAgentModal
        open={selectAgentModalOpen}
        agentsConfigFormilySchemas={props.scene.agentsConfigFormilySchemas}
        onSubmit={(agentDefinition) => {
          setOperatingAgentDefinition(agentDefinition);
          setSelectAgentModalOpen(false);
          setCreateOrUpdateAgentModalOpen(true);
        }}
        onNeedClose={() => {
          setSelectAgentModalOpen(false);
        }}
      />
      <CreateOrUpdateAgentModal
        open={createOrUpdateAgentModalOpen}
        sceneAgentConfigData={operatingAgentConfigIndex >= 0 ? sceneAgentConfigs[operatingAgentConfigIndex] : undefined}
        sceneAgentDefinition={operatingAgentDefinition}
        onSubmit={(agentConfig) => {
          if (operatingAgentConfigIndex >= 0) {
            const newSceneAgentConfigs = [...sceneAgentConfigs];
            newSceneAgentConfigs[operatingAgentConfigIndex] = agentConfig;
            setSceneAgentConfigs(newSceneAgentConfigs);
          } else {
            setSceneAgentConfigs([...sceneAgentConfigs, agentConfig]);
          }
          setOperatingAgentConfigIndex(-1);
          setOperatingAgentDefinition(undefined);
          setCreateOrUpdateAgentModalOpen(false);
        }}
        onNeedClose={() => {
          setOperatingAgentConfigIndex(-1);
          setOperatingAgentDefinition(undefined);
          setCreateOrUpdateAgentModalOpen(false);
        }}
      />
    </>
  );
};

export default SceneConfigBoard;
