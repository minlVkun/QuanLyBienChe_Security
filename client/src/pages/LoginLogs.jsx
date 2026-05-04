import React, { useState, useEffect, useCallback } from 'react';
import { Table, DatePicker, Empty } from 'antd';
import { LogIn, Loader2, AlertCircle, Monitor, HardDrive, Smartphone } from 'lucide-react';
import dayjs from 'dayjs';
import loginLogService from '../services/System/loginLogService';

import SearchBar from '../components/shared/SearchBar';
import Pagination from '../components/shared/Pagination';

const { RangePicker } = DatePicker;

const LoginLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Filters
  const [loginNameFilter, setLoginNameFilter] = useState('');
  const [hostNameFilter, setHostNameFilter] = useState('');
  const [dateRange, setDateRange] = useState(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        loginName: loginNameFilter,
        hostName: hostNameFilter,
        fromDate: dateRange ? dateRange[0].startOf('day').format('YYYY-MM-DD HH:mm:ss') : '',
        toDate: dateRange ? dateRange[1].endOf('day').format('YYYY-MM-DD HH:mm:ss') : ''
      };

      const res = await loginLogService.getLogs(params);

      if (res.success) {
        setLogs(res.logs || []);
        setTotalItems(res.totalRows || 0);
      } else {
        setError(res.message || "Lỗi tải dữ liệu");
      }
    } catch (err) {
      setError("Không thể tải danh sách log đăng nhập. Bạn có thể không có quyền truy cập.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, loginNameFilter, hostNameFilter, dateRange]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [loginNameFilter, hostNameFilter, dateRange]);

  const getAppIcon = (appName) => {
    const app = appName?.toLowerCase() || '';
    if (app.includes('chrome') || app.includes('browser') || app.includes('mozilla')) return <Monitor size={16} className="text-blue-500" />;
    if (app.includes('postman') || app.includes('insomnia')) return <HardDrive size={16} className="text-purple-500" />;
    if (app.includes('mobile') || app.includes('android') || app.includes('iphone')) return <Smartphone size={16} className="text-emerald-500" />;
    return <HardDrive size={16} className="text-gray-400" />;
  };

  const columns = [
    {
      title: 'TÊN ĐĂNG NHẬP',
      dataIndex: 'LoginName',
      key: 'LoginName',
      render: (val) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
            {val?.substring(0, 2).toUpperCase()}
          </div>
          <span className="font-bold text-gray-800">{val}</span>
        </div>
      )
    },
    {
      title: 'THỜI GIAN ĐĂNG NHẬP',
      dataIndex: 'LoginTime',
      key: 'LoginTime',
      render: (val) => (
        <span className="text-sm text-gray-600 font-medium">
          {dayjs(val).format('DD/MM/YYYY HH:mm:ss')}
        </span>
      )
    },
    {
      title: 'TÊN MÁY CHỦ (HOST)',
      dataIndex: 'HostName',
      key: 'HostName',
      render: (val) => (
        <div className="flex items-center gap-2 text-gray-600">
          <HardDrive size={14} />
          <span className="font-mono text-xs">{val || 'N/A'}</span>
        </div>
      )
    },
    {
      title: 'ỨNG DỤNG / TRÌNH DUYỆT',
      dataIndex: 'AppName',
      key: 'AppName',
      render: (val) => (
        <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg border border-gray-100 w-fit">
          {getAppIcon(val)}
          <span className="text-xs text-gray-500 truncate max-w-[200px]" title={val}>{val || 'Unknown'}</span>
        </div>
      )
    }
  ];

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-50/50">

      {/* HEADER SECTION */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <LogIn className="text-blue-600" size={28} />
            </div>
            Nhật ký đăng nhập (Login Logs)
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Giám sát các phiên đăng nhập và phát hiện truy cập bất thường.</p>
        </div>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-5 items-end">
        <div className="w-64">
          <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">Tên đăng nhập</label>
          <SearchBar
            placeholder="Username..."
            onSearch={setLoginNameFilter}
            className="h-11"
          />
        </div>

        <div className="w-64">
          <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">Tên máy chủ (Host)</label>
          <SearchBar
            placeholder="HostName..."
            onSearch={setHostNameFilter}
            className="h-11"
          />
        </div>

        <div className="min-w-[300px]">
          <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">Khoảng thời gian</label>
          <RangePicker
            showTime
            onChange={setDateRange}
            className="w-full rounded-xl h-11"
            format="DD/MM/YYYY HH:mm"
            placeholder={['Từ ngày', 'Đến ngày']}
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
            rowKey="LogID"
            loading={{
              spinning: loading,
              indicator: <Loader2 className="animate-spin text-blue-600" size={40} />
            }}
            pagination={false}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={<span className="text-gray-400">Không tìm thấy bản ghi đăng nhập nào.</span>}
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

      <style>{`
        .ant-picker-range {
          border-radius: 0.75rem !important;
        }
      `}</style>
    </div >
  );
};

export default LoginLogs;
