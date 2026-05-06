const express = require('express');

function registerRoutes(app) {
  app.use('/api/audit', require('./audit/audit.route'));
  app.use('/api/auth', require('./auth/auth.route'));
  app.use('/api/degrees', require('./degree/degree.route'));
  app.use('/api/positions', require('./position/position.route'));
  app.use('/api/system', require('./dashboard/dashboard.route'));
  app.use('/api/discipline', require('./discipline/discipline.route'));
  app.use('/api/departments', require('./department/department.route'));
  app.use('/api/contracts', require('./contract/contract.route'));
  app.use('/api/employees', require('./employee/employee.route'));
  app.use('/api/salary', require('./salary/salary.route'));
  app.use('/api/users', require('./user/user.route'));
  app.use('/api/work-history', require('./workHistory/workHistory.route'));
  app.use('/api/insurance', require('./insurance/insurance.route'));
  app.use('/api/insurance-log', require('./insuranceLog/insuranceLog.route'));
  
  app.use('/api/allowances', require('./allowance/allowance.route'));
  
  app.use('/api/login-logs', require('./loginLog/loginLog.route'));
  app.use('/api/configs', require('./systemConfig/config.route'));
  app.use('/api/attendance', require('./attendance/attendance.route'));
  app.use('/api/shifts', require('./shift/shift.route'));
  app.use('/api/schedule', require('./schedule/schedule.route'));
}

module.exports = { registerRoutes };
