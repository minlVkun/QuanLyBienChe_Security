import api from '../api';

const loginLogService = {
  getLogs: async (params) => {
    try {
      const response = await api.get('/login-logs', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default loginLogService;
