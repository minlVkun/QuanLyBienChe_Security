import React from 'react';
import { User, Calendar, IdCard, MapPin, Building2, Briefcase } from 'lucide-react';

const TabPersonalInfo = ({ employee }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "---";
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatGender = (gender) => (gender === false ? "Nam" : "Nữ");

  // Hàm xử lý hiển thị an toàn cho dữ liệu nhạy cảm (Đặc biệt là khi dùng Always Encrypted)
  const renderSafeValue = (val) => {
    if (!val) return "---";
    // Nếu là object {type: 'Buffer', data: [...]}
    if (typeof val === 'object' && val.type === 'Buffer') {
      return "[Dữ liệu đã mã hóa]";
    }
    return val.toString();
  };

  if (!employee) return null;

  return (
    <div className="animate-in fade-in duration-300">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <IdCard className="w-5 h-5 mr-2 text-blue-500" /> Thông tin định danh
        </h3>
      </div>
      <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1.5 flex items-center">
            <Calendar className="w-4 h-4 mr-1.5 text-gray-400" /> Ngày sinh
          </p>
          <p className="text-base font-semibold text-gray-900">{formatDate(employee.NgaySinh)}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1.5 flex items-center">
            <User className="w-4 h-4 mr-1.5 text-gray-400" /> Giới tính
          </p>
          <p className="text-base font-semibold text-gray-900">{formatGender(employee.GioiTinh)}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1.5 flex items-center">
            <IdCard className="w-4 h-4 mr-1.5 text-gray-400" /> Số CCCD
          </p>
          <p className="text-base font-semibold text-gray-900">{renderSafeValue(employee.SoCCCD)}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1.5 flex items-center">
            <MapPin className="w-4 h-4 mr-1.5 text-gray-400" /> Quê quán
          </p>
          <p className="text-base font-semibold text-gray-900">{renderSafeValue(employee.QueQuan)}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1.5 flex items-center">
            <Building2 className="w-4 h-4 mr-1.5 text-gray-400" /> Đơn vị
          </p>
          <p className="text-base font-semibold text-gray-900">{employee.TenDonVi || "---"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1.5 flex items-center">
            <Briefcase className="w-4 h-4 mr-1.5 text-gray-400" /> Chức vụ
          </p>
          <p className="text-base font-semibold text-gray-900">{employee.ChucVuHienTai || "---"}</p>
        </div>
      </div>
    </div>
  );
};

export default TabPersonalInfo;