import axiosClient from '../../api/axiosClient';

const salaryService = {
  // --- MÀN HÌNH 1: BẢNG LƯƠNG TỔNG HỢP ---
  getPayroll: async (thangNam, maDonVi) => {
    // URL: /api/salary/payroll?thangNam=04/2026&maDonVi=xxx
    const params = { thangNam };
    if (maDonVi && maDonVi !== 'All') params.maDonVi = maDonVi;
    const response = await axiosClient.get('/salary/payroll', { params });
    return response.data;
  },

  generatePayroll: async (thangNam) => {
    const response = await axiosClient.post('/salary/payroll/generate', { thangNam });
    return response.data;
  },

  // --- MÀN HÌNH 2: HỒ SƠ LƯƠNG CÁ NHÂN ---
  getCurrentSalary: async (maNV) => {
    const response = await axiosClient.get(`/salary/current/${maNV}`);
    return response.data;
  },

  getSalaryHistory: async (maNV) => {
    const response = await axiosClient.get(`/salary/history/${maNV}`);
    return response.data;
  },

  getPersonalPayrolls: async (maNV) => {
    const response = await axiosClient.get(`/salary/payroll/${maNV}`);
    return response.data;
  },

  // --- MÀN HÌNH 3: NÂNG BẬC ---
  getScales: async () => {
    const response = await axiosClient.get('/salary/scales');
    return response.data;
  },

  promote: async (payload) => {
    const response = await axiosClient.post('/salary/promote', payload);
    return response.data;
  },

  postMonthlySalary: async (payload) => {
    const response = await axiosClient.post('/salary/monthly', payload);
    return response.data;
  },

  calculatePreview: async (payload) => {
    const response = await axiosClient.post('/salary/preview', payload);
    return response.data;
  },

  updatePayroll: async (id, payload) => {
    const response = await axiosClient.put(`/salary/payroll/${id}`, payload);
    return response.data;
  },

  deletePayroll: async (id) => {
    const response = await axiosClient.delete(`/salary/payroll/${id}`);
    return response.data;
  },

  // --- QUẢN LÝ NGẠCH LƯƠNG ---
  createScale: async (data) => {
    const response = await axiosClient.post('/salary/scales', data);
    return response.data;
  },

  updateScale: async (id, data) => {
    const response = await axiosClient.put(`/salary/scales/${id}`, data);
    return response.data;
  },

  deleteScale: async (id) => {
    const response = await axiosClient.delete(`/salary/scales/${id}`);
    return response.data;
  },

  // --- QUẢN LÝ BẬC LƯƠNG ---
  addStep: async (data) => {
    const response = await axiosClient.post('/salary/steps', data);
    return response.data;
  },

  deleteStep: async (maNgach, bacLuong) => {
    const response = await axiosClient.delete(`/salary/steps/${maNgach}/${bacLuong}`);
    return response.data;
  }
};

export default salaryService;