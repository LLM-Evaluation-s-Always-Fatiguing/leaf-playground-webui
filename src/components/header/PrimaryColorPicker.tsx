'use client';

import { useEffect, useState } from 'react';
import { Button, ColorPicker, Flex } from 'antd';
import { MdOutlineColorLens } from 'react-icons/md';
import { commonTheme } from '@/layouts/GlobalLayout/theme';
import useDisplayConfig from '@/managers/DisplayConfigManager/useDisplayConfig';

interface HeaderPrimaryColorPickerProps {}

const HeaderPrimaryColorPicker = (props: HeaderPrimaryColorPickerProps) => {
  const displayConfig = useDisplayConfig();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [primaryColor, setPrimaryColor] = useState(displayConfig.primaryColor);

  useEffect(() => {
    if (pickerOpen) {
      setPrimaryColor(displayConfig.primaryColor);
    }
  }, [pickerOpen]);

  return (
    <ColorPicker
      open={pickerOpen}
      value={primaryColor}
      presets={[
        {
          label: 'Presets',
          colors: [
            '#7B916E',
            '#f5222d',
            '#fa541c',
            '#fa8c16',
            '#faad14',
            '#fadb14',
            '#a0d911',
            '#52c41a',
            '#13c2c2',
            '#1677ff',
            '#2f54eb',
            '#722ed1',
            '#eb2f96',
            '#718096',
            '#E53E3E',
            '#DD6B20',
            '#D69E2E',
            '#38A169',
            '#319795',
            '#3182ce',
            '#00B5D8',
            '#805AD5',
            '#D53F8C',
            '#00A0DC',
            '#385898',
            '#0078FF',
            '#22c35e',
            '#1DA1F2',
            '#0088CC',
          ],
        },
      ]}
      panelRender={(panel) => (
        <div>
          {panel}
          <Flex
            justify={'flex-end'}
            gap={12}
            style={{
              marginTop: '8px',
            }}
          >
            <Button
              onClick={() => {
                displayConfig.applyPrimaryColor(commonTheme.token!.colorPrimary!);
                setPickerOpen(false);
              }}
            >
              Reset
            </Button>
            <Button
              type={'primary'}
              onClick={() => {
                displayConfig.applyPrimaryColor(primaryColor);
                setPickerOpen(false);
              }}
            >
              Apply
            </Button>
          </Flex>
        </div>
      )}
      onOpenChange={(open) => {
        setPickerOpen(open);
      }}
      onChange={(_, hex) => {
        setPrimaryColor(hex);
      }}
    >
      <Button className="actionButton" type="text" icon={<MdOutlineColorLens size={'1.05em'} />} />
    </ColorPicker>
  );
};

export default HeaderPrimaryColorPicker;
