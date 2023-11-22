import styled from '@emotion/styled';
import { SceneListItem } from '@/types/server/Scene';
import { Card } from 'antd';
import { GrTest } from 'react-icons/gr';
import { useTheme } from 'antd-style';

const CoverImage = styled.div`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  font-size: 21px;
`;

const Container = styled.div`
  padding: 12px 20px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  .info {
    margin-left: 14px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;

    .title {
      font-size: 14px;
      font-weight: 500;
    }

    .desc {
      font-size: 12px;
      color: ${(props) => props.theme.colorTextSecondary};
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`;

interface SceneListComponentProps {
  selected: boolean;
  scene: SceneListItem;
  onClick?: () => void;
}

const SceneListComponent = (props: SceneListComponentProps) => {
  const theme = useTheme();

  return (
    <Card
      style={
        props.selected
          ? {
              border: `1px solid ${theme.colorPrimary}`,
            }
          : {}
      }
      bodyStyle={{
        padding: 0,
        cursor: 'pointer',
      }}
      onClick={() => {
        props.onClick?.();
      }}
    >
      <Container>
        <CoverImage>
          <GrTest
            size={'1em'}
            style={{
              color: props.selected ? theme.colorPrimary : theme.colorFill,
            }}
          />
        </CoverImage>
        <div className="info">
          <div className="title">{props.scene.metadata.name}</div>
          <div className="desc">{props.scene.metadata.description}</div>
        </div>
      </Container>
    </Card>
  );
};

export default SceneListComponent;
