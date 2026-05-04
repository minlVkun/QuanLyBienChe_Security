import axiosClient from '../../api/axiosClient';

const userService = {
  getAll: async () => {
    const response = await axiosClient.get('/users');
    return response.data;
  },

  resetPassword: async (userId, newPassword = '123456') => {
    const response = await axiosClient.post(`/users/${userId}/reset-password`, { newPassword });
    return response.data;
  },

  update: async (userId, data) => {
    const response = await axiosClient.put(`/users/${userId}`, data);
    return response.data;
  }
};

export default userService;