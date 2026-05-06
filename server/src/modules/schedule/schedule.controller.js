// src/modules/schedule/schedule.controller.js
const ScheduleService = require('./schedule.service');

const scheduleController = {
    // [GET] /api/schedule?fromDate=&toDate=&maNV=&maDonVi=&page=&limit=
    async getAll(req, res) {
        try {
            const result = await ScheduleService.getAll(req.user, req.query);
            res.json({ success: true, ...result });
        } catch (err) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    },

    // [GET] /api/schedule/:id
    async getById(req, res) {
        try {
            const data = await ScheduleService.getById(req.user, parseInt(req.params.id));
            res.json({ success: true, data });
        } catch (err) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    },

    // [POST] /api/schedule
    async create(req, res) {
        try {
            const result = await ScheduleService.create(req.user, req.body);
            res.status(201).json({ success: true, message: result.message, id: result.id });
        } catch (err) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    },

    // [POST] /api/schedule/bulk
    async bulkAssign(req, res) {
        try {
            const result = await ScheduleService.bulkAssign(req.user, req.body);
            res.status(201).json({ success: true, ...result });
        } catch (err) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    },

    // [PUT] /api/schedule/:id
    async update(req, res) {
        try {
            const result = await ScheduleService.update(req.user, parseInt(req.params.id), req.body);
            res.json({ success: true, message: result.message });
        } catch (err) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    },

    // [DELETE] /api/schedule/:id
    async delete(req, res) {
        try {
            const result = await ScheduleService.delete(req.user, parseInt(req.params.id));
            res.json({ success: true, message: result.message });
        } catch (err) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    }
};

module.exports = scheduleController;
