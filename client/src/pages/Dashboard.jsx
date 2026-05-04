import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Spin, Alert } from 'antd';
import { Users, Wallet, UserPlus, Coins, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import dashboardService from '../services/System/dashboardService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Chỉ gọi API khi đã xác định được user
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await dashboardService.getStats(user.role);
        if (res && res.success) {
          setData(res.data);
        } else {
          setError('Không thể tải dữ liệu thống kê.');
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu dashboard:", err);
        setError('Đã xảy ra lỗi hệ thống khi tải Dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Spin size="large" />
        <p className="mt-4 text-gray-500 font-medium animate-pulse">Đang tải dữ liệu tổng quan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert message="Lỗi tải dữ liệu" description={error} type="error" showIcon />
      </div>
    );
  }

  // Đảm bảo user đã được load
  if (!user) return null;

  // Hàm định dạng tiền tệ
  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  // ===============================================
  // GIAO DIỆN DÀNH CHO NHÂN VIÊN THƯỜNG
  // ===============================================
  if (user?.role === 'db_Employee') {
    return (
      <div className="space-y-6 p-4 md:p-8 min-h-screen bg-gray-50/50">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Chào mừng trở lại, {user?.HoTen || user?.username}!</h1>
          <p className="text-gray-500 mt-1 font-medium">Dưới đây là thông tin tổng quan về hiệu suất và phúc lợi của bạn.</p>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <div className="bg-blue-50 p-6 rounded-2xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Wallet size={28} /></div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Mức lương hiện tại</p>
                  <h3 className="text-2xl font-black text-gray-800">{formatCurrency(data?.personalStats?.currentSalary)}</h3>
                </div>
              </div>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="bg-emerald-50 p-6 rounded-2xl shadow-sm border border-emerald-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><Coins size={28} /></div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Ngày phép còn lại</p>
                  <h3 className="text-2xl font-black text-gray-800">{data?.personalStats?.leaveDaysRemaining} Ngày</h3>
                </div>
              </div>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="bg-purple-50 p-6 rounded-2xl shadow-sm border border-purple-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><TrendingUp size={28} /></div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Khen thưởng</p>
                  <h3 className="text-2xl font-black text-gray-800">{data?.personalStats?.achievements} Lần</h3>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6 text-gray-800">Biến động lương 6 tháng qua</h3>
          <div style={{ width: '100%', height: 350, minHeight: 350 }}>
            {(!data?.salaryHistory || data.salaryHistory.length === 0) ? (
              <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium bg-gray-50 rounded-xl border border-dashed border-gray-200">
                Chưa có dữ liệu lương
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={data.salaryHistory}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10} />
                  <YAxis tickFormatter={(value) => `${value / 1000000}M`} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dx={-10} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="amount" name="Thực lĩnh" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ===============================================
  // GIAO DIỆN DÀNH CHO ADMIN / DEPT_HEAD / HR
  // ===============================================
  return (
    <div className="space-y-6 p-4 md:p-8 min-h-screen bg-gray-50/50">
      <div className="bg-white p-6 flex justify-between items-center rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Tổng quan hệ thống HRM</h1>
          <p className="text-gray-500 mt-1 font-medium">Theo dõi các chỉ số nhân sự và biến động chi phí trong thời gian thực.</p>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-200 text-white hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-2">Tổng Nhân Sự</p>
                <h3 className="text-4xl font-black">{data?.kpi?.totalEmployees}</h3>
              </div>
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm shadow-inner"><Users size={32} /></div>
            </div>
          </div>
        </Col>
        
        <Col xs={24} md={8}>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl shadow-lg shadow-emerald-200 text-white hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-2">Quỹ Lương (Tháng này)</p>
                <h3 className="text-4xl font-black">{new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(data?.kpi?.totalPayroll || 0)}</h3>
              </div>
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm shadow-inner"><Wallet size={32} /></div>
            </div>
          </div>
        </Col>
        
        <Col xs={24} md={8}>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-lg shadow-purple-200 text-white hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs font-bold uppercase tracking-wider mb-2">Nhân Sự Mới Ký HĐ</p>
                <h3 className="text-4xl font-black">+{data?.kpi?.newHires}</h3>
              </div>
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm shadow-inner"><UserPlus size={32} /></div>
            </div>
          </div>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
            <h3 className="text-lg font-bold mb-6 text-gray-800">Biến động nhân sự (6 Tháng qua)</h3>
            <div style={{ width: '100%', height: 350, minHeight: 350 }}>
              {(!data?.employeeGrowth || data.employeeGrowth.length === 0) ? (
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  Không có dữ liệu biến động
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={data.employeeGrowth}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dx={-10} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                    <Line type="monotone" dataKey="employees" name="Tổng nhân sự" stroke="#3b82f6" strokeWidth={3} dot={{r: 3}} activeDot={{r: 6}} />
                    <Line type="monotone" dataKey="newHires" name="Tuyển mới" stroke="#10b981" strokeWidth={3} dot={{r: 3}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </Col>
        
        <Col xs={24} lg={12}>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
            <h3 className="text-lg font-bold mb-6 text-gray-800">Chi phí lương theo phòng ban</h3>
            <div style={{ width: '100%', height: 350, minHeight: 350 }}>
              {(!data?.salaryByDept || data.salaryByDept.length === 0) ? (
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  Chưa có chi phí lương
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={data.salaryByDept}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="dept" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10} />
                    <YAxis tickFormatter={(val) => `${val / 1000000}M`} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dx={-10} />
                    <Tooltip 
                      formatter={(val) => formatCurrency(val)} 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Bar dataKey="cost" name="Chi phí (VND)" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;