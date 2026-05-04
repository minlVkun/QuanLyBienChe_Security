import React, { useState, useEffect } from 'react';
import { Modal, Select, InputNumber, Input, DatePicker, message, Divider } from 'antd';
import { TrendingUp } from 'lucide-react';
import dayjs from 'dayjs';

// IMPORT TRỰC TIẾP TỪ SERVICE
import salaryService from '../../services/Payroll/salaryService';

const PromoteSalaryModal = ({ isOpen, onClose, onRefresh, employeeId }) => {
  const [scales, setScales] = useState([]);
  const [loadingScales, setLoadingScales] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    MaNgach: '',
    BacLuong: 1,
    HeSoLuong: 0,
    NgayHuong: dayjs().format('YYYY-MM-DD'),
    GhiChu: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchScales();
    }
  }, [isOpen]);

  const fetchScales = async () => {
    try {
      setLoadingScales(true);
      // GỌI API QUA SERVICE
      const res = await salaryService.getScales();
      
      // Vì Service đã return response.data, nên ta lấy thẳng luôn
      setScales(res?.data || res || []);
    } catch (error) {
      message.error("Không thể tải danh sách thang lương");
    } finally {
      setLoadingScales(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.MaNgach || !formData.HeSoLuong) {
      return message.warning("Vui lòng nhập đầy đủ thông tin lương mới");
    }

    try {
      setIsSubmitting(true);
      
      // GỌI API QUA SERVICE
      await salaryService.promote({
        MaNV: employeeId,
        ...formData
      });
      
      message.success("Cập nhật quyết định lương thành công!");
      onRefresh();
      onClose();
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi khi cập nhật lương");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-blue-600">
          <TrendingUp size={20} />
          <span className="font-bold">Quyết định nâng bậc / Điều chỉnh lương</span>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={isSubmitting}
      okText="Xác nhận cập nhật"
      cancelText="Hủy bỏ"
      centered
      width={500}
      styles={{ body: { paddingTop: '20px' } }}
    >
      <div className="space-y-5">
        {/* Chọn Ngạch Lương */}
        <div>
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
            Ngạch lương & Bậc
          </label>
          <Select
            className="w-full"
            placeholder="Chọn ngạch lương áp dụng"
            loading={loadingScales}
            onChange={(val, option) => setFormData({ 
              ...formData, 
              MaNgach: val, 
              HeSoLuong: option.heso,
              BacLuong: option.bacluong
            })}
            options={scales.map(s => ({
              value: s.MaNgach,
              label: `${s.TenNgach} - Bậc ${s.BacLuong} (HS: ${s.HeSoLuong})`,
              heso: s.HeSoLuong,
              bacluong: s.BacLuong
            }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Hệ số lương */}
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
              Hệ số lương mới
            </label>
            <InputNumber
              className="w-full"
              value={formData.HeSoLuong}
              readOnly
              prefix={<TrendingUp size={14} className="text-blue-500" />}
            />
          </div>

          {/* Ngày áp dụng */}
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
              Ngày bắt đầu hưởng
            </label>
            <DatePicker
              className="w-full"
              defaultValue={dayjs()}
              onChange={(date) => setFormData({ ...formData, NgayHuong: date?.format('YYYY-MM-DD') })}
            />
          </div>
        </div>

        {/* Ghi chú */}
        <div>
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
            Lý do / Số quyết định
          </label>
          <Input.TextArea
            rows={3}
            placeholder="Ví dụ: Quyết định số 123/QĐ-HR - Nâng bậc lương định kỳ năm 2026"
            value={formData.GhiChu}
            onChange={(e) => setFormData({ ...formData, GhiChu: e.target.value })}
          />
        </div>

        <Divider />
        <p className="text-[10px] text-gray-400 italic text-center">
          Mọi thay đổi về lương sẽ được ghi lại trong <b>Audit Log</b> để phục vụ hậu kiểm.
        </p>
      </div>
    </Modal>
  );
};

export default PromoteSalaryModal;