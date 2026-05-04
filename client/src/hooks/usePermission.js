import { useAuth } from '../context/AuthContext';

/**
 * usePermission()
 * Hook RBAC tập trung — single source of truth cho phân quyền UI.
 *
 * Sử dụng:
 *   const { canEdit, isAdmin } = usePermission();
 *   {canEdit() && <Button>Edit</Button>}
 */
const usePermission = () => {
  const { user } = useAuth();
  const role = user?.role || '';

  /** Kiểm tra user có role nào đó không */
  const hasRole = (...roles) => roles.includes(role);

  /** Admin tối cao */
  const isAdmin = () => hasRole('db_Admin');

  /** Admin hoặc HR Human — thao tác nhân sự */
  const isHR = () => hasRole('db_Admin', 'db_HR_Human');

  /** Admin hoặc HR Payroll — thao tác lương */
  const isPayroll = () => hasRole('db_Admin', 'db_HR_Payroll');

  /** Trưởng phòng */
  const isDeptHead = () => hasRole('db_Admin', 'db_HR_Human', 'db_DeptHead');

  /**
   * Quyền chỉnh sửa thông tin nhân viên.
   * Admin + HR Human được phép.
   */
  const canEdit = () => hasRole('db_Admin', 'db_HR_Human');

  /**
   * Quyền xóa bản ghi (bằng cấp, kỷ luật, ...).
   * Chỉ Admin + HR Human.
   */
  const canDelete = () => hasRole('db_Admin', 'db_HR_Human');

  /**
   * Quyền thao tác bảng lương (tính lương, nâng bậc).
   */
  const canManagePayroll = () => hasRole('db_Admin', 'db_HR_Payroll');

  /**
   * Quyền xem thông tin tài chính/lương của nhân viên.
   */
  const canViewFinancial = () => hasRole('db_Admin', 'db_HR_Payroll', 'db_HR_Human');

  /**
   * Quyền điều động/bổ nhiệm nhân viên.
   */
  const canTransfer = () => hasRole('db_Admin', 'db_HR_Human');

  /**
   * Quyền quản trị tài khoản.
   */
  const canManageUsers = () => isAdmin();

  return {
    role,
    hasRole,
    isAdmin,
    isHR,
    isPayroll,
    isDeptHead,
    canEdit,
    canDelete,
    canManagePayroll,
    canViewFinancial,
    canTransfer,
    canManageUsers,
  };
};

export default usePermission;
