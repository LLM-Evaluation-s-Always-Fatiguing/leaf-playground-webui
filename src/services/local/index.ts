import fileLocalAPI from '@/services/local/file';
import taskResultBundleLocalAPI from '@/services/local/task-result-bundle';
import dictLocalAPI from '@/services/local/dict';

const LocalAPI = {
  dict: dictLocalAPI,
  file: fileLocalAPI,
  taskResultBundle: taskResultBundleLocalAPI,
};

export default LocalAPI;
