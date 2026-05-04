import api from '../api';

const configService = {
  /**
   * Lấy danh sách cấu hình
   */
  getAll: async () => {
    const response = await api.get('/configs');
    return response.data;
  },

  /**
   * Cập nhật giá trị cấu hình
   * @param {string} key 
   * @param {string} value 
   * @param {string} description
   */
  update: async (key, value, description) => {
    const response = await api.put(`/configs/${key}`, { value, description });
    return response.data;
  },

  /**
   * Tạo cấu hình mới
   */
  create: async (data) => {
    const response = await api.post('/configs', data);
    return response.data;
  },

  /**
   * Xóa cấu hình
   * @param {string} key 
   */
  delete: async (key) => {
    const response = await api.delete(`/configs/${key}`);
    return response.data;
  }
};

export default configService;
