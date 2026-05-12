import React, { useState, useEffect } from 'react';
import { Modal, Form, InputNumber, Input, message, Switch } from 'antd';
import { Edit3 } from 'lucide-react';
import salaryService from '../../services/Payroll/salaryService';

const EditPayrollModal = ({ isOpen, onClose, onRefresh, payrollData }) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && payrollData) {
      form.setFieldsValue({
        phuCap: payrollData.PhuCap,
        khauTru: payrollData.TienKhauTruBH,
        ghiChu: payrollData.GhiChu,
        daThanhToan: payrollData.DaThanhToan === 1
      });
    }
  }, [isOpen, payrollData, form]);

  const handleFinish = async (values) => {
    try {
      setIsSubmitting(true);
      await salaryService.updatePayroll(payrollData.ID_BangLuong, values);
      message.success("Cập nhật phiếu lương thành công!");
      onRefresh();
      onClose();
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi khi cập nhật");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-blue-600">
          <Edit3 size={20} />
          <span className="font-bold">Chỉnh sửa phiếu lương - {payrollData?.HoTen}</span>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={isSubmitting}
      okText="Cập nhật"
      cancelText="Hủy"
      centered
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="mt-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="phuCap"
            label="Phụ Cấp"
            rules={[{ required: true, message: 'Nhập phụ cấp' }]}
          >
            <InputNumber
              className="w-full"
              min={0}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Form.Item>
          <Form.Item
            name="khauTru"
            label="Khấu Trừ"
            rules={[{ required: true, message: 'Nhập khấu trừ' }]}
          >
            <InputNumber
              className="w-full"
              min={0}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Form.Item>
        </div>

        <Form.Item name="daThanhToan" label="Trạng thái thanh toán" valuePropName="checked">
          <Switch 
            checkedChildren="Đã thanh toán" 
            unCheckedChildren="Chưa thanh toán" 
            className="bg-gray-200"
          />
        </Form.Item>
        <Form.Item name="ghiChu" label="Ghi chú">
          <Input.TextArea rows={3} placeholder="Lý do điều chỉnh..." />
        </Form.Item>

        <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
          <p className="text-[11px] text-amber-700 m-0">
            * Hệ thống sẽ tự động tính toán lại <b>Thực lĩnh</b> sau khi bạn lưu thay đổi.
          </p>
        </div>
      </Form>
    </Modal>
  );
};

export default EditPayrollModal;
