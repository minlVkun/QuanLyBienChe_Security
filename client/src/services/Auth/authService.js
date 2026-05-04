import axiosClient from '../../api/axiosClient';

const authService = {
  // Hàm gọi API Đăng nhập
  login: async (username, password) => {
    const response = await axiosClient.post('/auth/login', { username, password });
    return response.data;
  },

  // Hàm đổi mật khẩu (Dùng cho sau này)
  changePassword: async (oldPassword, newPassword) => {
    const response = await axiosClient.post('/auth/change-password', { oldPassword, newPassword });
    return response.data;
  }
};

export default authService;