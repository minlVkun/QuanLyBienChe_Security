//src/
const InsuranceLogService = require('./insuranceLog.service');

const getContributionHistory = async (req, res) => {
    try {
        const maNV = req.params.id;
        const result = await InsuranceLogService.getContributionHistory(req.user, maNV, req.query);

        return res.status(200).json({
            success: true,
            data: result.logs,
            pagination: result.pagination
        });
    } catch (err) {
        console.error("Error occurred while fetching insurance contribution history:", err);
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'Có lỗi xảy ra khi lấy lịch sử đóng bảo hiểm'
        });
    }
};


module.exports = {
    getContributionHistory
};