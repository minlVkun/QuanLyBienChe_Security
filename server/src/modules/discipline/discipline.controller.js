const DisciplineService = require('./discipline.service');

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
        return res.status(err.statusCode || 500).json({ 
            success: false, 
            message: err.message || "Đã xảy ra lỗi máy chủ nội bộ." 
        });
    }
};

const addDisciplineRecord = async (req, res) => {
    try {
        await DisciplineService.createDiscipline(req.user, req.body);
        
        return res.status(201).json({ 
            success: true, 
            message: 'Thêm mới quyết định Khen thưởng/Kỷ luật thành công.' 
        });
    } catch (err) {
        console.error(`[Controller Error - addDisciplineRecord]:`, err.message);
        return res.status(err.statusCode || 500).json({ 
            success: false, 
            message: err.message || "Đã xảy ra lỗi máy chủ nội bộ." 
        });
    }
};

const deleteDisciplineRecord = async (req, res) => {
    try {
        const id = req.params.id;
        await DisciplineService.deleteDiscipline(req.user, id);
        
        return res.status(200).json({ 
            success: true, 
            message: 'Xóa quyết định Khen thưởng/Kỷ luật thành công.' 
        });
    } catch (err) {
        console.error(`[Controller Error - deleteDisciplineRecord]:`, err.message);
        return res.status(err.statusCode || 500).json({ 
            success: false, 
            message: err.message || "Đã xảy ra lỗi máy chủ nội bộ." 
        });
    }
};

module.exports = { getDisciplineRecords, addDisciplineRecord, deleteDisciplineRecord };