import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Briefcase, Plus, Edit, Trash2, AlertCircle, TrendingUp
} from 'lucide-react';
import { message, Modal, Skeleton, Form, Input, InputNumber } from 'antd';
import positionService from '../services/System/positionService';
import HasPermission from '../components/shared/HasPermission';
import CustomButton from '../components/shared/CustomButton';

const PositionList = () => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPos, setEditingPos] = useState(null);
  const [form] = Form.useForm();

  const fetchPositions = async () => {
    try {
      setLoading(true);
      const res = await positionService.getAll();
      setPositions(res?.data || res || []);
    } catch (error) {
      message.error("Không thể tải danh sách chức vụ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const handleAdd = () => {
    setEditingPos(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (pos) => {
    setEditingPos(pos);
    form.setFieldsValue(pos);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa chức vụ',
      content: 'Bạn có chắc chắn muốn xóa chức vụ này? Hệ thống sẽ kiểm tra xem có nhân viên nào đang giữ chức vụ này không.',
      okText: 'Xóa',
      okType: 'danger',
      onOk: async () => {
        try {
          await positionService.delete(id);
          message.success("Xóa chức vụ thành công");
          fetchPositions();
        } catch (error) {
          message.error(error.response?.data?.message || "Lỗi khi xóa chức vụ");
        }
      }
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingPos) {
        await positionService.update(editingPos.MaChucVu, values);
        message.success("Cập nhật chức vụ thành công");
      } else {
        await positionService.create(values);
        message.success("Thêm chức vụ mới thành công");
      }
      setIsModalOpen(false);
      fetchPositions();
    } catch (error) {
      if (error.errorFields) return;
      message.error(error.response?.data?.message || "Lỗi khi lưu dữ liệu");
    }
  };

  const filteredPositions = useMemo(() => {
    return positions.filter(p =>
      p.TenChucVu.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.MaChucVu.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [positions, searchTerm]);

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-50/50 font-sans animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center">
            <Briefcase className="mr-3 text-indigo-600 shrink-0" size={28} />
            Quản lý Chức vụ
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Thiết lập danh mục chức vụ và hệ số phụ cấp tương ứng.</p>
        </div>
        <HasPermission requiredRoles={['db_Admin', 'db_HR_Human']}>
          <CustomButton variant="primary" icon={Plus} onClick={handleAdd}>
            Thêm chức vụ
          </CustomButton>
        </HasPermission>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 shrink-0" size={18} />
            <input
              type="text"
              placeholder="Tìm theo mã hoặc tên chức vụ..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                <th className="p-4 pl-8">Mã Chức vụ</th>
                <th className="p-4">Tên Chức vụ</th>
                <th className="p-4 text-center">Hệ số Phụ cấp</th>
                <th className="p-4 text-right pr-8">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan="4" className="p-4"><Skeleton active paragraph={{ rows: 1 }} /></td></tr>
                ))
              ) : filteredPositions.length > 0 ? (
                filteredPositions.map((pos) => (
                  <tr key={pos.MaChucVu} className="hover:bg-indigo-50/40 transition-colors group">
                    <td className="p-4 pl-8">
                      <span className="font-mono text-xs font-bold text-gray-400">#{pos.MaChucVu}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-bold text-gray-800">{pos.TenChucVu}</span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black">
                        <TrendingUp size={14} />
                        {pos.PhuCapChucVu.toFixed(2)}
                      </div>
                    </td>
                    <td className="p-4 text-right pr-8">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <HasPermission requiredRoles={['db_Admin', 'db_HR_Human']}>
                          <button
                            onClick={() => handleEdit(pos)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                            title="Sửa"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(pos.MaChucVu)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Xóa"
                          >
                            <Trash2 size={18} />
                          </button>
                        </HasPermission>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-20 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <AlertCircle size={48} className="mb-4 text-gray-200" />
                      <p className="font-bold">Không tìm thấy chức vụ nào</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        title={<span className="text-xl font-black text-gray-900">{editingPos ? 'Cập nhật Chức vụ' : 'Thêm Chức vụ Mới'}</span>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        okText={editingPos ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
        okButtonProps={{ className: 'bg-indigo-600' }}
        width={500}
      >
        <Form form={form} layout="vertical" className="mt-6">
          <Form.Item
            name="MaChucVu"
            label={<span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Mã Chức vụ</span>}
            rules={[{ required: true, message: 'Vui lòng nhập mã chức vụ' }]}
          >
            <Input disabled={!!editingPos} placeholder="Ví dụ: GD, TP, NV..." className="rounded-lg py-2" />
          </Form.Item>
          <Form.Item
            name="TenChucVu"
            label={<span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Tên Chức vụ</span>}
            rules={[{ required: true, message: 'Vui lòng nhập tên chức vụ' }]}
          >
            <Input placeholder="Ví dụ: Giám đốc, Trưởng phòng..." className="rounded-lg py-2" />
          </Form.Item>
          <Form.Item
            name="PhuCapChucVu"
            label={<span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Hệ số Phụ cấp</span>}
            rules={[{ required: true, message: 'Vui lòng nhập hệ số phụ cấp' }]}
            initialValue={0.00}
          >
            <InputNumber step={0.1} min={0} className="w-full rounded-lg py-1" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PositionList;
