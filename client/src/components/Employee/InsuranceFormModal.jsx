import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message, Typography } from 'antd';
import { Edit3, CreditCard, ShieldCheck, Hospital, Save } from 'lucide-react';
import insuranceService from '../../services/Employee/insuranceService';

const { Text } = Typography;

const InsuranceFormModal = ({ isOpen, onClose, onSuccess, employeeId, initialData }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && initialData) {
            form.setFieldsValue({
                SoBHXH: initialData.SoBHXH,
                SoBHYT: initialData.SoBHYT,
                NoiDangKyKCB: initialData.NoiDangKyKCB
            });
        } else if (isOpen) {
            form.resetFields();
        }
    }, [isOpen, initialData, form]);

    const handleUpdate = async (values) => {
        setLoading(true);
        try {
            // [BẢO MẬT] Lọc bỏ dữ liệu Masked trước khi gửi để tránh ghi đè dữ liệu che mờ
            const payload = { ...values };
            if (payload.SoBHXH && (payload.SoBHXH.includes('x') || payload.SoBHXH.includes('*'))) {
                delete payload.SoBHXH;
            }

            const res = await insuranceService.updateInsuranceInfo(employeeId, payload);
            if (res.success) {
                message.success('Cập nhật thông tin bảo hiểm thành công');
                onSuccess();
                onClose();
                form.resetFields();
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi khi cập nhật thông tin');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={
                <div className="flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-blue-600" />
                    <span>Cập nhật Thông tin Bảo hiểm</span>
                </div>
            }
            open={isOpen}
            onCancel={onClose}
            onOk={() => form.submit()}
            confirmLoading={loading}
            destroyOnHidden
            maskClosable={false}
            centered
            footer={[
                <Button key="back" onClick={onClose} className="rounded-lg">
                    Hủy
                </Button>,
                <Button 
                    key="submit" 
                    type="primary" 
                    icon={<Save className="w-4 h-4 mr-1" />} 
                    loading={loading} 
                    onClick={() => form.submit()}
                    className="bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                    Cập nhật
                </Button>
            ]}
        >
            <Form form={form} layout="vertical" onFinish={handleUpdate} className="mt-4">
                <Form.Item
                    name="SoBHXH"
                    label={<span className="font-bold text-gray-700">Số BHXH</span>}
                    rules={[{ required: true, message: 'Vui lòng nhập số BHXH' }]}
                    extra={<Text type="secondary" className="text-[11px]">Giữ nguyên nếu số đang hiển thị dạng ẩn (chứa * hoặc x).</Text>}
                >
                    <Input size="large" prefix={<CreditCard className="w-4 h-4 text-gray-400" />} />
                </Form.Item>
                <Form.Item
                    name="SoBHYT"
                    label={<span className="font-bold text-gray-700">Số BHYT</span>}
                    rules={[{ required: true, message: 'Vui lòng nhập số BHYT' }]}
                >
                    <Input size="large" prefix={<ShieldCheck className="w-4 h-4 text-gray-400" />} />
                </Form.Item>
                <Form.Item
                    name="NoiDangKyKCB"
                    label={<span className="font-bold text-gray-700">Nơi Đăng ký KCB ban đầu</span>}
                >
                    <Input size="large" prefix={<Hospital className="w-4 h-4 text-gray-400" />} placeholder="Bệnh viện Đa khoa..." />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default InsuranceFormModal;
