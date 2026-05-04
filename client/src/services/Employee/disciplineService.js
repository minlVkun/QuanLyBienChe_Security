import axiosClient from '../../api/axiosClient';

const disciplineService = {
  getByEmployeeId: async (empId) => {
    const response = await axiosClient.get(`/discipline/${empId}`);
    return response.data;
  },
  
  // THÊM 2 HÀM NÀY VÀO
  create: async (data) => {
    const response = await axiosClient.post('/discipline', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosClient.put(`/discipline/${id}`, data);
    return response.data;
  },
  // ------------------

  delete: async (id) => {
    const response = await axiosClient.delete(`/discipline/${id}`);
    return response.data;
  }
};
export default disciplineService;