import { connect, mapProps } from '@formily/react';
import { ColorPicker as AntdColorPicker } from 'antd';

const ColorPicker = connect(
  AntdColorPicker,
  mapProps((props, field) => {
    const format: 'hex' = 'hex';
    const onChange: any = props.onChange;
    return {
      showText: true,
      presets: [
        {
          label: 'Presets',
          colors: [
            '#f5222d',
            '#e84749',
            '#F56565',
            '#fa541c',
            '#fa8c16',
            '#faad14',
            '#c2a600',
            '#d8bd14',
            '#fadb14',
            '#38A169',
            '#52c41a',
            '#a0d911',
            '#319795',
            '#13c2c2',
            '#0BC5EA',
            '#1677ff',
            '#2f54eb',
            '#4299E1',
            '#9254de',
            '#b391f5',
            '#c9b6fc',
            '#eb2f96',
            '#ED64A6',
            '#f7a8c0',
          ],
        },
      ],
      ...props,
      format: format,
      onChange: (_, hex: string) => {
        if (onChange) {
          onChange(hex);
        }
      },
    };
  })
);

export default ColorPicker;
