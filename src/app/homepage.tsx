'use client';

import React, { useEffect, useState } from 'react';
import WebUITaskBundleTaskInfo from '@/types/api-router/webui/task-bundle/TaskInfo';
import Project from '@/types/server/meta/Project';
import Scene from '@/types/server/meta/Scene';
import ServerAppInfo from '@/types/server/meta/ServerAppInfo';
import { message } from 'antd';
import styled from '@emotion/styled';
import md5 from 'crypto-js/md5';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import SceneConfigBoard from '@/components/homepage/SceneConfigBoard';
import ProjectInfoBoard from '@/components/homepage/ProjectInfoBoard';
import SceneListComponent from '@/components/scene/SceneListComponent';
import LocalAPI from '@/services/local';
import ServerAPI from '@/services/server';
import useGlobalStore from '@/stores/global';

const ScenesArea = styled.div`
  width: 24%;
  min-width: 260px;
  max-width: 340px;
  position: relative;
  border-right: 1px solid ${(props) => props.theme.dividerColor};

  .content {
    width: 100%;
    height: 100%;
    overflow: hidden auto;
    padding: 16px 12px;
  }
`;

const OperationArea = styled.div`
  flex-grow: 1;
  width: 76%;
  min-width: 680px;
  overflow: hidden auto;
  position: relative;
`;

const PageContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;

  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: stretch;
`;

interface HomePageProps {
  appInfo: ServerAppInfo;
  projects: string[];
  taskHistory: Record<string, WebUITaskBundleTaskInfo[]>;
}

export default function HomePage(props: HomePageProps) {
  const globalStore = useGlobalStore();

  const [taskHistory, setTaskHistory] = useState<Record<string, WebUITaskBundleTaskInfo[]>>(props.taskHistory);

  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projects, setProjects] = useState<string[]>(props.projects);
  const [selectedProject, setSelectedProject] = useState<string>(props.projects[0]);

  const [projectDetailLoading, setProjectDetailLoading] = useState(false);
  const [projectDetail, setProjectDetail] = useState<Project>();

  const [started, setStarted] = useState(false);

  const reloadProjectList = async () => {
    try {
      setProjectsLoading(true);
      const homepageResp = await ServerAPI.site.homepage();
      if (!homepageResp.projects.some((p) => p === selectedProject) && homepageResp.projects.length > 0) {
        setSelectedProject(homepageResp.projects[0]);
      }
      setProjects(homepageResp.projects);
    } catch (e) {
      console.error(e);
      message.error('Failed to load project list.');
    } finally {
      setProjectsLoading(false);
    }
  };

  const reloadTaskHistory = async () => {
    try {
      // const taskHistory = await LocalAPI.taskBundle.webui.getAll(props.serverInfo.paths.result_dir);
      setTaskHistory(taskHistory);
    } catch (e) {
      console.error(e);
      message.error('Failed to load task history');
    }
  };

  const loadProjectDetail = async () => {
    try {
      setProjectDetailLoading(true);
      const projectResp = await ServerAPI.project.detail(selectedProject);
      setProjectDetail(projectResp);
      setProjectDetailLoading(false);
    } catch (e) {
      console.error(e);
      message.error('Failed to load project detail');
      setProjectDetailLoading(false);
    }
  };

  useEffect(() => {
    globalStore.clearTaskState();
    reloadProjectList();
    reloadTaskHistory();
    loadProjectDetail();
  }, []);

  useEffect(() => {
    loadProjectDetail();
  }, [selectedProject]);

  return (
    <PageContainer>
      <ScenesArea>
        <div className="content">
          {projects.map((project, index) => {
            return (
              <SceneListComponent
                key={project}
                project={project}
                selected={selectedProject === project}
                onClick={() => {
                  setSelectedProject(project);
                  setStarted(false);
                }}
              />
            );
          })}
        </div>
        <LoadingOverlay spinning={projectsLoading} />
      </ScenesArea>
      <OperationArea>
        <LoadingOverlay spinning={projectDetailLoading} />
        {started && projectDetail ? (
          <SceneConfigBoard
            key={projectDetail.id}
            project={projectDetail}
            serverInfo={props.appInfo}
            taskHistory={[]}
          />
        ) : (
          <ProjectInfoBoard
            project={projectDetail}
            onStartClick={async () => {
              setStarted(true);
            }}
          />
        )}
        <LoadingOverlay spinning={false} />
      </OperationArea>
    </PageContainer>
  );
}
