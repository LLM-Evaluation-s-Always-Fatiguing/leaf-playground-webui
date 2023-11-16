import { Theme as AntdStyleTheme } from 'antd-style';

declare module 'styled-components' {
  export interface DefaultTheme extends AntdStyleTheme {}
}
