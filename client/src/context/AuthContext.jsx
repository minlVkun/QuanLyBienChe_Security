import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

// 1. Tạo Context
export const AuthContext = createContext();

// 2. Tạo Provider (Nhà cung cấp dữ liệu cho toàn bộ App)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionVersion, setSessionVersion] = useState(0);

  // Khi vừa mở web lên, kiểm tra xem trước đó đã đăng nhập chưa
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        // Dùng try...catch để phòng trường hợp dữ liệu bị lỗi định dạng
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Lỗi khi đọc thông tin người dùng:", error);
        localStorage.removeItem('user'); // Xóa đi nếu dữ liệu bị hỏng
      }
    }
    setLoading(false); // Báo hiệu đã kiểm tra xong
  }, []);

  // Hàm gọi khi nhấn nút Đăng nhập thành công
  const login = (token, userData) => {
    // Chuẩn hóa dữ liệu: Đảm bảo field 'role' luôn tồn tại (viết thường)
    const normalizedUser = {
      ...userData,
      role: userData.role || userData.RoleName || ''
    };
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    setUser(normalizedUser); // Cập nhật bộ nhớ trung tâm ngay lập tức
  };

  // Hàm gọi khi nhấn Đăng xuất
  const logout = () => {
    const { clearAuthSession } = require('../api/axiosClient');
    clearAuthSession(); // Xóa sạch Token ở cả localStorage và Axios Header
    
    setUser(null); // Xóa sạch bộ nhớ state
    setSessionVersion(prev => prev + 1); // Đánh dấu phiên thay đổi (để các component reset UI)
  };

  // Cập nhật Token mới sau khi Silent Re-auth thành công
  const updateToken = (newToken, userData) => {
    // 1. Kiểm tra đầu vào
    if (!newToken || typeof newToken !== 'string') {
      console.error("Token không hợp lệ:", newToken);
      return;
    }

    try {
      // 2. Giải mã Token để lấy thông tin mới nhất (Role, MaNV...)
      const decoded = jwtDecode(newToken);
      
      // 3. Chuẩn hóa dữ liệu User (Ưu tiên data từ API, nếu thiếu thì lấy từ Token)
      const normalizedUser = {
        ...(userData || {}),
        UserID: decoded?.UserID || userData?.UserID,
        Username: decoded?.Username || userData?.Username,
        MaNV: decoded?.MaNV || userData?.MaNV,
        role: decoded?.RoleName || decoded?.role || userData?.role || userData?.RoleName || ''
      };

      // 4. Lưu vào Storage & State
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      setUser(normalizedUser);
      
      // 5. Giải phóng hàng chờ request tại axiosClient
      const { onTokenRefreshed } = require('../api/axiosClient');
      onTokenRefreshed(newToken);
      
    } catch (error) {
      console.error("Lỗi khi cập nhật Token:", error);
      // Nếu token hỏng, có thể cân nhắc logout() tùy chính sách
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateToken, loading, sessionVersion }}>
      {!loading && children} 
    </AuthContext.Provider>
  );
};

// 3. Custom Hook (Gợi ý thêm để code gọn hơn)
// Giúp các component khác gọi useAuth() thay vì useContext(AuthContext)
export const useAuth = () => {
  return useContext(AuthContext);
};