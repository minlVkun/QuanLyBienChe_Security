import React, { useState, useEffect, useMemo, useContext } from 'react';
import { 
  Search, Key, Shield, UserCog, 
  Filter, AlertTriangle 
} from 'lucide-react';
import { message, Modal, Skeleton, Switch, Select } from 'antd';
import { AuthContext } from '../context/AuthContext';

// IMPORT SERVICE MỚI
import userService from '../services/System/userService';

// Cấu hình màu sắc Role theo yêu cầu
const roleConfig = {
  'db_Admin': { label: 'Administrator', color: 'bg-red-100 text-red-700 border-red-200' },
  'db_HR_Human': { label: 'HR Human', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  'db_HR_Payroll': { label: 'HR Payroll', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  'db_DeptHead': { label: 'Trưởng phòng', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  'db_Employee': { label: 'Nhân viên', color: 'bg-gray-100 text-gray-700 border-gray-200' },
};

const UserManagement = () => {
  const { user } = useContext(AuthContext); // Lấy thông tin user hiện tại từ Context 
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Logic Lọc Dữ Liệu
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = u.Username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.HoTen?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = filterRole === 'All' || u.RoleName === filterRole;
      const matchStatus = filterStatus === 'All' || u.TrangThai.toString() === filterStatus;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchTerm, filterRole, filterStatus]);

  // Logic Fetch Data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      // GỌI API QUA SERVICE: Tăng limit lên 500 để lấy hầu hết user cho việc lọc client-side
      const res = await userService.getAll({ limit: 500 });
      
      const data = res?.users || [];
      setUsers(data);
    } catch (error) {
      message.error("Lỗi khi tải danh sách tài khoản");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'db_Admin') fetchUsers();
  }, [user?.role]); // Chỉ re-fetch khi ROLE thực sự thay đổi, không phụ thuộc reference object user


  // Kiểm tra quyền truy cập (Bảo mật mức ứng dụng)
  if (user?.role !== 'db_Admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="text-red-600" size={40} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">Access Denied</h2>
        <p className="text-gray-500 max-w-md font-medium">Bạn không có quyền quản trị viên để truy cập module này. Mọi hành vi truy cập trái phép sẽ được ghi lại trong Audit Log.</p>
      </div>
    );
  }

  // Handler: Reset Password 
  const handleResetPassword = (targetUser) => {
    Modal.confirm({
      title: `Reset mật khẩu cho [${targetUser.Username}]`,
      content: 'Hệ thống sẽ đặt lại mật khẩu về mặc định (123456). Bạn có chắc chắn?',
      okText: 'Xác nhận',
      onOk: async () => {
        try {
          // GỌI API QUA SERVICE
          await userService.resetPassword(targetUser.UserID);
          message.success("Đã reset mật khẩu thành công!");
        } catch (error) {
          message.error("Lỗi khi reset mật khẩu");
        }
      }
    });
  };

  // Handler: Update Role/Status
  const handleUpdateUser = async (targetUser, newData) => {
    try {
      // ĐÃ FIX LỖI LOGIC: Hỗ trợ cả trường hợp truyền "Role" hoặc "RoleName"
      const payload = {
        RoleName: newData.RoleName || newData.Role || targetUser.RoleName, 
        TrangThai: newData.TrangThai !== undefined ? newData.TrangThai : targetUser.TrangThai
      };

      // GỌI API QUA SERVICE
      await userService.update(targetUser.UserID, payload);
      message.success("Cập nhật thành công!");
      fetchUsers(); 
    } catch (error) {
      console.error("Update Error Details:", error.response?.data);
      message.error(error.response?.data?.message || "Cập nhật thất bại!");
    }
  };

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-50/50 font-sans animate-in fade-in duration-500">
      
      {/* TOOLBAR SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center">
            <UserCog className="mr-3 text-red-600" size={28} />
            Quản trị tài khoản
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium italic">
            Tổng cộng: <span className="text-blue-600 font-bold">{users.length}</span> tài khoản · 
            Đang lọc: <span className="text-orange-600 font-bold">{filteredUsers.length}</span>
          </p>
        </div>
        <button 
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
        >
          <Search size={16} className={loading ? 'animate-spin' : ''} />
          Làm mới dữ liệu
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* FILTERS TOOLBAR */}
        <div className="p-5 border-b border-gray-50 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm theo Username hoặc Họ tên..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter size={16} className="text-gray-400" />
            <Select 
              defaultValue="All" 
              className="w-40" 
              onChange={setFilterRole}
              options={[
                { value: 'All', label: 'Tất cả Quyền' },
                ...Object.keys(roleConfig).map(r => ({ value: r, label: roleConfig[r].label }))
              ]}
            />
            <Select 
              defaultValue="All" 
              className="w-40" 
              onChange={setFilterStatus}
              options={[
                { value: 'All', label: 'Tất cả Trạng thái' },
                { value: '1', label: 'Hoạt động' },
                { value: '0', label: 'Bị khóa' },
              ]}
            />
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                <th className="p-4 pl-8">Tài khoản</th>
                <th className="p-4">Nhân viên</th>
                <th className="p-4">Quyền hạn (Role)</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right pr-8">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan="5" className="p-6"><Skeleton active paragraph={{ rows: 1 }} /></td></tr>
                ))
              ) : filteredUsers.map((u) => (
                <tr key={u.UserID} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="p-4 pl-8">
                    <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                      {u.Username}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-gray-800">{u.HoTen}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${roleConfig[u.RoleName]?.color || ''}`}>
                      {roleConfig[u.RoleName]?.label || u.RoleName}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Switch 
                          size="small" 
                          checked={u.TrangThai === 1} 
                          onChange={(checked) => handleUpdateUser(u, { TrangThai: checked ? 1 : 0 })}
                        />
                      <span className={`text-xs font-bold ${u.TrangThai === 1 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {u.TrangThai === 1 ? 'Hoạt động' : 'Bị khóa'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right pr-8">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleResetPassword(u)}
                        className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all" 
                        title="Reset mật khẩu"
                      >
                        <Key size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          Modal.confirm({
                            title: 'Thay đổi quyền hạn',
                            content: (
                              <Select 
                                defaultValue={u.RoleName} 
                                className="w-full mt-4" 
                                onChange={(val) => window.selectedNewRole = val}
                                options={Object.keys(roleConfig).map(r => ({ value: r, label: roleConfig[r].label }))}
                              />
                            ),
                            onOk: () => {
                              if (window.selectedNewRole) {
                                handleUpdateUser(u, { Role: window.selectedNewRole });
                              }
                            }
                          });
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
                        title="Chỉnh sửa quyền"
                      >
                        <Shield size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;