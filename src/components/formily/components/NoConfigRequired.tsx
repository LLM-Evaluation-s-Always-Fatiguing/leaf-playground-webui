import { Input as AntdInput } from 'antd';

const NoConfigRequired = () => {
  return (
    <AntdInput
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
      }}
      value={'No manual config required.'}
      readOnly
      bordered={false}
    />
  );
};

export default NoConfigRequired;
