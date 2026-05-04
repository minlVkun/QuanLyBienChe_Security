import React, { useState, useEffect, useCallback } from 'react';
import { Table, Tag, DatePicker, Modal, Empty } from 'antd';
import { ShieldAlert, Eye, Loader2, AlertCircle } from 'lucide-react';
import dayjs from 'dayjs';
import auditService from '../services/System/auditService';

import CustomButton from '../components/shared/CustomButton';
import SearchBar from '../components/shared/SearchBar';
import CustomSelect from '../components/shared/CustomSelect';
import Pagination from '../components/shared/Pagination';

const { RangePicker } = DatePicker;

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [userFilter, setUserFilter] = useState('');
  const [dateRange, setDateRange] = useState(null);

  const actionOptions = [
    { value: 'All', label: 'Tất cả' },
    { value: 'INSERT', label: 'Thêm mới (INSERT)' },
    { value: 'UPDATE', label: 'Cập nhật (UPDATE)' },
    { value: 'DELETE', label: 'Xóa (DELETE)' }
  ];

  // Modal Detail
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        action: actionFilter,
        user: userFilter,
        startDate: dateRange ? dateRange[0].format('YYYY-MM-DD') : '',
        endDate: dateRange ? dateRange[1].format('YYYY-MM-DD') : ''
      };

      const res = await auditService.getLogs(params);

      if (res.success) {
        setLogs(res.data || []);
        setTotalItems(res.pagination?.total || 0);
      } else {
        setError(res.message || "Lỗi tải dữ liệu");
      }
    } catch (err) {
      setError("Không thể tải danh sách nhật ký. Bạn có thể không có quyền truy cập.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, actionFilter, userFilter, dateRange]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, actionFilter, userFilter, dateRange]);

  const handleViewDetail = async (auditID) => {
    setIsModalOpen(true);
    setDetailLoading(true);
    setSelectedLog(null);
    try {
      const res = await auditService.getLogDetail(auditID);
      if (res.success) {
        setSelectedLog(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const getActionBadge = (action) => {
    switch (action?.toUpperCase()) {
      case 'INSERT': return <Tag color="success" className="font-bold border-none px-3">THÊM MỚI</Tag>;
      case 'UPDATE': return <Tag color="processing" className="font-bold border-none px-3">CẬP NHẬT</Tag>;
      case 'DELETE': return <Tag color="error" className="font-bold border-none px-3">XÓA</Tag>;
      default: return <Tag color="default">{action}</Tag>;
    }
  };

  const columns = [
    {
      title: 'THỜI GIAN',
      dataIndex: 'ChangedDate',
      key: 'ChangedDate',
      render: (val) => (
        <span className="text-sm text-gray-600 font-medium">
          {dayjs(val).format('DD/MM/YYYY HH:mm:ss')}
        </span>
      )
    },
    {
      title: 'NGƯỜI THỰC HIỆN',
      dataIndex: 'ChangedBy',
      key: 'ChangedBy',
      render: (val) => <span className="font-bold text-gray-800">{val}</span>
    },
    {
      title: 'HÀNH ĐỘNG',
      dataIndex: 'Action',
      key: 'Action',
      render: (val) => getActionBadge(val)
    },
    {
      title: 'MODULE (BẢNG)',
      dataIndex: 'TableName',
      key: 'TableName',
      render: (val) => <Tag color="purple" className="border-none">{val}</Tag>
    },
    {
      title: 'ĐỐI TƯỢNG',
      dataIndex: 'RecordID',
      key: 'RecordID',
      render: (val) => <span className="text-gray-500 font-mono text-xs">{val || 'N/A'}</span>
    },
    {
      title: '',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <CustomButton
          variant="outline"
          icon={Eye}
          onClick={() => handleViewDetail(record.AuditID)}
          className="text-blue-500 hover:text-blue-700 bg-blue-50 border-none hover:bg-blue-100"
        >
          Xem
        </CustomButton>
      )
    }
  ];

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-50/50">

      {/* HEADER SECTION */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
            <div className="p-2.5 bg-red-100 rounded-xl">
              <ShieldAlert className="text-red-600" size={28} />
            </div>
            Nhật ký hệ thống (Audit Logs)
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Theo dõi toàn bộ các thay đổi dữ liệu nhạy cảm trên hệ thống.</p>
        </div>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-5 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">Tìm kiếm chung</label>
          <SearchBar
            placeholder="Mã đối tượng, Tên bảng..."
            onSearch={setSearchTerm}
            className="h-11"
          />
        </div>

        <div className="w-48">
          <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">Hành động</label>
          <CustomSelect
            options={actionOptions}
            value={actionFilter}
            onChange={setActionFilter}
            className="w-full h-11"
          />
        </div>

        <div className="w-48">
          <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">Người thực hiện</label>
          <SearchBar
            placeholder="Username..."
            onSearch={setUserFilter}
            className="h-11"
          />
        </div>

        <div className="min-w-[250px]">
          <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">Khoảng thời gian</label>
          <RangePicker
            onChange={setDateRange}
            className="w-full rounded-xl h-11"
            format="DD/MM/YYYY"
          />
        </div>
      </div>

      {/* ERROR OR TABLE */}
      {error && !loading ? (
        <div className="p-10 bg-red-50 rounded-2xl flex flex-col items-center justify-center text-red-500 border border-red-100">
          <AlertCircle size={40} className="mb-4" />
          <h3 className="font-bold text-lg mb-2">Lỗi truy xuất dữ liệu</h3>
          <p>{error}</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-2">
          <Table
            columns={columns}
            dataSource={logs}
            rowKey="AuditID"
            loading={{
              spinning: loading,
              indicator: <Loader2 className="animate-spin text-blue-600" size={40} />
            }}
            pagination={false}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={<span className="text-gray-400">Không tìm thấy nhật ký nào khớp với bộ lọc.</span>}
                />
              )
            }}
            className="custom-saas-table"
          />
          {/* Pagination Wrapper */}
          {totalItems > 0 && (
            <div className="mt-4 p-4 border border-gray-100 bg-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 shadow-sm">
              <span>
                {loading ? 'Đang kiểm tra...' : (
                  <>Đang hiển thị trang <b>{currentPage}</b> / {Math.ceil(totalItems / itemsPerPage) || 1} (Tổng <b>{totalItems}</b> kết quả)</>
                )}
              </span>
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(totalItems / itemsPerPage) || 1}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )
      }

      {/* DETAIL MODAL */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-lg font-bold">
            <Eye className="text-blue-500" />
            Chi tiết thay đổi
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={800}
        centered
        className="rounded-2xl overflow-hidden"
      >
        {detailLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-blue-500">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-medium">Đang tải dữ liệu chi tiết...</p>
          </div>
        ) : selectedLog ? (
          <div className="mt-4 space-y-6">
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Mã Log (ID)</p>
                <p className="font-mono font-medium text-gray-800">#{selectedLog.AuditID}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Thời gian</p>
                <p className="font-medium text-gray-800">{dayjs(selectedLog.ChangedDate).format('DD/MM/YYYY HH:mm:ss')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Người thực hiện</p>
                <p className="font-medium text-gray-800">{selectedLog.ChangedBy}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Loại hành động</p>
                {getActionBadge(selectedLog.Action)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* OLD DATA */}
              <div className="bg-red-50/50 rounded-xl p-4 border border-red-100">
                <h4 className="text-red-600 font-bold mb-3 flex items-center gap-2">Dữ liệu trước (Old Data)</h4>
                {selectedLog.OldData ? (
                  <pre className="text-xs font-mono bg-white p-3 rounded-lg border border-red-100 overflow-x-auto text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(selectedLog.OldData, null, 2)}
                  </pre>
                ) : (
                  <div className="text-center py-10 text-gray-400 font-medium italic bg-white rounded-lg border border-red-100">Không có dữ liệu cũ</div>
                )}
              </div>

              {/* NEW DATA */}
              <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
                <h4 className="text-emerald-600 font-bold mb-3 flex items-center gap-2">Dữ liệu sau (New Data)</h4>
                {selectedLog.NewData ? (
                  <pre className="text-xs font-mono bg-white p-3 rounded-lg border border-emerald-100 overflow-x-auto text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(selectedLog.NewData, null, 2)}
                  </pre>
                ) : (
                  <div className="text-center py-10 text-gray-400 font-medium italic bg-white rounded-lg border border-emerald-100">Không có dữ liệu mới</div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-red-500">
            <AlertCircle size={40} className="mb-4" />
            <p className="font-medium">Không tìm thấy chi tiết nhật ký này.</p>
          </div>
        )}
      </Modal>

      {/* INJECT STYLES FOR SELECT */}
      <style>{`
        .ant-select-selector {
          border-radius: 0.75rem !important;
        }
      `}</style>
    </div >
  );
};

export default AuditLog;
