import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select, Upload, Button, message, Row, Col } from 'antd';
import { FileText, Upload as UploadIcon, AlertCircle, Save, X } from 'lucide-react';
import dayjs from 'dayjs';
import contractService from '../../services/Payroll/contractService';

const { Option } = Select;

const ContractFormModal = ({ isOpen, onClose, onRefresh, initialData, employeeId }) => {
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fileList, setFileList] = useState([]);

    useEffect(() => {
        const prepareData = async () => {
            if (isOpen) {
                if (initialData) {
                    form.setFieldsValue({
                        ...initialData,
                        NgayKy: initialData.NgayKy ? dayjs(initialData.NgayKy) : null,
                        NgayCoHieuLuc: initialData.NgayCoHieuLuc ? dayjs(initialData.NgayCoHieuLuc) : null,
                        NgayHetHan: initialData.NgayHetHan ? dayjs(initialData.NgayHetHan) : null,
                    });
                    if (initialData.TepDinhKem) {
                        setFileList([
                            {
                                uid: '-1',
                                name: initialData.TepDinhKem.split('/').pop(),
                                status: 'done',
                                url: `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/${initialData.TepDinhKem}`,
                            },
                        ]);
                    } else {
                        setFileList([]);
                    }
                } else {
                    form.resetFields();
                    setFileList([]);
                    // Tự động tạo mã hợp đồng mới từ Backend
                    try {
                        const res = await contractService.generateCode();
                        if (res.success) {
                            form.setFieldsValue({ MaHopDong: res.code });
                        }
                    } catch (error) {
                        console.error('Lỗi khi tạo mã hợp đồng:', error);
                    }
                }
            }
        };
        prepareData();
    }, [isOpen, initialData, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setIsSubmitting(true);

            const formData = new FormData();
            formData.append('MaHopDong', values.MaHopDong);
            formData.append('MaNV', employeeId);
            formData.append('LoaiHopDong', values.LoaiHopDong);
            formData.append('NgayKy', values.NgayKy.format('YYYY-MM-DD'));
            formData.append('NgayCoHieuLuc', values.NgayCoHieuLuc.format('YYYY-MM-DD'));
            if (values.NgayHetHan) {
                formData.append('NgayHetHan', values.NgayHetHan.format('YYYY-MM-DD'));
            }
            formData.append('TrangThai', values.TrangThai || 'Đang hiệu lực');

            if (fileList.length > 0 && fileList[0].originFileObj) {
                formData.append('contractFile', fileList[0].originFileObj);
            }

            let res;
            if (initialData) {
                res = await contractService.update(initialData.MaHopDong, formData);
            } else {
                res = await contractService.create(formData);
            }

            if (res.success) {
                message.success(initialData ? 'Cập nhật hợp đồng thành công' : 'Thêm hợp đồng mới thành công');
                onRefresh();
                onClose();
            } else {
                message.error(res.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Submit error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            title={
                <div className="flex items-center gap-2 text-blue-600">
                    <FileText className="w-5 h-5" />
                    <span>{initialData ? 'Chỉnh sửa hợp đồng' : 'Thêm hợp đồng mới'}</span>
                </div>
            }
            open={isOpen}
            onCancel={onClose}
            destroyOnHidden={true}
            mask={{ closable: false }}
            footer={[
                <Button key="cancel" onClick={onClose} icon={<X className="w-4 h-4 inline mr-1" />}>
                    Hủy
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    onClick={handleSubmit}
                    loading={isSubmitting}
                    className="bg-blue-600"
                    icon={<Save className="w-4 h-4 inline mr-1" />}
                >
                    {initialData ? 'Cập nhật' : 'Lưu hợp đồng'}
                </Button>
            ]}
            width={650}
            centered
            className="modern-modal"
        >
            <Form form={form} layout="vertical" className="mt-4">
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="MaHopDong"
                            label="Mã hợp đồng (Tự động)"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mã hợp đồng' },
                                { max: 50, message: 'Mã hợp đồng quá dài' }
                            ]}
                        >
                            <Input
                                placeholder="Hệ thống tự tạo..."
                                readOnly
                                className="bg-gray-50 font-mono font-bold text-blue-700"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="LoaiHopDong"
                            label="Loại hợp đồng"
                            rules={[{ required: true, message: 'Vui lòng chọn loại hợp đồng' }]}
                        >
                            <Select placeholder="Chọn loại hợp đồng">
                                <Option value="Hợp đồng thử việc">Hợp đồng thử việc</Option>
                                <Option value="Hợp đồng xác định thời hạn (1 năm)">Hợp đồng xác định thời hạn (1 năm)</Option>
                                <Option value="Hợp đồng xác định thời hạn (3 năm)">Hợp đồng xác định thời hạn (3 năm)</Option>
                                <Option value="Hợp đồng không xác định thời hạn">Hợp đồng không xác định thời hạn</Option>
                                <Option value="Cộng tác viên">Cộng tác viên</Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item
                            name="NgayKy"
                            label="Ngày ký"
                            rules={[{ required: true, message: 'Chọn ngày ký' }]}
                        >
                            <DatePicker className="w-full" format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item
                            name="NgayCoHieuLuc"
                            label="Ngày có hiệu lực"
                            rules={[{ required: true, message: 'Chọn ngày hiệu lực' }]}
                        >
                            <DatePicker className="w-full" format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item
                            name="NgayHetHan"
                            label="Ngày hết hạn"
                        >
                            <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="Bỏ trống nếu vô thời hạn" />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            name="TrangThai"
                            label="Trạng thái"
                            initialValue="Đang hiệu lực"
                        >
                            <Select>
                                <Option value="Đang hiệu lực">Đang hiệu lực</Option>
                                <Option value="Đã hết hạn">Đã hết hạn</Option>
                                <Option value="Đã thanh lý">Đã thanh lý</Option>
                                <Option value="Tạm hoãn">Tạm hoãn</Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label="File đính kèm (Bản scan PDF/Ảnh)">
                            <Upload
                                fileList={fileList}
                                onChange={({ fileList }) => setFileList(fileList)}
                                beforeUpload={() => false}
                                maxCount={1}
                            >
                                <Button icon={<UploadIcon className="w-4 h-4" />}>Chọn tệp tin</Button>
                            </Upload>
                        </Form.Item>
                    </Col>
                </Row>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2 items-start mt-2">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-xs text-amber-700 italic">
                        Lưu ý: Mọi thay đổi về hợp đồng sẽ được ghi lại trong nhật ký hệ thống (Audit Log).
                        Vui lòng kiểm tra kỹ các mốc thời gian hiệu lực.
                    </p>
                </div>
            </Form>
        </Modal>
    );
};

export default ContractFormModal;
