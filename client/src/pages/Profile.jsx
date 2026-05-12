import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User, Shield, Hash, Building2,
  Mail, Phone, CheckCircle2, Lock,
  GraduationCap, History, Award, Wallet, FileText, ShieldPlus
} from 'lucide-react';
import { Skeleton, message, Tabs, Tag } from 'antd';
import { canAccessTab, ROLE_LABELS } from '../utils/rbac';

// SERVICES
import employeeService from '../services/Employee/employeeService';
import degreeService from '../services/Employee/degreeService';
import disciplineService from '../services/Employee/disciplineService';
import workHistoryService from '../services/Employee/workHistoryService';

// TABS
import TabPersonalInfo from '../components/Employee/EmployeeTabs/TabPersonalInfo';
import TabDegrees from '../components/Employee/EmployeeTabs/TabDegrees';
import TabWorkHistory from '../components/Employee/EmployeeTabs/TabWorkHistory';
import TabSalary from '../components/Employee/EmployeeTabs/TabSalary';
import TabDiscipline from '../components/Employee/EmployeeTabs/TabDiscipline';
import TabInsurance from '../components/Employee/EmployeeTabs/TabInsurance';
import TabContract from '../components/Employee/EmployeeTabs/TabContract';
import TabFixedAllowance from '../components/Employee/EmployeeTabs/TabFixedAllowance';

const Profile = () => {
  const { user, sessionVersion } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const [data, setData] = useState({
    employee: null,
    degrees: [],
    disciplines: [],
    workHistories: []
  });
  const [loading, setLoading] = useState(true);

  const fetchMyData = useCallback(async () => {
    if (!user?.MaNV) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [empRes, degRes, disRes, workRes] = await Promise.allSettled([
        employeeService.getById(user.MaNV),
        degreeService.getByEmployeeId(user.MaNV),
        disciplineService.getByEmployeeId(user.MaNV),
        workHistoryService.getByEmployeeId(user.MaNV)
      ]);

      setData({
        employee: empRes.status === 'fulfilled' ? empRes.value.data : null,
        degrees: degRes.status === 'fulfilled' ? (Array.isArray(degRes.value) ? degRes.value : degRes.value.data) : [],
        disciplines: disRes.status === 'fulfilled' ? (Array.isArray(disRes.value) ? disRes.value : disRes.value.data) : [],
        workHistories: workRes.status === 'fulfilled' ? (Array.isArray(workRes.value) ? workRes.value : workRes.value.data) : []
      });
    } catch (err) {
      message.error("Không thể tải thông tin cá nhân");
    } finally {
      setLoading(false);
    }
  }, [user?.MaNV]);

  useEffect(() => {
    fetchMyData();
  }, [fetchMyData, sessionVersion]);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <Skeleton active avatar paragraph={{ rows: 4 }} />
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  if (!user?.MaNV || !data.employee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <User className="text-gray-400" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Hồ sơ chưa được liên kết</h2>
        <p className="text-gray-500 max-w-md">Tài khoản này chưa được liên kết với hồ sơ nhân viên. Vui lòng liên hệ quản trị viên.</p>
      </div>
    );
  }

  const { employee } = data;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12">
      <div className="max-w-7xl mx-auto p-6 md:p-8">

        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-20 -mt-20 opacity-50 blur-3xl"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className={`w-32 h-32 rounded-3xl flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-blue-200 bg-gradient-to-tr ${employee.GioiTinh === true ? 'from-blue-600 to-indigo-500' : 'from-pink-500 to-rose-400'}`}>
                {employee.HoTen?.charAt(0)}
              </div>
              <div className="absolute -bottom-2 -right-2 p-1.5 bg-white rounded-xl shadow-lg border border-gray-100">
                <CheckCircle2 size={20} className="text-emerald-500" />
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">{employee.HoTen}</h1>
                <Tag color="blue" className="w-fit mx-auto md:mx-0 font-bold px-3 py-0.5 rounded-lg border-none uppercase tracking-widest text-[10px]">
                  #{employee.MaNV}
                </Tag>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-medium text-gray-500">
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-blue-500" />
                  <span>{employee.TenDonVi}</span>
                </div>
                <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                  <Shield size={16} className="text-indigo-500" />
                  <span>{ROLE_LABELS[user.role]}</span>
                </div>
                <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                  <Mail size={16} className="text-gray-400" />
                  <span>{employee.Email || 'Chưa cập nhật'}</span>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-3">
                <div className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chức vụ</span>
                  <span className="text-sm font-bold text-gray-800">{employee.ChucVuHienTai || '---'}</span>
                </div>
                <div className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hệ số</span>
                  <span className="text-sm font-bold text-blue-600">{employee.HeSoLuong || '---'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Menu Sidebar (Desktop) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 sticky top-8">
              <nav className="space-y-1">
                {[
                  { id: 'info', label: 'Thông tin chung', icon: User },
                  { id: 'degrees', label: 'Bằng cấp & Chứng chỉ', icon: GraduationCap, perm: 'degrees' },
                  { id: 'work-history', label: 'Quá trình công tác', icon: History, perm: 'work-history' },
                  { id: 'salary', label: 'Lương & Bậc', icon: Wallet, perm: 'salary' },
                  { id: 'contract', label: 'Hợp đồng lao động', icon: FileText, perm: 'contract' },
                  { id: 'allowance', label: 'Phụ cấp cố định', icon: Wallet, perm: 'allowance' },
                  { id: 'discipline', label: 'Khen thưởng / Kỷ luật', icon: Award, perm: 'discipline' },
                  { id: 'insurance', label: 'Bảo hiểm & Y tế', icon: ShieldPlus, perm: 'insurance' },
                ].filter(item => !item.perm || canAccessTab(user.role, item.perm)).map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === item.id
                        ? 'bg-blue-50 text-blue-600 shadow-sm'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                      }`}
                  >
                    <item.icon size={18} className={activeTab === item.id ? 'text-blue-600' : 'text-gray-400'} />
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="mt-4 pt-4 border-t border-gray-50 p-2">
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100/50">
                  <div className="flex items-center gap-2 text-amber-700 mb-2">
                    <Lock size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Bảo mật</span>
                  </div>
                  <p className="text-[11px] text-amber-600 leading-relaxed font-medium">
                    Bạn chỉ có quyền xem thông tin của chính mình. Mọi thay đổi dữ liệu cần được phê duyệt bởi phòng nhân sự.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Display Area */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 min-h-[500px] overflow-hidden">
              <div className="p-8">
                {activeTab === 'info' && <TabPersonalInfo employee={employee} />}

                {activeTab === 'degrees' && (
                  <TabDegrees degrees={data.degrees} canEdit={false} />
                )}

                {activeTab === 'work-history' && (
                  <TabWorkHistory workHistories={data.workHistories} />
                )}

                {activeTab === 'salary' && <TabSalary employeeId={user.MaNV} />}

                {activeTab === 'contract' && <TabContract employeeId={user.MaNV} />}

                {activeTab === 'allowance' && <TabFixedAllowance employeeId={user.MaNV} />}

                {activeTab === 'discipline' && (
                  <TabDiscipline disciplines={data.disciplines} canEdit={false} />
                )}

                {activeTab === 'insurance' && <TabInsurance employeeId={user.MaNV} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
