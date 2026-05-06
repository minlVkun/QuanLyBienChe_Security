// client/src/services/Schedule/scheduleService.js
import axiosClient from '../../api/axiosClient';

const scheduleService = {
    getAll: (params) =>
        axiosClient.get('/schedule', { params }).then(r => r.data),

    getById: (id) =>
        axiosClient.get(`/schedule/${id}`).then(r => r.data),

    create: (payload) =>
        axiosClient.post('/schedule', payload).then(r => r.data),

    bulkAssign: (payload) =>
        axiosClient.post('/schedule/bulk', payload).then(r => r.data),

    update: (id, payload) =>
        axiosClient.put(`/schedule/${id}`, payload).then(r => r.data),

    delete: (id) =>
        axiosClient.delete(`/schedule/${id}`).then(r => r.data),
};

export default scheduleService;
