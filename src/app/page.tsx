'use client';
import Image from 'next/image';
import { Button } from 'antd';
import styles from './page.module.css';
import styled from 'styled-components';
import { Space } from '@formily/antd-v5';
import { useTheme } from "antd-style";

const Test1 = styled.div`
  width: 50px;
  height: 50px;
  background: ${(p) => p.theme.colorPrimary};
`;

export default function Home() {
  return <main></main>;
}
