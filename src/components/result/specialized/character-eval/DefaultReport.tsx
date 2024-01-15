import { useMemo, useRef, useState } from 'react';
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
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
`;

const RadarChartContainer = styled.div`
  width: 45%;
  min-width: 400px;
  height: 630px;
`;

const DetailChartContainer = styled.div`
  flex-grow: 1;
  min-width: 600px;
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

  .currentAgent {
    align-self: center;
    font-size: 20px;
    line-height: 1;
    font-weight: 500;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
`;

interface CharacterEvalDefaultReportProps extends DefaultResultReportComponentProps {}

const CharacterEvalDefaultReport: ResultReportFunctionComponent<CharacterEvalDefaultReportProps> = (props) => {
  const radarChartInstanceRef = useRef<EChartsInstance>();

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
  const metricsKeyByAgent: Record<string, CharacterEvalMetrics> = useMemo(() => {
    return keyBy(metrics, (m) => m.agent);
  }, [metrics]);

  const radarData = useMemo(() => {
    const result: ({ name: string; value: number[] } & Record<string, any>)[] = [];
    agents.forEach((agent, index) => {
      const color = colors[index];
      const agentMetrics = metricsKeyByAgent[agent];
      const avgConversationalAbility =
        Math.round(
          ((agentMetrics.conversationalAbility.fluency +
            agentMetrics.conversationalAbility.coherency +
            agentMetrics.conversationalAbility.consistency) /
            3.0) *
            1000
        ) / 1000;

      const rolePlayingAttractiveness =
        Math.round(
          ((agentMetrics.rolePlayingAttractiveness.humanLikeness +
            agentMetrics.rolePlayingAttractiveness.communicationSkills +
            agentMetrics.rolePlayingAttractiveness.expressionDiversity +
            agentMetrics.rolePlayingAttractiveness.empathy) /
            4.0) *
            1000
        ) / 1000;

      const characterConsistency =
        Math.round(
          ((agentMetrics.characterConsistency.knowledgeExposure +
            agentMetrics.characterConsistency.knowledgeAccuracy +
            agentMetrics.characterConsistency.knowledgeHallucination +
            agentMetrics.characterConsistency.personaBehavior +
            agentMetrics.characterConsistency.personaUtterance) /
            5.0) *
            1000
        ) / 1000;

      result.push({
        name: agent,
        value: [
          avgConversationalAbility,
          agentMetrics.personalityBackTesting,
          rolePlayingAttractiveness,
          characterConsistency,
        ],
        itemStyle: {
          color: color,
        },
        lineStyle: {
          color: color,
        },
      });
    });
    return result;
  }, [agents, colors, metricsKeyByAgent]);
  const [chartSelectedData, setChartSelectedData] = useState<{
    seriesIndex: number;
    dataIndex: number[];
  }>();
  const chartSelectedDataRef = useRef<{
    seriesIndex: number;
    dataIndex: number[];
  }>();

  const radarChartOptions = useMemo(() => {
    return {
      legend: {
        type: 'scroll',
        data: agents,
        left: 10,
        top: 10,
        orient: 'horizontal',
      },
      radar: {
        indicator: [
          { name: 'Conversational\nAbility', max: (v: any) => v.max, min: (v: any) => v.min * 0.95 },
          { name: 'Personality\nBack-Testing', max: (v: any) => v.max, min: 0 },
          { name: 'Role-playing\nAttractiveness', max: (v: any) => v.max, min: (v: any) => v.min * 0.95 },
          { name: 'Character\nConsistency', max: (v: any) => v.max, min: (v: any) => v.min * 0.95 },
        ],
        shape: 'circle',
        radius: '65%',
      },
      tooltip: {
        show: true,
      },
      series: [
        {
          type: 'radar',
          data: radarData,
          selectedMode: 'single',
          emphasis: {
            focus: 'self',
            blurScope: 'coordinateSystem',
            itemStyle: {
              opacity: 1,
            },
            lineStyle: {
              opacity: 1,
            },
          },
          z: 2,
          itemStyle: {
            opacity: chartSelectedData ? 0.1 : 1,
          },
          lineStyle: {
            opacity: chartSelectedData ? 0.1 : 1,
          },
          select: {
            itemStyle: {
              opacity: 1,
            },
            lineStyle: {
              opacity: 1,
            },
          },
        },
      ],
    };
  }, [agents, radarData, chartSelectedData]);

  const currentDetailMetrics = useMemo(() => {
    if (chartSelectedData && chartSelectedData.dataIndex.length > 0) {
      return metrics[chartSelectedData.dataIndex[0]];
    }
    return undefined;
  }, [metrics, chartSelectedData]);

  const onEvents = useMemo(() => {
    return {
      selectchanged: (params: any) => {
        if ((params.selected || []).length > 0) {
          setChartSelectedData(params.selected[0]);
          chartSelectedDataRef.current = params.selected[0];
        } else {
          setChartSelectedData(undefined);
          chartSelectedDataRef.current = undefined;
        }
      },
    };
  }, []);

  return (
    <Container>
      <RadarChartContainer>
        <ReactECharts
          style={{
            width: '100%',
            height: '600px',
          }}
          option={radarChartOptions}
          onChartReady={(instance) => {
            radarChartInstanceRef.current = instance;
            instance.setOption({
              graphic: {
                elements: [
                  {
                    type: 'rect',
                    z: 1,
                    left: 'center',
                    top: 'middle',
                    shape: {
                      width: instance.getWidth(),
                      height: instance.getHeight(),
                    },
                    style: {
                      fill: 'transparent',
                    },
                    onclick: () => {
                      if (radarChartInstanceRef.current) {
                        console.log(chartSelectedDataRef.current);
                        radarChartInstanceRef.current.dispatchAction({
                          type: 'unselect',
                          ...chartSelectedDataRef.current,
                        });
                      }
                    },
                  },
                ],
              },
            });
          }}
          onEvents={onEvents}
        />
      </RadarChartContainer>
      <DetailChartContainer>
        {currentDetailMetrics ? (
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
                    right: 20,
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
                  series: [
                    {
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
                      color: '#5470c6',
                    },
                  ],
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
                  xAxis: {
                    type: 'category',
                    data: [],
                  },
                  yAxis: {
                    type: 'value',
                    max: 1,
                  },
                  series: [
                    {
                      type: 'bar',
                      label: {
                        show: true,
                        position: 'top',
                      },
                      data: [currentDetailMetrics.personalityBackTesting],
                      color: '#91cc75',
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
                    right: 0,
                  },
                  xAxis: {
                    type: 'category',
                    data: ['Fluency', 'Coherency', 'Consistency'],
                  },
                  yAxis: {
                    type: 'value',
                  },
                  series: [
                    {
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
                      color: '#fac858',
                    },
                  ],
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
                    right: 20,
                  },
                  xAxis: {
                    type: 'category',
                    data: ['Human\nLikeness', 'Communication\nSkills', 'Expression\nDiversity', 'Empathy'],
                  },
                  yAxis: {
                    type: 'value',
                  },
                  series: [
                    {
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
                      color: '#ee6666',
                    },
                  ],
                }}
              />
            </div>
            <div className="currentAgent">
              <div>Current Agent:</div>
              <Select
                style={{
                  marginLeft: '20px',
                  width: '180px',
                }}
                allowClear
                onClear={() => {
                  setChartSelectedData(undefined);
                  chartSelectedDataRef.current = undefined;
                  radarChartInstanceRef.current.dispatchAction({
                    type: 'unSelect',
                  });
                }}
                value={currentDetailMetrics.agent}
                onChange={(value) => {
                  if (value) {
                    const dataIndex = agents.indexOf(value);
                    const selectedData = {
                      seriesIndex: 0,
                      dataIndex: [dataIndex],
                    };
                    setChartSelectedData(selectedData);
                    chartSelectedDataRef.current = selectedData;
                    radarChartInstanceRef.current.dispatchAction({
                      type: 'select',
                      ...selectedData,
                    });
                  }
                }}
                options={agents.map((a) => {
                  return {
                    label: a,
                    value: a,
                  };
                })}
              />
            </div>
          </>
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                fontSize: '16px',
                whiteSpace: 'pre-line',
                textAlign: 'left',
              }}
            >
              {'You can select Agent on the left side, \nor choose here '}
              <span>
                <Select
                  style={{
                    width: '180px',
                  }}
                  value={''}
                  onChange={(value) => {
                    console.log(value);
                    if (value) {
                      const dataIndex = agents.indexOf(value);
                      const selectedData = {
                        seriesIndex: 0,
                        dataIndex: [dataIndex],
                      };
                      console.log(selectedData);
                      setChartSelectedData(selectedData);
                      chartSelectedDataRef.current = selectedData;
                      radarChartInstanceRef.current.dispatchAction({
                        type: 'select',
                        ...selectedData,
                      });
                    }
                  }}
                  options={agents.map((a) => {
                    return {
                      label: a,
                      value: a,
                    };
                  })}
                />
              </span>
              {' to display details.'}
            </div>
          </div>
        )}
      </DetailChartContainer>
    </Container>
  );
};

CharacterEvalDefaultReport.reportName = 'Default';
CharacterEvalDefaultReport.requiredMetrics = [];

export default CharacterEvalDefaultReport;
