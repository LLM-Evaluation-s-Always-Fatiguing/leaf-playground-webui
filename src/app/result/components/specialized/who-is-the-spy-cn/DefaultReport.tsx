import { useMemo } from 'react';
import { getAllAgentInstanceFrom } from '@/types/webui/AgentInstance';
import styled from '@emotion/styled';
import ReactECharts from 'echarts-for-react';
import keyBy from 'lodash/keyBy';
import { DefaultResultReportComponentProps, ResultReportFunctionComponent } from '@/app/result/components/def';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
`;

const ChartContainer = styled.div`
  width: calc(100% / 3);
`;

interface WhoIsTheSpyCNDefaultReportProps extends DefaultResultReportComponentProps {}

const WhoIsTheSpyCNDefaultReport: ResultReportFunctionComponent<WhoIsTheSpyCNDefaultReportProps> = (props) => {
  const agents = useMemo(() => {
    return getAllAgentInstanceFrom(props.scene, props.createSceneTaskParams);
  }, [props.scene, props.createSceneTaskParams]);
  const source = useMemo(() => {
    if (!props.metrics) return [];
    const agentsKeyByAgentId = keyBy(agents, (a) => a.config.config_data.profile.id);
    const result: ({ metric: string } & Record<string, any>)[] = [];
    const camouflageAbility = props.metrics.merged_metrics['player.describe_key.伪装能力'];
    if (camouflageAbility) {
      const camouflageAbilityKeyByAgentId = keyBy(camouflageAbility, (mr) => mr.target_agent);
      const camouflageAbilitySource: { metric: string } & Record<string, any> = {
        metric: '伪装能力',
      };
      Object.keys(camouflageAbilityKeyByAgentId).forEach((agentId) => {
        camouflageAbilitySource[agentsKeyByAgentId[agentId].config.config_data.profile.name] =
          camouflageAbilityKeyByAgentId[agentId].value;
      });
      result.push(camouflageAbilitySource);
    }
    const inferenceAbility = props.metrics.merged_metrics['player.predict_role.推理能力'];
    if (inferenceAbility) {
      const inferenceAbilityKeyByAgentId = keyBy(inferenceAbility, (mr) => mr.target_agent);
      const inferenceAbilitySource: { metric: string } & Record<string, any> = {
        metric: '推理能力',
      };
      Object.keys(inferenceAbilityKeyByAgentId).forEach((agentId) => {
        inferenceAbilitySource[agentsKeyByAgentId[agentId].config.config_data.profile.name] =
          inferenceAbilityKeyByAgentId[agentId].value;
      });
      result.push(inferenceAbilitySource);
    }
    const finalScoreSource: { metric: string } & Record<string, any> = {
      metric: '综合得分',
    };
    Object.keys(agentsKeyByAgentId).forEach((agentId) => {
      const agentName = agentsKeyByAgentId[agentId].config.config_data.profile.name;
      finalScoreSource[agentName] = Math.round((result[0][agentName] * 0.4 + result[1][agentName] * 0.6) * 100) / 100.0;
    });
    result.push(finalScoreSource);
    return result;
  }, [agents, props.metrics]);

  return (
    <Container>
      <ChartContainer>
        <ReactECharts
          option={{
            legend: {},
            tooltip: {},
            dataset: {
              dimensions: ['metric', ...agents.map((a) => a.config.config_data.profile.name)],
              source: source,
            },
            xAxis: { type: 'category' },
            yAxis: { max: 5 },
            series: agents.map((agent) => {
              return {
                type: 'bar',
                itemStyle: { color: agent.config.config_data.chart_major_color },
                label: {
                  show: true,
                  precision: 2,
                  position: 'top',
                },
              };
            }),
          }}
        />
      </ChartContainer>
    </Container>
  );
};

WhoIsTheSpyCNDefaultReport.reportName = 'Default';
WhoIsTheSpyCNDefaultReport.requiredMetrics = ['player.describe_key.伪装能力', 'player.predict_role.推理能力'];

export default WhoIsTheSpyCNDefaultReport;
