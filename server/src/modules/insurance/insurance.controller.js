const InsuranceService = require('./insurance.service');

const getInsuranceDetail = async (req, res) => {
    try {
        const maNV = req.params.id;
        const data = await InsuranceService.getInsurance(req.user, maNV);
        return res.status(200).json({ success: true, data });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({ success: false, message: err.message || 'Có lỗi xảy ra khi lấy thông tin bảo hiểm' });
    }  
};

const updateInsuranceInfo = async (req, res) => {
    try {
        const maNV = req.params.id;
        const result = await InsuranceService.updateInsurance(req.user, maNV, req.body);
        return res.status(200).json({ success: true, message: result.message });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({ success: false, message: err.message || 'Có lỗi xảy ra khi cập nhật thông tin bảo hiểm' });
    }
};

module.exports = {
    getInsuranceDetail,
    updateInsuranceInfo
};