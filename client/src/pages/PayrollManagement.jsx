import React, { useState, useEffect, useMemo } from 'react';
import {
  Calculator, DollarSign, Users, CheckCircle2,
  Lock, Eye, FileSpreadsheet, Filter,
  AlertCircle, RefreshCw, FileEdit, TrendingUp
} from 'lucide-react';
import {
  Table, Tag, Button, message,
  Space, Tooltip, Empty, Card, Progress
} from 'antd';
import dayjs from 'dayjs';
import { useAuth } from '../context/AuthContext';
import salaryService from '../services/Payroll/salaryService';
import UnitSelect from '../components/common/UnitSelect';
import * as XLSX from 'xlsx';

import CustomButton from '../components/shared/CustomButton';
import CustomSelect from '../components/shared/CustomSelect';
import AddMonthlySalaryModal from '../components/Payroll/AddMonthlySalaryModal';
import EditPayrollModal from '../components/Payroll/EditPayrollModal';
import PayslipModal from '../components/Payroll/PayslipModal';
import PromoteSalaryModal from '../components/Payroll/PromoteSalaryModal';
import { Modal } from 'antd';
import { Edit, Trash2 } from 'lucide-react';

// ==========================================
// SUB-COMPONENT: STATS CARDS
// ==========================================
const PayrollStats = ({ stats, loading }) => {
  const cardItems = [
    {
      title: 'Tổng Quỹ Lương',
      value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalBudget),
      icon: <DollarSign className="text-emerald-600" size={24} />,
      color: 'bg-emerald-50',
      desc: 'Dựa trên thực lĩnh tháng'
    },
    {
      title: 'Tổng Nhân Sự',
      value: `${stats.totalStaff} Thành viên`,
      icon: <Users className="text-blue-600" size={24} />,
      color: 'bg-blue-50',
      desc: 'Được tính trong kỳ lương'
    },
    {
      title: 'Tiến Độ Chốt Sổ',
      value: `${stats.completedPercent}%`,
      icon: <CheckCircle2 className="text-indigo-600" size={24} />,
      color: 'bg-indigo-50',
      progress: stats.completedPercent,
      desc: `${stats.chotCount}/${stats.totalStaff} nhân viên`
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cardItems.map((item, i) => (
        <Card key={i} loading={loading} className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{item.title}</p>
              <h2 className="text-2xl font-black text-gray-900">{item.value}</h2>
              <p className="text-[10px] text-gray-500 mt-2 font-medium italic">{item.desc}</p>
            </div>
            <div className={`p-3 rounded-xl ${item.color}`}>
              {item.icon}
            </div>
          </div>
          {item.progress !== undefined && (
            <Progress percent={item.progress} showInfo={false} size="small" className="mt-4" strokeColor="#4f46e5" />
          )}
        </Card>
      ))}
    </div>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================
const PayrollManagement = () => {
  const { user, sessionVersion } = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [thangNamStr, setThangNamStr] = useState(dayjs().format('MM/YYYY'));
  const [maDonVi, setMaDonVi] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [targetEmployeeId, setTargetEmployeeId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState(null);

  // Tạo danh sách 12 tháng gần nhất cho Select
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = dayjs().subtract(i, 'month');
    return { value: d.format('MM/YYYY'), label: `Tháng ${d.format('MM/YYYY')}` };
  });

  const canManage = ['db_Admin', 'db_HR_Payroll'].includes(user?.role);

  const fetchPayroll = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await salaryService.getPayroll(thangNamStr, maDonVi);
      setData(res?.data || []);
    } catch (error) {
      message.error("Lỗi đồng bộ dữ liệu kỳ lương");
    } finally {
      setLoading(false);
    }
  }, [thangNamStr, maDonVi]);

  const handleGeneratePayroll = async () => {
    try {
      setLoading(true);
      const res = await salaryService.generatePayroll(thangNamStr);
      message.success(res?.message || `Đã khởi tạo bảng lương tháng ${thangNamStr}`);
      fetchPayroll();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Lỗi khi khởi tạo dự toán';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayroll = (record) => {
    Modal.confirm({
      title: 'Xác nhận xóa phiếu lương',
      content: `Bạn có chắc chắn muốn xóa phiếu lương của nhân viên [${record.HoTen}] trong kỳ ${thangNamStr}? Hành động này không thể hoàn tác.`,
      okText: 'Xóa ngay',
      okType: 'danger',
      cancelText: 'Hủy bỏ',
      onOk: async () => {
        try {
          await salaryService.deletePayroll(record.ID_BangLuong);
          message.success("Đã xóa phiếu lương thành công");
          fetchPayroll();
        } catch (error) {
          message.error(error.response?.data?.message || "Lỗi khi xóa phiếu lương");
        }
      }
    });
  };

  useEffect(() => {
    setData([]); // Xóa sạch dữ liệu khi phiên làm việc bị thay đổi (đăng xuất)
  }, [sessionVersion]);

  useEffect(() => { fetchPayroll(); }, [fetchPayroll]);

  // --- XUẤT EXCEL ---
  const handleExportExcel = () => {
    if (!data || data.length === 0) {
      return message.warning("Không có dữ liệu để xuất Excel");
    }

    // 1. Chuẩn bị dữ liệu (Map lại các cột cho dễ đọc)
    const exportData = data.map((item, index) => ({
      'STT': index + 1,
      'Mã NV': item.MaNV,
      'Họ Tên': item.HoTen,
      'Đơn Vị': item.TenDonVi,
      'Hệ Số Lương': item.HeSoLuong,
      'Lương Cơ Sở': item.LuongCoSo,
      'Phụ Cấp': item.PhuCap,
      'Khấu Trừ (BH)': item.TienKhauTruBH,
      'Thực Lĩnh': item.ThucLanh === '***' ? 'Bảo mật (RLS)' : item.ThucLanh,
      'Trạng Thái': item.NgayChot ? (item.DaThanhToan ? 'Đã thanh toán' : 'Đã chốt sổ') : 'Dự toán'
    }));

    // 2. Tạo WorkBook và WorkSheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bảng Lương");

    // 3. Tự động chỉnh độ rộng cột (Auto-fit width)
    const colWidths = [
      { wch: 5 },  { wch: 10 }, { wch: 25 }, { wch: 20 },
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
      { wch: 20 }, { wch: 15 }
    ];
    worksheet['!cols'] = colWidths;

    // 4. Xuất file
    const fileName = `BangLuong_${thangNamStr.replace('/', '_')}_${maDonVi !== 'All' ? maDonVi : 'ToanCongTy'}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    message.success("Xuất báo cáo Excel thành công!");
  };

  // --- TÍNH TOÁN STATS (OPTIMIZED) ---
  const stats = useMemo(() => {
    const totalStaff = data.length;
    const chotCount = data.filter(d => d.NgayChot).length;
    const totalBudget = data.reduce((sum, item) => sum + (Number(item.ThucLanh) || 0), 0);
    const completedPercent = totalStaff > 0 ? Math.round((chotCount / totalStaff) * 100) : 0;

    return { totalStaff, chotCount, totalBudget, completedPercent };
  }, [data]);

  // --- RENDERER: BẢO MẬT RLS ---
  const renderSecureAmount = (val) => {
    if (val === '***') {
      return (
        <Tooltip title="Dữ liệu bảo mật bởi chính sách RLS">
          <div className="flex items-center justify-end text-gray-300 gap-1 animate-pulse cursor-help">
            <Lock size={12} />
            <span className="text-[11px] font-bold uppercase">Bảo mật</span>
          </div>
        </Tooltip>
      );
    }
    return <span className="font-black text-blue-700">{new Intl.NumberFormat('vi-VN').format(val)} đ</span>;
  };

  const columns = [
    {
      title: 'NHÂN SỰ',
      key: 'name',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-400 border border-gray-200">
            {record.HoTen?.charAt(0)}
          </div>
          <div>
            <div className="text-sm font-bold text-gray-800">{record.HoTen}</div>
            <div className="text-[10px] text-gray-400 font-mono tracking-tighter">#{record.MaNV}</div>
          </div>
        </div>
      )
    },
    { title: 'ĐƠN VỊ', dataIndex: 'TenDonVi', key: 'dept', render: (t) => <span className="text-xs font-medium text-gray-600">{t}</span> },
    {
      title: 'HỆ SỐ',
      dataIndex: 'HeSoLuong',
      align: 'center',
      render: (v) => <Tag color="blue" className="rounded-md border-none font-bold px-3">{v}</Tag>
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'NgayChot',
      render: (val, record) => {
        // Nếu chưa có ngày chốt -> Luôn là Dự toán
        if (!val) {
          return <Tag color="warning" icon={<AlertCircle size={10} />} className="rounded-full border-none px-3 py-0.5 text-[10px] font-bold uppercase">DỰ TOÁN</Tag>;
        }
        
        // Nếu đã có ngày chốt, kiểm tra trạng thái thanh toán
        // Sử dụng !! hoặc so sánh trực tiếp để handle cả true/false và 1/0
        if (record.DaThanhToan === true || record.DaThanhToan === 1) {
          return <Tag color="success" icon={<CheckCircle2 size={10} />} className="rounded-full border-none px-3 py-0.5 text-[10px] font-bold uppercase">ĐÃ THANH TOÁN</Tag>;
        }
        
        // Mặc định nếu đã chốt nhưng chưa thanh toán
        return <Tag color="processing" icon={<RefreshCw size={10} />} className="rounded-full border-none px-3 py-0.5 text-[10px] font-bold uppercase">ĐÃ CHỐT SỔ</Tag>;
      }
    },
    {
      title: 'THỰC LĨNH',
      dataIndex: 'ThucLanh',
      align: 'right',
      render: (val) => renderSecureAmount(val)
    },
    {
      title: '',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          {canManage && (
            <Tooltip title="Nâng bậc / Điều chỉnh lương">
              <CustomButton 
                variant="outline" 
                icon={TrendingUp} 
                className="text-gray-400 hover:text-emerald-600 border-none bg-transparent shadow-none" 
                onClick={() => {
                  setTargetEmployeeId(record.MaNV);
                  setIsPromoteModalOpen(true);
                }}
              />
            </Tooltip>
          )}
          <Tooltip title="Xem chi tiết phiếu lương">
            <CustomButton 
              variant="outline" 
              icon={Eye} 
              className="text-gray-400 hover:text-blue-600 border-none bg-transparent shadow-none" 
              onClick={() => {
                setSelectedPayslip({ ...record, ThangNam: thangNamStr });
                setIsPayslipModalOpen(true);
              }}
            />
          </Tooltip>
          {canManage && (
            <>
              <Tooltip title="Chỉnh sửa (Phụ cấp/Khấu trừ)">
                <CustomButton 
                  variant="outline" 
                  icon={Edit} 
                  className="text-gray-400 hover:text-orange-600 border-none bg-transparent shadow-none" 
                  onClick={() => {
                    setEditingPayroll(record);
                    setIsEditModalOpen(true);
                  }}
                />
              </Tooltip>
              <Tooltip title="Xóa bản ghi lương">
                <CustomButton 
                  variant="outline" 
                  icon={Trash2} 
                  className="text-gray-400 hover:text-red-600 border-none bg-transparent shadow-none" 
                  onClick={() => handleDeletePayroll(record)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="p-8 min-h-screen bg-gray-50/30">

      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
              <Calculator className="text-white" size={24} />
            </div>
            Quản Lý Tiền Lương
          </h1>
          <p className="text-gray-500 text-sm mt-2 flex items-center gap-2">
            <Lock size={14} className="text-emerald-500" /> Hệ thống bảo mật dữ liệu tầng Database (RLS)
          </p>
        </div>

        <Space size="middle" className="flex-wrap">
          <CustomButton variant="outline" icon={FileSpreadsheet} onClick={handleExportExcel}>
            Xuất Excel
          </CustomButton>
          {canManage && (
            <>
              <CustomButton
                variant="outline"
                icon={FileEdit}
                onClick={() => setIsModalOpen(true)}
                className="h-12 px-6 border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Chốt Cá Nhân
              </CustomButton>
              <CustomButton
                variant="primary"
                icon={Calculator}
                onClick={handleGeneratePayroll}
                isLoading={loading}
                className="h-12 px-8 shadow-xl shadow-blue-100"
              >
                Tính Bảng Lương
              </CustomButton>
            </>
          )}
        </Space>
      </div>

      {/* STATS AREA */}
      <PayrollStats stats={stats} loading={loading} />

      {/* TOOLBAR */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-6 items-center">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Kỳ lương</label>
          <CustomSelect
            options={monthOptions}
            value={thangNamStr}
            onChange={setThangNamStr}
            className="w-44"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Đơn vị công tác</label>
          <UnitSelect isFilter={true} value={maDonVi} onChange={(e) => setMaDonVi(e.target.value)} className="h-11" />
        </div>

        <div className="flex items-end h-full pt-5">
          <Button type="text" icon={<Filter size={18} />} className="text-gray-400 font-bold hover:text-blue-600">Lọc nâng cao</Button>
        </div>

        <div className="ml-auto pt-5">
          <Button type="text" icon={<RefreshCw size={16} className={loading ? 'animate-spin' : ''} />} onClick={fetchPayroll} />
        </div>
      </div>

      {/* TABLE AREA */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-2">
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="MaNV"
          pagination={{ pageSize: 12, showSizeChanger: false, placement: 'bottomCenter' }}
          locale={{
            emptyText: (
              <div className="py-20">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div className="space-y-4">
                      <p className="text-gray-400 font-medium">Kỳ lương tháng {thangNamStr} chưa được khởi tạo hoặc chưa có dữ liệu.</p>
                      {canManage && (
                        <CustomButton onClick={handleGeneratePayroll} isLoading={loading} variant="outline" className="border-blue-600 text-blue-600">
                          Khởi tạo và tính lương ngay
                        </CustomButton>
                      )}
                    </div>
                  }
                />
              </div>
            )
          }}
          className="custom-saas-table"
        />
      </div>

      <AddMonthlySalaryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={fetchPayroll}
      />

      <PayslipModal
        open={isPayslipModalOpen}
        onClose={() => setIsPayslipModalOpen(false)}
        payslip={selectedPayslip}
      />

      <PromoteSalaryModal
        isOpen={isPromoteModalOpen}
        onClose={() => setIsPromoteModalOpen(false)}
        employeeId={targetEmployeeId}
        onRefresh={fetchPayroll}
      />

      <EditPayrollModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPayroll(null);
        }}
        onRefresh={fetchPayroll}
        payrollData={editingPayroll}
      />
    </div>
  );
};

export default PayrollManagement;