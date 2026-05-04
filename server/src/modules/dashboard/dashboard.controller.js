const dashboardService = require('./dashboard.service');

class DashboardController {
    static async getStats(req, res) {
        try {
            // req.user được gán từ jwt middleware
            const data = await dashboardService.getDashboardData(req.user);
            res.json({
                success: true,
                data
            });
        } catch (error) {
            console.error('[DashboardController Error]', error);
            res.status(500).json({ 
                success: false, 
                message: "Lỗi khi lấy dữ liệu Dashboard: " + error.message 
            });
        }
    }
}

module.exports = DashboardController;
