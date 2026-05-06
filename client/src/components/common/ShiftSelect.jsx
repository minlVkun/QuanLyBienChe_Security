import React, { useState, useEffect } from 'react';
import { AlertCircle, Timer } from 'lucide-react';
import shiftService from '../../services/System/shiftService';
import dayjs from 'dayjs';

const ShiftSelect = ({ value, onChange, error, disabled, name = "MaCaLamViec" }) => {
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchShifts = async () => {
            setLoading(true);
            try {
                const res = await shiftService.getAll();
                // SQL returns raw recordset, access payload correctly
                setShifts(res.data?.data || []);
            } catch (err) {
                console.error("Lỗi tải danh mục ca làm việc:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchShifts();
    }, []);

    // Helper để format giờ an toàn
    const formatTime = (timeStr) => {
        if (!timeStr) return '--:--';
        // dayjs xử lý được cả ISO string lẫn HH:mm:ss
        return dayjs(timeStr, 'HH:mm:ss').format('HH:mm');
    };

    return (
        <div className="w-full">
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Ca làm việc</label>
            <div className="relative">
                <Timer size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${error ? 'text-red-400' : 'text-gray-400'}`} />
                <select
                    name={name}
                    value={value || ''}
                    onChange={onChange}
                    disabled={disabled || loading}
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl outline-none appearance-none bg-white transition-all 
                        ${error ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'}
                        ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-70' : ''}
                    `}
                >
                    <option value="">-- Chọn ca làm việc --</option>
                    {shifts.map(s => (
                        <option key={s.MaCaLamViec} value={s.MaCaLamViec}>
                            {s.TenCa} ({formatTime(s.GioBatDau)} - {formatTime(s.GioKetThuc)})
                        </option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 border-l pl-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
            {error && (
                <p className="text-red-500 text-[11px] mt-1.5 font-bold flex items-center">
                    <AlertCircle size={12} className="mr-1" /> {error}
                </p>
            )}
        </div>
    );
};

export default ShiftSelect;
