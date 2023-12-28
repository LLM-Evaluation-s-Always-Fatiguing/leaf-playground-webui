import { RiRobot2Fill } from 'react-icons/ri';
import { BlankAvatar } from '@/components/processing/specialized/who-is-the-spy/icons/BlankAvatar';
import { CivilianAvatar } from '@/components/processing/specialized/who-is-the-spy/icons/CivilianAvatar';
import { SpyAvatar } from '@/components/processing/specialized/who-is-the-spy/icons/SpyAvatar';

interface RoleAvatarProps {
  role?: 'civilian' | 'spy' | 'blank';
}

const RoleAvatar = (props: RoleAvatarProps) => {
  switch (props.role) {
    case 'civilian':
      return <CivilianAvatar />;
    case 'spy':
      return <SpyAvatar />;
    case 'blank':
      return <BlankAvatar />;
    default:
      return <RiRobot2Fill size={'1em'} />;
  }
};

export default RoleAvatar;
