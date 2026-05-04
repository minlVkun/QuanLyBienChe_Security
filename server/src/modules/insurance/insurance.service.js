const InsuranceModel = require('./insurance.model');
const { updateInsuranceSchema, formatZodError } = require('./insurance.validation');

class InsuranceService {
    static async getInsurance(reqUser, maNV) {
        if (!maNV) {
            const err = new Error("Mã nhân viên là bắt buộc.");
            err.statusCode = 400; throw err;
        }

        const data = await InsuranceModel.getInsurance(reqUser, maNV);
        if (!data) {
            const err = new Error("Không tìm thấy thông tin bảo hiểm của nhân viên hoặc nhân viên không tồn tại");
            err.statusCode = 404; throw err;
        }

        return data;
    }

    static async updateInsurance(reqUser, maNV, data) {
        if (!maNV) {
            const err = new Error("Mã nhân viên là bắt buộc.");
            err.statusCode = 400; throw err;
        }

        const validationResult = updateInsuranceSchema.safeParse(data);
        if (!validationResult.success) {
            const err = new Error(formatZodError(validationResult.error));
            err.statusCode = 400; throw err;
        }

        const affectedRows = await InsuranceModel.updateInsurance(reqUser, maNV, validationResult.data);
        if (affectedRows === 0) {
            const err = new Error("Không tìm thấy nhân viên hoặc nhân viên không tồn tại");
            err.statusCode = 404; throw err;
        }

        return { message: "Cập nhật thông tin bảo hiểm thành công" };
    }
}

module.exports = InsuranceService;
