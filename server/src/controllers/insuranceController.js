//src/controllers/insuranceController.js
const InsuranceModel = require('../models/insuranceModel');

const getInsuranceDetail = async (req, res) => {
    try {
        const maNV = req.params.id;

        const data = await InsuranceModel.getInsurance(req.user, maNV);
        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông tin bảo hiểm của nhân viên hoặc nhân viên không tồn tại'
            });
        }
        res.json({
            success: true,
            data: data
        });
    } catch (err) {
        console.error("Error occurred while fetching insurance details:", err);
        res.status(500).json({
            success: false, 
            message: 'Có lỗi xảy ra khi lấy thông tin bảo hiểm của nhân viên'
        });
    }  
};

const updateInsuranceInfo = async (req, res) => {
    try {
        const maNV = req.params.id;

        const result = await InsuranceModel.updateInsurance(req.user, maNV, req.body);
        if (result.rowsAffected[0] > 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy nhân viên hoặc nhân viên không tồn tại'
            });
        }
        res.json({
            success: true,
            message: 'Cập nhật thông tin bảo hiểm thành công'
        });
    } catch (err) {
        console
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi cập nhật thông tin bảo hiểm của nhân viên'
        });
    }
};

module.exports = {
    getInsuranceDetail,
    updateInsuranceInfo
};