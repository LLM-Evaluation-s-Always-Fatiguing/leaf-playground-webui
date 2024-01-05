import WebUIAgentInstance from '@/types/api-router/webui/AgentInstance';
import SceneAgentConfig from '@/types/server/config/Agent';
import { Card } from 'antd';
import styled from '@emotion/styled';
import { RiRobot2Fill } from 'react-icons/ri';
import Markdown from '@/components/markdown/Markdown';
import RoleAvatar from '@/components/processing/specialized/who-is-the-spy/RoleAvatar';
import { TrophyIcon } from '@/components/processing/specialized/who-is-the-spy/icons/TrophyIcon';

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
    flex-shrink: 0;
    position: relative;
    background: ${(props) => props.theme.colorFillSecondary};
    color: ${(props) => props.theme.colorPrimary};

    .winMark {
      position: absolute;
      right: -6px;
      bottom: -18px;
      font-size: 21px;
    }
  }

  .name {
    margin-top: 4px;
  }

  .role {
  }

  .key {
    width: 100%;
    height: 60px;
    text-align: center;
  }

  .youMark {
    margin-top: 4px;
    font-weight: 500;
  }
`;

interface PlayerCardProps {
  agent: WebUIAgentInstance;
  godView: boolean;
  live: boolean;
  win: boolean;
  role: 'civilian' | 'spy' | 'blank';
  gameKey: string;
  you: boolean;
}

const PlayerCard = (props: PlayerCardProps) => {
  return (
    <Card
      hoverable
      style={{
        margin: 6,
        cursor: 'default',
        ...(props.live ? {} : { opacity: 0.35, filter: 'grayscale(60%)' }),
        ...(props.you
          ? {
              borderColor: props.agent.config.config_data.chart_major_color,
            }
          : {}),
      }}
      bodyStyle={{
        width: 100,
        minHeight: 80,
        padding: 0,
      }}
    >
      <Content>
        <div
          className="avatar"
          style={{
            color: props.agent.config.config_data.chart_major_color,
          }}
        >
          <RoleAvatar role={props.godView ? props.role : undefined} />
          {props.win && (
            <div className="winMark">
              <TrophyIcon />
            </div>
          )}
        </div>
        <div className="name">{props.agent.config.config_data.profile.name}</div>
        {props.godView && <div className="role">{props.role}</div>}
        {(props.you || props.godView) && (
          <div className="key">{<Markdown content={props.gameKey} useLocalAssets={true} limitHeight={true} />}</div>
        )}
        {props.you && <div className="youMark">You</div>}
      </Content>
    </Card>
  );
};

export default PlayerCard;
