import dictLocalAPI from '@/services/local/dict';
import fileLocalAPI from '@/services/local/file';
import taskBundleLocalAPI from '@/services/local/task-bundle';

const LocalAPI = {
  dict: dictLocalAPI,
  file: fileLocalAPI,
  taskBundle: taskBundleLocalAPI,
};

export default LocalAPI;
