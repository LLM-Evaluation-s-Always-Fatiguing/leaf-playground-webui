import Image from 'next/image';
import { useTheme } from 'antd-style';
import LogoPNG from '@/assets/Logo.png';

export default function LEAFLogo() {
  const theme = useTheme();
  return <Image src={LogoPNG} height={theme.headerHeight} alt={'logo'} />;
}
