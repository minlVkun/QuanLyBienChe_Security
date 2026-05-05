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
            if (res.success && res.data.length > 0) {
                setTodayStatus(res.data[0]);
            } else {
                setTodayStatus(null);
            }
        } catch (err) {
            console.error('Lỗi khi lấy trạng thái chấm công hôm nay');
        }
    }, [maNV]);

    useEffect(() => {
        fetchTodayStatus();
    }, [fetchTodayStatus]);

    const handleCheck = async () => {
        if (loading || (todayStatus?.GioVao && todayStatus?.GioRa)) return;

        setLoading(true);
        try {
            const res = await attendanceService.check();
            if (res.success) {
                message.success(res.message || 'Thao tác thành công');
                await fetchTodayStatus();
                if (onRefresh) onRefresh();
            }
        } catch (err) {
            message.error(err.message || 'Lỗi khi chấm công');
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
        buttonText = "Hoàn tất";
        icon = <CheckCircle2 size={20} />;
        btnClass = "bg-emerald-500 text-white opacity-80 cursor-not-allowed shadow-emerald-100/50";
    }

    return (
        <div className="relative group">
            <Tooltip title={isFinished ? "Bạn đã hoàn tất ngày làm việc" : (hasCheckedIn ? "Nhấn để kết thúc ca làm" : "Nhấn để bắt đầu ca làm")}>
                <Button
                    type="primary"
                    size="large"
                    icon={icon}
                    onClick={handleCheck}
                    loading={loading}
                    disabled={loading || isFinished}
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
