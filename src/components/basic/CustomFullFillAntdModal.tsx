'use client';

import React from 'react';
import { Modal, ModalProps } from 'antd';

interface CustomFullFillAntdModalProps extends ModalProps {}

const CustomFullFillAntdModal: React.FC<CustomFullFillAntdModalProps> = (props) => {
  return <Modal wrapClassName={'custom-full-fill-antd-modal'} {...props} />;
};

export default CustomFullFillAntdModal;
