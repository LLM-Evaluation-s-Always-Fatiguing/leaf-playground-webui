import { PropsWithChildren } from 'react';
import DisplayConfigRegistry from '@/managers/DisplayConfigManager/DisplayConfigRegistry';
import { getDisplayConfigPersistentStateFromCookies } from '@/managers/DisplayConfigManager/DisplayConfigUtils';

const ManagersServerRegistry = (props: PropsWithChildren) => {
  const displayConfigStateFromCookies = getDisplayConfigPersistentStateFromCookies();

  return (
    <DisplayConfigRegistry
      themeMode={displayConfigStateFromCookies.themeMode}
      happyWorkEffect={displayConfigStateFromCookies.happyWorkEffect}
      primaryColor={displayConfigStateFromCookies.primaryColor}
    >
      {props.children}
    </DisplayConfigRegistry>
  );
};

export default ManagersServerRegistry;
