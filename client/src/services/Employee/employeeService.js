import axiosClient from '../../api/axiosClient';

const ENDPOINT = '/employees';

const employeeService = {
  // Lấy toàn bộ danh sách nhân viên (có phân trang và tìm kiếm)
  getAll: async (params = {}) => {
    const response = await axiosClient.get(ENDPOINT, { params });
    return response.data;
  },

  // Lấy chi tiết 1 nhân viên để Edit
  getById: async (id) => {
    const response = await axiosClient.get(`${ENDPOINT}/${id}`);
    return response.data;
  },

  // Thêm mới nhân viên (Dùng cho Modal sau này)
  create: async (data) => {
    const response = await axiosClient.post(ENDPOINT, data);
    return response.data;
  },

  // Cập nhật nhân viên (Dùng cho Modal sau này)
  update: async (id, data) => {
    const response = await axiosClient.put(`${ENDPOINT}/${id}`, data);
    return response.data;
  },

  // Xóa nhân viên
  delete: async (id) => {
    const response = await axiosClient.delete(`${ENDPOINT}/${id}`);
    return response.data;
  }
};

export default employeeService;