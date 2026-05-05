import api from '../api';

const attendanceService = {
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
     * Lấy lịch sử chấm công của bản thân hoặc của nhân viên (nếu là Admin/HR)
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
    },

    /**
     * Quản lý: Lấy danh sách chấm công (Admin/HR)
     */
    getAll: async (filters) => {
        try {
            const response = await api.get('/attendance', { params: filters });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Lỗi hệ thống' };
        }
    },

    /**
     * Quản lý: Cập nhật thủ công (HR)
     */
    updateManual: async (id, data) => {
        try {
            const response = await api.put(`/attendance/${id}`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Lỗi hệ thống' };
        }
    },

    /**
     * Xuất Excel
     */
    exportExcel: async (filters) => {
        try {
            const response = await api.post('/attendance/export', filters, {
                responseType: 'blob'
            });
            
            // Tạo URL để tải xuống
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `BaoCaoChamCong_${new Date().getTime()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            return true;
        } catch (error) {
            throw error.response?.data || { message: 'Lỗi khi xuất file' };
        }
    }
};

export default attendanceService;
