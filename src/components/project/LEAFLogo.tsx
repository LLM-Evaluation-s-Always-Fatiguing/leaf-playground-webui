import Image from 'next/image';
import LogoPNG from '@/assets/Logo.png';
import { useTheme } from 'antd-style';

export default function LEAFLogo() {
  const theme = useTheme();
  return <Image src={LogoPNG} height={theme.headerHeight} alt={'logo'} />;
}
