const AllowanceService = require('./allowance.service');

const allowanceController = {
    async getByEmployeeId(req, res) {
        try {
            const { id } = req.params;
            const data = await AllowanceService.getByEmployeeId(req.user, id);
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async create(req, res) {
        try {
            const { id } = req.params;
            const result = await AllowanceService.create(req.user, id, req.body);
            res.status(201).json(result);
        } catch (error) {
            const code = error.statusCode || 500;
            res.status(code).json({ success: false, message: error.message });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const result = await AllowanceService.update(req.user, id, req.body);
            res.status(200).json(result);
        } catch (error) {
            const code = error.statusCode || 500;
            res.status(code).json({ success: false, message: error.message });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await AllowanceService.delete(req.user, id);
            res.status(200).json(result);
        } catch (error) {
            const code = error.statusCode || 500;
            res.status(code).json({ success: false, message: error.message });
        }
    }
};

module.exports = allowanceController;
