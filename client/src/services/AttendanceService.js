import api from './api';

const AttendanceService = {
    /**
     * Thực hiện Check-in / Check-out tự động
     */
    check: async () => {
        try {
            const response = await api.post('/attendance/check');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Lỗi hệ thống' };
        }
    },

    /**
     * Lấy lịch sử chấm công
     */
    getHistory: async (maNV, fromDate, toDate) => {
        try {
            const response = await api.get(`/attendance/history/${maNV}`, {
                params: { fromDate, toDate }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Lỗi hệ thống' };
        }
    }
};

export default AttendanceService;
