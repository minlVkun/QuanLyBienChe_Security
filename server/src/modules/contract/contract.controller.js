const ContractService = require('./contract.service');

const getAllContracts = async (req, res) => {
    try {
        const data = await ContractService.getAllContracts(req.user);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi lấy danh sách hợp đồng' });
    }
};

const generateCode = async (req, res) => {
    try {
        const code = await ContractService.generateContractCode(req.user);
        return res.status(200).json({ success: true, code });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi khi tạo mã hợp đồng' });
    }
};

const getContractsByEmployeeId = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const data = await ContractService.getContractsByEmployeeId(req.user, employeeId);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi lấy danh sách hợp đồng' });
    }
};

const createContract = async (req, res) => {
    try {
        // req.body chứa thông tin text, req.file chứa file từ multer
        const result = await ContractService.createContract(req.user, req.body, req.file);
        return res.status(201).json(result);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ 
            success: false, 
            message: error.message || 'Đã xảy ra lỗi khi tạo hợp đồng' 
        });
    }
};

const updateContract = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await ContractService.updateContract(req.user, id, req.body, req.file);
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ 
            success: false, 
            message: error.message || 'Đã xảy ra lỗi khi cập nhật hợp đồng' 
        });
    }
};

const deleteContract = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await ContractService.deleteContract(req.user, id);
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ 
            success: false, 
            message: error.message || 'Đã xảy ra lỗi khi xóa hợp đồng' 
        });
    }
};

const downloadContractFile = async (req, res) => {
    try {
        const { filename } = req.params;
        // path.join để tạo đường dẫn tuyệt đối an toàn
        const path = require('path');
        const filePath = path.join(__dirname, '../../../../uploads/contracts', filename);
        
        if (!require('fs').existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'File không tồn tại' });
        }

        return res.download(filePath);
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi khi tải file' });
    }
};

module.exports = { 
    getAllContracts, 
    generateCode,
    getContractsByEmployeeId, 
    createContract,
    updateContract,
    deleteContract,
    downloadContractFile
};
