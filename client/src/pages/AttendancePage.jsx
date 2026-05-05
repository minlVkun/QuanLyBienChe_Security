import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Tag, Space, Typography, Row, Col, message, DatePicker, Select, Input, Button, Modal, TimePicker, Divider, Tabs } from 'antd';
import { CheckCircle2, Calendar as CalendarIcon, Timer, AlertCircle, Search, FileDown, Edit3, Filter, User, LayoutDashboard } from 'lucide-react';
import attendanceService from '../services/Attendance/attendanceService';
import departmentService from '../services/System/departmentService';
import AttendanceButton from '../components/Attendance/AttendanceButton';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const AttendancePage = () => {
    const { user } = useAuth();
    const isAdminOrHR = ['db_Admin', 'db_HR_Human', 'db_HR_Payroll', 'db_DeptHead'].includes(user?.role);

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [personalData, setPersonalData] = useState([]);
    const [stats, setStats] = useState({ totalDays: 0, lateMinutes: 0, onTimeDays: 0 });
    const [currentTime, setCurrentTime] = useState(dayjs());
    const [activeTab, setActiveTab] = useState('personal');

    // Filters (Admin)
    const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]);
    const [maDonVi, setMaDonVi] = useState(null);
    const [trangThai, setTrangThai] = useState(null);
    const [keyword, setKeyword] = useState('');
    const [departments, setDepartments] = useState([]);

    // Manual Edit Modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [editTimes, setEditTimes] = useState({ gioVao: null, gioRa: null });

    // Cập nhật đồng hồ mỗi giây
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(dayjs()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await departmentService.getAll();
            setDepartments(Array.isArray(res) ? res : (res?.data || []));
        } catch (err) { /* silent */ }
    };

    const fetchPersonalHistory = useCallback(async () => {
        try {
            const start = dayjs().startOf('month').format('YYYY-MM-DD');
            const end = dayjs().endOf('month').format('YYYY-MM-DD');
            const res = await attendanceService.getHistory(user.MaNV, start, end);
            const list = Array.isArray(res.data) ? res.data : [];
            setPersonalData(list);

            const late = list.reduce((sum, item) => sum + (item.SoPhutDiTre || 0), 0);
            const onTime = list.filter(item => (item.SoPhutDiTre || 0) === 0 && item.GioVao).length;
            setStats({ totalDays: list.length, lateMinutes: late, onTimeDays: onTime });
        } catch (err) {
            console.error("Lỗi tải lịch sử cá nhân:", err);
        }
    }, [user?.MaNV]);

    const fetchAdminData = useCallback(async () => {
        if (!isAdminOrHR) return;
        setLoading(true);
        try {
            const params = {
                fromDate: dateRange[0].format('YYYY-MM-DD'),
                toDate: dateRange[1].format('YYYY-MM-DD'),
                maDonVi,
                trangThai,
                keyword
            };
            const res = await attendanceService.getAll(params);
            setData(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            message.error(err.message || 'Không thể tải dữ liệu hệ thống');
        } finally {
            setLoading(false);
        }
    }, [isAdminOrHR, dateRange, maDonVi, trangThai, keyword]);

    useEffect(() => {
        fetchPersonalHistory();
        if (isAdminOrHR) {
            fetchAdminData();
            fetchDepartments();
        }
    }, [fetchPersonalHistory, fetchAdminData, isAdminOrHR]);

    const handleExport = async () => {
        try {
            setLoading(true);
            await attendanceService.exportExcel({
                fromDate: dateRange[0].format('YYYY-MM-DD'),
                toDate: dateRange[1].format('YYYY-MM-DD'),
                maDonVi,
                trangThai,
                keyword
            });
            message.success('Đã xuất file thành công');
        } catch (err) {
            message.error(err.message || 'Lỗi khi xuất file');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenEdit = (record) => {
        setEditingRecord(record);
        setEditTimes({
            gioVao: record.GioVao ? dayjs(record.GioVao) : null,
            gioRa: record.GioRa ? dayjs(record.GioRa) : null
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateManual = async () => {
        try {
            setLoading(true);
            await attendanceService.updateManual(editingRecord.ChamCongID, {
                gioVao: editTimes.gioVao ? editTimes.gioVao.toISOString() : null,
                gioRa: editTimes.gioRa ? editTimes.gioRa.toISOString() : null
            });
            message.success("Đã điều chỉnh công thành công");
            setIsEditModalOpen(false);
            fetchAdminData();
            fetchPersonalHistory();
        } catch (err) {
            message.error(err.message || "Lỗi khi cập nhật");
        } finally {
            setLoading(false);
        }
    };

    const commonColumns = [
        {
            title: 'Ngày',
            dataIndex: 'NgayChamCong',
            key: 'NgayChamCong',
            render: (date) => dayjs(date).format('DD/MM/YYYY'),
            sorter: (a, b) => dayjs(a.NgayChamCong).unix() - dayjs(b.NgayChamCong).unix(),
        },
        {
            title: 'Giờ Vào',
            dataIndex: 'GioVao',
            key: 'GioVao',
            render: (time) => time ? <Tag color="blue">{dayjs(time).format('HH:mm:ss')}</Tag> : '-'
        },
        {
            title: 'Giờ Ra',
            dataIndex: 'GioRa',
            key: 'GioRa',
            render: (time) => time ? <Tag color="orange">{dayjs(time).format('HH:mm:ss')}</Tag> : '-'
        },
        {
            title: 'Đi Trễ',
            dataIndex: 'SoPhutDiTre',
            key: 'SoPhutDiTre',
            render: (min) => min > 0 ? <Text type="danger" strong>{min}p</Text> : <Text type="success">0</Text>
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'TrangThai',
            key: 'TrangThai',
            render: (status) => {
                let color = 'default';
                if (status === 'Đủ công') color = 'success';
                if (status === 'Thiếu giờ') color = 'warning';
                if (status === 'Chưa hoàn tất') color = 'processing';
                return <Tag color={color} className="rounded-full px-3">{status}</Tag>;
            }
        }
    ];

    const adminColumns = [
        {
            title: 'Nhân viên',
            key: 'NhanVien',
            render: (_, r) => (
                <div>
                    <div className="font-bold">{r.HoTen}</div>
                    <div className="text-xs text-gray-400">#{r.MaNV}</div>
                </div>
            )
        },
        {
            title: 'Đơn vị',
            dataIndex: 'TenDonVi',
            key: 'TenDonVi',
            responsive: ['md']
        },
        ...commonColumns,
        {
            title: 'Sửa',
            key: 'actions',
            width: 60,
            render: (_, r) => (
                <Button
                    type="text"
                    icon={<Edit3 size={16} />}
                    onClick={() => handleOpenEdit(r)}
                    className="text-indigo-600 hover:bg-indigo-50"
                />
            )
        }
    ];

    const renderPersonalTab = () => (
        <div className="space-y-6">
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    <Card className="shadow-sm border-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 text-white overflow-hidden relative min-h-[220px] flex items-center">
                        <div className="relative z-10 w-full p-2">
                            <div className="flex items-center space-x-3 mb-2 opacity-80">
                                <CalendarIcon size={18} />
                                <Text className="text-white uppercase tracking-wider text-[11px] font-bold">
                                    {currentTime.format('dddd, DD MMMM YYYY')}
                                </Text>
                            </div>
                            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                                <div>
                                    <Title level={1} className="m-0 text-white font-black tracking-tighter" style={{ color: 'white', fontSize: '4rem', lineHeight: 1 }}>
                                        {currentTime.format('HH:mm:ss')}
                                    </Title>
                                    <div className="mt-4 flex items-center text-blue-100 text-xs bg-white/10 w-fit px-3 py-1.5 rounded-full backdrop-blur-sm">
                                        <AlertCircle size={14} className="mr-2" />
                                        Hệ thống tự động nhận diện Check-in/Check-out
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <AttendanceButton maNV={user?.MaNV} onRefresh={fetchPersonalHistory} />
                                </div>
                            </div>
                        </div>
                        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute -left-10 -top-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-2xl"></div>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card className="h-full shadow-sm border-0 bg-white flex flex-col justify-center">
                        <Title level={5} className="mb-6 flex items-center gap-2">
                            <Timer size={18} className="text-indigo-600" />
                            Thống kê tháng này
                        </Title>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-center">
                                <Text className="block text-[10px] uppercase font-bold text-blue-400 mb-1">Ngày công</Text>
                                <Text strong className="text-3xl text-blue-700">{stats.totalDays}</Text>
                            </div>
                            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 text-center">
                                <Text className="block text-[10px] uppercase font-bold text-rose-400 mb-1">Số phút trễ</Text>
                                <Text strong className="text-3xl text-rose-700">{stats.lateMinutes}</Text>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Card className="shadow-sm border-0" title={<div className="flex items-center gap-2"><LayoutDashboard size={18} /> Lịch sử chấm công gần đây</div>}>
                <Table
                    columns={commonColumns}
                    dataSource={personalData}
                    rowKey="ChamCongID"
                    pagination={{ pageSize: 10 }}
                    className="custom-table"
                />
            </Card>
        </div>
    );

    const renderAdminTab = () => (
        <Card className="shadow-sm border-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <Title level={4} className="m-0">Báo cáo chấm công hệ thống</Title>
                    <Text className="text-gray-400">Dữ liệu tổng hợp từ toàn bộ nhân viên và phòng ban</Text>
                </div>
                <Button
                    type="primary"
                    icon={<FileDown size={18} />}
                    onClick={handleExport}
                    className="bg-emerald-600 hover:bg-emerald-700 border-none h-11 px-8 rounded-xl font-bold shadow-lg shadow-emerald-100"
                    loading={loading}
                >
                    Xuất Excel
                </Button>
            </div>

            <Divider className="mb-6 mt-2" />

            {/* Filter Bar */}
            <div className="bg-slate-50 p-5 rounded-2xl flex flex-wrap items-end gap-4 mb-6 border border-slate-100 shadow-inner">
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Khoảng ngày</span>
                    <RangePicker
                        value={dateRange}
                        onChange={(dates) => dates && setDateRange(dates)}
                        className="h-11 rounded-xl border-slate-200 w-[280px]"
                    />
                </div>

                <div className="flex flex-col gap-2 min-w-[200px]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Đơn vị</span>
                    <Select
                        placeholder="Tất cả đơn vị"
                        className="h-11 w-full"
                        allowClear
                        onChange={setMaDonVi}
                    >
                        {departments.map(d => <Option key={d.MaDonVi} value={d.MaDonVi}>{d.TenDonVi}</Option>)}
                    </Select>
                </div>

                <div className="flex flex-col gap-2 min-w-[160px]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Trạng thái</span>
                    <Select
                        placeholder="Tất cả"
                        className="h-11 w-full"
                        allowClear
                        onChange={setTrangThai}
                    >
                        <Option value="Đủ công">Đủ công</Option>
                        <Option value="Thiếu giờ">Thiếu giờ</Option>
                        <Option value="Chưa hoàn tất">Chưa hoàn tất</Option>
                    </Select>
                </div>

                <div className="flex flex-col gap-2 flex-1 min-w-[240px]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Tìm kiếm nhanh</span>
                    <Input
                        prefix={<Search size={18} className="text-slate-300" />}
                        placeholder="Nhập Mã NV hoặc Họ tên..."
                        className="h-11 rounded-xl border-slate-200"
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                </div>
            </div>

            <Table
                columns={adminColumns}
                dataSource={data}
                rowKey="ChamCongID"
                loading={loading}
                pagination={{ pageSize: 12, showTotal: (total) => `Tổng cộng ${total} dòng dữ liệu` }}
                className="custom-table border border-slate-100 rounded-2xl overflow-hidden"
            />
        </Card>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <Title level={2} className="m-0 font-bold tracking-tight">Chấm công & Giờ giấc</Title>
                    <Text className="text-gray-400">Theo dõi thời gian làm việc và hiệu suất chuyên cần</Text>
                </div>
            </div>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                className="attendance-tabs"
                items={[
                    {
                        key: 'personal',
                        label: (
                            <span className="flex items-center gap-2 px-2">
                                <User size={18} />
                                Cá nhân
                            </span>
                        ),
                        children: renderPersonalTab()
                    },
                    ...(isAdminOrHR ? [{
                        key: 'admin',
                        label: (
                            <span className="flex items-center gap-2 px-2">
                                <LayoutDashboard size={18} />
                                Quản trị hệ thống
                            </span>
                        ),
                        children: renderAdminTab()
                    }] : [])
                ]}
            />

            {/* Manual Edit Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                            <Edit3 size={18} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold">Điều chỉnh công</span>
                            <span className="text-[10px] text-gray-400 font-normal">{editingRecord?.HoTen} - #{editingRecord?.MaNV}</span>
                        </div>
                    </div>
                }
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                onOk={handleUpdateManual}
                okText="Xác nhận cập nhật"
                cancelText="Hủy bỏ"
                confirmLoading={loading}
                width={400}
                centered
                className="modern-modal"
            >
                <div className="py-4 space-y-6">
                    <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-between border border-slate-100">
                        <div className="flex flex-col">
                            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ngày chấm công</Text>
                            <Text className="font-bold text-slate-700">{dayjs(editingRecord?.NgayChamCong).format('DD/MM/YYYY')}</Text>
                        </div>
                        <Tag color="blue" className="m-0 rounded-lg border-0 bg-blue-100 text-blue-700 font-bold px-3 py-1">
                            {editingRecord?.TrangThai}
                        </Tag>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="flex flex-col gap-2">
                            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Giờ Vào (Check-in)</Text>
                            <TimePicker
                                className="h-11 rounded-xl w-full"
                                value={editTimes.gioVao}
                                onChange={(val) => setEditTimes(prev => ({ ...prev, gioVao: val }))}
                                format="HH:mm:ss"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Giờ Ra (Check-out)</Text>
                            <TimePicker
                                className="h-11 rounded-xl w-full"
                                value={editTimes.gioRa}
                                onChange={(val) => setEditTimes(prev => ({ ...prev, gioRa: val }))}
                                format="HH:mm:ss"
                            />
                        </div>
                    </div>
                    
                    <div className="bg-amber-50 p-3 rounded-xl flex items-start gap-3 border border-amber-100">
                        <AlertCircle size={16} className="text-amber-600 mt-0.5" />
                        <Text className="text-[11px] text-amber-800 leading-relaxed">
                            Lưu ý: Sau khi cập nhật, hệ thống sẽ tự động tính toán lại số phút trễ/sớm và trạng thái công dựa trên ca làm việc của nhân viên.
                        </Text>
                    </div>
                </div>
            </Modal>

            <style>{`
                .attendance-tabs .ant-tabs-nav::before {
                    border-bottom: 2px solid #f1f5f9;
                }
                .attendance-tabs .ant-tabs-tab {
                    padding: 12px 16px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border-radius: 12px 12px 0 0;
                    margin: 0 4px 0 0 !important;
                }
                .attendance-tabs .ant-tabs-tab-active {
                    background: #f8fafc;
                }
                .attendance-tabs .ant-tabs-tab-btn {
                    font-weight: 600;
                    color: #64748b;
                }
                .attendance-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
                    color: #4f46e5;
                }
                .attendance-tabs .ant-tabs-ink-bar {
                    height: 3px;
                    border-radius: 3px;
                    background: #4f46e5;
                }
                
                .custom-table .ant-table-thead > tr > th {
                    background: #f8fafc;
                    font-size: 10px;
                    text-transform: uppercase;
                    font-weight: 800;
                    color: #64748b;
                    letter-spacing: 0.1em;
                    padding: 16px;
                    border-bottom: 1px solid #f1f5f9;
                }
                .custom-table .ant-table-tbody > tr > td {
                    padding: 16px;
                    border-bottom: 1px solid #f1f5f9;
                }
                .custom-table .ant-table-tbody > tr:hover > td {
                    background-color: #f8fafc !important;
                }
                
                .modern-modal .ant-modal-content {
                    border-radius: 24px;
                    padding: 24px;
                    box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.1);
                }
                .modern-modal .ant-modal-header {
                    margin-bottom: 24px;
                    border-bottom: 0;
                }
                .modern-modal .ant-modal-footer {
                    border-top: 0;
                    margin-top: 12px;
                }
                .modern-modal .ant-btn {
                    border-radius: 12px;
                    height: 44px;
                    font-weight: 600;
                    padding-left: 24px;
                    padding-right: 24px;
                }
            `}</style>
        </div>
    );
};

export default AttendancePage;
