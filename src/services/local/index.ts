import dictLocalAPI from '@/services/local/dict';
import fileLocalAPI from '@/services/local/file';
import taskBundleLocalAPI from '@/services/local/task-bundle';
import pathLocalAPI from '@/services/local/path';

const LocalAPI = {
  dict: dictLocalAPI,
  file: fileLocalAPI,
  path: pathLocalAPI,
  taskBundle: taskBundleLocalAPI,
};

export default LocalAPI;
