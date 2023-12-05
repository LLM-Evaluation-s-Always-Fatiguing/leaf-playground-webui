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
import EvaluatorConfig, { EvaluatorConfigData } from '@/types/server/Evaluator';
import WebUITaskBundleTaskInfo from '@/types/api-router/webui/task-bundle/TaskInfo';
import { MdOutlineHistory } from 'react-icons/md';
import TaskHistoriesModal from '@/components/task/TaskHistoriesModal';
import LocalAPI from '@/services/local';

const Container = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  position: relative;

  .historyButton {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 40px;
    height: 40px;
    border-radius: ${(props) => props.theme.borderRadius}px;
    background: ${(props) => props.theme.colorBgBase};
    ${(props) =>
      props.theme.isDarkMode
        ? `border: 1px solid ${props.theme.colorPrimary};`
        : 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);'}
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    color: ${(props) => props.theme.colorPrimary};
    font-size: 26px;
  }

  .title {
    font-size: 24px;
    font-weight: 500;
    z-index: 10;
  }
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
  taskHistories: WebUITaskBundleTaskInfo[];
}

const SceneConfigBoard = ({ scene, taskHistories }: SceneConfigBoardProps) => {
  const router = useRouter();
  const globalStore = useGlobalStore();

  const hasHistories = taskHistories.length > 0;

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
  const [evaluationMethod, setEvaluationMethod] = useState('evaluators');
  const evaluatorForm = useMemo(() => {
    return createForm({
      validateFirst: true,
      effects() {
        onFormValuesChange((form) => {
          setEvaluationMethod(form.values.evaluation_method);
        });
      },
    });
  }, []);

  const [loading, setLoading] = useState(false);
  const [loadingTip, setLoadingTip] = useState('');

  const [selectAgentModalOpen, setSelectAgentModalOpen] = useState(false);
  const [sceneAgentConfigs, setSceneAgentConfigs] = useState<SceneAgentConfig[]>([]);
  const [operatingAgentDefinition, setOperatingAgentDefinition] = useState<SceneAgentDefinition>();
  const [operatingAgentConfigIndex, setOperatingAgentConfigIndex] = useState(-1);
  const [createOrUpdateAgentModalOpen, setCreateOrUpdateAgentModalOpen] = useState(false);
  const [taskHistoriesModalOpen, setTaskHistoriesModalOpen] = useState(false);

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
                defaultActiveKey={['basic', 'additional', 'evaluation']}
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
                          key: 'evaluation',
                          label: 'Evaluation',
                          children: (
                            <Form form={evaluatorForm} labelCol={5} wrapperCol={16}>
                              <FormilyDefaultSchemaField>
                                <FormilyDefaultSchemaField.Markup
                                  title={'Evaluation method'}
                                  name={'evaluation_method'}
                                  x-decorator="FormItem"
                                  x-component="Radio.Group"
                                  default={'evaluators'}
                                  enum={[
                                    { label: 'Only Human', value: 'human' },
                                    { label: 'With LLM', value: 'evaluators' },
                                  ]}
                                />
                              </FormilyDefaultSchemaField>
                              {evaluationMethod === 'evaluators' && (
                                <FormilyDefaultSchemaField schema={scene.evaluatorsConfigFormilySchemas} />
                              )}
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
              <Space wrap={true}>
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
                      onDeleteButtonClick={() => {
                        const newSceneAgentConfigs = [...sceneAgentConfigs];
                        newSceneAgentConfigs.splice(index, 1);
                        setSceneAgentConfigs(newSceneAgentConfigs);
                      }}
                    />
                  );
                })}
              </Space>
            </Card>
          </Space>
        </Content>
        <Footer>
          <Space>
            <Button
              size={'large'}
              disabled={creatingScene}
              style={{
                minWidth: '120px',
                fontSize: '18px',
                lineHeight: '1.2',
              }}
              onClick={async () => {
                await sceneForm.reset();
                await sceneAdditionalForm.reset();
                await evaluatorForm.reset();
                setSceneAgentConfigs([]);
              }}
            >
              Reset
            </Button>
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
                  if (evaluationMethod === 'evaluators') {
                    evaluatorConfig = [];
                    Object.entries(evaluatorForm.values)
                      .filter((entry) => entry[0] !== 'evaluation_method')
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
                  const { task_id, save_dir, agent_configs } = await ServerAPI.sceneTask.createSceneTask(finalConfig);
                  await LocalAPI.taskBundle.webui.save(save_dir, task_id, scene, finalConfig, agent_configs);
                  globalStore.updateInfoAfterSceneTaskCreated(save_dir, task_id, scene, finalConfig, agent_configs);
                  router.push(`/processing/${task_id}?bundlePath=${encodeURIComponent(save_dir)}`);
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
          </Space>
        </Footer>
        {hasHistories && (
          <div
            className="historyButton"
            onClick={() => {
              setTaskHistoriesModalOpen(true);
            }}
          >
            <MdOutlineHistory size={'1em'} />
          </div>
        )}
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
        otherAgentConfigs={sceneAgentConfigs}
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
      <TaskHistoriesModal
        open={taskHistoriesModalOpen}
        scene={scene}
        tasks={taskHistories}
        onApplyHistoryTaskConfig={(runConfig) => {
          console.log(runConfig);
          sceneForm.setValues(runConfig.scene_info_config_data);
          sceneAdditionalForm.setValues(runConfig.additional_config_data);
          if (runConfig.scene_evaluators_config_data) {
            evaluatorForm.setValues(
              runConfig.scene_evaluators_config_data.reduce(
                (acc, evaluator) => {
                  acc[evaluator.evaluator_name] = evaluator.evaluator_config_data;
                  return acc;
                },
                {} as Record<string, EvaluatorConfigData>
              )
            );
          }
          setSceneAgentConfigs(runConfig.scene_agents_config_data);
          setTaskHistoriesModalOpen(false);
        }}
        onNeedClose={() => {
          setTaskHistoriesModalOpen(false);
        }}
      />
    </>
  );
};

export default SceneConfigBoard;
