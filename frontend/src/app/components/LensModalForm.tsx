import { Form, FormInstance, FormProps, Modal, ModalProps } from 'antd';
import useI18NPrefix from 'app/hooks/useI18NPrefix';
import { CommonFormTypes } from 'globalConstants';
import {
  forwardRef,
  ReactNode,
  useCallback,
  useImperativeHandle,
} from 'react';
import styled from 'styled-components';

export interface LensModalFormProps extends ModalProps {
  type?: CommonFormTypes;
  formProps?: FormProps;
  onSave: (values: any) => void;
  children?: ReactNode;
}

export const LensModalForm = forwardRef<FormInstance, LensModalFormProps>(
  ({ type, formProps, onSave, afterClose, children, title, ...rest }, ref) => {
    const [form] = Form.useForm();
    const tg = useI18NPrefix('global');
    useImperativeHandle(ref, () => form);

    const handleOk = useCallback(() => form.submit(), [form]);
    const handleAfterClose = useCallback(() => {
      form.resetFields();
      afterClose?.();
    }, [afterClose, form]);

    const modalTitle =
      type === CommonFormTypes.SaveAs
        ? tg('button.saveAs')
        : `${type ? tg(`modal.title.${type}`) : ''}${title || ''}`;

    return (
      <StyledModal
        {...rest}
        width={rest.width || 560}
        title={modalTitle}
        onOk={handleOk}
        afterClose={handleAfterClose}
      >
        <LensForm
          form={form}
          layout="vertical"
          onFinish={onSave}
          {...formProps}
        >
          {children}
        </LensForm>
      </StyledModal>
    );
  },
);

const StyledModal = styled(Modal)`
  .ant-modal-header {
    padding-bottom: 12px;
    margin-bottom: 12px;
    border-bottom: 1px solid ${p => p.theme.borderColorSplit};
  }

  .ant-modal-title {
    font-size: 15px;
    font-weight: 600;
  }

  .ant-modal-footer {
    padding-top: 12px;
    margin-top: 8px;
    border-top: 1px solid ${p => p.theme.borderColorSplit};
  }
`;

const LensForm = styled(Form)`
  .ant-form-item {
    margin-bottom: 14px;
  }

  .ant-form-item-label > label {
    font-size: 12px;
    color: ${p => p.theme.textColorSnd};
  }
`;
