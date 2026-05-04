import axiosClient from '../../api/axiosClient';

const positionService = {
  // Lấy toàn bộ danh sách chức vụ
  getAll: async () => {
    const response = await axiosClient.get('/positions');
    return response.data;
  },

  create: async (data) => {
    const response = await axiosClient.post('/positions', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosClient.put(`/positions/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosClient.delete(`/positions/${id}`);
    return response.data;
  }
};

export default positionService;