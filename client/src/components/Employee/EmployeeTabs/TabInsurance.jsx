import React, { useState, useEffect } from 'react';
import { Typography, Spin, Empty, message } from 'antd';
import { ShieldCheck, History, Edit3, CreditCard, Hospital, Landmark } from 'lucide-react';
import dayjs from 'dayjs';
import insuranceService from '../../../services/Employee/insuranceService';
import InsuranceFormModal from '../InsuranceFormModal';

const { Title } = Typography;

const TabInsurance = ({ employeeId }) => {
    const [loading, setLoading] = useState(false);
    const [insuranceData, setInsuranceData] = useState(null);
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (employeeId) {
            fetchInsuranceDetail();
            fetchContributionHistory();
        }
    }, [employeeId]);

    const fetchInsuranceDetail = async () => {
        setLoading(true);
        try {
            const res = await insuranceService.getInsuranceDetail(employeeId);
            if (res.success && res.data) {
                setInsuranceData(res.data);
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Không tải được thông tin bảo hiểm');
        } finally {
            setLoading(false);
        }
    };

    const fetchContributionHistory = async () => {
        setHistoryLoading(true);
        try {
            const res = await insuranceService.getContributionHistory(employeeId, { limit: 100 });
            if (res.success) {
                setHistory(res.data);
            }
        } catch (error) {
            message.error('Không tải được lịch sử đóng bảo hiểm');
        } finally {
            setHistoryLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* PHẦN 1: THÔNG TIN CHI TIẾT (VIEW MODE) */}
            <div className="px-6 pt-6">
                <div className="flex justify-between items-center mb-6">
                    <Title level={4} className="flex items-center gap-2 !mb-0">
                        <ShieldCheck className="w-6 h-6 text-blue-600" /> Thông tin Sổ Bảo Hiểm
                    </Title>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                        <Edit3 className="w-4 h-4 mr-1.5" /> Chỉnh sửa thông tin
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12"><Spin /></div>
                ) : insuranceData ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Card Số BHXH */}
                        <div className="p-5 border border-gray-100 rounded-xl bg-white shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Số BHXH</p>
                                <p className="text-base font-bold text-gray-900">{insuranceData.SoBHXH}</p>
                            </div>
                        </div>

                        {/* Card Số BHYT */}
                        <div className="p-5 border border-gray-100 rounded-xl bg-white shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Số BHYT</p>
                                <p className="text-base font-bold text-gray-900">{insuranceData.SoBHYT || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Card Nơi KCB */}
                        <div className="p-5 border border-gray-100 rounded-xl bg-white shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                <Hospital className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Nơi Đăng ký KCB</p>
                                <p className="text-base font-bold text-gray-900 truncate max-w-[200px]" title={insuranceData.NoiDangKyKCB}>
                                    {insuranceData.NoiDangKyKCB || 'Chưa cập nhật'}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <Empty description="Chưa có dữ liệu bảo hiểm" />
                )}
            </div>

            {/* PHẦN 2: LỊCH SỬ ĐÓNG BẢO HIỂM (LIST STYLE) */}
            <div className="px-6 pb-6">
                <Title level={5} className="flex items-center gap-2 mb-6">
                    <History className="w-5 h-5 text-gray-600" /> Lịch sử đóng bảo hiểm
                </Title>

                <div className="space-y-4">
                    {historyLoading ? (
                        <div className="flex justify-center py-12"><Spin /></div>
                    ) : history && history.length > 0 ? (
                        history.map((log) => (
                            <div key={log.LogID} className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-all gap-4">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                        <Landmark className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-bold text-gray-900">Tháng {dayjs(log.ThangNam).format('MM/YYYY')}</h4>
                                        <p className="text-sm text-gray-500">Ghi chú: {log.GhiChu || 'Không có'}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:items-end gap-2 shrink-0">
                                    <div className="flex gap-4">
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">NLĐ Đóng</p>
                                            <p className="text-sm font-bold text-blue-600">
                                                {new Intl.NumberFormat('vi-VN').format(log.TienNLDDong || 0)} đ
                                            </p>
                                        </div>
                                        <div className="text-right border-l pl-4 border-gray-100">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Công ty Đóng</p>
                                            <p className="text-sm font-bold text-indigo-600">
                                                {new Intl.NumberFormat('vi-VN').format(log.TienCTyDong || 0)} đ
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl">
                            <Empty description="Chưa có lịch sử đóng bảo hiểm" />
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL CẬP NHẬT (EDIT MODE) */}
            <InsuranceFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchInsuranceDetail}
                employeeId={employeeId}
                initialData={insuranceData}
            />
        </div>
    );
};

export default TabInsurance;