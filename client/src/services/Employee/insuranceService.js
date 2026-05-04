import axiosClient from '../../api/axiosClient';

const insuranceService = {
  getInsuranceDetail: async (id) => {
    const response = await axiosClient.get(`/insurance/${id}`);
    return response.data;
  },

  updateInsuranceInfo: async (id, data) => {
    const response = await axiosClient.put(`/insurance/${id}`, data);
    return response.data;
  },

  getContributionHistory: async (id, params = {}) => {
    const response = await axiosClient.get(`/insurance-log/${id}`, { params });
    return response.data;
  }
};

export default insuranceService;
