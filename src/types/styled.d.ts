import { Theme as AntdStyleTheme } from 'antd-style';

interface NewToken {
  headerHeight: number;
  dividerColor: string;
}

declare module 'antd-style' {
  export interface CustomToken extends NewToken {}
}

declare module '@emotion/react' {
  export interface Theme extends AntdStyleTheme {}
}
