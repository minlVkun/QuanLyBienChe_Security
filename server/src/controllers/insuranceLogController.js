//src/
const InsuranceLogModel = require('../models/insuranceLogModel');

const getContributionHistory = async (req, res) => {
    try {
        const maNV = req.params.id;

        const data = await InsuranceLogModel.getContributionHistory(req.user, maNV);
        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy lịch sử đóng bảo hiểm của nhân viên hoặc nhân viên không tồn tại'
            });
        }
        res.json({
            success: true,
            data: data
        });
    } catch (err) {
        console.error("Error occurred while fetching insurance contribution history:", err);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy lịch sử đóng bảo hiểm'
        });
    }
};


module.exports = {
    getContributionHistory
};