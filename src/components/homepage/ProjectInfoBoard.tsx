'use client';

import Project from '@/types/server/meta/Project';
import { Button } from 'antd';
import styled from '@emotion/styled';
import Markdown from '@/components/markdown/Markdown';

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

interface ProjectInfoBoardProps {
  project?: Project;
  displayMode?: boolean;
  onStartClick: () => Promise<void>;
}

const ProjectInfoBoard = (props: ProjectInfoBoardProps) => {
  return (
    <Container>
      {props.project && (
        <>
          <Header>
            <div className="title">{props.project.metadata.scene_metadata.scene_definition.name}</div>
          </Header>
          <div className="infoArea">
            {props.project.readme ? (
              <Markdown
                content={props.project.readme}
                useHubAssets={true}
                hubAssetsProjectId={props.project.id}
                removeComments={true}
              />
            ) : (
              <div className="desc">{props.project.metadata.scene_metadata.scene_definition.description}</div>
            )}
          </div>
          {!props.displayMode && (
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
          )}
        </>
      )}
    </Container>
  );
};

export default ProjectInfoBoard;
