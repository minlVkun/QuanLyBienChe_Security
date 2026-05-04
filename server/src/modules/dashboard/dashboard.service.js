const DashboardModel = require('./dashboard.model');

class DashboardService {
    static async getDashboardData(reqUser) {
        // Nếu là nhân viên thường, chỉ trả về dữ liệu cá nhân
        if (reqUser.role === 'db_Employee') {
            const [personalStats, salaryHistoryData] = await Promise.all([
                DashboardModel.getPersonalStats(reqUser),
                DashboardModel.getPersonalSalaryHistory(reqUser)
            ]);
            
            // Format '10/2023' -> 'T10' để thư viện Recharts vẽ đẹp hơn
            let salaryHistory = salaryHistoryData.map(item => ({
                month: 'T' + item.month.substring(0, 2),
                amount: item.amount
            }));

            return {
                personalStats: {
                    currentSalary: personalStats.currentSalary || 0,
                    leaveDaysRemaining: personalStats.leaveDaysRemaining || 12, // Dummy static data
                    achievements: personalStats.achievements || 0
                },
                salaryHistory
            };
        }

        // Nếu là Admin hoặc Trưởng phòng, trả về dữ liệu tổng quan phòng ban/công ty
        // RLS ở Model đã tự động lọc records theo reqUser.role!
        const [stats, charts] = await Promise.all([
            DashboardModel.getStats(reqUser),
            DashboardModel.getChartData(reqUser)
        ]);

        const formattedGrowth = charts.employeeGrowth.map(item => ({
            month: 'T' + item.month.substring(0, 2),
            employees: item.employees,
            newHires: item.newHires
        }));

        return {
            kpi: {
                totalEmployees: stats.TotalEmployees,
                totalPayroll: stats.TotalPayroll,
                newHires: stats.NewHires
            },
            salaryByDept: charts.salaryByDept.map(item => ({
                dept: item.dept || 'Chưa phân bổ',
                cost: item.cost
            })),
            employeeGrowth: formattedGrowth
        };
    }
}

module.exports = DashboardService;
