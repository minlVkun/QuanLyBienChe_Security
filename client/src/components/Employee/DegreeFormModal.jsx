import React, { useState, useEffect } from 'react';
import { X, GraduationCap, Building2, BookOpen, Calendar, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

// IMPORT SERVICE MỚI (Import trực tiếp file, không qua index.js)
import degreeService from '../../services/Employee/degreeService';

const initialFormState = {
  LoaiBang: 'Đại học',
  ChuyenNganh: '',
  NoiDaoTao: '',
  NamTotNghiep: new Date().getFullYear() // Mặc định năm hiện tại
};

const DegreeFormModal = ({ isOpen, onClose, onRefresh, initialData, employeeId }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...initialFormState, ...initialData });
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
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.ChuyenNganh.trim()) newErrors.ChuyenNganh = 'Bắt buộc nhập chuyên ngành';
    if (!formData.NoiDaoTao.trim()) newErrors.NoiDaoTao = 'Bắt buộc nhập nơi đào tạo';
    if (!formData.NamTotNghiep) newErrors.NamTotNghiep = 'Bắt buộc nhập năm';
    
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
        // CẬP NHẬT (SỬ DỤNG SERVICE)
        await degreeService.update(initialData.ID_Bang, formData);
        setToastMessage('Cập nhật bằng cấp thành công!');
      } else {
        // THÊM MỚI (SỬ DỤNG SERVICE)
        await degreeService.create({ ...formData, MaNV: employeeId });
        setToastMessage('Thêm bằng cấp thành công!');
      }

      setTimeout(() => {
        if (onRefresh) onRefresh();
        onClose();
      }, 1000);

    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Có lỗi xảy ra khi lưu dữ liệu!');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 relative">
        
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-xl shadow-lg">
            <CheckCircle2 className="w-4 h-4 mr-2 shrink-0" />
            <span className="font-bold text-sm">{toastMessage}</span>
          </div>
        )}

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">
            {initialData ? 'Sửa thông tin bằng cấp' : 'Thêm bằng cấp mới'}
          </h2>
          <button onClick={onClose} disabled={isSubmitting} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {submitError && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center text-sm font-medium">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            {submitError}
          </div>
        )}

        <form id="degreeForm" onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Loại bằng / Trình độ</label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select name="LoaiBang" value={formData.LoaiBang} onChange={handleChange} disabled={isSubmitting} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 bg-white">
                <option value="Tiến sĩ">Tiến sĩ</option>
                <option value="Thạc sĩ">Thạc sĩ</option>
                <option value="Đại học">Đại học</option>
                <option value="Cao đẳng">Cao đẳng</option>
                <option value="Trung cấp">Trung cấp</option>
                <option value="Chứng chỉ">Chứng chỉ ngắn hạn</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Chuyên ngành <span className="text-red-500">*</span></label>
            <div className="relative">
              <BookOpen className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.ChuyenNganh ? 'text-red-400' : 'text-gray-400'}`} />
              <input type="text" name="ChuyenNganh" value={formData.ChuyenNganh} onChange={handleChange} disabled={isSubmitting} placeholder="VD: Công nghệ thông tin..." className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm outline-none transition-all ${errors.ChuyenNganh ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`} />
            </div>
            {errors.ChuyenNganh && <p className="text-red-500 text-[11px] mt-1 font-bold">{errors.ChuyenNganh}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Nơi đào tạo <span className="text-red-500">*</span></label>
            <div className="relative">
              <Building2 className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.NoiDaoTao ? 'text-red-400' : 'text-gray-400'}`} />
              <input type="text" name="NoiDaoTao" value={formData.NoiDaoTao} onChange={handleChange} disabled={isSubmitting} placeholder="VD: Đại học Bách Khoa..." className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm outline-none transition-all ${errors.NoiDaoTao ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`} />
            </div>
            {errors.NoiDaoTao && <p className="text-red-500 text-[11px] mt-1 font-bold">{errors.NoiDaoTao}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Năm tốt nghiệp <span className="text-red-500">*</span></label>
            <div className="relative">
              <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.NamTotNghiep ? 'text-red-400' : 'text-gray-400'}`} />
              <input type="number" name="NamTotNghiep" value={formData.NamTotNghiep} onChange={handleChange} disabled={isSubmitting} min="1950" max="2099" className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm outline-none transition-all ${errors.NamTotNghiep ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`} />
            </div>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">
            Hủy
          </button>
          <button type="submit" form="degreeForm" disabled={isSubmitting || !!toastMessage} className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center">
            {isSubmitting ? <><Loader2 className="animate-spin w-4 h-4 mr-2" /> Đang lưu...</> : 'Lưu bằng cấp'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DegreeFormModal;