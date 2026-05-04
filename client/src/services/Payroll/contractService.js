import axiosClient from '../../api/axiosClient';

const ENDPOINT = '/contracts';

const contractService = {
  // Lấy toàn bộ danh sách hợp đồng
  getAll: async () => {
    const response = await axiosClient.get(ENDPOINT);
    return response.data;
  },

  // Lấy danh sách hợp đồng của 1 nhân viên cụ thể
  getByEmployeeId: async (employeeId) => {
    const response = await axiosClient.get(`${ENDPOINT}/employee/${employeeId}`);
    return response.data;
  },

  // Tự động tạo mã hợp đồng mới
  generateCode: async () => {
    const response = await axiosClient.get(`${ENDPOINT}/generate-code`);
    return response.data;
  },

  // Tạo hợp đồng mới (hỗ trợ file upload)
  create: async (formData) => {
    const response = await axiosClient.post(ENDPOINT, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Cập nhật hợp đồng
  update: async (id, formData) => {
    const response = await axiosClient.put(`${ENDPOINT}/${encodeURIComponent(id)}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Xóa hợp đồng
  delete: async (id) => {
    const response = await axiosClient.delete(`${ENDPOINT}/${encodeURIComponent(id)}`);
    return response.data;
  },

  // Tải file bảo mật (Dùng blob để tránh expose link trực tiếp)
  downloadFile: async (filePath) => {
    // filePath thường có dạng uploads/contracts/abc.pdf, ta chỉ lấy phần filename
    const filename = filePath.split('/').pop();
    const response = await axiosClient.get(`${ENDPOINT}/download/${filename}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export default contractService;
