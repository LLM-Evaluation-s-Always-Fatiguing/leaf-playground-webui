import dictLocalAPI from '@/services/local/dict';
import fileLocalAPI from '@/services/local/file';
import networkLocalAPI from '@/services/local/network';
import pathLocalAPI from '@/services/local/path';
import taskBundleLocalAPI from '@/services/local/task-bundle';

const LocalAPI = {
  dict: dictLocalAPI,
  file: fileLocalAPI,
  path: pathLocalAPI,
  network: networkLocalAPI,
  taskBundle: taskBundleLocalAPI,
};

export default LocalAPI;
