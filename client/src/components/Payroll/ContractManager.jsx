import React, { useState, useEffect } from 'react';
import { Table, Button, Drawer, Form, Input, Select, DatePicker, Upload, message, Space } from 'antd';
import { UploadOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import employeeService from '../../services/Employee/employeeService';
import contractService from '../../services/Payroll/contractService';
const ContractManager = () => {
    const [contracts, setContracts] = useState([]);
    const [employees, setEmployees] = useState([]); // Dùng cho dropdown MaNV
    const [loadingTable, setLoadingTable] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [editingContract, setEditingContract] = useState(null);

    const [form] = Form.useForm();

    const fetchContracts = async () => {
        setLoadingTable(true);
        try {
            const res = await contractService.getAll();
            if (res.success) {
                setContracts(res.data);
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi tải danh sách hợp đồng');
        } finally {
            setLoadingTable(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const res = await employeeService.getAll();
            if (res.success) setEmployees(res.data);
        } catch (error) { 
            // Ignore if employees cannot be loaded, just keep empty list
        }
    };

    useEffect(() => {
        fetchContracts();
        fetchEmployees();
    }, []);

    const openDrawer = (record = null) => {
        if (record) {
            setEditingContract(record);
            form.setFieldsValue({
                MaHopDong: record.MaHopDong,
                MaNV: record.MaNV,
                LoaiHopDong: record.LoaiHopDong,
                NgayKy: dayjs(record.NgayKy),
                NgayCoHieuLuc: dayjs(record.NgayCoHieuLuc),
                NgayHetHan: record.NgayHetHan ? dayjs(record.NgayHetHan) : null
            });
        } else {
            setEditingContract(null);
            form.resetFields();
        }
        setFileList([]);
        setDrawerOpen(true);
    };

    const closeDrawer = () => {
        setDrawerOpen(false);
        setEditingContract(null);
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: `Bạn có chắc chắn muốn xóa hợp đồng ${id}?`,
            okText: 'Xóa',
            okType: 'danger',
            onOk: async () => {
                try {
                    await contractService.delete(id);
                    message.success('Đã xóa hợp đồng');
                    fetchContracts();
                } catch (error) {
                    message.error('Lỗi khi xóa hợp đồng');
                }
            }
        });
    };

    // [File Upload Config]
    const uploadProps = {
        onRemove: (file) => {
            setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
        },
        beforeUpload: (file) => {
            // [Auto-fix Front-end] Kiểm tra mime type ngay tại client để tránh mất thời gian gửi request
            if (file.type !== 'application/pdf') {
                message.error('Bạn chỉ có thể tải lên file PDF!');
                return Upload.LIST_IGNORE;
            }
            if (file.size / 1024 / 1024 > 5) {
                message.error('File không được lớn hơn 5MB!');
                return Upload.LIST_IGNORE;
            }
            setFileList([file]); // Chỉ lưu 1 file
            return false; // Ngăn chặn AntD tự động upload
        },
        fileList,
        accept: ".pdf"
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoadingSubmit(true);

            // [Important] Sử dụng FormData để gửi file + text
            const formData = new FormData();
            formData.append('MaHopDong', values.MaHopDong);
            formData.append('MaNV', values.MaNV);
            formData.append('LoaiHopDong', values.LoaiHopDong);
            
            // Format ngày chuẩn YYYY-MM-DD
            formData.append('NgayKy', values.NgayKy.format('YYYY-MM-DD'));
            formData.append('NgayCoHieuLuc', values.NgayCoHieuLuc.format('YYYY-MM-DD'));
            if (values.NgayHetHan) {
                formData.append('NgayHetHan', values.NgayHetHan.format('YYYY-MM-DD'));
            }

            if (fileList.length > 0) {
                formData.append('contractFile', fileList[0]);
            }

            if (editingContract) {
                await contractService.update(editingContract.MaHopDong, formData);
                message.success('Cập nhật hợp đồng thành công');
            } else {
                await contractService.create(formData);
                message.success('Tạo hợp đồng thành công');
            }

            closeDrawer();
            fetchContracts();
        } catch (error) {
            if (error.errorFields) return; // Form validate fails

            // Fail-safe error extraction
            const errorMsg = error.response?.data?.message || 
                           error.response?.data?.error || 
                           'Có lỗi xảy ra khi tạo hợp đồng';
            message.error(errorMsg);
        } finally {
            setLoadingSubmit(false);
        }
    };

    // [Date Validation UI Logic]
    const disabledFutureDate = (current) => {
        // NgayKy không được chọn ngày tương lai
        return current && current > dayjs().endOf('day');
    };

    const disabledNgayHetHan = (current) => {
        // NgayHetHan phải lớn hơn NgayCoHieuLuc đang chọn trên form
        const ngayHieuLuc = form.getFieldValue('NgayCoHieuLuc');
        if (!ngayHieuLuc) return false; // Nếu chưa chọn hiệu lực thì cứ mở tạm
        return current && current <= dayjs(ngayHieuLuc).endOf('day');
    };

    const columns = [
        { title: 'Mã HĐ', dataIndex: 'MaHopDong', key: 'MaHopDong' },
        { title: 'Nhân viên', dataIndex: 'HoTen', key: 'HoTen' },
        { title: 'Loại HĐ', dataIndex: 'LoaiHopDong', key: 'LoaiHopDong' },
        { title: 'Ngày Ký', dataIndex: 'NgayKy', key: 'NgayKy', render: (d) => dayjs(d).format('DD/MM/YYYY') },
        { title: 'Trạng thái', dataIndex: 'TrangThai', key: 'TrangThai' },
        { 
            title: 'Bản Scan', 
            key: 'TepDinhKem',
            render: (_, record) => record.TepDinhKem ? (
                <a 
                    href={`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/${record.TepDinhKem}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 font-bold hover:underline"
                >
                    Xem PDF
                </a>
            ) : <span className="text-gray-400">Chưa đính kèm</span>
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button 
                        type="text" 
                        icon={<EditOutlined className="text-blue-500" />} 
                        onClick={() => openDrawer(record)} 
                    />
                    <Button 
                        type="text" 
                        icon={<DeleteOutlined className="text-red-500" />} 
                        onClick={() => handleDelete(record.MaHopDong)} 
                    />
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: 24, background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2>Quản lý Hợp Đồng</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={openDrawer}>
                    Tạo Hợp Đồng
                </Button>
            </div>

            <Table 
                columns={columns} 
                dataSource={contracts} 
                rowKey="MaHopDong" 
                loading={loadingTable} 
            />

            <Drawer
                title={editingContract ? "Chỉnh Sửa Hợp Đồng" : "Tạo Hợp Đồng Mới"}
                width={500}
                onClose={closeDrawer}
                open={drawerOpen}
                maskClosable={false}
                destroyOnHidden
                extra={
                    <Space>
                        <Button onClick={closeDrawer}>Hủy</Button>
                        <Button type="primary" onClick={handleSubmit} loading={loadingSubmit}>
                            Lưu Hợp Đồng
                        </Button>
                    </Space>
                }
            >
                <Form layout="vertical" form={form}>
                    <Form.Item name="MaHopDong" label="Số Hợp Đồng" rules={[{ required: true, message: 'Nhập số hợp đồng' }]}>
                        <Input placeholder="VD: HD-001/2026" />
                    </Form.Item>

                    <Form.Item name="MaNV" label="Nhân viên" rules={[{ required: true, message: 'Chọn nhân viên' }]}>
                        <Select showSearch optionFilterProp="children" placeholder="Chọn nhân viên">
                            {employees.map(emp => (
                                <Select.Option key={emp.MaNV} value={emp.MaNV}>{emp.HoTen}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="LoaiHopDong" label="Loại hợp đồng" rules={[{ required: true, message: 'Chọn loại hợp đồng' }]}>
                        <Select placeholder="Chọn loại HĐ">
                            <Select.Option value="Thử việc">Thử việc (2 tháng)</Select.Option>
                            <Select.Option value="Xác định thời hạn 1 năm">Xác định thời hạn 1 năm</Select.Option>
                            <Select.Option value="Không xác định thời hạn">Không xác định thời hạn</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="NgayKy" label="Ngày ký" rules={[{ required: true, message: 'Chọn ngày ký' }]}>
                        <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} disabledDate={disabledFutureDate} />
                    </Form.Item>

                    <Form.Item 
                        name="NgayCoHieuLuc" 
                        label="Ngày có hiệu lực" 
                        rules={[{ required: true, message: 'Chọn ngày hiệu lực' }]}
                    >
                        <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item 
                        name="NgayHetHan" 
                        label="Ngày hết hạn" 
                        dependencies={['NgayCoHieuLuc']} 
                    >
                        <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} disabledDate={disabledNgayHetHan} />
                    </Form.Item>

                    <Form.Item label="Bản Scan Hợp Đồng (PDF)">
                        <Upload {...uploadProps}>
                            <Button icon={<UploadOutlined />}>Chọn File (Max 5MB)</Button>
                        </Upload>
                        {fileList.length === 0 && <div style={{ fontSize: '12px', color: 'gray', marginTop: 4 }}>Chưa đính kèm bản PDF</div>}
                    </Form.Item>
                </Form>
            </Drawer>
        </div>
    );
};

export default ContractManager;
