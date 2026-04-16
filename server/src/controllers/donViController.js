const DonViService = require('../services/donViService');

class DonViController {
    /**
     * Lấy sơ đồ tổ chức
     */
    static async getOrgChart(req, res) {
        try {
            const data = await DonViService.getOrgChart(req.user);
            return res.status(200).json({
                success: true,
                count: data.length,
                data: data
            });
        } catch (err) {
            console.error(`[Controller Error - getOrgChart]:`, err.message);
            return res.status(500).json({ 
                success: false, 
                message: "Không thể tải sơ đồ tổ chức lúc này." 
            });
        }
    }

    /**
     * Thay đổi trưởng phòng đơn vị
     */
    static async changeDeptHead(req, res) {
        try {
            const { id } = req.params; // MaDonVi
            const { maTruongPhong } = req.body;

            // Validate định dạng đầu vào cơ bản
            if (maTruongPhong !== undefined && maTruongPhong !== null && typeof maTruongPhong !== 'string') {
                return res.status(400).json({ success: false, message: "Định dạng mã trưởng phòng không hợp lệ." });
            }

            const result = await DonViService.changeDeptHead(req.user, id, maTruongPhong);

            return res.status(200).json({
                success: true,
                message: result.message
            });

        } catch (err) {
            console.error(`[Controller Error - changeDeptHead]:`, err.message);
            
            const statusCode = (err.message.includes("không tìm thấy") || err.message.includes("không được để trống")) ? 400 : 500;
            const finalMessage = statusCode === 500 ? "Lỗi máy chủ khi cập nhật lãnh đạo." : err.message;

            return res.status(statusCode).json({ 
                success: false, 
                message: finalMessage 
            });
        }
    }
}

module.exports = DonViController;