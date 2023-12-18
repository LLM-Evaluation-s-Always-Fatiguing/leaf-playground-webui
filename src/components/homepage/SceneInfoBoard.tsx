'use client';

import styled from '@emotion/styled';
import { Button } from 'antd';
import Scene from "@/types/server/meta/Scene";

const Header = styled.div`
  width: 100%;
  height: 65px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid ${(props) => props.theme.dividerColor};

  .title {
    font-size: 36px;
    line-height: 1.2;
    font-weight: 500;
    color: ${(props) => props.theme.colorText};
  }
`;

const Footer = styled.div`
  width: 100%;
  height: 85px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;

  padding: 0 20px;
`;

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  overflow: hidden;

  .infoArea {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: 12px 20px;
    overflow: hidden auto;
    flex-grow: 1;

    .desc {
      font-size: 21px;
      font-weight: normal;
      color: ${(props) => props.theme.colorTextSecondary};
    }
  }
`;

interface SceneInfoBoardProps {
  scene?: Scene;
  onStartClick: () => Promise<void>;
}

const SceneInfoBoard = (props: SceneInfoBoardProps) => {
  return (
    <Container>
      {props.scene && (
        <>
          <Header>
            <div className="title">{props.scene.scene_metadata.scene_definition.name}</div>
          </Header>
          <div className="infoArea">
            <div className="desc">{props.scene.scene_metadata.scene_definition.description}</div>
          </div>
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
                await props.onStartClick();
              }}
            >
              I Choose You!
            </Button>
          </Footer>
        </>
      )}
    </Container>
  );
};

export default SceneInfoBoard;
