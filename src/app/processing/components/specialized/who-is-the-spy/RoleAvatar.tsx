import { IoMdPerson } from 'react-icons/io';
import { RiRobot2Fill } from 'react-icons/ri';
import { BlankAvatar } from '@/app/processing/components/specialized/who-is-the-spy/icons/BlankAvatar';
import { CivilianAvatar } from '@/app/processing/components/specialized/who-is-the-spy/icons/CivilianAvatar';
import { SpyAvatar } from '@/app/processing/components/specialized/who-is-the-spy/icons/SpyAvatar';

interface RoleAvatarProps {
  role?: 'civilian' | 'spy' | 'blank' | '平民' | '卧底' | '白板';
}

const RoleAvatar = (props: RoleAvatarProps) => {
  switch (props.role) {
    case 'civilian':
    case '平民':
      return <CivilianAvatar />;
    case 'spy':
    case '卧底':
      return <SpyAvatar />;
    case 'blank':
    case '白板':
      return <BlankAvatar />;
    default:
      return <RiRobot2Fill size={'1em'} />;
  }
};

export default RoleAvatar;
