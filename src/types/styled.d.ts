import { Theme as AntdStyleTheme } from 'antd-style';

interface NewToken {
  customBrandColor: string;
}

declare module 'antd-style' {
  export interface CustomToken extends NewToken {
    headerHeight: number;
  }
}

declare module 'styled-components' {
  export interface DefaultTheme extends AntdStyleTheme {}
}
