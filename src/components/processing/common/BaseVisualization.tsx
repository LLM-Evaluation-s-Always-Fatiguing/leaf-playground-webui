import { useState } from 'react';
import { Button, Flex, Typography } from 'antd';
import { Select } from '@formily/antd-v5';
import styled from '@emotion/styled';
import { DefaultProcessingVisualizationComponentProps } from '@/components/processing/def';

const Container = styled(Typography)`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;

  .topTip {
    margin-top: 20px;
    align-self: center;
  }
`;

interface BaseVisualizationProps extends DefaultProcessingVisualizationComponentProps {
  onTryVisualization: (name: string) => void;
}

const BaseVisualization = (props: BaseVisualizationProps) => {
  const [tryVisualizationName, setTryVisualizationName] = useState<string>();

  return (
    <Container>
      <h2 className="topTip">No specialized visualization.</h2>
      <Flex
        style={{
          alignSelf: 'center',
        }}
      >
        <h4>You can try</h4>
        <Select
          style={{
            width: '240px',
            margin: '0 12px',
          }}
          allowClear
          value={tryVisualizationName}
          onChange={(value) => {
            setTryVisualizationName(value);
          }}
          options={[
            {
              label: 'SampleQAVisualization',
              value: 'SampleQAVisualization',
            },
            {
              label: 'WhoIsTheSpyVisualization',
              value: 'WhoIsTheSpyVisualization',
            },
          ]}
        />
        <Button
          type={'primary'}
          onClick={() => {
            if (tryVisualizationName) {
              props.onTryVisualization(tryVisualizationName);
            }
          }}
        >
          Confirm
        </Button>
      </Flex>
    </Container>
  );
};

export default BaseVisualization;
