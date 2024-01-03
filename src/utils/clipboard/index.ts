import copy from 'copy-to-clipboard';
import { message } from 'antd';

export function copyToClipboard(text: string) {
  const result = copy(text);
  if (result) {
    message.success('Copied');
  } else {
    message.error('Copy failed');
  }
}
