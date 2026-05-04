const PositionModel = require('./position.model');
const { createPositionSchema, updatePositionSchema, formatZodError } = require('./position.validation');

class PositionService {
    static async getAll(reqUser) {
        return await PositionModel.getAll(reqUser);
    }

    static async getById(reqUser, id) {
        const chucVu = await PositionModel.getById(reqUser, id);
        if (!chucVu) {
            const err = new Error("Không tìm thấy chức vụ này.");
            err.statusCode = 404; throw err;
        }
        return chucVu;
    }

    static async create(reqUser, data) {
        const validationResult = createPositionSchema.safeParse(data);
        if (!validationResult.success) {
            const err = new Error(formatZodError(validationResult.error));
            err.statusCode = 400; throw err;
        }

        const validData = validationResult.data;

        // Check exists
        const checkExist = await PositionModel.getById(reqUser, validData.MaChucVu);
        if (checkExist) {
            const err = new Error("Mã chức vụ đã tồn tại!");
            err.statusCode = 400; throw err;
        }

        await PositionModel.create(reqUser, validData);
        return { message: "Thêm chức vụ thành công." };
    }

    static async update(reqUser, id, data) {
        const validationResult = updatePositionSchema.safeParse(data);
        if (!validationResult.success) {
            const err = new Error(formatZodError(validationResult.error));
            err.statusCode = 400; throw err;
        }

        await PositionModel.update(reqUser, id, validationResult.data);
        return { message: "Cập nhật chức vụ thành công." };
    }

    static async delete(reqUser, id) {
        try {
            await PositionModel.delete(reqUser, id);
            return { message: "Xóa chức vụ thành công." };
        } catch (error) {
            if (error.number === 547) {
                const err = new Error("Không thể xóa. Chức vụ này đang được gán cho nhân viên!");
                err.statusCode = 400; throw err;
            }
            throw error;
        }
    }
}

module.exports = PositionService;
