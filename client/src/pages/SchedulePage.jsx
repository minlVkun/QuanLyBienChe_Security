// client/src/pages/SchedulePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Table, Button, DatePicker, Select, Input, Tag, Tooltip,
    Popconfirm, message, Form, Modal, Space, Badge, Tabs
} from 'antd';
import {
    CalendarDays, Plus, Zap, Pencil, Trash2,
    Search, RefreshCw, Users
} from 'lucide-react';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import scheduleService from '../services/Schedule/scheduleService';
import axiosClient from '../api/axiosClient';
import BulkAssignModal from '../components/Schedule/BulkAssignModal';

dayjs.extend(isoWeek);
const { RangePicker } = DatePicker;
const { Option } = Select;

// ─── Màu theo ca ───────────────────────────────────────────────────────────────
const shiftColors = ['blue', 'green', 'orange', 'purple', 'cyan', 'magenta', 'gold'];
const getShiftColor = (maCa) => {
    let hash = 0;
    for (let i = 0; i < maCa.length; i++) hash = maCa.charCodeAt(i) + ((hash << 5) - hash);
    return shiftColors[Math.abs(hash) % shiftColors.length];
};

// ─── Calendar Week View ─────────────────────────────────────────────────────────
const WeekCalendar = ({ schedules, weekStart, onDelete, canEdit }) => {
    const days = Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'));
    // Nhóm lịch theo ngày
    const byDay = {};
    schedules.forEach(s => {
        const key = dayjs(s.NgayLam).format('YYYY-MM-DD');
        if (!byDay[key]) byDay[key] = [];
        byDay[key].push(s);
    });

    return (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
            <div className="grid grid-cols-7 min-w-[700px]">
                {days.map(d => {
                    const key   = d.format('YYYY-MM-DD');
                    const isToday = d.isSame(dayjs(), 'day');
                    return (
                        <div key={key} className="border-r border-gray-100 last:border-0">
                            {/* Header ngày */}
                            <div className={`p-2 text-center text-xs font-semibold border-b
                                ${isToday ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-500'}`}>
                                {d.format('ddd')}<br/>
                                <span className={`text-base font-bold ${isToday ? 'text-white' : 'text-gray-800'}`}>
                                    {d.format('D')}
                                </span>
                            </div>
                            {/* Danh sách lịch */}
                            <div className="p-1.5 min-h-[120px] space-y-1 bg-white">
                                {(byDay[key] || []).map(s => (
                                    <div key={s.LichID}
                                        className="rounded-lg px-2 py-1 text-xs flex justify-between items-start gap-1"
                                        style={{ background: `var(--ant-${getShiftColor(s.MaCaLamViec)}-1, #eef2ff)`,
                                                 borderLeft: `3px solid var(--ant-${getShiftColor(s.MaCaLamViec)}-6, #4f46e5)` }}>
                                        <div>
                                            <div className="font-semibold text-gray-800">{s.HoTen}</div>
                                            <div className="text-gray-500">{s.TenCa}</div>
                                        </div>
                                        {canEdit && (
                                            <Popconfirm
                                                title="Xóa lịch này?"
                                                onConfirm={() => onDelete(s.LichID)}
                                                okText="Xóa" cancelText="Hủy"
                                            >
                                                <Trash2 size={12} className="text-red-400 cursor-pointer hover:text-red-600 flex-shrink-0 mt-0.5" />
                                            </Popconfirm>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const SchedulePage = () => {
    const [schedules,   setSchedules]   = useState([]);
    const [shifts,      setShifts]      = useState([]);
    const [employees,   setEmployees]   = useState([]);
    const [loading,     setLoading]     = useState(false);
    const [pagination,  setPagination]  = useState({ total: 0, page: 1, limit: 50 });

    // Bộ lọc
    const [dateRange,   setDateRange]   = useState([dayjs().startOf('isoWeek'), dayjs().endOf('isoWeek')]);
    const [maDonVi,     setMaDonVi]     = useState('');
    const [keyword,     setKeyword]     = useState('');
    const [weekStart,   setWeekStart]   = useState(dayjs().startOf('isoWeek'));

    // Modal states
    const [showBulk,    setShowBulk]    = useState(false);
    const [editRecord,  setEditRecord]  = useState(null);
    const [editForm]                    = Form.useForm();
    const [editLoading, setEditLoading] = useState(false);

    const [activeTab, setActiveTab] = useState('calendar');

    // ── Tải danh sách ca và NV một lần ──────────────────────────────────────────
    useEffect(() => {
        axiosClient.get('/shifts', { params: { limit: 200 } }).then(r => {
            setShifts(r.data.data || []);
        });
        axiosClient.get('/employees', { params: { limit: 500 } }).then(r => {
            setEmployees(r.data.data || []);
        });
    }, []);

    // ── Tải lịch làm việc ───────────────────────────────────────────────────────
    const fetchSchedules = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: pagination.limit,
                fromDate: dateRange?.[0]?.format('YYYY-MM-DD'),
                toDate:   dateRange?.[1]?.format('YYYY-MM-DD'),
            };
            if (maDonVi)  params.maDonVi = maDonVi;
            const result = await scheduleService.getAll(params);
            setSchedules(result.data || []);
            setPagination(prev => ({ ...prev, ...result.pagination, page }));
        } catch {
            message.error('Không tải được lịch làm việc');
        } finally {
            setLoading(false);
        }
    }, [dateRange, maDonVi, pagination.limit]);

    useEffect(() => { fetchSchedules(1); }, [dateRange, maDonVi]);

    // ── Xóa ─────────────────────────────────────────────────────────────────────
    const handleDelete = async (id) => {
        try {
            await scheduleService.delete(id);
            message.success('Đã xóa lịch làm việc');
            fetchSchedules(pagination.page);
        } catch (err) {
            message.error(err.response?.data?.message || 'Lỗi khi xóa');
        }
    };

    // ── Sửa ─────────────────────────────────────────────────────────────────────
    const openEdit = (record) => {
        setEditRecord(record);
        editForm.setFieldsValue({
            maCaLamViec: record.MaCaLamViec,
            ngayLam:     dayjs(record.NgayLam),
            ghiChu:      record.GhiChu
        });
    };

    const handleEditSubmit = async (values) => {
        setEditLoading(true);
        try {
            await scheduleService.update(editRecord.LichID, {
                maCaLamViec: values.maCaLamViec,
                ngayLam:     values.ngayLam.format('YYYY-MM-DD'),
                ghiChu:      values.ghiChu || null
            });
            message.success('Cập nhật lịch thành công!');
            setEditRecord(null);
            fetchSchedules(pagination.page);
        } catch (err) {
            message.error(err.response?.data?.message || 'Lỗi khi cập nhật');
        } finally {
            setEditLoading(false);
        }
    };

    // ── Columns bảng ────────────────────────────────────────────────────────────
    const columns = [
        { title: 'ID', dataIndex: 'LichID', width: 60 },
        { title: 'Mã NV', dataIndex: 'MaNV', width: 90 },
        { title: 'Họ tên', dataIndex: 'HoTen', ellipsis: true },
        { title: 'Đơn vị', dataIndex: 'TenDonVi', ellipsis: true },
        {
            title: 'Ngày làm',
            dataIndex: 'NgayLam',
            render: v => dayjs(v).format('DD/MM/YYYY'),
            width: 110
        },
        {
            title: 'Ca làm việc',
            dataIndex: 'TenCa',
            render: (v, r) => <Tag color={getShiftColor(r.MaCaLamViec)}>{v}</Tag>,
            width: 140
        },
        {
            title: 'Giờ',
            render: (_, r) => (
                <span className="text-xs text-gray-500">
                    {r.GioBatDau?.substring(0,5)} – {r.GioKetThuc?.substring(0,5)}
                </span>
            ),
            width: 110
        },
        { title: 'Ghi chú', dataIndex: 'GhiChu', ellipsis: true },
        {
            title: 'Thao tác',
            width: 90,
            render: (_, r) => (
                <Space size={4}>
                    <Tooltip title="Sửa">
                        <Button size="small" icon={<Pencil size={13}/>} onClick={() => openEdit(r)} />
                    </Tooltip>
                    <Popconfirm title="Xóa lịch này?" onConfirm={() => handleDelete(r.LichID)} okText="Xóa" cancelText="Hủy">
                        <Button size="small" danger icon={<Trash2 size={13}/>} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div className="p-4 space-y-4">
            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
                        <CalendarDays size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-800 m-0">Lịch Làm Việc</h1>
                        <p className="text-xs text-gray-400 m-0">Phân ca & Quản lý lịch làm việc</p>
                    </div>
                </div>

                <Space>
                    <Button
                        icon={<RefreshCw size={14}/>}
                        onClick={() => fetchSchedules(1)}
                        loading={loading}
                    >Làm mới</Button>
                    <Button
                        type="primary"
                        icon={<Zap size={14}/>}
                        onClick={() => setShowBulk(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 border-0"
                    >Phân ca hàng loạt</Button>
                </Space>
            </div>

            {/* ── Bộ lọc ── */}
            <div className="bg-white rounded-xl border border-gray-100 p-3 flex flex-wrap gap-3 items-end shadow-sm">
                <div>
                    <div className="text-xs text-gray-500 mb-1">Khoảng thời gian</div>
                    <RangePicker
                        value={dateRange}
                        onChange={v => { setDateRange(v); if (v) setWeekStart(v[0].startOf('isoWeek')); }}
                        format="DD/MM/YYYY"
                    />
                </div>
                <div>
                    <div className="text-xs text-gray-500 mb-1">Từ khóa</div>
                    <Input
                        prefix={<Search size={13} className="text-gray-400"/>}
                        placeholder="Mã NV / Tên..."
                        value={keyword}
                        onChange={e => setKeyword(e.target.value)}
                        className="w-40"
                        allowClear
                    />
                </div>
                <Badge count={schedules.length} showZero color="blue" offset={[4, 0]}>
                    <span className="text-xs text-gray-500">bản ghi</span>
                </Badge>
            </div>

            {/* ── Tabs: Calendar | Table ── */}
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                type="card"
                size="small"
                items={[
                    {
                        key: 'calendar',
                        label: (
                            <span className="flex items-center gap-1.5">
                                <CalendarDays size={13}/> Lịch tuần
                            </span>
                        ),
                        children: (
                            <div className="bg-white rounded-b-xl rounded-tr-xl border border-gray-100 p-3 shadow-sm">
                                {/* Week nav */}
                                <div className="flex items-center justify-between mb-3">
                                    <Button size="small" onClick={() => setWeekStart(w => w.subtract(1, 'week'))}>
                                        ← Tuần trước
                                    </Button>
                                    <span className="font-semibold text-gray-700 text-sm">
                                        Tuần {weekStart.isoWeek()} · {weekStart.format('DD/MM')} – {weekStart.add(6,'day').format('DD/MM/YYYY')}
                                    </span>
                                    <Button size="small" onClick={() => setWeekStart(w => w.add(1, 'week'))}>
                                        Tuần sau →
                                    </Button>
                                </div>
                                <WeekCalendar
                                    schedules={schedules.filter(s =>
                                        dayjs(s.NgayLam) >= weekStart &&
                                        dayjs(s.NgayLam) <= weekStart.add(6, 'day')
                                    )}
                                    weekStart={weekStart}
                                    onDelete={handleDelete}
                                    canEdit={true}
                                />
                            </div>
                        )
                    },
                    {
                        key: 'table',
                        label: (
                            <span className="flex items-center gap-1.5">
                                <Users size={13}/> Bảng danh sách
                            </span>
                        ),
                        children: (
                            <Table
                                dataSource={schedules.filter(s =>
                                    !keyword ||
                                    s.MaNV?.includes(keyword) ||
                                    s.HoTen?.toLowerCase().includes(keyword.toLowerCase())
                                )}
                                columns={columns}
                                rowKey="LichID"
                                loading={loading}
                                size="small"
                                pagination={{
                                    total: pagination.total,
                                    current: pagination.page,
                                    pageSize: pagination.limit,
                                    showSizeChanger: true,
                                    showTotal: (t) => `Tổng ${t} bản ghi`,
                                    onChange: (p) => fetchSchedules(p)
                                }}
                                className="rounded-xl overflow-hidden border border-gray-100 shadow-sm"
                            />
                        )
                    }
                ]}
            />

            {/* ── Modal Phân ca hàng loạt ── */}
            <BulkAssignModal
                isOpen={showBulk}
                onClose={() => setShowBulk(false)}
                onRefresh={() => fetchSchedules(1)}
                shifts={shifts}
                employees={employees}
            />

            {/* ── Modal Sửa ── */}
            <Modal
                open={!!editRecord}
                onCancel={() => setEditRecord(null)}
                onOk={() => editForm.submit()}
                confirmLoading={editLoading}
                okText="Lưu"
                cancelText="Đóng"
                title={
                    <span className="flex items-center gap-2 text-indigo-600">
                        <Pencil size={16}/> Sửa lịch làm việc — NV {editRecord?.MaNV}
                    </span>
                }
            >
                <Form form={editForm} layout="vertical" onFinish={handleEditSubmit} className="mt-3">
                    <Form.Item name="ngayLam" label="Ngày làm" rules={[{ required: true }]}>
                        <DatePicker className="w-full" format="DD/MM/YYYY" />
                    </Form.Item>
                    <Form.Item name="maCaLamViec" label="Ca làm việc" rules={[{ required: true }]}>
                        <Select options={shifts.map(s => ({ value: s.MaCaLamViec, label: `${s.TenCa} (${s.MaCaLamViec})` }))} />
                    </Form.Item>
                    <Form.Item name="ghiChu" label="Ghi chú">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SchedulePage;
