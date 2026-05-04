import React, { useState, useEffect } from 'react';
import { X, Award, Calendar, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

// IMPORT SERVICE MỚI (Trực tiếp từ file)
import disciplineService from '../../services/Employee/disciplineService';

const initialFormState = {
  Loai: 'Khen thưởng',
  HinhThuc: 'Giấy khen',
  NgayQuyetDinh: new Date().toISOString().split('T')[0],
  SoQuyetDinh: '',
  NoiDung: ''
};

const DisciplineFormModal = ({ isOpen, onClose, onRefresh, initialData, employeeId }) => {
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
          // Cắt chuỗi để lấy đúng định dạng YYYY-MM-DD cho input date
          NgayQuyetDinh: initialData.NgayQuyetDinh ? initialData.NgayQuyetDinh.split('T')[0] : ''
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
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.HinhThuc.trim()) newErrors.HinhThuc = 'Bắt buộc nhập hình thức';
    if (!formData.NgayQuyetDinh) newErrors.NgayQuyetDinh = 'Bắt buộc chọn ngày';
    if (!formData.NoiDung.trim()) newErrors.NoiDung = 'Bắt buộc nhập nội dung quyết định';
    
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
        // CẬP NHẬT (DÙNG SERVICE)
        await disciplineService.update(initialData.RecordID, formData);
        setToastMessage('Cập nhật quyết định thành công!');
      } else {
        // THÊM MỚI (DÙNG SERVICE)
        await disciplineService.create({ ...formData, MaNV: employeeId });
        setToastMessage('Thêm quyết định thành công!');
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
            {initialData ? 'Sửa quyết định' : 'Thêm quyết định mới'}
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

        <form id="disciplineForm" onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Loại quyết định</label>
              <div className="relative">
                <Award className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${formData.Loai === 'Khen thưởng' ? 'text-emerald-500' : 'text-red-500'}`} />
                <select name="Loai" value={formData.Loai} onChange={handleChange} disabled={isSubmitting} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 bg-white">
                  <option value="Khen thưởng">Khen thưởng</option>
                  <option value="Kỷ luật">Kỷ luật</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Hình thức <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="HinhThuc" 
                value={formData.HinhThuc} 
                onChange={handleChange} 
                placeholder="VD: Giấy khen, Khiển trách..."
                className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all ${errors.HinhThuc ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`} 
              />
              {errors.HinhThuc && <p className="text-red-500 text-[11px] mt-1 font-bold">{errors.HinhThuc}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Số quyết định</label>
              <input 
                type="text" 
                name="SoQuyetDinh" 
                value={formData.SoQuyetDinh} 
                onChange={handleChange} 
                placeholder="VD: QĐ-123"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Ngày quyết định <span className="text-red-500">*</span></label>
              <div className="relative">
                <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.NgayQuyetDinh ? 'text-red-400' : 'text-gray-400'}`} />
                <input type="date" name="NgayQuyetDinh" value={formData.NgayQuyetDinh} onChange={handleChange} disabled={isSubmitting} className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm outline-none transition-all ${errors.NgayQuyetDinh ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`} />
              </div>
              {errors.NgayQuyetDinh && <p className="text-red-500 text-[11px] mt-1 font-bold">{errors.NgayQuyetDinh}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Nội dung / Lý do <span className="text-red-500">*</span></label>
            <div className="relative">
              <FileText className={`absolute left-3 top-3 w-4 h-4 ${errors.NoiDung ? 'text-red-400' : 'text-gray-400'}`} />
              <textarea 
                name="NoiDung" 
                value={formData.NoiDung} 
                onChange={handleChange} 
                disabled={isSubmitting} 
                rows="4"
                placeholder="VD: Hoàn thành xuất sắc nhiệm vụ dự án..." 
                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm outline-none transition-all resize-none ${errors.NoiDung ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`} 
              />
            </div>
            {errors.NoiDung && <p className="text-red-500 text-[11px] mt-1 font-bold">{errors.NoiDung}</p>}
          </div>
        </form>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">
            Hủy
          </button>
          <button type="submit" form="disciplineForm" disabled={isSubmitting || !!toastMessage} className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center">
            {isSubmitting ? <><Loader2 className="animate-spin w-4 h-4 mr-2" /> Đang lưu...</> : 'Lưu quyết định'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisciplineFormModal;