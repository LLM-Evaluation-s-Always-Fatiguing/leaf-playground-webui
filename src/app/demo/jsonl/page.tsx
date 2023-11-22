'use client';

import { Space, Card, Form, Input, Button, Row, Col, message } from 'antd';
import JSONViewer from '@/components/common/JSONViewer';
import { useState } from 'react';
import LocalAPI from '@/services/local';

const FormItem = Form.Item;

const JSONLTestPage = () => {
  const [jsonLObject, setJsonObject] = useState({});

  const loadJOSNLObject = async (filePath: string) => {
    try {
      const res = await LocalAPI.file.readJSONL(filePath);
      setJsonObject(res);
    } catch (e) {
      message.error(JSON.stringify(e));
    }
  };

  return (
    <Space
      direction={'vertical'}
      style={{
        width: '100%',
      }}
    >
      <Form
        layout="inline"
        onFinish={(values) => {
          loadJOSNLObject(values.filePath);
        }}
      >
        <Row>
          <Col>
            <FormItem label="JSONL file Path" name="filePath" required rules={[{ required: true }]}>
              <Input />
            </FormItem>
          </Col>
          <Col>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Col>
        </Row>
      </Form>
      <Card>
        <JSONViewer jsonObject={jsonLObject} />
      </Card>
    </Space>
  );
};

export default JSONLTestPage;
