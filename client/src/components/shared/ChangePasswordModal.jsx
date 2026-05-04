import React, { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import authService from '../../services/Auth/authService';

const ChangePasswordModal = ({ isOpen, onClose, onLogout }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      await authService.changePassword(values.oldPassword, values.newPassword);
      message.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
      form.resetFields();
      onClose();
      onLogout();
    } catch (error) {
      const errorMsg = error?.response?.data?.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại!';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Đổi Mật Khẩu"
      open={isOpen}
      onCancel={handleCancel}
      destroyOnClose
      mask={{ closable: false }}
      okText="Xác nhận"
      cancelText="Hủy"
      onOk={() => form.submit()}
      confirmLoading={loading}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="oldPassword"
          label="Mật khẩu cũ"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu cũ!' },
          ]}
        >
          <Input.Password placeholder="Nhập mật khẩu cũ" />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="Mật khẩu mới"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('oldPassword') !== value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu mới không được trùng với mật khẩu cũ!'));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Nhập mật khẩu mới" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu mới"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Xác nhận mật khẩu không khớp!'));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Nhập lại mật khẩu mới" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;
