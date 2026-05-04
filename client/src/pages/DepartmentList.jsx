import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Building2,
  UserCheck, ChevronRight, AlertCircle, Plus, Edit, Trash2
} from 'lucide-react';
import { message, Modal, Skeleton } from 'antd';
import DepartmentFormModal from '../components/System/DepartmentFormModal';
import HasPermission from '../components/shared/HasPermission';
import CustomButton from '../components/shared/CustomButton';

import departmentService from '../services/System/departmentService';

// Logic xây dựng cấu trúc cây 
const buildTree = (data, parentId = null, level = 0) => {
  let result = [];
  data
    .filter(item => item.MaDonViCha === parentId)
    .forEach(item => {
      result.push({ ...item, level });
      const children = buildTree(data, item.MaDonVi, level + 1);
      result = result.concat(children);
    });
  return result;
};

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  // 1. Fetch dữ liệu QUA SERVICE
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await departmentService.getAll();

      // Service đã trả về response.data, ta lấy data bên trong theo format API
      const data = res?.data || res || [];
      setDepartments(data);
    } catch (error) {
      console.error("Fetch Dept Error:", error);
      message.error("Không thể tải sơ đồ tổ chức");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // 2. Removed buildTree from here, it's defined outside or we just move it outside.

  // 3. Xử lý Cập nhật Trưởng phòng QUA SERVICE
  const handleUpdateDeptHead = (deptId) => {
    let newHeadValue = '';
    Modal.confirm({
      title: 'Cập nhật Trưởng đơn vị',
      content: (
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">Nhập mã nhân viên mới cho đơn vị này:</p>
          <input
            autoFocus
            onChange={(e) => { newHeadValue = e.target.value; }}
            className="w-full border rounded-lg p-2 outline-none focus:border-blue-500"
            placeholder="Ví dụ: NV001"
          />
        </div>
      ),
      onOk: async () => {
        if (!newHeadValue) return message.warning("Vui lòng nhập mã nhân viên");

        try {
          await departmentService.updateHead(deptId, newHeadValue);
          message.success("Cập nhật trưởng phòng thành công");
          fetchDepartments();
        } catch (error) {
          message.error(error.response?.data?.message || "Lỗi khi cập nhật trưởng phòng");
        }
      }
    });
  };

  // 4. Xử lý Xóa Đơn vị
  const handleDeleteDept = (deptId) => {
    Modal.confirm({
      title: 'Xác nhận xóa đơn vị',
      content: 'Hệ thống sẽ kiểm tra nhân sự bên trong. Bạn có chắc chắn muốn xóa đơn vị này?',
      okText: 'Xóa',
      okType: 'danger',
      onOk: async () => {
        try {
          await departmentService.delete(deptId);
          message.success("Xóa đơn vị thành công");
          fetchDepartments();
        } catch (error) {
          message.error(error.response?.data?.message || "Lỗi khi xóa đơn vị");
        }
      }
    });
  };

  // 5. Mở modal thêm mới
  const handleAddDept = () => {
    setEditingDept(null);
    setIsModalOpen(true);
  };

  // 6. Mở modal chỉnh sửa
  const handleEditDept = (dept) => {
    setEditingDept(dept);
    setIsModalOpen(true);
  };

  const displayDepartments = useMemo(() => {
    const treeData = buildTree(departments);
    if (!searchTerm) return treeData;
    return treeData.filter(d =>
      d.TenDonVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(d.MaDonVi).includes(searchTerm)
    );
  }, [departments, searchTerm]);

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-50/50 font-sans animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center">
            <Building2 className="mr-3 text-blue-600 shrink-0" size={28} />
            Sơ đồ tổ chức
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Quản lý các phòng ban và nhân sự quản lý trực thuộc.</p>
        </div>
        <HasPermission requiredRoles={['db_Admin', 'db_HR_Human']}>
          <CustomButton variant="primary" icon={Plus} onClick={handleAddDept}>
            Thêm đơn vị
          </CustomButton>
        </HasPermission>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 shrink-0" size={18} />
            <input
              type="text"
              placeholder="Tìm theo mã hoặc tên đơn vị..."
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
                <th className="p-4 pl-8">Mã Đơn vị</th>
                <th className="p-4">Tên Đơn vị</th>
                <th className="p-4">Trưởng phòng</th>
                <th className="p-4 text-right pr-8">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan="4" className="p-4"><Skeleton active paragraph={{ rows: 1 }} /></td></tr>
                ))
              ) : displayDepartments.length > 0 ? (
                displayDepartments.map((dept) => (
                  <tr key={dept.MaDonVi} className="hover:bg-blue-50/40 transition-colors group">
                    <td className="p-4 pl-8">
                      <span className="font-mono text-xs font-bold text-gray-400">#{dept.MaDonVi}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center" style={{ marginLeft: `${dept.level * 32}px` }}>
                        {dept.level > 0 && <ChevronRight size={14} className="mr-2 text-gray-300 shrink-0" />}
                        <span className={`text-sm font-bold ${dept.level === 0 ? 'text-blue-700' : 'text-gray-800'}`}>
                          {dept.TenDonVi}
                        </span>
                        {!dept.MaDonViCha && <span className="ml-3 px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-extrabold uppercase rounded shadow-sm">Gốc</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <UserCheck size={16} className={dept.TenTruongPhong ? "text-emerald-500 shrink-0" : "text-gray-300 shrink-0"} />
                        <span className={`text-sm ${dept.TenTruongPhong ? 'font-semibold text-gray-700' : 'text-gray-400 italic'}`}>
                          {dept.TenTruongPhong || "Chưa chỉ định"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right pr-8">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <HasPermission requiredRoles={['db_Admin', 'db_HR_Human']}>
                          <button
                            onClick={() => handleUpdateDeptHead(dept.MaDonVi)}
                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                            title="Giao quyền quản lý"
                          >
                            <UserCheck size={18} />
                          </button>
                          <button
                            onClick={() => handleEditDept(dept)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Sửa thông tin"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteDept(dept.MaDonVi)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Xóa đơn vị"
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
                      <p className="font-bold">Không tìm thấy dữ liệu sơ đồ</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DepartmentFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={fetchDepartments}
        initialData={editingDept}
        departments={departments}
      />
    </div>
  );
};

export default DepartmentList;