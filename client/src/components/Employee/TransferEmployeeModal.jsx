import React, { useState } from 'react';
import { Modal, Form, Select, Input, message } from 'antd';
import workHistoryService from '../../services/Employee/workHistoryService';

/**
 * TransferEmployeeModal - Component điều động / bổ nhiệm nhân sự
 * 
 * Props:
 * @param {boolean} open - Trạng thái hiển thị Modal
 * @param {function} onClose - Hàm xử lý khi đóng Modal
 * @param {function} onSuccess - Hàm gọi sau khi điều động thành công để load lại data cha
 * @param {string} targetMaNV - Mã nhân viên cần điều động
 * @param {Array} departments - Danh sách đơn vị [{ MaDonVi, TenDonVi }]
 * @param {Array} positions - Danh sách chức vụ [{ MaChucVu, TenChucVu }]
 */
const TransferEmployeeModal = ({
    open = false,
    onClose = () => { },
    onSuccess = () => { },
    targetMaNV = '',
    departments = [],
    positions = []
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // Xử lý khi nhấn Xác nhận trên Modal
    const handleSubmit = async () => {
        try {
            // Validate dữ liệu form trước khi gọi API
            const values = await form.validateFields();

            setLoading(true);

            // Payload gửi lên Backend theo đúng yêu cầu API
            const payload = {
                targetMaNV,
                newMaDonVi: values.newMaDonVi,
                newMaChucVu: values.newMaChucVu,
                lyDo: values.lyDo || ''
            };

            const response = await workHistoryService.transfer(payload);

            if (response.success) {
                message.success('Điều động nhân sự thành công');
                form.resetFields();
                onSuccess(); // Reload dữ liệu ở component cha
                onClose();   // Đóng modal
            } else {
                throw new Error(response.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            // Kiểm tra nếu là lỗi validation của AntD thì không hiện message.error chung
            if (error.errorFields) return;

            // Trích xuất message lỗi an toàn từ backend
            const errorMsg = error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                'Lỗi hệ thống khi thực hiện điều động';

            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Điều động / Bổ nhiệm nhân sự"
            open={open}
            onCancel={onClose}
            onOk={handleSubmit}
            confirmLoading={loading} // Chống double submit
            destroyOnHidden={true}     // Xóa dữ liệu form khi đóng modal
            mask={{ closable: false }}     // Không cho phép đóng bằng cách click ra ngoài
            okText="Xác nhận"
            cancelText="Hủy"
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{ lyDo: '' }}
            >
                <div style={{ marginBottom: 16 }}>
                    <strong>Nhân viên: </strong>
                    <span style={{ color: '#1890ff' }}>{targetMaNV}</span>
                </div>

                <Form.Item
                    name="newMaDonVi"
                    label="Đơn vị / Phòng ban mới"
                    rules={[{ required: true, message: 'Vui lòng chọn đơn vị mới' }]}
                >
                    <Select
                        placeholder="Chọn đơn vị"
                        showSearch
                        optionFilterProp="children"
                    >
                        {departments?.map(dept => (
                            <Select.Option key={dept.MaDonVi} value={dept.MaDonVi}>
                                {dept.TenDonVi}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="newMaChucVu"
                    label="Chức vụ mới"
                    rules={[{ required: true, message: 'Vui lòng chọn chức vụ mới' }]}
                >
                    <Select
                        placeholder="Chọn chức vụ"
                        showSearch
                        optionFilterProp="children"
                    >
                        {positions?.map(pos => (
                            <Select.Option key={pos.MaChucVu} value={pos.MaChucVu}>
                                {pos.TenChucVu}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="lyDo"
                    label="Lý do điều động / Ghi chú"
                    rules={[
                        { min: 5, message: 'Lý do phải ít nhất 5 ký tự' },
                        { max: 500, message: 'Lý do không được vượt quá 500 ký tự' }
                    ]}
                >
                    <Input.TextArea
                        rows={4}
                        placeholder="Nhập lý do điều động hoặc bổ nhiệm..."
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default TransferEmployeeModal;
