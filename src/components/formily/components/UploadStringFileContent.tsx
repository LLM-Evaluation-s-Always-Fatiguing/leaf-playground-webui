import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const { Dragger } = Upload;

interface FormilyUploadStringFileContentProps {
  value?: string;
  onChange: (value?: string) => void;
}

const FormilyUploadStringFileContent = (props: FormilyUploadStringFileContentProps) => {
  return (
    <div>
      <Dragger
        fileList={
          props.value
            ? [
              {
                name: 'Current File',
              } as any,
            ]
            : []
        }
        beforeUpload={async (file) => {
          try {
            const result = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.onerror = (e) => reject(e);
              reader.readAsText(file);
            });
            if (result) {
              props.onChange(result as string);
            }
          } catch (e) {
            console.error(e);
            message.error('Failed to read file as text!');
          }
          return false;
        }}
        onRemove={() => {
          props.onChange(undefined);
        }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag file to this area to upload</p>
        {props.value && (
          <p className="ant-upload-hint" style={{
            fontSize: 16, fontWeight: 500
          }}>
            Current file content: {props.value.substring(0, Math.min(props.value.length, 88))}...
          </p>
        )}
      </Dragger>
    </div>
  );
};

export default FormilyUploadStringFileContent;
