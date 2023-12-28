import SceneAgentConfig from '@/types/server/config/Agent';
import { Card } from 'antd';
import styled from '@emotion/styled';
import { RiRobot2Fill } from 'react-icons/ri';

const Content = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 8px;
  overflow: hidden;
  position: relative;

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    font-size: 21px;
    background: ${(props) => props.theme.colorFillSecondary};
    color: ${(props) => props.theme.colorPrimary};
  }

  .name {
    margin-top: 4px;
  }

  .role {
  }

  .key {
  }

  .winMark {
  }
`;

interface PlayerCardProps {
  agent: SceneAgentConfig;
}

const PlayerCard = (props: PlayerCardProps) => {
  return (
    <Card
      hoverable
      style={{
        margin: 6,
        cursor: 'default'
      }}
      bodyStyle={{
        width: 100,
        height: 110,
        padding: 0,
      }}
    >
      <Content>
        <div
          className="avatar"
          style={{
            color: props.agent.config_data.chart_major_color,
          }}
        >
          <RiRobot2Fill size={'1em'} />
        </div>
        <div className="name">{props.agent.config_data.profile.name}</div>
      </Content>
    </Card>
  );
};

export default PlayerCard;
