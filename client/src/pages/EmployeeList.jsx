import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import employeeService from '../services/Employee/employeeService';

import EmployeeFormModal from '../components/Employee/EmployeeFormModal';
import UnitSelect from '../components/common/UnitSelect';
import CustomButton from '../components/shared/CustomButton';
import SearchBar from '../components/shared/SearchBar';
import Pagination from '../components/shared/Pagination';
import HasPermission from '../components/shared/HasPermission';

import { message, Modal } from 'antd';
import {
  Search, Plus, Edit, Trash2, Eye, UserX, Loader2, AlertCircle
} from 'lucide-react';

const EmployeeList = () => {
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [unitFilter, setUnitFilter] = useState('All');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // --- LOGIC PHÂN TRANG & TÌM KIẾM ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // GỌI SERVICE ĐỂ LẤY DATA: Do Backend trả về toàn bộ danh sách, ta không cần truyền params phân trang lên API
      const res = await employeeService.getAll();
      setEmployees(res.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Không thể tải danh sách nhân viên. Vui lòng kiểm tra kết nối server.");
    } finally {
      setLoading(false);
    }
  }, []); // Không còn phụ thuộc vào các state tìm kiếm/phân trang để tránh lặp vô hạn

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Reset về trang 1 khi người dùng gõ tìm kiếm hoặc đổi phòng ban
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, unitFilter]);

  // Xử lý Lọc & Tìm kiếm ở Frontend
  const filteredEmployees = employees.filter(emp => {
    const matchUnit = unitFilter === '' || unitFilter === 'All' ||
      String(emp.MaDonVi || '').trim() === String(unitFilter).trim() ||
      String(emp.TenDonVi || '').trim() === String(unitFilter).trim();

    const matchSearch = searchTerm === '' ||
      String(emp.HoTen || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(emp.MaNV || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchUnit && matchSearch;
  });

  // Xử lý Phân trang (Pagination) ở Frontend
  const totalItems = filteredEmployees.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const roleLabels = {
    'db_Admin': 'Administrator',
    'db_HR_Human': 'Quản lý Nhân sự',
    'db_HR_Payroll': 'Quản lý Lương',
    'db_DeptHead': 'Trưởng phòng',
    'db_Employee': 'Nhân viên'
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'db_Admin': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'db_HR_Human': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'db_HR_Payroll': return 'bg-teal-100 text-teal-700 border-teal-200';
      case 'db_DeptHead': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'db_Employee': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // --- SỰ KIỆN: BẤM NÚT SỬA ---
  const handleEditClick = async (emp) => {
    try {
      // GỌI SERVICE ĐỂ LẤY CHI TIẾT
      const data = await employeeService.getById(emp.MaNV);
      setEditingEmployee(data.data || data);
      setIsModalOpen(true);
    } catch (error) {
      console.error(error);
      message.error("Không lấy được dữ liệu chi tiết!");
    }
  };

  // --- SỰ KIỆN: BẤM NÚT XÓA (SOFT DELETE) ---
  const handleDeleteClick = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa nhân viên',
      content: `Bạn có chắc chắn muốn xóa nhân viên #${id} này không?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          // GỌI SERVICE ĐỂ XÓA
          await employeeService.delete(id);
          message.success("Xóa nhân viên thành công");
          fetchEmployees(); // Cập nhật lại bảng
        } catch (error) {
          if (error.response?.status === 403) {
            message.error("Không có quyền truy cập để xóa");
          } else if (error.response?.status === 404) {
            message.error("Không tìm thấy nhân viên");
          } else {
            message.error("Xóa thất bại. Vui lòng thử lại!");
          }
        }
      }
    });
  };

  // --- SỰ KIỆN: BẤM NÚT THÊM MỚI ---
  const handleAddClick = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-50 font-sans">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh sách Nhân viên</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý thông tin, vai trò và hồ sơ của toàn bộ nhân viên.</p>
        </div>
        <HasPermission action="EMPLOYEE_CREATE">
          <CustomButton variant="primary" icon={Plus} onClick={handleAddClick} className="w-full md:w-auto">
            Thêm nhân viên
          </CustomButton>
        </HasPermission>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Toolbar */}
        <div className="p-5 border-b border-gray-100 bg-white flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-xs">
            <SearchBar onSearch={setSearchTerm} placeholder="Tìm theo tên..." />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <UnitSelect
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              isFilter={true}
              placeholder="Tất cả phòng ban"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto relative min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4 pl-6">Mã NV</th>
                <th className="p-4">Nhân viên</th>
                <th className="p-4">Chức vụ</th>
                <th className="p-4">Ca làm việc</th>
                <th className="p-4">Vai trò (Role)</th>
                <th className="p-4 text-right pr-6">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-20 text-center">
                    <div className="flex flex-col items-center justify-center text-blue-600">
                      <Loader2 className="w-10 h-10 mb-2 animate-spin" />
                      <p className="text-gray-500 animate-pulse">Đang tải dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-red-500">
                      <AlertCircle className="w-10 h-10 mb-2" />
                      <p className="font-medium text-gray-900">{error}</p>
                      <button onClick={fetchEmployees} className="mt-3 text-sm text-blue-600 hover:underline">Thử lại</button>
                    </div>
                  </td>
                </tr>
              ) : paginatedEmployees.length > 0 ? (
                paginatedEmployees.map((emp) => (
                  <tr key={emp.MaNV} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-4 pl-6 font-medium text-gray-900">#{emp.MaNV}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 flex items-center justify-center text-blue-700 font-bold border border-blue-200 uppercase">
                          {emp.HoTen?.charAt(0) || '?'}
                        </div>
                        <span className="font-semibold text-gray-800">{emp.HoTen}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700 font-medium">
                          {emp.ChucVuHienTai || <span className="text-gray-300 italic">Chưa cập nhật</span>}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700 font-medium">
                          {emp.TenCaLamViec || (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-50 text-red-600 text-[10px] font-bold border border-red-100">
                              <AlertCircle size={10} /> CHƯA GÁN CA
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadge(emp.Role)}`}>
                        {roleLabels[emp.Role] || emp.Role}
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Xem chi tiết" onClick={() => navigate(`/employees/${emp.MaNV}`)}><Eye className="w-4 h-4" /></button>
                        <HasPermission action="EMPLOYEE_EDIT">
                          <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Chỉnh sửa" onClick={() => handleEditClick(emp)}><Edit className="w-4 h-4" /></button>
                        </HasPermission>
                        <HasPermission action="EMPLOYEE_DELETE">
                          <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa" onClick={() => handleDeleteClick(emp.MaNV)}><Trash2 className="w-4 h-4" /></button>
                        </HasPermission>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <UserX className="w-12 h-12 mb-3 text-gray-300" />
                      <p className="text-base font-medium text-gray-900">Không tìm thấy nhân viên</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- PHÂN TRANG SECTION --- */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <span>
            {loading ? 'Đang kiểm tra...' : (
              <>Đang hiển thị trang <b>{currentPage}</b> / {totalPages || 1} (Tổng <b>{totalItems}</b> kết quả)</>
            )}
          </span>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* --- FORM ĐA NĂNG ĐƯỢC GỌI Ở ĐÂY --- */}
      <EmployeeFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEmployee(null); // Đóng form thì xóa sạch dữ liệu cũ
        }}
        onRefresh={fetchEmployees} // Tải lại bảng sau khi Thêm/Sửa thành công
        initialData={editingEmployee} // Bí quyết gộp Form nằm ở biến này!
      />
    </div>
  );
};

export default EmployeeList;