import { ThemeConfig } from 'antd';

export const commonTheme: ThemeConfig = {
  components: {
    Layout: {
      headerPadding: '0',
    },
  },
};
export const lightTheme: ThemeConfig = {
  components: {
    Layout: {
      headerBg: '#fff',
    },
  },
};

export const darkTheme: ThemeConfig = {};
