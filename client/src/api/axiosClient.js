// src/api/axiosClient.js
import axios from 'axios';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 1. Khởi tạo "người đưa thư"
const axiosClient = axios.create({
  // Lấy địa chỉ từ file .env, nếu không có thì mặc định dùng localhost
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api/', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Cấu hình "Kẹp thẻ nhân viên" (Gắn Token vào mỗi request)
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // SECURITY: Đảm bảo xóa sạch header nếu không có token trong localStorage
    delete config.headers.Authorization;
  }
  
  // Vô hiệu hóa cache trình duyệt — bắt buộc với hệ thống RLS
  config.headers['Cache-Control'] = 'no-cache';
  config.headers['Pragma'] = 'no-cache';
  return config;
});

// Hàm xóa sạch dấu vết phiên làm việc (Bảo mật RAM)
export const clearAuthSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Xóa cứng header trong defaults để triệt tiêu rò rỉ RAM
  delete axiosClient.defaults.headers.common['Authorization'];
};


// 3. Xử lý lỗi chung & Silent Re-auth
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 (Hết hạn Token) và không phải request đăng nhập/xác thực lại
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      const url = originalRequest.url;
      // Tránh kích hoạt Modal hết hạn cho các luồng xác thực đặc biệt hoặc reveal dữ liệu
      if (url.includes('/auth/login') || url.includes('/auth/reauth') || url.includes('/reveal')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // Phát ra sự kiện yêu cầu nạp lại token (Silent Re-auth Modal sẽ bắt)
      window.dispatchEvent(new CustomEvent('auth:expired'));

      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axiosClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    return Promise.reject(error);
  }
);

// Hàm để AuthContext gọi sau khi gia hạn thành công
export const onTokenRefreshed = (newToken) => {
  isRefreshing = false;
  axiosClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  processQueue(null, newToken);
};

export const onTokenRefreshFailed = (error) => {
  isRefreshing = false;
  processQueue(error, null);
};

// Gợi ý: Khai báo luôn API đăng nhập ở đây để các Component gọi cho tiện
export const authApi = {
  login: (username, password) => axiosClient.post('/auth/login', { username, password }),
};

export default axiosClient;