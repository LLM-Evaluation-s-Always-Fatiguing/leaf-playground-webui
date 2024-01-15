import { useMemo, useRef, useState } from 'react';
import { Button, Space } from 'antd';
import { Select } from '@formily/antd-v5';
import styled from '@emotion/styled';
import ReactECharts, { EChartsInstance } from 'echarts-for-react';
import { keyBy } from 'lodash';
import { DefaultResultReportComponentProps, ResultReportFunctionComponent } from '@/components/result/def';
import { getRandomAgentColor } from '@/utils/color';
import mockMetrics from './mock/metrics.json';

interface CharacterEvalMetrics {
  agent: string;
  conversationalAbility: {
    fluency: number;
    coherency: number;
    consistency: number;
  };
  personalityBackTesting: number;
  rolePlayingAttractiveness: {
    humanLikeness: number;
    communicationSkills: number;
    expressionDiversity: number;
    empathy: number;
  };
  characterConsistency: {
    knowledgeExposure: number;
    knowledgeAccuracy: number;
    knowledgeHallucination: number;
    personaBehavior: number;
    personaUtterance: number;
  };
}

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
`;

const DetailChartContainer = styled.div`
  flex-grow: 1;
  min-width: 600px;
  width: 100%;
  height: 630px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;

  .row {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: stretch;
  }
`;

interface CharacterEvalCompareReportProps extends DefaultResultReportComponentProps {}

const CharacterEvalCompareReport: ResultReportFunctionComponent<CharacterEvalCompareReportProps> = (props) => {
  const metrics: CharacterEvalMetrics[] = mockMetrics;
  const agents = useMemo(() => {
    return metrics.map((m) => m.agent);
  }, [metrics]);
  const colors = useMemo(() => {
    const result: string[] = [];
    for (let i = 0; i < agents.length; i++) {
      result.push(getRandomAgentColor(result));
    }
    return result;
  }, [agents]);
  const metricsKeyByAgent = useMemo(() => {
    return keyBy(metrics, (m) => m.agent);
  }, [metrics]);

  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);

  return (
    <Container>
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <div
          style={{
            whiteSpace: 'nowrap',
          }}
        >
          Compare Agents:
        </div>
        <Select
          mode="multiple"
          style={{
            marginLeft: '20px',
            flexGrow: 1,
          }}
          value={selectedAgents}
          onChange={(values) => {
            setSelectedAgents(values);
          }}
          allowClear
          options={agents.map((agent) => ({ value: agent, label: agent }))}
        />
      </div>
      <DetailChartContainer>
        {selectedAgents.length > 0 && (
          <>
            <div className="row">
              <ReactECharts
                style={{
                  width: '79%',
                  height: 300,
                }}
                option={{
                  title: { text: 'Character Consistency', left: 'center' },
                  grid: {
                    left: 30,
                    right: 20,
                  },
                  tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                      type: 'shadow',
                    },
                  },
                  xAxis: {
                    type: 'category',
                    data: [
                      'Knowledge\nExposure',
                      'Knowledge\nAccuracy',
                      'Knowledge\nHallucination',
                      'Persona\nBehavior',
                      'Persona\nUtterance',
                    ],
                  },
                  yAxis: {
                    type: 'value',
                  },
                  series: selectedAgents.map((agent) => {
                    const currentDetailMetrics = metricsKeyByAgent[agent];
                    const agentIndex = agents.indexOf(agent);
                    const color = colors[agentIndex];
                    return {
                      name: agent,
                      type: 'bar',
                      label: {
                        show: true,
                        position: 'top',
                      },
                      data: [
                        currentDetailMetrics.characterConsistency.knowledgeExposure,
                        currentDetailMetrics.characterConsistency.knowledgeAccuracy,
                        currentDetailMetrics.characterConsistency.knowledgeHallucination,
                        currentDetailMetrics.characterConsistency.personaBehavior,
                        currentDetailMetrics.characterConsistency.personaUtterance,
                      ],
                      color,
                    };
                  }),
                }}
              />
              <ReactECharts
                style={{
                  width: '21%',
                  height: 300,
                }}
                option={{
                  title: { text: 'Personality\nBack-Testing', left: 'center' },
                  grid: {
                    left: 30,
                    right: 20,
                  },
                  tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                      type: 'shadow',
                    },
                  },
                  xAxis: {
                    type: 'category',
                    data: selectedAgents,
                  },
                  yAxis: {
                    type: 'value',
                    max: 1,
                  },
                  series: [
                    {
                      type: 'bar',
                      colorBy: 'data',
                      label: {
                        show: true,
                        position: 'top',
                      },
                      data: selectedAgents.map((agent) => {
                        const agentIndex = agents.indexOf(agent);
                        const color = colors[agentIndex];
                        return {
                          value: metricsKeyByAgent[agent].personalityBackTesting,
                          itemStyle: {
                            color,
                          },
                        };
                      }),
                    },
                  ],
                }}
              />
            </div>
            <div className="row">
              <ReactECharts
                style={{
                  width: '36%',
                  height: 300,
                }}
                option={{
                  title: { text: 'Conversational Ability', left: 'center' },
                  grid: {
                    left: 30,
                    right: 0,
                  },
                  tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                      type: 'shadow',
                    },
                  },
                  xAxis: {
                    type: 'category',
                    data: ['Fluency', 'Coherency', 'Consistency'],
                  },
                  yAxis: {
                    type: 'value',
                  },
                  series: selectedAgents.map((agent) => {
                    const currentDetailMetrics = metricsKeyByAgent[agent];
                    const agentIndex = agents.indexOf(agent);
                    const color = colors[agentIndex];
                    return {
                      name: agent,
                      type: 'bar',
                      label: {
                        show: true,
                        position: 'top',
                      },
                      data: [
                        currentDetailMetrics.conversationalAbility.fluency,
                        currentDetailMetrics.conversationalAbility.coherency,
                        currentDetailMetrics.conversationalAbility.consistency,
                      ],
                      color,
                    };
                  }),
                }}
              />
              <ReactECharts
                style={{
                  width: '64%',
                  height: 300,
                }}
                option={{
                  title: { text: 'Role-playing Attractiveness', left: 'center' },
                  grid: {
                    left: 30,
                    right: 20,
                  },
                  tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                      type: 'shadow',
                    },
                  },
                  xAxis: {
                    type: 'category',
                    data: ['Human\nLikeness', 'Communication\nSkills', 'Expression\nDiversity', 'Empathy'],
                  },
                  yAxis: {
                    type: 'value',
                  },
                  series: selectedAgents.map((agent) => {
                    const currentDetailMetrics = metricsKeyByAgent[agent];
                    const agentIndex = agents.indexOf(agent);
                    const color = colors[agentIndex];
                    return {
                      name: agent,
                      type: 'bar',
                      label: {
                        show: true,
                        position: 'top',
                      },
                      data: [
                        currentDetailMetrics.rolePlayingAttractiveness.humanLikeness,
                        currentDetailMetrics.rolePlayingAttractiveness.communicationSkills,
                        currentDetailMetrics.rolePlayingAttractiveness.expressionDiversity,
                        currentDetailMetrics.rolePlayingAttractiveness.empathy,
                      ],
                      color,
                    };
                  }),
                }}
              />
            </div>
          </>
        )}
      </DetailChartContainer>
    </Container>
  );
};

CharacterEvalCompareReport.reportName = 'Detail Compare';
CharacterEvalCompareReport.requiredMetrics = [];

export default CharacterEvalCompareReport;
