import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Typography, Space, Tag, Modal, Form, Input, InputNumber, TimePicker, message, Popconfirm, Divider } from 'antd';
import { Timer, Plus, Edit3, Trash2, Clock, Info } from 'lucide-react';
import shiftService from '../services/System/shiftService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ShiftList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [form] = Form.useForm();

    const fetchShifts = async () => {
        setLoading(true);
        try {
            const res = await shiftService.getAll();
            setData(res.data?.data || []);
        } catch (err) {
            message.error(err.message || 'Không thể tải danh sách ca làm việc');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShifts();
    }, []);

    const handleOpenModal = (record = null) => {
        setEditingRecord(record);
        if (record) {
            form.setFieldsValue({
                ...record,
                gioBatDau: dayjs(record.GioBatDau, 'HH:mm:ss'),
                gioKetThuc: dayjs(record.GioKetThuc, 'HH:mm:ss'),
                maCa: record.MaCa,
                tenCa: record.TenCa,
                phutChoPhepTre: record.PhutChoPhepTre
            });
        } else {
            form.resetFields();
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            const payload = {
                ...values,
                gioBatDau: values.gioBatDau.format('HH:mm:ss'),
                gioKetThuc: values.gioKetThuc.format('HH:mm:ss'),
            };

            if (editingRecord) {
                await shiftService.update(editingRecord.MaCa, payload);
                message.success('Cập nhật ca làm việc thành công');
            } else {
                await shiftService.create(payload);
                message.success('Thêm ca làm việc mới thành công');
            }
            setIsModalOpen(false);
            fetchShifts();
        } catch (err) {
            message.error(err.message || 'Thao tác thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await shiftService.delete(id);
            message.success('Đã xóa ca làm việc');
            fetchShifts();
        } catch (err) {
            message.error(err.message || 'Lỗi khi xóa');
        }
    };

    const columns = [
        {
            title: 'Mã Ca',
            dataIndex: 'MaCa',
            key: 'MaCa',
            render: (text) => <Tag color="blue" className="font-mono font-bold px-3 py-1 rounded-md">{text}</Tag>
        },
        {
            title: 'Tên Ca',
            dataIndex: 'TenCa',
            key: 'TenCa',
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Giờ Bắt Đầu',
            dataIndex: 'GioBatDau',
            key: 'GioBatDau',
            render: (time) => <span className="flex items-center gap-2"><Clock size={14} className="text-blue-500" /> {dayjs(time, 'HH:mm:ss').format('HH:mm')}</span>
        },
        {
            title: 'Giờ Kết Thúc',
            dataIndex: 'GioKetThuc',
            key: 'GioKetThuc',
            render: (time) => <span className="flex items-center gap-2"><Clock size={14} className="text-orange-500" /> {dayjs(time, 'HH:mm:ss').format('HH:mm')}</span>
        },
        {
            title: 'Cho Phép Trễ',
            dataIndex: 'PhutChoPhepTre',
            key: 'PhutChoPhepTre',
            render: (min) => <Tag color={min > 0 ? 'warning' : 'default'}>{min} phút</Tag>
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 120,
            render: (_, r) => (
                <Space>
                    <Button 
                        type="text" 
                        icon={<Edit3 size={16} />} 
                        onClick={() => handleOpenModal(r)}
                        className="text-indigo-600 hover:bg-indigo-50"
                    />
                    <Popconfirm
                        title="Xóa ca làm việc này?"
                        description="Hành động này không thể hoàn tác."
                        onConfirm={() => handleDelete(r.MaCa)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button 
                            type="text" 
                            danger 
                            icon={<Trash2 size={16} />} 
                        />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <Card className="shadow-sm border-0">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                            <Timer size={32} />
                        </div>
                        <div>
                            <Title level={3} className="m-0">Danh mục Ca làm việc</Title>
                            <Text className="text-gray-400">Quản lý định nghĩa thời gian làm việc trong hệ thống</Text>
                        </div>
                    </div>
                    <Button 
                        type="primary" 
                        icon={<Plus size={18} />} 
                        onClick={() => handleOpenModal()}
                        className="h-12 px-6 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-100 font-bold"
                    >
                        Thêm Ca Mới
                    </Button>
                </div>

                <Table 
                    columns={columns} 
                    dataSource={data} 
                    rowKey="MaCa" 
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    className="custom-table"
                />
            </Card>

            <Modal
                title={
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                            {editingRecord ? <Edit3 size={18} /> : <Plus size={18} />}
                        </div>
                        <span className="font-bold">{editingRecord ? 'Cập nhật Ca làm việc' : 'Thêm Ca làm việc mới'}</span>
                    </div>
                }
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={loading}
                width={500}
                centered
                okText={editingRecord ? "Cập nhật" : "Lưu mới"}
                cancelText="Hủy bỏ"
                className="modern-modal"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{ phutChoPhepTre: 0 }}
                    className="mt-4"
                >
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="maCa"
                            label="Mã Ca"
                            rules={[{ required: true, message: 'Vui lòng nhập mã ca' }]}
                        >
                            <Input placeholder="VD: HC, CA1..." disabled={!!editingRecord} className="h-10 rounded-lg" />
                        </Form.Item>
                        <Form.Item
                            name="tenCa"
                            label="Tên Ca"
                            rules={[{ required: true, message: 'Vui lòng nhập tên ca' }]}
                        >
                            <Input placeholder="VD: Hành chính" className="h-10 rounded-lg" />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="gioBatDau"
                            label="Giờ Bắt Đầu"
                            rules={[{ required: true, message: 'Chọn giờ bắt đầu' }]}
                        >
                            <TimePicker format="HH:mm:ss" className="w-full h-10 rounded-lg" />
                        </Form.Item>
                        <Form.Item
                            name="gioKetThuc"
                            label="Giờ Kết Thúc"
                            rules={[{ required: true, message: 'Chọn giờ kết thúc' }]}
                        >
                            <TimePicker format="HH:mm:ss" className="w-full h-10 rounded-lg" />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="phutChoPhepTre"
                        label="Số phút cho phép đi trễ"
                    >
                        <InputNumber min={0} className="w-full h-10 rounded-lg flex items-center" />
                    </Form.Item>

                    <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3 border border-blue-100">
                        <Info size={16} className="text-blue-600 mt-1" />
                        <Text className="text-[11px] text-blue-800 leading-relaxed">
                            Thông tin này sẽ được sử dụng làm căn cứ để hệ thống tự động tính toán dữ liệu đi trễ, về sớm và tính công ngày cho nhân viên.
                        </Text>
                    </div>
                </Form>
            </Modal>

            <style>{`
                .custom-table .ant-table-thead > tr > th {
                    background: #f8fafc;
                    font-size: 11px;
                    text-transform: uppercase;
                    font-weight: 700;
                    color: #64748b;
                    letter-spacing: 0.05em;
                    padding: 16px;
                }
                .custom-table .ant-table-tbody > tr > td {
                    padding: 16px;
                }
                .modern-modal .ant-modal-content {
                    border-radius: 20px;
                    padding: 24px;
                }
                .modern-modal .ant-modal-header {
                    border-bottom: 0;
                }
                .modern-modal .ant-modal-footer {
                    border-top: 0;
                    padding-top: 0;
                }
                .modern-modal .ant-btn {
                    border-radius: 10px;
                    height: 40px;
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
};

export default ShiftList;
