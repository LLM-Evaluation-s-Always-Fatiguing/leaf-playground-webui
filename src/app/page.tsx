import HomePage from '@/app/homepage';
import ServerAPI from '@/services/server';

export default async function Page({ searchParams }: { searchParams: { selectedProjectId?: string } }) {
  let selectedProjectId = searchParams.selectedProjectId;
  try {
    const homepageInfo = await ServerAPI.site.homepage();
    const allHistoryMap = await ServerAPI.sceneTask.allHistoryMap();
    if (!selectedProjectId) {
      selectedProjectId = homepageInfo.projects[0].id;
    }
    const selectedProjectDetail = await ServerAPI.project.detail(selectedProjectId);
    return (
      <HomePage
        appInfo={homepageInfo.app_info}
        projects={homepageInfo.projects}
        selectedProjectId={selectedProjectId}
        selectedProjectDetail={selectedProjectDetail}
        allHistoryMap={allHistoryMap}
      />
    );
  } catch (e) {
    console.error(e);
  }
}
