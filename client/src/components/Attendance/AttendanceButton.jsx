import React, { useState, useEffect, useCallback } from 'react';
import { Button, message, Tooltip, Badge } from 'antd';
import { Clock, CheckCircle2, LogIn, LogOut } from 'lucide-react';
import attendanceService from '../../services/Attendance/attendanceService';
import dayjs from 'dayjs';

/**
 * AttendanceButton - Nút chấm công thông minh với hiệu ứng Premium
 */
const AttendanceButton = ({ onRefresh, className, maNV }) => {
    const [loading, setLoading] = useState(false);
    const [todayStatus, setTodayStatus] = useState(null); // { GioVao, GioRa }

    const fetchTodayStatus = useCallback(async () => {
        if (!maNV) return;
        try {
            const today = dayjs().format('YYYY-MM-DD');
            const res = await attendanceService.getHistory(maNV, today, today);
            
            let list = [];
            if (Array.isArray(res)) {
                list = res;
            } else if (res && Array.isArray(res.data)) {
                list = res.data;
            } else if (res && res.success && Array.isArray(res.data)) {
                list = res.data;
            }

            if (list.length > 0) {
                setTodayStatus(list[0]);
            } else {
                setTodayStatus(null);
            }
        } catch (err) {
            console.error('Lỗi khi lấy trạng thái chấm công hôm nay:', err.message);
        }
    }, [maNV]);

    useEffect(() => {
        fetchTodayStatus();
    }, [fetchTodayStatus]);

    const handleCheck = async () => {
        if (loading) return;

        setLoading(true);
        try {
            const res = await attendanceService.check();
            const payload = res;
            if (payload?.success) {
                message.success(payload.message || 'Thao tác thành công');
                await fetchTodayStatus();
                if (onRefresh) onRefresh();
            } else {
                message.error(payload?.message || 'Lỗi khi chấm công');
            }
        } catch (err) {
            const errMsg = err.response?.data?.message || err.message || 'Lỗi khi chấm công';
            if (err.response?.status === 500 && errMsg.toLowerCase().includes('ca l')) {
                message.error('⚠️ Bạn chưa được gán Ca làm việc. Vui lòng liên hệ HR!');
            } else {
                message.error(errMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    // Xác định trạng thái
    const hasCheckedIn = !!todayStatus?.GioVao;
    const hasCheckedOut = !!todayStatus?.GioRa;
    const isFinished = hasCheckedIn && hasCheckedOut;

    let buttonText = "Check-in";
    let icon = <LogIn size={20} />;
    let btnClass = "bg-white text-blue-600 hover:text-blue-700 shadow-blue-200/50";

    if (hasCheckedIn && !hasCheckedOut) {
        buttonText = "Check-out";
        icon = <LogOut size={20} />;
        btnClass = "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-200/50";
    } else if (isFinished) {
        // Nếu đã xong 1 phiên, cho phép Check-in phiên mới
        buttonText = "Check-in"; 
        icon = <LogIn size={20} />;
        btnClass = "bg-white text-blue-600 hover:text-blue-700 shadow-blue-200/50";
    }

    return (
        <div className="relative group">
            <Tooltip title={hasCheckedIn && !hasCheckedOut ? "Nhấn để kết thúc ca làm" : "Nhấn để bắt đầu ca làm"}>
                <Button
                    type="primary"
                    size="large"
                    icon={icon}
                    onClick={handleCheck}
                    loading={loading}
                    disabled={loading}
                    className={`h-14 px-8 border-none font-bold rounded-2xl shadow-xl transition-all duration-300 flex items-center gap-3 hover:scale-105 active:scale-95 ${btnClass} ${className}`}
                >
                    <span className="text-base tracking-wide">{buttonText}</span>
                </Button>
            </Tooltip>
            
            {hasCheckedIn && !hasCheckedOut && (
                <div className="absolute -top-2 -right-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </span>
                </div>
            )}
        </div>
    );
};

export default AttendanceButton;
