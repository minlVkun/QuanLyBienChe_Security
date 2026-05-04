import axiosClient from '../../api/axiosClient';

const ENDPOINT = '/audit';

const auditService = {
  // Lấy danh sách logs kèm theo phân trang và filter
  getLogs: async (params = {}) => {
    // params: { page, limit, search, action, user, startDate, endDate }
    const response = await axiosClient.get(ENDPOINT, { params });
    return response.data;
  },

  // Lấy chi tiết 1 log để xem nội dung thay đổi
  getLogDetail: async (id) => {
    const response = await axiosClient.get(`${ENDPOINT}/${id}`);
    return response.data;
  }
};

export default auditService;
