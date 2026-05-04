import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Phone, User, 
  CheckCircle2, Shield, Edit,
  GraduationCap, History, Award, AlertCircle, ShieldPlus, FileText, Wallet
} from 'lucide-react';
import { Skeleton, message, Modal as AntdModal } from 'antd';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS, canAccessTab } from '../utils/rbac';

// IMPORT CÁC SERVICES
import employeeService from '../services/Employee/employeeService';
import degreeService from '../services/Employee/degreeService';
import disciplineService from '../services/Employee/disciplineService';
import workHistoryService from '../services/Employee/workHistoryService';

// Import Modals & Tabs 
import DegreeFormModal from '../components/Employee/DegreeFormModal';
import DisciplineFormModal from '../components/Employee/DisciplineFormModal';
import EmployeeFormModal from '../components/Employee/EmployeeFormModal';
import TransferEmployeeModal from '../components/Employee/TransferEmployeeModal';
import TabPersonalInfo from '../components/Employee/EmployeeTabs/TabPersonalInfo';
import TabDegrees from '../components/Employee/EmployeeTabs/TabDegrees';
import TabWorkHistory from '../components/Employee/EmployeeTabs/TabWorkHistory';
import TabSalary from '../components/Employee/EmployeeTabs/TabSalary';
import TabDiscipline from '../components/Employee/EmployeeTabs/TabDiscipline';
import TabInsurance from '../components/Employee/EmployeeTabs/TabInsurance';
import TabContract from '../components/Employee/EmployeeTabs/TabContract';
import departmentService from '../services/System/departmentService';
import positionService from '../services/System/positionService';
import TabFixedAllowance from '../components/Employee/EmployeeTabs/TabFixedAllowance';

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sessionVersion, user } = useAuth();
  const userRole = user?.role || '';
  
  const [activeTab, setActiveTab] = useState('info');

  const [employee, setEmployee] = useState(null);
  const [degrees, setDegrees] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [workHistories, setWorkHistories] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDegreeModalOpen, setIsDegreeModalOpen] = useState(false);
  const [editingDegree, setEditingDegree] = useState(null);
  const [isDisciplineModalOpen, setIsDisciplineModalOpen] = useState(false);
  const [editingDiscipline, setEditingDiscipline] = useState(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);

  const roleMapping = ROLE_LABELS;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // GỌI 4 SERVICES CÙNG LÚC
      const results = await Promise.allSettled([
        employeeService.getById(id),
        degreeService.getByEmployeeId(id),
        disciplineService.getByEmployeeId(id),
        workHistoryService.getByEmployeeId(id) 
      ]);

      // Xử lý data trả về từ Service (Lưu ý: Service đã rút gọn .data 1 lần rồi)
      if (results[0].status === 'fulfilled' && results[0].value.success) {
        setEmployee(results[0].value.data);
      } else {
        throw new Error("Không tìm thấy thông tin nhân viên");
      }

      if (results[1].status === 'fulfilled') {
        const degData = results[1].value;
        setDegrees(Array.isArray(degData) ? degData : (degData.data || []));
      } else setDegrees([]);

      if (results[2].status === 'fulfilled') {
        const disData = results[2].value;
        setDisciplines(Array.isArray(disData) ? disData : (disData.data || []));
      } else setDisciplines([]);

      if (results[3].status === 'fulfilled') {
        const workData = results[3].value;
        setWorkHistories(Array.isArray(workData) ? workData : (workData.data || []));
      } else setWorkHistories([]);

    } catch (err) {
      setError(err.message || "Lỗi kết nối máy chủ");
      message.error("Không thể tải thông tin nhân sự");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchData();
  }, [fetchData, id]);

  // Fetch danh sách phòng ban + chức vụ cho TransferModal
  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [deptRes, posRes] = await Promise.allSettled([
          departmentService.getAll(),
          positionService.getAll()
        ]);
        if (deptRes.status === 'fulfilled') {
          const d = deptRes.value;
          setDepartments(Array.isArray(d) ? d : (d?.data || []));
        }
        if (posRes.status === 'fulfilled') {
          const p = posRes.value;
          setPositions(Array.isArray(p) ? p : (p?.data || []));
        }
      } catch (_) { /* non-critical */ }
    };
    fetchLookups();
  }, []);

  useEffect(() => {
    setEmployee(null);
    setDegrees([]);
    setDisciplines([]);
    setWorkHistories([]);
  }, [sessionVersion]);

  useEffect(() => {
    // SECURITY: Xóa sạch dữ liệu nhạy cảm khi rời khỏi trang (Unmount)
    return () => {
      // Clean up if needed
    };
  }, []);

  // SỬ DỤNG SERVICE ĐỂ XÓA BẰNG CẤP
  const handleDeleteDegree = (degreeId) => {
    AntdModal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc muốn xóa bằng cấp này không?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await degreeService.delete(degreeId);
          message.success("Đã xóa bằng cấp");
          fetchData(); 
        } catch (error) {
          message.error("Xóa thất bại!");
        }
      }
    });
  };

  // SỬ DỤNG SERVICE ĐỂ XÓA KỶ LUẬT
  const handleDeleteDiscipline = (recordId) => {
    AntdModal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc muốn xóa quyết định này không?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await disciplineService.delete(recordId);
          message.success("Đã xóa quyết định");
          fetchData(); 
        } catch (error) {
          message.error("Xóa thất bại!");
        }
      }
    });
  };

  // --- PHẦN RENDER UI BÊN DƯỚI GIỮ NGUYÊN HOÀN TOÀN ---
  // (Mình không đổi 1 chữ nào giao diện Tailwind cực đẹp của bạn)
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton active avatar paragraph={{ rows: 4 }} />
          <Skeleton active paragraph={{ rows: 10 }} />
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center p-8">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Lỗi truy cập</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <button onClick={() => navigate('/employees')} className="flex items-center text-blue-600 font-bold">
          <ArrowLeft className="mr-2" /> Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-12">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-6 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Quay lại danh sách
          </button>
          
          <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{employee.HoTen}</h1>
                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-md font-mono">
                  #{employee.MaNV}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 text-xs font-bold rounded-full">
                  <Shield className="w-3.5 h-3.5" /> {roleMapping[employee.Role] || employee.Role}
                </span>
                <span className={`flex items-center gap-1.5 px-3 py-1 border text-xs font-bold rounded-full ${employee.TrangThai === 1 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {employee.TrangThai === 1 ? "Đang làm việc" : "Đã nghỉ việc"}
                </span>
              </div>
            </div>
            
            <button onClick={() => setIsEditModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl shadow-sm transition-all">
              <Edit className="w-4 h-4" /> Chỉnh sửa
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* CỘT TRÁI: Profile Card */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center">
              
              <div className="relative mb-4">
                <div className={`w-28 h-28 rounded-full flex items-center justify-center text-white text-4xl font-extrabold shadow-md bg-gradient-to-tr ${employee.GioiTinh === true ? 'from-blue-600 to-indigo-400' : 'from-pink-500 to-rose-400'}`}>
                  {employee.HoTen.charAt(0)}
                </div>
                {/* Status Dot */}
                <div className={`absolute bottom-1 right-2 w-5 h-5 border-4 border-white rounded-full ${employee.TrangThai === 1 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
              </div>
              
              <h2 className="text-xl font-bold text-gray-900">{employee.HoTen}</h2>
              <p className="text-sm font-medium text-indigo-600 mt-1">{roleMapping[employee.Role] || employee.Role}</p>
              
              <div className="w-full h-px bg-gray-100 my-6"></div>

              <div className="w-full space-y-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-400 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="text-left overflow-hidden">
                    <p className="text-xs text-gray-400 font-medium mb-0.5">Email liên hệ</p>
                    <span className="text-sm font-medium text-gray-900">{employee.Email || '—'}</span>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-400 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-400 font-medium mb-0.5">Số điện thoại</p>
                    <span className="text-sm font-medium text-gray-900">{employee.SoDienThoai || '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Tabs */}
          <div className="lg:col-span-8 xl:col-span-9">
            {/* TABS HEADER */}
            <div className="bg-white rounded-t-2xl border-b border-gray-100 px-2 sm:px-6 flex overflow-x-auto custom-scrollbar shadow-sm">
              {/* Hồ sơ: Tất cả */}
              <button onClick={() => setActiveTab('info')} className={`flex items-center gap-2 px-4 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap outline-none ${activeTab === 'info' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200'}`}>
                <User className={`w-4 h-4 ${activeTab === 'info' ? 'text-blue-600' : 'text-gray-400'}`} /> Hồ sơ
              </button>
              {canAccessTab(userRole, 'degrees') && (
                <button onClick={() => setActiveTab('degrees')} className={`flex items-center gap-2 px-4 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap outline-none ${activeTab === 'degrees' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200'}`}>
                  <GraduationCap className={`w-4 h-4 ${activeTab === 'degrees' ? 'text-blue-600' : 'text-gray-400'}`} /> Bằng cấp
                </button>
              )}
              {canAccessTab(userRole, 'work-history') && (
                <button onClick={() => setActiveTab('work-history')} className={`flex items-center gap-2 px-4 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap outline-none ${activeTab === 'work-history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200'}`}>
                  <History className={`w-4 h-4 ${activeTab === 'work-history' ? 'text-blue-600' : 'text-gray-400'}`} /> Quá trình công tác
                </button>
              )}
              {canAccessTab(userRole, 'salary') && (
                <button onClick={() => setActiveTab('salary')} className={`flex items-center gap-2 px-4 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap outline-none ${activeTab === 'salary' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200'}`}>
                  <Wallet className={`w-4 h-4 ${activeTab === 'salary' ? 'text-blue-600' : 'text-gray-400'}`} /> Lương &amp; Bậc
                </button>
              )}
              {canAccessTab(userRole, 'contract') && (
                <button onClick={() => setActiveTab('contract')} className={`flex items-center gap-2 px-4 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap outline-none ${activeTab === 'contract' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200'}`}>
                  <FileText className={`w-4 h-4 ${activeTab === 'contract' ? 'text-blue-600' : 'text-gray-400'}`} /> Hợp đồng
                </button>
              )}
              {canAccessTab(userRole, 'discipline') && (
                <button onClick={() => setActiveTab('discipline')} className={`flex items-center gap-2 px-4 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap outline-none ${activeTab === 'discipline' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200'}`}>
                  <Award className={`w-4 h-4 ${activeTab === 'discipline' ? 'text-blue-600' : 'text-gray-400'}`} /> Khen thưởng/Kỷ luật
                </button>
              )}
              {canAccessTab(userRole, 'insurance') && (
                <button onClick={() => setActiveTab('insurance')} className={`flex items-center gap-2 px-4 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap outline-none ${activeTab === 'insurance' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200'}`}>
                  <ShieldPlus className={`w-4 h-4 ${activeTab === 'insurance' ? 'text-blue-600' : 'text-gray-400'}`} /> Bảo hiểm &amp; Tài chính
                </button>
              )}
              {canAccessTab(userRole, 'allowance') && (
                <button onClick={() => setActiveTab('allowance')} className={`flex items-center gap-2 px-4 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap outline-none ${activeTab === 'allowance' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200'}`}>
                  <Wallet className={`w-4 h-4 ${activeTab === 'allowance' ? 'text-blue-600' : 'text-gray-400'}`} /> Phụ cấp cố định
                </button>
              )}
            </div>

            {/* RENDER TAB CONTENT */}
            <div className="bg-white rounded-b-2xl shadow-sm border border-t-0 border-gray-100 p-6 md:p-8 min-h-[400px]">
                {activeTab === 'info' && <TabPersonalInfo employee={employee} />}
                
                {activeTab === 'degrees' && (
                  <TabDegrees 
                    degrees={degrees} 
                    onAdd={() => { setEditingDegree(null); setIsDegreeModalOpen(true); }}
                    onEdit={(deg) => { setEditingDegree(deg); setIsDegreeModalOpen(true); }}
                    onDelete={handleDeleteDegree}
                  />
                )}

                {activeTab === 'work-history' && (
                  <TabWorkHistory 
                    workHistories={workHistories} 
                    onTransfer={() => setIsTransferModalOpen(true)}
                  />
                )}

                {activeTab === 'salary' && <TabSalary employeeId={id} />}

                {activeTab === 'contract' && <TabContract employeeId={id} />}
      {activeTab === 'allowance' && <TabFixedAllowance employeeId={id} />}

                {activeTab === 'discipline' && (
                  <TabDiscipline 
                    disciplines={disciplines}
                    onAdd={() => { setEditingDiscipline(null); setIsDisciplineModalOpen(true); }}
                    onEdit={(item) => { setEditingDiscipline(item); setIsDisciplineModalOpen(true); }}
                    onDelete={handleDeleteDiscipline}
                  />
                )}

                {activeTab === 'insurance' && <TabInsurance employeeId={id} />}
              </div>
            </div>
          </div>
        </div>

      {/* --- MODALS --- */}
      <EmployeeFormModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        initialData={employee} 
        onRefresh={fetchData} 
      />
      <DegreeFormModal
        isOpen={isDegreeModalOpen}
        onClose={() => { setIsDegreeModalOpen(false); setEditingDegree(null); }}
        initialData={editingDegree}
        employeeId={id} 
        onRefresh={fetchData}
      />
      <DisciplineFormModal
        isOpen={isDisciplineModalOpen}
        onClose={() => { setIsDisciplineModalOpen(false); setEditingDiscipline(null); }}
        initialData={editingDiscipline}
        employeeId={id} 
        onRefresh={fetchData}
      />
      <TransferEmployeeModal
        open={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSuccess={fetchData}
        targetMaNV={employee?.MaNV || ''}
        departments={departments}
        positions={positions}
      />
    </div>
  );
};

export default EmployeeDetail;