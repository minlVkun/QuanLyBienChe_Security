import axiosClient from '../../api/axiosClient';

const degreeService = {
  getByEmployeeId: async (empId) => {
    const response = await axiosClient.get(`/degrees/${empId}`);
    return response.data;
  },
  
  // Thêm mới hàm CREATE
  create: async (data) => {
    const response = await axiosClient.post('/degrees', data);
    return response.data;
  },

  // Thêm mới hàm UPDATE
  update: async (id, data) => {
    const response = await axiosClient.put(`/degrees/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosClient.delete(`/degrees/${id}`);
    return response.data;
  }
};
export default degreeService;