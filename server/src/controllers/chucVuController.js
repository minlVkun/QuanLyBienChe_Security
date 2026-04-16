const ChucVuModel = require('../models/chucVuModel');

const getAllChucVu = async (req, res) => {
    try {
        const danhSach = await ChucVuModel.getAll(req.user);
        return res.status(200).json({ success: true, data: danhSach });
    } catch (error) {
        console.error("Lỗi get all chức vụ:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống khi tải danh mục chức vụ." });
    }
};

const getChucVuById = async (req, res) => {
    try {
        const { id } = req.params;
        const chucVu = await ChucVuModel.getById(req.user, id);
        
        if (!chucVu) {
            return res.status(404).json({ success: false, message: "Không tìm thấy chức vụ này." });
        }
        return res.status(200).json({ success: true, data: chucVu });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi khi lấy chi tiết chức vụ." });
    }
};

const createChucVu = async (req, res) => {
    try {
        const { MaChucVu, TenChucVu, PhuCapChucVu } = req.body;
        
        // Validate cơ bản
        if (!MaChucVu || !TenChucVu) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập Mã và Tên chức vụ." });
        }

        // Kiểm tra mã đã tồn tại chưa
        const checkExist = await ChucVuModel.getById(req.user, MaChucVu);
        if (checkExist) {
            return res.status(400).json({ success: false, message: "Mã chức vụ đã tồn tại!" });
        }

        await ChucVuModel.create(req.user, { MaChucVu, TenChucVu, PhuCapChucVu });
        return res.status(201).json({ success: true, message: "Thêm chức vụ thành công." });
    } catch (error) {
        console.error("Lỗi create chức vụ:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống khi thêm chức vụ." });
    }
};

const updateChucVu = async (req, res) => {
    try {
        const { id } = req.params;
        const { TenChucVu, PhuCapChucVu } = req.body;

        if (!TenChucVu) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập tên chức vụ." });
        }

        await ChucVuModel.update(req.user, id, { TenChucVu, PhuCapChucVu });
        return res.status(200).json({ success: true, message: "Cập nhật chức vụ thành công." });
    } catch (error) {
        console.error("Lỗi update chức vụ:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống khi cập nhật chức vụ." });
    }
};

const deleteChucVu = async (req, res) => {
    try {
        const { id } = req.params;
        // Bắt lỗi nếu bảng Quá trình công tác đang tham chiếu khóa ngoại đến chức vụ này
        // (SQL Server sẽ văng lỗi Foreign Key, ta bắt lỗi ở khối Catch)
        await ChucVuModel.delete(req.user, id);
        return res.status(200).json({ success: true, message: "Xóa chức vụ thành công." });
    } catch (error) {
        console.error("Lỗi delete chức vụ:", error);
        // Kiểm tra mã lỗi SQL Server (Ví dụ: 547 là lỗi vi phạm khóa ngoại)
        if (error.number === 547) {
            return res.status(400).json({ success: false, message: "Không thể xóa. Chức vụ này đang được gán cho nhân viên!" });
        }
        return res.status(500).json({ success: false, message: "Lỗi hệ thống khi xóa chức vụ." });
    }
};

module.exports = {
    getAllChucVu,
    getChucVuById,
    createChucVu,
    updateChucVu,
    deleteChucVu
};