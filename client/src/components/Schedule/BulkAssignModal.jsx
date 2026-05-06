// client/src/components/Schedule/BulkAssignModal.jsx
import React, { useState, useEffect } from 'react';
import {
    Modal, Form, Select, DatePicker, Button,
    message, Tag, Divider, Alert, Spin
} from 'antd';
import { Users, Calendar, Zap } from 'lucide-react';
import dayjs from 'dayjs';
import scheduleService from '../../services/Schedule/scheduleService';

const { RangePicker } = DatePicker;

/**
 * Modal Phân ca hàng loạt
 * Props:
 *   isOpen     — boolean
 *   onClose    — () => void
 *   onRefresh  — () => void
 *   shifts     — [{ MaCaLamViec, TenCa }] — danh sách ca từ API
 *   employees  — [{ MaNV, HoTen }]         — danh sách NV từ API (tuỳ chọn, có thể nhập tay)
 */
const BulkAssignModal = ({ isOpen, onClose, onRefresh, shifts = [], employees = [] }) => {
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedDays, setSelectedDays] = useState([]);

    useEffect(() => {
        if (isOpen) {
            form.resetFields();
            setSelectedDays([]);
        }
    }, [isOpen, form]);

    // Từ RangePicker → mảng ngày làm theo ngày trong tuần được chọn (hoặc toàn bộ nếu không lọc)
    const handleRangeChange = (dates) => {
        if (!dates || !dates[0] || !dates[1]) { setSelectedDays([]); return; }
        const start = dates[0];
        const end   = dates[1];
        const days  = [];
        let cur = start;
        while (cur.isBefore(end, 'day') || cur.isSame(end, 'day')) {
            days.push(cur.format('YYYY-MM-DD'));
            cur = cur.add(1, 'day');
        }
        setSelectedDays(days);
    };

    const handleFinish = async (values) => {
        if (selectedDays.length === 0) {
            return message.warning('Vui lòng chọn khoảng thời gian để phân ca.');
        }
        try {
            setIsSubmitting(true);
            const payload = {
                maNVList: values.maNVList,
                maCaLamViec: values.maCaLamViec,
                ngayLamList: selectedDays,
                ghiChu: values.ghiChu || null
            };
            const result = await scheduleService.bulkAssign(payload);
            message.success(result.message || 'Phân ca hàng loạt thành công!');
            onRefresh();
            onClose();
        } catch (err) {
            message.error(err.response?.data?.message || 'Lỗi khi phân ca hàng loạt');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            open={isOpen}
            onCancel={onClose}
            onOk={() => form.submit()}
            confirmLoading={isSubmitting}
            okText={isSubmitting ? <Spin size="small" /> : 'Phân ca'}
            cancelText="Đóng"
            width={620}
            centered
            title={
                <div className="flex items-center gap-2 text-indigo-600">
                    <Zap size={18} />
                    <span className="font-bold">Phân Ca Hàng Loạt</span>
                </div>
            }
        >
            <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-3">
                {/* Chọn nhân viên */}
                <Form.Item
                    name="maNVList"
                    label={<span className="flex items-center gap-1"><Users size={14} /> Nhân viên</span>}
                    rules={[{ required: true, message: 'Chọn ít nhất 1 nhân viên' }]}
                >
                    <Select
                        mode="multiple"
                        allowClear
                        showSearch
                        placeholder="Chọn hoặc nhập mã NV..."
                        optionFilterProp="label"
                        options={employees.map(e => ({
                            value: e.MaNV,
                            label: `${e.MaNV} — ${e.HoTen}`
                        }))}
                    />
                </Form.Item>

                {/* Chọn ca làm việc */}
                <Form.Item
                    name="maCaLamViec"
                    label="Ca làm việc"
                    rules={[{ required: true, message: 'Chọn ca làm việc' }]}
                >
                    <Select
                        placeholder="Chọn ca..."
                        options={shifts.map(s => ({
                            value: s.MaCaLamViec,
                            label: `${s.TenCa} (${s.MaCaLamViec})`
                        }))}
                    />
                </Form.Item>

                {/* Khoảng thời gian */}
                <Form.Item
                    label={<span className="flex items-center gap-1"><Calendar size={14} /> Khoảng thời gian</span>}
                    required
                >
                    <RangePicker
                        className="w-full"
                        format="DD/MM/YYYY"
                        onChange={handleRangeChange}
                        disabledDate={d => d && d < dayjs().startOf('day')}
                    />
                </Form.Item>

                {/* Preview số ngày */}
                {selectedDays.length > 0 && (
                    <Alert
                        type="info"
                        className="mb-3"
                        message={
                            <span>
                                Sẽ phân ca <strong>{selectedDays.length} ngày</strong>.
                                {' '}Các ngày đã có lịch sẽ được bỏ qua tự động.
                            </span>
                        }
                        description={
                            <div className="flex flex-wrap gap-1 mt-1">
                                {selectedDays.slice(0, 10).map(d => (
                                    <Tag key={d} color="blue">{d}</Tag>
                                ))}
                                {selectedDays.length > 10 && (
                                    <Tag color="default">+{selectedDays.length - 10} ngày...</Tag>
                                )}
                            </div>
                        }
                    />
                )}

                <Divider className="my-2" />

                <Form.Item name="ghiChu" label="Ghi chú (tùy chọn)">
                    <Select
                        mode="tags"
                        tokenSeparators={[',']}
                        placeholder="Nhập ghi chú..."
                        maxTagCount={1}
                        open={false}
                        suffixIcon={null}
                        style={{ width: '100%' }}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default BulkAssignModal;
