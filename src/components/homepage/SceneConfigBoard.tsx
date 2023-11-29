'use client';

import Scene from '@/types/server/Scene';
import styled from '@emotion/styled';
import { Button, Card, Collapse, message, Space } from 'antd';
import { Form } from '@formily/antd-v5';
import { createForm, onFormValuesChange } from '@formily/core';
import { useMemo, useRef, useState } from 'react';
import SelectAgentModal from '@/components/agent/SelectAgentModal';
import FormilyDefaultSchemaField from '@/components/formily/FormilyDefaultSchemaField';
import CreateOrUpdateAgentModal from '@/components/agent/CreateOrUpdateAgentModal';
import SceneAgentConfig, { SceneAgentDefinition } from '@/types/server/Agent';
import AgentCard from '@/components/agent/AgentCard';
import { useRouter } from 'next/navigation';
import merge from 'lodash/merge';
import { DefaultSceneInfoConfig } from '@/models/scene';
import RunSceneConfig from '@/types/server/RunSceneConfig';
import useGlobalStore from '@/stores/global';
import ServerAPI from '@/services/server';
import { FormItem } from '@formily/antd-v5';
import EvaluatorConfig, { EvaluatorConfigData } from '@/types/server/Evaluator';

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

const SceneConfigBoard = ({ scene }: SceneConfigBoardProps) => {
  const router = useRouter();
  const globalStore = useGlobalStore();

  const creatingSceneRef = useRef(false);
  const [creatingScene, setCreatingScene] = useState(false);

  const sceneForm = useMemo(() => {
    return createForm({
      validateFirst: true,
    });
  }, []);
  const sceneAdditionalForm = useMemo(() => {
    return createForm({
      validateFirst: true,
    });
  }, []);
  const [assessmentMethod, setAssessmentMethod] = useState('human');
  const evaluatorForm = useMemo(() => {
    return createForm({
      validateFirst: true,
      effects() {
        onFormValuesChange((form) => {
          setAssessmentMethod(form.values.assessment_method);
        });
      },
    });
  }, []);

  const [selectAgentModalOpen, setSelectAgentModalOpen] = useState(false);
  const [sceneAgentConfigs, setSceneAgentConfigs] = useState<SceneAgentConfig[]>([]);
  const [operatingAgentDefinition, setOperatingAgentDefinition] = useState<SceneAgentDefinition>();
  const [operatingAgentConfigIndex, setOperatingAgentConfigIndex] = useState(-1);
  const [createOrUpdateAgentModalOpen, setCreateOrUpdateAgentModalOpen] = useState(false);

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
                defaultActiveKey={['basic', 'additional', 'assessment']}
                style={{
                  borderRadius: 0,
                  border: 'none',
                }}
                items={[
                  {
                    key: 'basic',
                    label: 'Basic',
                    children: (
                      <Form form={sceneForm} labelCol={5} wrapperCol={16}>
                        <FormilyDefaultSchemaField schema={scene.sceneInfoConfigFormilySchema} />
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
                      <Form form={sceneAdditionalForm} labelCol={5} wrapperCol={16}>
                        <FormilyDefaultSchemaField schema={scene.additionalConfigFormilySchema} />
                      </Form>
                    ),
                    style: {
                      borderRadius: 0,
                      border: 'none',
                    },
                  },
                  ...(scene.evaluatorsConfigFormilySchemas
                    ? [
                        {
                          key: 'assessment',
                          label: 'Assessment',
                          children: (
                            <Form form={evaluatorForm} labelCol={5} wrapperCol={16}>
                              <FormilyDefaultSchemaField>
                                <FormilyDefaultSchemaField.Markup
                                  title={'Assessment method'}
                                  name={'assessment_method'}
                                  x-decorator="FormItem"
                                  x-component="Radio.Group"
                                  default={'human'}
                                  enum={[
                                    { label: 'Only Human', value: 'human' },
                                    { label: 'With LLM', value: 'evaluators' },
                                  ]}
                                />
                              </FormilyDefaultSchemaField>
                              {assessmentMethod === 'evaluators' &&
                                Object.entries(scene.evaluatorsConfigFormilySchemas).map(([key, schema]) => {
                                  return (
                                    <FormilyDefaultSchemaField key={key}>
                                      <FormilyDefaultSchemaField.Void
                                        x-decorator="Card"
                                        x-decorator-props={{
                                          title: schema.title,
                                          size: 'small',
                                        }}
                                      >
                                        <FormilyDefaultSchemaField.Object name={key} x-decorator="FormItem">
                                          <FormilyDefaultSchemaField schema={schema} />
                                        </FormilyDefaultSchemaField.Object>
                                      </FormilyDefaultSchemaField.Void>
                                    </FormilyDefaultSchemaField>
                                  );
                                })}
                            </Form>
                          ),
                          style: {
                            borderRadius: 0,
                            border: 'none',
                          },
                        },
                      ]
                    : []),
                ]}
              />
            </Card>
            <Card title={`Agent List (At least ${scene.min_agents_num} agent${scene.min_agents_num > 1 ? 's' : ''})`}>
              <Space>
                {(scene.max_agents_num <= 0 || sceneAgentConfigs.length <= scene.max_agents_num) && (
                  <AgentCard
                    role={'add'}
                    agentsConfigFormilySchemas={scene.agentsConfigFormilySchemas}
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
                      agentsConfigFormilySchemas={scene.agentsConfigFormilySchemas}
                      sceneAgentConfig={agentConfig}
                      onEditButtonClick={() => {
                        setOperatingAgentConfigIndex(index);
                        setOperatingAgentDefinition({
                          agent_id: agentConfig.agent_id,
                          name: scene.agentsConfigFormilySchemas[agentConfig.agent_id].title,
                          schema: scene.agentsConfigFormilySchemas[agentConfig.agent_id],
                        });
                        setCreateOrUpdateAgentModalOpen(true);
                      }}
                    />
                  );
                })}
              </Space>
            </Card>
          </Space>
        </Content>
        <Footer>
          <Button
            loading={creatingScene}
            size={'large'}
            type={'primary'}
            style={{
              minWidth: '120px',
              fontSize: '18px',
              lineHeight: '1.2',
            }}
            onClick={async () => {
              if (creatingSceneRef.current) return;
              creatingSceneRef.current = true;
              setCreatingScene(true);
              try {
                await sceneForm.validate();
                await sceneAdditionalForm.validate();
                await evaluatorForm.validate();
                if (sceneAgentConfigs.length < scene.min_agents_num) {
                  message.error(
                    `At least ${scene.min_agents_num} agent${scene.min_agents_num > 1 ? 's' : ''} are required.`
                  );
                  creatingSceneRef.current = false;
                  setCreatingScene(false);
                  return;
                }
                const sceneConfig = merge({}, DefaultSceneInfoConfig, sceneForm.values);
                const additionalConfig = sceneAdditionalForm.values;
                let evaluatorConfig: EvaluatorConfig[] | null = null;
                if (assessmentMethod === 'human') {
                  evaluatorConfig = [];
                  Object.entries(evaluatorForm.values)
                    .filter((entry) => entry[0] !== 'assessment_method')
                    .forEach(([name, config]) => {
                      evaluatorConfig?.push({
                        evaluator_name: name,
                        evaluator_config_data: config as EvaluatorConfigData,
                      });
                    });
                }
                const finalConfig: RunSceneConfig = {
                  id: scene.id,
                  scene_info_config_data: sceneConfig,
                  scene_agents_config_data: sceneAgentConfigs,
                  additional_config_data: additionalConfig,
                  scene_evaluators_config_data: evaluatorConfig,
                };
                const { task_id } = await ServerAPI.sceneTask.createSceneTask(finalConfig);
                globalStore.updateRunSceneConfig(finalConfig);
                globalStore.updateTaskId(task_id);
                router.push(`/processing?taskId=${task_id}`);
              } catch (e) {
                console.error(e);
                message.error('Create scene task failed.');
                setCreatingScene(false);
                creatingSceneRef.current = false;
              }
            }}
          >
            Start
          </Button>
        </Footer>
      </Container>
      <SelectAgentModal
        open={selectAgentModalOpen}
        agentsConfigFormilySchemas={scene.agentsConfigFormilySchemas}
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
        sceneAgentConfig={operatingAgentConfigIndex >= 0 ? sceneAgentConfigs[operatingAgentConfigIndex] : undefined}
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
