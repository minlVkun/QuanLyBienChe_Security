import axiosClient from '../../api/axiosClient';

const shiftService = {
    getAll: () => {
        return axiosClient.get('/shifts');
    },

    getById: (id) => {
        return axiosClient.get(`/shifts/${id}`);
    },

    create: (data) => {
        return axiosClient.post('/shifts', data);
    },

    update: (id, data) => {
        return axiosClient.put(`/shifts/${id}`, data);
    },

    delete: (id) => {
        return axiosClient.delete(`/shifts/${id}`);
    }
};

export default shiftService;
