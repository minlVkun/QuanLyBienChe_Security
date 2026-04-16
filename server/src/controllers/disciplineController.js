const DisciplineService = require('../services/disciplineService');

const getDisciplineRecords = async (req, res) => {
    try {
        const maNV = req.params.id;
        const data = await DisciplineService.getDisciplineByMaNV(req.user, maNV);
        
        return res.status(200).json({
            success: true,
            count: data.length,
            data: data
        });
    } catch (err) {
        console.error(`[Controller Error - getDisciplineRecords]:`, err.message);
        const isBadRequest = err.message.includes("không hợp lệ");
        
        return res.status(isBadRequest ? 400 : 500).json({ 
            success: false, 
            message: err.message || "Đã xảy ra lỗi máy chủ nội bộ." 
        });
    }
};

const addDisciplineRecord = async (req, res) => {
    try {
        // Truyền thẳng req.body vào Service để xử lý trích xuất an toàn
        await DisciplineService.createDiscipline(req.user, req.body);
        
        return res.status(201).json({ 
            success: true, 
            message: 'Thêm mới quyết định Khen thưởng/Kỷ luật thành công.' 
        });
    } catch (err) {
        console.error(`[Controller Error - addDisciplineRecord]:`, err.message);
        
        // Phân loại mã lỗi dựa trên message do Service ném ra
        const isClientError = err.message.includes("Vui lòng cung cấp") || 
                              err.message.includes("đã tồn tại") || 
                              err.message.includes("Không thể thêm mới");
                              
        return res.status(isClientError ? 400 : 500).json({ 
            success: false, 
            message: err.message || "Đã xảy ra lỗi máy chủ nội bộ." 
        });
    }
};

module.exports = { getDisciplineRecords, addDisciplineRecord };