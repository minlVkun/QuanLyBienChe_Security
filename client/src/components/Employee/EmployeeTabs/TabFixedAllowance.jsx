import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Wallet, CheckCircle2, XCircle } from 'lucide-react';
import { Table, Modal, Form, Input, InputNumber, Switch, message, Popconfirm, Tag } from 'antd';
import api from '../../../services/api';

const TabFixedAllowance = ({ employeeId }) => {
  const [allowances, setAllowances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  const fetchAllowances = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/allowances/employees/${employeeId}/allowances`);
      setAllowances(res.data.data || []);
    } catch (error) {
      message.error("Không thể tải danh sách phụ cấp");
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchAllowances();
  }, [fetchAllowances]);

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/allowances/allowances/${id}`);
      message.success("Đã xóa phụ cấp");
      fetchAllowances();
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi khi xóa");
    }
  };

  const handleFinish = async (values) => {
    try {
      if (editingItem) {
        await api.put(`/allowances/allowances/${editingItem.Id}`, values);
        message.success("Cập nhật thành công");
      } else {
        await api.post(`/allowances/employees/${employeeId}/allowances`, values);
        message.success("Thêm mới thành công");
      }
      setIsModalOpen(false);
      fetchAllowances();
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi khi lưu");
    }
  };

  const columns = [
    {
      title: 'Tên phụ cấp',
      dataIndex: 'TenPhuCap',
      key: 'TenPhuCap',
      render: (text) => <span className="font-bold text-gray-700">{text}</span>
    },
    {
      title: 'Số tiền',
      dataIndex: 'SoTien',
      key: 'SoTien',
      render: (val) => <span className="text-blue-600 font-bold">{val.toLocaleString()} VNĐ</span>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'IsActive',
      key: 'IsActive',
      render: (active) => (
        active ? 
        <Tag color="success" icon={<CheckCircle2 size={12} className="mr-1" />}>Đang hoạt động</Tag> : 
        <Tag color="error" icon={<XCircle size={12} className="mr-1" />}>Ngừng</Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => handleEdit(record)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
          <Popconfirm title="Xác nhận xóa phụ cấp này?" onConfirm={() => handleDelete(record.Id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
            <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
          </Popconfirm>
        </div>
      )
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="text-blue-600" size={24} />
            Danh sách Phụ cấp cố định
          </h2>
          <p className="text-sm text-gray-500 mt-1">Các khoản phụ cấp này sẽ được tự động cộng vào bảng lương mỗi tháng.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-200 font-bold text-sm"
        >
          <Plus size={18} /> Thêm phụ cấp
        </button>
      </div>

      <Table 
        columns={columns} 
        dataSource={allowances} 
        rowKey="Id" 
        loading={loading}
        pagination={false}
        className="custom-table"
      />

      <Modal
        title={<span className="text-lg font-bold">{editingItem ? 'Sửa phụ cấp' : 'Thêm phụ cấp mới'}</span>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingItem ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
        width={400}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-4">
          <Form.Item name="TenPhuCap" label="Tên phụ cấp" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input placeholder="VD: Phụ cấp ăn trưa" className="rounded-lg py-2" />
          </Form.Item>
          <Form.Item name="SoTien" label="Số tiền (VNĐ)" rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}>
            <InputNumber 
              className="w-full rounded-lg py-1" 
              min={0} 
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
          <Form.Item name="IsActive" label="Trạng thái hoạt động" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TabFixedAllowance;
