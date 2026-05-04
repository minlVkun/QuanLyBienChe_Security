import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Hash, Building2, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const roleLabels = {
  'db_Admin': 'Administrator',
  'db_HR_Human': 'Quản lý Nhân sự',
  'db_HR_Payroll': 'Quản lý Lương',
  'db_DeptHead': 'Trưởng phòng',
  'db_Employee': 'Nhân viên'
};

const roleColors = {
  'db_Admin': 'bg-red-100 text-red-700 border-red-200',
  'db_HR_Human': 'bg-purple-100 text-purple-700 border-purple-200',
  'db_HR_Payroll': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'db_DeptHead': 'bg-blue-100 text-blue-700 border-blue-200',
  'db_Employee': 'bg-gray-100 text-gray-700 border-gray-200',
};

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const infoItems = [
    {
      icon: <User className="w-5 h-5 text-blue-500" />,
      label: 'Tên đăng nhập',
      value: user?.username || user?.Username || '---',
    },
    {
      icon: <Hash className="w-5 h-5 text-indigo-500" />,
      label: 'Mã nhân viên',
      value: user?.MaNV || '---',
    },
    {
      icon: <Shield className="w-5 h-5 text-emerald-500" />,
      label: 'Vai trò hệ thống',
      value: (
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${roleColors[user?.role] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
          {roleLabels[user?.role] || user?.role || 'Không xác định'}
        </span>
      ),
    },
    {
      icon: <Building2 className="w-5 h-5 text-amber-500" />,
      label: 'Hồ sơ chi tiết',
      value: user?.MaNV ? (
        <button
          onClick={() => navigate(`/employees/${user.MaNV}`)}
          className="text-blue-600 hover:underline font-semibold text-sm"
        >
          Xem hồ sơ nhân viên →
        </button>
      ) : (
        <span className="text-gray-400 text-sm italic">Tài khoản hệ thống</span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10 font-sans">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Hồ sơ cá nhân</h1>
          <p className="text-gray-500 text-sm mt-1">Thông tin tài khoản và phân quyền của bạn trong hệ thống.</p>
        </div>

        {/* Avatar Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-400 flex items-center justify-center text-white text-3xl font-extrabold shadow-md flex-shrink-0">
            {(user?.HoTen || user?.username || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user?.HoTen || user?.username || 'Người dùng'}</h2>
            <p className="text-sm text-blue-600 font-semibold mt-1">
              {roleLabels[user?.role] || user?.role}
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-5">Thông tin tài khoản</h3>
          <div className="space-y-5">
            {infoItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold mb-0.5">{item.label}</p>
                  <div className="text-sm font-bold text-gray-800">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-start gap-3">
          <KeyRound className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800 mb-1">Bảo mật tài khoản</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              Để thay đổi mật khẩu, vui lòng sử dụng menu <strong>Đổi Mật Khẩu</strong> ở góc trên bên phải màn hình.
              Sau khi đổi mật khẩu, bạn sẽ được đăng xuất và yêu cầu đăng nhập lại.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
