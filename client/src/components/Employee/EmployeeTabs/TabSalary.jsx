import React, { useState, useEffect } from 'react';
import { Timeline, Card, Statistic, Row, Col, Tag, Typography, Empty } from 'antd';
import { DollarSign, Calendar, ArrowUpRight, History, TrendingUp } from 'lucide-react';
import dayjs from 'dayjs';
import salaryService from '../../../services/Payroll/salaryService';
import PromoteSalaryModal from '../../Payroll/PromoteSalaryModal';

const { Text } = Typography;

const TabSalary = ({ employeeId }) => {
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);

  const fetchSalaryData = async () => {
    try {
      setLoading(true);
      const [currRes, histRes] = await Promise.all([
        salaryService.getCurrentSalary(employeeId),
        salaryService.getSalaryHistory(employeeId)
      ]);
      setCurrent(currRes?.data || currRes);
      setHistory(histRes?.data || histRes || []);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu lương:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) {
      fetchSalaryData();
    }
  }, [employeeId]);

  return (
    <div className="animate-in fade-in duration-300 p-6 space-y-8">
      {/* SECTION 1: TỔNG QUAN (CARD THÔNG MINH) */}
      <Row gutter={16}>
        <Col span={16}>
          <Card className="rounded-2xl border-none bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-100">
            <Row gutter={16} align="middle">
              <Col span={12}>
                <Statistic 
                  title={<span className="text-blue-100 font-bold uppercase text-[10px] tracking-widest">Hệ số lương hiện tại</span>}
                  value={current?.HeSoLuong || '---'}
                  styles={{ content: { color: '#fff', fontWeight: 900, fontSize: '32px' } }}
                  prefix={<ArrowUpRight className="text-blue-300" />}
                />
                <button 
                  onClick={() => setIsPromoteModalOpen(true)}
                  className="mt-2 text-[10px] font-bold text-blue-200 hover:text-white flex items-center gap-1 transition-colors bg-blue-500/30 px-2 py-1 rounded border border-blue-400/30"
                >
                  <TrendingUp size={12} /> Cập nhật lương / Nâng bậc
                </button>
              </Col>
              <Col span={12} className="border-l border-white/20 pl-6">
                <div className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mb-1">Ngày xét nâng bậc tới</div>
                <div className="text-white text-lg font-black">
                  {current?.NgayXetNangBacTiepTheo 
                    ? dayjs(current.NgayXetNangBacTiepTheo).format('DD/MM/YYYY') 
                    : '---'}
                </div>
                {current?.NgayXetNangBacTiepTheo && dayjs(current.NgayXetNangBacTiepTheo).diff(dayjs(), 'day') < 30 && (
                  <Tag color="orange" className="mt-2 border-none font-bold italic animate-pulse">Sắp đến hạn nâng bậc!</Tag>
                )}
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={8}>
          <Card className="rounded-2xl h-full flex flex-col justify-center text-center border-dashed border-2 border-gray-100">
            <Text className="text-gray-400 font-bold uppercase text-[10px]">Thực lĩnh tháng gần nhất</Text>
            <div className="text-2xl font-black text-emerald-600 mt-2">
              {current?.ThucLinhGanNhat?.toLocaleString('vi-VN') || '0'} đ
            </div>
          </Card>
        </Col>
      </Row>

      {/* SECTION 2: VERTICAL TIMELINE (LỊCH SỬ NÂNG LƯƠNG) */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h3 className="text-sm font-black text-gray-800 uppercase mb-8 flex items-center">
          <History className="mr-2 text-blue-500" size={18} /> Lịch sử diễn biến lương
        </h3>
        
        {Array.isArray(history) && history.length > 0 ? (
          <Timeline 
            mode="start" 
            className="custom-salary-timeline"
            items={history.map((item, index) => ({
              key: index,
              color: index === 0 ? 'blue' : 'gray',
              title: <span className="font-bold text-gray-400 text-xs">{dayjs(item.NgayHuong).format('MM/YYYY')}</span>,
              content: (
                <div className={`p-4 rounded-xl border ${index === 0 ? 'bg-blue-50/50 border-blue-100' : 'bg-gray-50/30 border-gray-100'}`}>
                  <div className="flex justify-between items-start">
                    <b className="text-gray-800">{item.TenNgach} - Bậc {item.BacLuong}</b>
                    <Tag color={index === 0 ? 'blue' : 'default'} className="m-0 font-bold">HS: {item.HeSoLuong}</Tag>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 italic">"{item.GhiChu || 'Điều chỉnh lương định kỳ'}"</p>
                </div>
              )
            }))}
          />
        ) : (
          <Empty description="Chưa có dữ liệu lịch sử nâng lương" />
        )}
      </div>

      <PromoteSalaryModal 
        isOpen={isPromoteModalOpen}
        onClose={() => setIsPromoteModalOpen(false)}
        employeeId={employeeId}
        onRefresh={fetchSalaryData}
      />
    </div>
  );
};

export default TabSalary;