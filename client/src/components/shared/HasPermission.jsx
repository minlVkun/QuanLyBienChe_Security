import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock } from 'lucide-react';

/**
 * Component bảo vệ giao diện theo phân quyền (RBAC)
 * 
 * @param {ReactNode} children - Nội dung được hiển thị nếu user có quyền
 * @param {Array} requiredRoles - Mảng các quyền (role) được phép truy cập. Ví dụ: ['db_Admin', 'db_HR_Human']
 * @param {ReactNode} fallback - Giao diện hiển thị thay thế nếu không có quyền (mặc định là null - ẩn đi)
 * @param {boolean} showWarning - Bật cờ này nếu muốn hiển thị một cảnh báo mặc định thay vì ẩn đi
 */
const HasPermission = ({ 
  children, 
  requiredRoles = [], 
  fallback = null,
  showWarning = false 
}) => {
  const { user } = useAuth();

  // Nếu không yêu cầu quyền gì đặc biệt, luôn cho phép render
  if (!requiredRoles || requiredRoles.length === 0) {
    return <>{children}</>;
  }

  // Kiểm tra user có tồn tại và role của user có nằm trong danh sách cho phép không
  const hasAccess = user && user.role && requiredRoles.includes(user.role);

  if (hasAccess) {
    return <>{children}</>;
  }

  // Nếu cấu hình hiển thị cảnh báo (VD: dùng để chặn nguyên một thẻ Card hoặc Section lớn)
  if (showWarning) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-gray-400">
        <Lock size={24} className="mb-2 text-gray-300" />
        <p className="text-sm font-medium">Bạn không có quyền xem hoặc sử dụng tính năng này</p>
      </div>
    );
  }

  // Nếu có truyền fallback UI thì render, không thì ẩn hoàn toàn (thích hợp cho các Nút bấm)
  return fallback ? <>{fallback}</> : null;
};

export default HasPermission;
