// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, UserCircle, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; 

// IMPORT SERVICE GỌI API TỪ THƯ MỤC SERVICES
import authService from '../services/Auth/authService'; 

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth(); // Lấy hàm login từ Custom Hook

  // Xử lý logic khi người dùng nhấn Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // GỌI SERVICE Ở ĐÂY (Rất sạch sẽ và ngắn gọn)
      const res = await authService.login(username, password);
      
      // Theo cấu trúc chuẩn: { success: true, data: { token, user }, message }
      if (res.success && res.data && res.data.token) {
        // Gọi hàm login từ Context để lưu token và thông tin User
        login(res.data.token, res.data.user); 
        
        // Chuyển hướng sang trang Dashboard
        navigate('/dashboard');
      } else {
        setError(res.message || 'Tên đăng nhập hoặc mật khẩu không chính xác!');
      }
    } catch (err) {
      console.error('Login error:', err);
      // Lấy message lỗi từ Backend trả về (nếu có)
      const errorMessage = err.response?.data?.message || 'Không thể kết nối đến máy chủ Backend.';
      setError(String(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <Lock className="text-white w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Hệ Thống Quản Trị</h2>
          <p className="text-gray-500 text-sm">Hệ thống Quản lý Biên chế</p>
        </div>

        {/* Thông báo lỗi */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center">
            <ShieldAlert className="w-4 h-4 mr-2 flex-shrink-0" /> 
            <span>{error}</span>
          </div>
        )}

        {/* Form Đăng nhập */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Tên đăng nhập */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserCircle className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Tên đăng nhập (Mã NV)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Mật khẩu */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Tiện ích bổ sung */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-gray-600 cursor-pointer">
              <input type="checkbox" className="mr-2 rounded text-blue-600 focus:ring-blue-500" />
              Ghi nhớ tôi
            </label>
            <Link to="/forgot-password" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
              Quên mật khẩu?
            </Link>
          </div>

          {/* Nút Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-lg text-base font-medium transition-all shadow-md flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang kiểm tra...
              </div>
            ) : 'Đăng Nhập'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 text-[10px] text-gray-400 text-center uppercase tracking-widest">
          SCA Duy Tan University - 2026
        </div>
      </div>
    </div>
  );
};

export default Login;