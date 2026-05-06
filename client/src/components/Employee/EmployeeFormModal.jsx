import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { 
  X, Mail, Phone, Calendar, User, AlertCircle, Loader2, IdCard, MapPin, CheckCircle2
} from 'lucide-react';

// IMPORT TRỰC TIẾP TỪ FILE SERVICE, KHÔNG QUA INDEX
import employeeService from '../../services/Employee/employeeService';

import PositionSelect from '../common/PositionSelect';
import UnitSelect from '../common/UnitSelect';
import ShiftSelect from '../common/ShiftSelect';

import CustomButton from '../shared/CustomButton';
import CustomSelect from '../shared/CustomSelect';

const initialFormState = {
  HoTen: '',
  NgaySinh: '',
  GioiTinh: 'Nam',
  SoCCCD: '',
  Email: '',
  SoDienThoai: '',
  QueQuan: '',
  MaDonVi: '',
  MaChucVu: '',
  MaCaLamViec: '',
  NgayVaoBienChe: ''
};

const EmployeeFormModal = ({ isOpen, onClose, onRefresh, initialData }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          ...initialFormState,
          ...initialData,
          // Đảo ngược Giới tính từ số sang chuỗi
          GioiTinh: (initialData.GioiTinh === 1 || initialData.GioiTinh === true) ? 'Nữ' : 'Nam',

          MaDonVi: initialData.MaDonVi || '', 
          MaChucVu: initialData.MaChucVu || '',
          MaCaLamViec: initialData.MaCaLamViec || '',
          
          // Xử lý cắt chuỗi ngày tháng để gắn vào input type="date"
          NgaySinh: initialData.NgaySinh ? initialData.NgaySinh.split('T')[0] : '',
          NgayVaoBienChe: initialData.NgayVaoBienChe ? initialData.NgayVaoBienChe.split('T')[0] : ''
        });
      } else {
        setFormData(initialFormState);
      }
      setErrors({});
      setSubmitError(null);
      setToastMessage('');
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (submitError) setSubmitError(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.HoTen?.trim()) newErrors.HoTen = 'Bắt buộc nhập họ tên';
    
    // Chỉ bắt buộc nhập CCCD khi Thêm mới
    if (!initialData && !formData.SoCCCD?.trim()) newErrors.SoCCCD = 'Bắt buộc nhập số CCCD';
    
    if (!formData.Email?.trim()) {
      newErrors.Email = 'Bắt buộc nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email)) {
      newErrors.Email = 'Email không hợp lệ';
    }
    
    if (!formData.MaDonVi) newErrors.MaDonVi = 'Bắt buộc chọn đơn vị';
    if (!formData.MaChucVu) newErrors.MaChucVu = 'Bắt buộc chọn chức vụ';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (initialData) {
        // --- GỌI API CẬP NHẬT (PUT) QUA SERVICE ---
        const updatePayload = {
          HoTen: formData.HoTen,
          Email: formData.Email,
          MaChucVu: formData.MaChucVu,      
          MaDonVi: formData.MaDonVi,        
          NgayVaoBienChe: formData.NgayVaoBienChe, 
          NgaySinh: formData.NgaySinh,
          GioiTinh: formData.GioiTinh === 'Nam' ? 0 : 1,
          SoDienThoai: formData.SoDienThoai,
          QueQuan: formData.QueQuan,
          MaCaLamViec: formData.MaCaLamViec
        };

        // SỬ DỤNG SERVICE ĐỂ UPDATE
        await employeeService.update(initialData.MaNV || initialData.id, updatePayload);
        setToastMessage('Cập nhật thông tin nhân viên thành công!');
        message.success("Cập nhật thành công");

      } else {
        // --- GỌI API THÊM MỚI (POST) QUA SERVICE ---
        const createPayload = { 
          ...formData, 
          GioiTinh: formData.GioiTinh === 'Nam' ? 0 : 1 
        };

        // SỬ DỤNG SERVICE ĐỂ CREATE
        await employeeService.create(createPayload);
        setToastMessage('Thêm mới thành công! Mật khẩu mặc định đã được tạo.');
        message.success("Thiết lập nhân viên mới thành công");
      }

      // Đợi 1.5s để user thấy Toast thành công rồi mới đóng
      setTimeout(() => {
        if (onRefresh) onRefresh();
        onClose();
      }, 1500);

    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra khi xử lý hệ thống!';
      setSubmitError(errorMsg);
      message.error("Lưu thông tin thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[96vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 relative">
        
        {/* Toast Overlay Thành công */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-3 rounded-xl shadow-xl animate-in slide-in-from-top-4 duration-300">
            <CheckCircle2 className="w-5 h-5 mr-2 shrink-0" />
            <span className="font-bold text-sm">{toastMessage}</span>
          </div>
        )}

        {/* Header: ĐỔI TEXT THEO CHẾ ĐỘ THÊM/SỬA */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">
              {initialData ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {initialData ? `Đang chỉnh sửa hồ sơ của: ${initialData.HoTen}` : 'Điền đầy đủ thông tin bên dưới để tạo hồ sơ và tài khoản nhân viên.'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            disabled={isSubmitting}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Thông báo lỗi từ API */}
        {submitError && (
          <div className="mx-8 mt-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center text-sm font-medium animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
            {submitError}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-10 bg-white custom-scrollbar">
          <form id="employeeForm" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-8 w-full">
            
            {/* CỘT 1: THÔNG TIN CÁ NHÂN */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-blue-600 uppercase tracking-[0.2em] border-b pb-3">Thông tin định danh</h3>
              
              <div className="w-full">
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Mã nhân viên <span className="text-gray-400 lowercase">(Tự động cấp)</span></label>
                <div className="relative">
                  <IdCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input 
                    type="text" 
                    readOnly 
                    disabled 
                    // Hiện mã NV nếu đang sửa
                    value={initialData ? initialData.MaNV : ''} 
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-400 cursor-not-allowed font-mono text-sm font-bold" 
                    placeholder="Hệ thống tự động cấp sau khi lưu" 
                  />
                </div>
              </div>

              <div className="w-full">
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Họ và Tên <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.HoTen ? 'text-red-400' : 'text-gray-400'}`} />
                  <input 
                    type="text" 
                    name="HoTen" 
                    value={formData.HoTen} 
                    onChange={handleChange} 
                    disabled={isSubmitting}
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all ${errors.HoTen ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`} 
                    placeholder="Nhập đầy đủ họ tên..." 
                  />
                </div>
                {errors.HoTen && <p className="text-red-500 text-[11px] mt-1.5 font-bold flex items-center"><AlertCircle size={12} className="mr-1"/> {errors.HoTen}</p>}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Giới tính</label>
                  <CustomSelect
                    options={[
                      { value: 'Nam', label: 'Nam' },
                      { value: 'Nữ', label: 'Nữ' }
                    ]}
                    value={formData.GioiTinh}
                    onChange={(val) => handleChange({ target: { name: 'GioiTinh', value: val } })}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Ngày sinh</label>
                  <input type="date" name="NgaySinh" value={formData.NgaySinh} onChange={handleChange} disabled={isSubmitting} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500" />
                </div>
              </div>

              <div className="w-full">
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Số CCCD {initialData ? '' : <span className="text-red-500">*</span>}</label>
                <div className="relative">
                  <IdCard size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.SoCCCD ? 'text-red-400' : 'text-gray-400'}`} />
                  <input 
                    type="text" 
                    name="SoCCCD" 
                    value={formData.SoCCCD} 
                    onChange={handleChange} 
                    disabled={isSubmitting || initialData} // Khóa CCCD không cho sửa nếu đang cập nhật
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl outline-none transition-all 
                      ${initialData ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : (errors.SoCCCD ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500')}
                    `} 
                    placeholder="Nhập 12 số CCCD..." 
                  />
                </div>
                {errors.SoCCCD && <p className="text-red-500 text-[11px] mt-1.5 font-bold flex items-center"><AlertCircle size={12} className="mr-1"/> {errors.SoCCCD}</p>}
              </div>
            </div>

            {/* CỘT 2: LIÊN HỆ & CÔNG TÁC */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-blue-600 uppercase tracking-[0.2em] border-b pb-3">Liên hệ & Công tác</h3>
              
              <div className="w-full">
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Email liên hệ <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.Email ? 'text-red-400' : 'text-gray-400'}`} />
                  <input 
                    type="email" 
                    name="Email" 
                    value={formData.Email} 
                    onChange={handleChange} 
                    disabled={isSubmitting}
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl outline-none ${errors.Email ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`} 
                    placeholder="example@company.com" 
                  />
                </div>
                {errors.Email && <p className="text-red-500 text-[11px] mt-1.5 font-bold flex items-center"><AlertCircle size={12} className="mr-1"/> {errors.Email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="w-full">
                  <UnitSelect 
                    value={formData.MaDonVi} 
                    onChange={handleChange}
                    error={errors.MaDonVi}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="w-full">
                  <PositionSelect 
                    value={formData.MaChucVu} 
                    onChange={handleChange} 
                    error={errors.MaChucVu}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Ngày vào biên chế</label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="date" name="NgayVaoBienChe" value={formData.NgayVaoBienChe} onChange={handleChange} disabled={isSubmitting} className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Quê quán</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      name="QueQuan" 
                      value={formData.QueQuan} 
                      onChange={handleChange} 
                      disabled={isSubmitting}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500" 
                      placeholder="VD: Đà Nẵng..." 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="w-full">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="tel" name="SoDienThoai" value={formData.SoDienThoai} onChange={handleChange} disabled={isSubmitting} className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500" placeholder="09xxxxxxxx" />
                </div>
                <div className="w-full">
                  <ShiftSelect 
                    value={formData.MaCaLamViec} 
                    onChange={handleChange} 
                    disabled={isSubmitting} 
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-10 py-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-4 rounded-b-2xl">
          <CustomButton 
            variant="outline"
            onClick={onClose} 
            isDisabled={isSubmitting} 
            className="px-6 border-none shadow-none text-gray-500 hover:text-gray-700 bg-transparent hover:bg-gray-200"
          >
            Hủy bỏ
          </CustomButton>
          <CustomButton 
            type="submit" 
            form="employeeForm" 
            variant="primary"
            isDisabled={!!toastMessage}
            isLoading={isSubmitting}
            className="px-12 py-3 shadow-lg shadow-blue-100 min-w-[180px]"
          >
            {initialData ? 'Lưu thay đổi' : 'Tạo hồ sơ nhân viên'}
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default EmployeeFormModal;