import React, { useState, useEffect } from 'react';
import { Building2, Loader2, AlertCircle, Filter } from 'lucide-react';

// IMPORT SERVICE MỚI
import departmentService from '../../services/System/departmentService';
import CustomSelect from '../shared/CustomSelect';

const UnitSelect = ({ 
  value, 
  onChange, 
  error, 
  name = "MaDonVi", 
  disabled = false, 
  isFilter = false, 
  placeholder = "-- Chọn đơn vị --", 
  className = "" 
}) => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUnits = async () => {
      setLoading(true);
      try {
        // GỌI API QUA SERVICE
        const res = await departmentService.getAll();
        
        let dataList = [];
        // Service đã trả về response.data, ta bắt các trường hợp cấu trúc trả về của API
        if (Array.isArray(res)) dataList = res;
        else if (res && Array.isArray(res.data)) dataList = res.data;
        else if (res && Array.isArray(res.recordset)) dataList = res.recordset;
        
        setUnits(dataList || []);
      } catch (err) {
        console.error("⚠️ Lỗi gọi API lấy danh sách đơn vị:", err);
        setUnits([]); 
      } finally {
        setLoading(false);
      }
    };
    
    fetchUnits();
  }, []);

  // Chuẩn bị options cho CustomSelect
  const unitOptions = units.map(unit => ({ value: unit.MaDonVi, label: unit.TenDonVi }));
  const filterOptions = [{ value: 'All', label: loading ? 'Đang tải...' : '-- Tất cả đơn vị --' }, ...unitOptions];

  const handleSelectChange = (val) => {
    if (onChange) onChange({ target: { name, value: val } });
  };

  // ==========================================
  // GIAO DIỆN 1: KHI DÙNG LÀM BỘ LỌC 
  // ==========================================
  if (isFilter) {
    return (
      <div className={`flex items-center gap-2 w-full sm:w-auto ${className}`}>
        {loading ? (
          <Loader2 className="w-4 h-4 text-blue-500 animate-spin hidden sm:block" />
        ) : (
          <Filter className="w-4 h-4 text-gray-500 hidden sm:block" />
        )}
        <CustomSelect
          options={filterOptions}
          value={value}
          onChange={handleSelectChange}
          disabled={disabled || loading}
          className="w-full sm:w-auto"
        />
      </div>
    );
  }

  // ==========================================
  // GIAO DIỆN 2: KHI DÙNG TRONG FORM THÊM/SỬA
  // ==========================================
  return (
    <div className={`w-full ${className}`}>
      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">
        Đơn vị công tác <span className="text-red-500">*</span>
      </label>
      
      <div className="relative w-full">
        <CustomSelect
          options={unitOptions}
          value={value}
          onChange={handleSelectChange}
          disabled={disabled || loading}
          placeholder={loading ? 'Đang tải...' : placeholder}
          className={error ? 'border border-red-500 rounded-lg' : ''}
        />
      </div>
      {error && (
        <p className="text-red-500 text-[10px] mt-1 font-bold flex items-center">
          <AlertCircle size={10} className="mr-1"/> {error}
        </p>
      )}
    </div>
  );
};

export default UnitSelect;