import styled from '@emotion/styled';
import { useTheme } from "antd-style";

const Container = styled.div`
  width: 100%;
  height: 100%;

  .header {
    height: 60px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    font-size: 21px;
    font-weight: 500;
    padding: 0 16px;
    border-bottom: 1px solid ${(props) => props.theme.dividerColor};

    .connectionStatus {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;

      .indicator {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        margin-right: 8px;
      }

      font-size: 14px;
      font-weight: normal;
    }

    > div {
      flex-basis: 1px;
      flex-shrink: 0;
    }
  }
`;

interface ProcessingConsoleProps {
  wsConnected: boolean;
}

const ProcessingConsole = (props: ProcessingConsoleProps) => {
  const theme = useTheme();
  return (
    <Container>
      <div className="header">
        <div className="connectionStatus">
          <div
            className="indicator"
            style={{
              background: props.wsConnected ? theme.colorSuccess : theme.colorError,
            }}
          />
          {props.wsConnected ? <span>Connected</span> : <span>Disconnected</span>}
        </div>
        <div>Console</div>
        <div></div>
      </div>
    </Container>
  );
};

export default ProcessingConsole;
