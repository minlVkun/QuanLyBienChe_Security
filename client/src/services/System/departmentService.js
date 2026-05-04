import axiosClient from '../../api/axiosClient';

const departmentService = {
  // Lấy toàn bộ danh sách phòng ban
  getAll: async () => {
    const response = await axiosClient.get('/departments');
    return response.data;
  },

  // Cập nhật Trưởng phòng
  updateHead: async (deptId, maNV) => {
    const response = await axiosClient.put(`/departments/${deptId}/head`, { maTruongPhong: maNV });
    return response.data;
  },

  create: async (payload) => {
    const response = await axiosClient.post('/departments', payload);
    return response.data;
  },

  update: async (deptId, payload) => {
    const response = await axiosClient.put(`/departments/${deptId}`, payload);
    return response.data;
  },

  delete: async (deptId) => {
    const response = await axiosClient.delete(`/departments/${deptId}`);
    return response.data;
  }
};

export default departmentService;