import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/EmployeeList';
import EmployeeDetail from './pages/EmployeeDetail';
import AuditLog from './pages/AuditLog';
import DepartmentList from './pages/DepartmentList';
import UserManagement from './pages/UserManagement';
import PayrollManagement from './pages/PayrollManagement';
import Profile from './pages/Profile';
import PositionList from './pages/PositionList';
import SalaryScaleList from '.
/pages/SalaryScaleList';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import LoginLogs from './pages/LoginLogs';

import ProtectedRoute from './routes/ProtectedRoute';
function App() {
  return (
    <Router>
      <Routes>
        {/* Route công khai: Ai cũng vào được */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Cụm Route bảo vệ: Phải đăng nhập mới vào được */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          {/* Dashboard: Mọi role đã login đều xem được */}
          <Route path="dashboard" element={<Dashboard />} />

          {/* Trang hồ sơ cá nhân: Mọi role */}
          <Route path="profile" element={<Profile />} />

          {/* Quản lý nhân sự: Chỉ Admin, HR và Trưởng phòng */}
          <Route path="employees" element={
            <ProtectedRoute>
              <EmployeeList />
            </ProtectedRoute>
          } />
          <Route path="employees/:id" element={<EmployeeDetail />} />
          <Route path="departments" element={
            <ProtectedRoute>
              <DepartmentList />
            </ProtectedRoute>
          } />
          {/* QUẢN LÝ LƯƠNG TẠI ĐÂY */}
          <Route path="salary" element={
            <ProtectedRoute allowedRoles={['db_Admin', 'db_HR_Payroll', 'db_DeptHead']}>
              <PayrollManagement />
            </ProtectedRoute>
          } />
          {/* Nhật ký: Chỉ DUY NHẤT Admin */}
          <Route path="audit" element={
            <ProtectedRoute allowedRoles={['db_Admin']}>
              <AuditLog />
            </ProtectedRoute>
          } />

          <Route path="login-logs" element={
            <ProtectedRoute allowedRoles={['db_Admin']}>
              <LoginLogs />
            </ProtectedRoute>
          } />

          <Route path="users" element={
            <ProtectedRoute allowedRoles={['db_Admin']}>
              <UserManagement />
            </ProtectedRoute>
          } />

          <Route path="positions" element={
            <ProtectedRoute allowedRoles={['db_Admin', 'db_HR_Human']}>
              <PositionList />
            </ProtectedRoute>
          } />

          <Route path="salary-scales" element={
            <ProtectedRoute allowedRoles={['db_Admin', 'db_HR_Human']}>
              <SalaryScaleList />
            </ProtectedRoute>
          } />

          {/* Mặc định vào Dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Nếu gõ bậy bạ -> Về Login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;