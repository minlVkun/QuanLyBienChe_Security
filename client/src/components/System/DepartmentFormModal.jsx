import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { Building2 } from 'lucide-react';
import departmentService from '../../services/System/departmentService';

const DepartmentFormModal = ({ isOpen, onClose, onRefresh, initialData, departments }) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.setFieldsValue({
          maDonVi: initialData.MaDonVi,
          tenDonVi: initialData.TenDonVi,
          maDonViCha: initialData.MaDonViCha
        });
      } else {
        form.resetFields();
      }
    }
  }, [isOpen, initialData, form]);

  const handleFinish = async (values) => {
    try {
      setIsSubmitting(true);
      if (initialData) {
        await departmentService.update(initialData.MaDonVi, values);
        message.success("Cập nhật đơn vị thành công!");
      } else {
        await departmentService.create(values);
        message.success("Thêm đơn vị mới thành công!");
      }
      onRefresh();
      onClose();
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi khi lưu dữ liệu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const parentOptions = [
    { value: null, label: '-- Không có (Gốc) --' },
    ...departments
      .filter(d => !initialData || d.MaDonVi !== initialData.MaDonVi)
      .map(d => ({ value: d.MaDonVi, label: d.TenDonVi }))
  ];

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-blue-600">
          <Building2 size={20} />
          <span className="font-bold">{initialData ? 'Chỉnh sửa đơn vị' : 'Thêm đơn vị mới'}</span>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={isSubmitting}
      okText={initialData ? "Cập nhật" : "Thêm mới"}
      cancelText="Hủy"
      centered
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="mt-4"
      >
        <Form.Item 
          name="maDonVi" 
          label="Mã Đơn Vị" 
          rules={[{ required: true, message: 'Nhập mã đơn vị' }]}
          disabled={!!initialData}
        >
          <Input placeholder="VD: DV_IT" disabled={!!initialData} />
        </Form.Item>
        
        <Form.Item 
          name="tenDonVi" 
          label="Tên Đơn Vị" 
          rules={[{ required: true, message: 'Nhập tên đơn vị' }]}
        >
          <Input placeholder="VD: Phòng Công nghệ thông tin" />
        </Form.Item>

        <Form.Item 
          name="maDonViCha" 
          label="Đơn vị trực thuộc (Cấp trên)"
        >
          <Select options={parentOptions} placeholder="Chọn đơn vị cấp trên" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DepartmentFormModal;
