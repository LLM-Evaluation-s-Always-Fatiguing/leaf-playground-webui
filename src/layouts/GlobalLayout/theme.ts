import { ThemeConfig } from 'antd';
import { CustomToken } from 'antd-style';

export const commonTheme: ThemeConfig = {
  token: {
    colorPrimary: '#7B916E'
  },
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
      bodyBg: '#fff',
    },
  },
};

export const darkTheme: ThemeConfig = {
  components: {
    Layout: {
      headerBg: '#000',
    },
  },
};

export const commonCustomToken: Partial<CustomToken> = {
  headerHeight: 64,
};

export const lightCustomToken: Partial<CustomToken> = {
  dividerColor: '#D9E1E8',
};

export const darkCustomToken: Partial<CustomToken> = {
  dividerColor: '#2E1728',
};
