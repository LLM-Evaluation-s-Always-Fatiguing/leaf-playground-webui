import HomePage from '@/app/homepage';
import ServerAPI from '@/services/server';

export default async function Page() {
  const homepageInfo = await ServerAPI.site.homepage();
  const allHistoryMap = await ServerAPI.sceneTask.allHistoryMap();
  return <HomePage appInfo={homepageInfo.app_info} projects={homepageInfo.projects} allHistoryMap={allHistoryMap} />;
}
