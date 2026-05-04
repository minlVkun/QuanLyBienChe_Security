// components/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spin } from 'antd'; // Dùng vòng xoay của AntD cho đẹp

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1. Khi đang kiểm tra xem có Token trong máy không, hiện màn hình chờ
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Spin size="large" tip="Đang kiểm tra quyền truy cập..." />
      </div>
    );
  }

  // 2. Nếu chưa đăng nhập -> Đá văng về trang Login
  // Lưu lại vị trí cũ (state: { from: location }) để sau khi login xong quay lại đúng trang đó
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Nếu đã đăng nhập nhưng không đúng Role (Phân quyền)
  // Ví dụ: Nhân viên đòi vào xem "Nhật ký hệ thống" của Admin
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />; 
  }

  // 4. Mọi thứ hợp lệ -> Cho phép xem trang
  return children;
};

export default ProtectedRoute;