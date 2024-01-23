import React, { CSSProperties } from 'react';
import { Button, ButtonProps, Tooltip } from 'antd';
import { useTheme } from 'antd-style';
import { TooltipPlacement } from 'antd/es/tooltip';
import CircleFillAutoplayIcon from '@/app/processing/components/common/icons/CircleFillAutoplayIcon';

interface SampleAutoPlayButtonProps extends ButtonProps {
  autoPlay: boolean;
  toolTipPlacement?: TooltipPlacement;
}

const SampleAutoPlayButton = ({ autoPlay, toolTipPlacement, style, ...props }: SampleAutoPlayButtonProps) => {
  const theme = useTheme();

  return (
    <Tooltip
      title={autoPlay ? 'Disable Auto Play' : 'Enable Auto Play'}
      {...(toolTipPlacement
        ? {
            placement: toolTipPlacement,
          }
        : {})}
    >
      <Button
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '6px 0',
          fontSize: '24px',
          color: autoPlay ? theme.colorPrimary : theme.colorTextQuaternary,
          ...style,
        }}
        type={'text'}
        size={'small'}
        icon={<CircleFillAutoplayIcon />}
        {...props}
      />
    </Tooltip>
  );
};

export default SampleAutoPlayButton;
