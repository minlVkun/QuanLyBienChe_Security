import axiosClient from '../../api/axiosClient';

const workHistoryService = {
  getByEmployeeId: async (empId) => {
    const response = await axiosClient.get(`/work-history/${empId}`);
    return response.data;
  },
  transfer: async (payload) => {
    const response = await axiosClient.post('/work-history/transfer', payload);
    return response.data;
  }
};
export default workHistoryService;