import api from '../api';

const dashboardService = {
  getStats: async (role) => {
    // Gọi API Backend đã tạo. Role không cần truyền lên qua param vì Backend có thể tự giải mã từ Token (req.user)
    const response = await api.get('/system/dashboard-stats');
    return response.data;
  }
};

export default dashboardService;
