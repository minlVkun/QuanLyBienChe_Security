/**
 * rbac.js — Cấu hình phân quyền tập trung (RBAC)
 *
 * Toàn bộ logic ẩn/hiện Menu và Tab được định nghĩa TẠI ĐÂY.
 * Không rải rác logic phân quyền khắp nơi trong code.
 *
 * Cách dùng:
 *   import { hasRole, MENU_PERMISSIONS, TAB_PERMISSIONS } from '../utils/rbac';
 */

// ─── Danh sách tất cả roles ───────────────────────────────────────────────────
export const ROLES = {
  ADMIN: 'db_Admin',
  HR_HUMAN: 'db_HR_Human',
  HR_PAYROLL: 'db_HR_Payroll',
  DEPT_HEAD: 'db_DeptHead',
  EMPLOYEE: 'db_Employee',
};

// ─── Nhãn hiển thị cho từng role ─────────────────────────────────────────────
export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Quản trị viên',
  [ROLES.HR_HUMAN]: 'Quản lý Nhân sự',
  [ROLES.HR_PAYROLL]: 'Quản lý Lương',
  [ROLES.DEPT_HEAD]: 'Trưởng đơn vị',
  [ROLES.EMPLOYEE]: 'Nhân viên',
};

// ─── Phân quyền Menu Sidebar ──────────────────────────────────────────────────
// null = tất cả roles đều thấy
export const MENU_PERMISSIONS = {
  '/dashboard': null,  // Tất cả
  '/employees': [ROLES.ADMIN, ROLES.HR_HUMAN, ROLES.HR_PAYROLL, ROLES.DEPT_HEAD],
  '/departments': null, // Tất cả
  '/salary': [ROLES.ADMIN, ROLES.HR_PAYROLL, ROLES.DEPT_HEAD],
  '/users': [ROLES.ADMIN],
  '/audit': [ROLES.ADMIN],
  '/login-logs': [ROLES.ADMIN],
  '/configs': [ROLES.ADMIN],
  '/positions': [ROLES.ADMIN, ROLES.HR_HUMAN],
  '/salary-scales': [ROLES.ADMIN, ROLES.HR_HUMAN],
  '/shifts': [ROLES.ADMIN, ROLES.HR_HUMAN],
  '/schedule': [ROLES.ADMIN, ROLES.HR_HUMAN, ROLES.HR_PAYROLL, ROLES.DEPT_HEAD],
  '/attendance': null, // Tất cả (Check-in/out)
};

// ─── Phân quyền Tabs trong Chi tiết nhân viên ─────────────────────────────────
// null = tất cả roles đều thấy
export const TAB_PERMISSIONS = {
  'info': null, // Tất cả (RLS phía backend tự giới hạn Employee chỉ xem mình)
  'degrees': [ROLES.ADMIN, ROLES.HR_HUMAN, ROLES.DEPT_HEAD],
  'work-history': [ROLES.ADMIN, ROLES.HR_HUMAN, ROLES.DEPT_HEAD],
  'salary': [ROLES.ADMIN, ROLES.HR_PAYROLL, ROLES.DEPT_HEAD],
  'contract': [ROLES.ADMIN, ROLES.HR_HUMAN, ROLES.HR_PAYROLL],
  'discipline': [ROLES.ADMIN, ROLES.HR_HUMAN, ROLES.HR_PAYROLL, ROLES.DEPT_HEAD],
  'insurance': [ROLES.ADMIN, ROLES.HR_PAYROLL],
  'allowance': [ROLES.ADMIN, ROLES.HR_PAYROLL, ROLES.DEPT_HEAD],
};

// ─── Phân quyền Hành động (Button/Action level) ───────────────────────────────
// Định nghĩa các tổ hợp quyền cho từng tính năng cụ thể
export const ACTION_PERMISSIONS = {
  // LƯƠNG (Payroll)
  PAYROLL_GENERATE: [ROLES.ADMIN, ROLES.HR_PAYROLL],
  PAYROLL_EDIT: [ROLES.ADMIN, ROLES.HR_PAYROLL],
  PAYROLL_DELETE: [ROLES.ADMIN, ROLES.HR_PAYROLL],
  PAYROLL_PROMOTE: [ROLES.ADMIN, ROLES.HR_PAYROLL],
  PAYROLL_EXPORT: [ROLES.ADMIN, ROLES.HR_PAYROLL, ROLES.DEPT_HEAD],

  // NHÂN SỰ (HR)
  EMPLOYEE_CREATE: [ROLES.ADMIN, ROLES.HR_HUMAN],
  EMPLOYEE_EDIT: [ROLES.ADMIN, ROLES.HR_HUMAN],
  EMPLOYEE_DELETE: [ROLES.ADMIN], // Chỉ Admin mới được xóa hồ sơ gốc
  EMPLOYEE_VIEW_ALL: [ROLES.ADMIN, ROLES.HR_HUMAN, ROLES.HR_PAYROLL, ROLES.DEPT_HEAD],

  // LỊCH LÀM VIỆC (Schedule)
  SCHEDULE_MANAGE: [ROLES.ADMIN, ROLES.HR_HUMAN],

  // CHẤM CÔNG (Attendance)
  ATTENDANCE_MANAGE: [ROLES.ADMIN, ROLES.HR_HUMAN, ROLES.HR_PAYROLL],

  // HỆ THỐNG (System)
  SYSTEM_CONFIG: [ROLES.ADMIN],
  AUDIT_VIEW: [ROLES.ADMIN],
};

// ─── Hàm kiểm tra quyền ───────────────────────────────────────────────────────

/**
 * Kiểm tra user có quyền truy cập vào một resource không.
 * @param {string} userRole  - Role của user hiện tại (e.g. 'db_Admin')
 * @param {string[]|null} allowedRoles - Danh sách roles được phép. null = tất cả.
 * @returns {boolean}
 */
export const hasRole = (userRole, allowedRoles) => {
  if (!allowedRoles) return true;       // null → công khai cho tất cả
  if (!userRole) return false;           // Chưa đăng nhập
  return allowedRoles.includes(userRole);
};

/**
 * Kiểm tra user có quyền truy cập Menu item không.
 * @param {string} userRole
 * @param {string} path - Key của menu item (e.g. '/employees')
 * @returns {boolean}
 */
export const canAccessMenu = (userRole, path) => {
  return hasRole(userRole, MENU_PERMISSIONS[path] ?? null);
};

/**
 * Kiểm tra user có thấy Tab trong EmployeeDetail không.
 * @param {string} userRole
 * @param {string} tabKey - Key của tab (e.g. 'salary')
 * @returns {boolean}
 */
export const canAccessTab = (userRole, tabKey) => {
  return hasRole(userRole, TAB_PERMISSIONS[tabKey] ?? null);
};

/**
 * Kiểm tra user có quyền thực hiện một hành động cụ thể không.
 * @param {string} userRole
 * @param {string} actionKey - Key của hành động trong ACTION_PERMISSIONS
 * @returns {boolean}
 */
export const canPerform = (userRole, actionKey) => {
  return hasRole(userRole, ACTION_PERMISSIONS[actionKey] ?? null);
};
