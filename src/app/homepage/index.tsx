'use client';

import React, { useEffect, useState } from 'react';
import Project, { ListProject } from '@/types/server/meta/Project';
import ServerAppInfo from '@/types/server/meta/ServerAppInfo';
import SceneTaskHistory from '@/types/server/task/SceneTaskHistory';
import { message } from 'antd';
import styled from '@emotion/styled';
import LoadingOverlay from '@/components/loading/LoadingOverlay';
import ProjectInfoBoard from '@/app/homepage/components/ProjectInfoBoard';
import SceneConfigBoard from '@/app/homepage/components/SceneConfigBoard';
import SceneListComponent from '@/components/scene/SceneListComponent';
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
  projects: ListProject[];
  selectedProjectId: string;
  selectedProjectDetail: Project;
  allHistoryMap: Record<string, SceneTaskHistory[]>;
}

export default function Index(props: HomePageProps) {
  const globalStore = useGlobalStore();

  const [allTaskHistoryMap, setAllTaskHistoryMap] = useState<Record<string, SceneTaskHistory[]>>(props.allHistoryMap);

  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projects, setProjects] = useState<ListProject[]>(props.projects);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(props.selectedProjectId);

  const [projectDetailLoading, setProjectDetailLoading] = useState(false);
  const [projectDetail, setProjectDetail] = useState<Project>(props.selectedProjectDetail);

  const [started, setStarted] = useState(false);

  const reloadProjectList = async () => {
    try {
      setProjectsLoading(true);
      const homepageResp = await ServerAPI.site.homepage();
      if (!homepageResp.projects.some((p) => p.id === selectedProjectId) && homepageResp.projects.length > 0) {
        setSelectedProjectId(homepageResp.projects[0].id);
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
      const allHistoryMapResp = await ServerAPI.sceneTask.allHistoryMap();
      setAllTaskHistoryMap(allHistoryMapResp);
    } catch (e) {
      console.error(e);
      message.error('Failed to load task history');
    }
  };

  const loadProjectDetail = async () => {
    if (!selectedProjectId) return;
    try {
      setProjectDetailLoading(true);
      const projectResp = await ServerAPI.project.detail(selectedProjectId);
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
  }, []);

  useEffect(() => {
    loadProjectDetail();
    if (typeof window !== undefined) {
      window.history.replaceState({}, '', selectedProjectId ? `/?selectedProjectId=${selectedProjectId}` : '/');
    }
  }, [selectedProjectId]);

  return (
    <PageContainer>
      <ScenesArea>
        <div className="content">
          {projects.map((project, index) => {
            return (
              <SceneListComponent
                key={project.id}
                project={project}
                selected={selectedProjectId === project.id}
                onClick={() => {
                  setSelectedProjectId(project.id);
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
            project={projectDetail}
            serverInfo={props.appInfo}
            taskHistory={allTaskHistoryMap[projectDetail.id] || []}
            reloadHistory={async ()=>{
              await reloadTaskHistory();
            }}
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
