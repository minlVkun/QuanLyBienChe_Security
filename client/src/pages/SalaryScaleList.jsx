import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Wallet, Plus, Edit, Trash2, AlertCircle, Layers, Star
} from 'lucide-react';
import { message, Modal, Skeleton, Form, Input, InputNumber, Tag, Popconfirm, Select } from 'antd';
import salaryService from '../services/Payroll/salaryService';
import HasPermission from '../components/shared/HasPermission';
import CustomButton from '../components/shared/CustomButton';

const SalaryScaleList = () => {
  const [scales, setScales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isScaleModalOpen, setIsScaleModalOpen] = useState(false);
  const [editingScale, setEditingScale] = useState(null);
  const [scaleForm] = Form.useForm();

  const [isStepModalOpen, setIsStepModalOpen] = useState(false);
  const [currentMaNgach, setCurrentMaNgach] = useState(null);
  const [stepForm] = Form.useForm();

  const fetchScales = async () => {
    try {
      setLoading(true);
      const res = await salaryService.getScales();
      const rawData = res?.data || res || [];
      
      // Group by Scale
      const grouped = rawData.reduce((acc, curr) => {
        if (!acc[curr.MaNgach]) {
          acc[curr.MaNgach] = {
            MaNgach: curr.MaNgach,
            TenNgach: curr.TenNgach,
            NhomNgach: curr.NhomNgach,
            steps: []
          };
        }
        acc[curr.MaNgach].steps.push({
          BacLuong: curr.BacLuong,
          HeSoLuong: curr.HeSoLuong
        });
        return acc;
      }, {});
      
      setScales(Object.values(grouped));
    } catch (error) {
      message.error("Không thể tải danh mục ngạch bậc lương");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScales();
  }, []);

  // --- SCALE ACTIONS ---
  const handleAddScale = () => {
    setEditingScale(null);
    scaleForm.resetFields();
    setIsScaleModalOpen(true);
  };

  const handleEditScale = (scale) => {
    setEditingScale(scale);
    scaleForm.setFieldsValue(scale);
    setIsScaleModalOpen(true);
  };

  const handleDeleteScale = (id) => {
    Modal.confirm({
      title: 'Xóa ngạch lương?',
      content: 'Hệ thống sẽ xóa ngạch lương và toàn bộ các bậc lương đi kèm. Chỉ có thể xóa nếu không có nhân viên nào đang áp dụng ngạch này.',
      okText: 'Xóa',
      okType: 'danger',
      onOk: async () => {
        try {
          await salaryService.deleteScale(id);
          message.success("Xóa ngạch lương thành công");
          fetchScales();
        } catch (error) {
          message.error(error.response?.data?.message || "Lỗi khi xóa");
        }
      }
    });
  };

  const handleScaleSubmit = async () => {
    try {
      const values = await scaleForm.validateFields();
      if (editingScale) {
        await salaryService.updateScale(editingScale.MaNgach, values);
        message.success("Cập nhật thành công");
      } else {
        await salaryService.createScale(values);
        message.success("Thêm mới thành công");
      }
      setIsScaleModalOpen(false);
      fetchScales();
    } catch (error) {
      if (error.errorFields) return;
      message.error(error.response?.data?.message || "Lỗi hệ thống");
    }
  };

  // --- STEP ACTIONS ---
  const handleAddStep = (maNgach) => {
    setCurrentMaNgach(maNgach);
    stepForm.resetFields();
    stepForm.setFieldsValue({ MaNgach: maNgach });
    setIsStepModalOpen(true);
  };

  const handleStepSubmit = async () => {
    try {
      const values = await stepForm.validateFields();
      await salaryService.addStep(values);
      message.success("Thêm bậc lương thành công");
      setIsStepModalOpen(false);
      fetchScales();
    } catch (error) {
      if (error.errorFields) return;
      message.error(error.response?.data?.message || "Lỗi hệ thống");
    }
  };

  const handleDeleteStep = async (maNgach, bacLuong) => {
    try {
      await salaryService.deleteStep(maNgach, bacLuong);
      message.success("Đã xóa bậc lương");
      fetchScales();
    } catch (error) {
      message.error("Lỗi khi xóa bậc lương");
    }
  };

  const filteredScales = useMemo(() => {
    return scales.filter(s =>
      s.TenNgach.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.MaNgach.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [scales, searchTerm]);

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-50/50 font-sans animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center">
            <Wallet className="mr-3 text-emerald-600 shrink-0" size={28} />
            Danh mục Ngạch/Bậc Lương
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Quản lý các ngạch lương, nhóm ngạch và hệ số bậc lương chi tiết.</p>
        </div>
        <HasPermission requiredRoles={['db_Admin', 'db_HR_Human']}>
          <CustomButton variant="primary" icon={Plus} onClick={handleAddScale}>
            Thêm ngạch lương
          </CustomButton>
        </HasPermission>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 shrink-0" size={18} />
            <input
              type="text"
              placeholder="Tìm theo mã hoặc tên ngạch..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : filteredScales.length > 0 ? (
            filteredScales.map((scale) => (
              <div key={scale.MaNgach} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Scale Header */}
                <div className="bg-gray-50/50 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-600">
                      <Layers size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-gray-900">{scale.TenNgach}</h3>
                        <Tag color="blue" className="rounded-full px-2 text-[10px] font-black uppercase">{scale.NhomNgach}</Tag>
                      </div>
                      <p className="text-xs text-gray-400 font-mono">Mã ngạch: #{scale.MaNgach}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <HasPermission requiredRoles={['db_Admin', 'db_HR_Human']}>
                      <button onClick={() => handleAddStep(scale.MaNgach)} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg flex items-center gap-1">
                        <Plus size={14} /> Thêm bậc
                      </button>
                      <button onClick={() => handleEditScale(scale)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDeleteScale(scale.MaNgach)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </HasPermission>
                  </div>
                </div>

                {/* Steps List */}
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {scale.steps.sort((a, b) => a.BacLuong - b.BacLuong).map((step) => (
                    <div key={step.BacLuong} className="relative group p-3 bg-white border border-gray-50 rounded-xl hover:border-emerald-200 hover:bg-emerald-50/20 transition-all text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Bậc {step.BacLuong}</p>
                      <p className="text-lg font-black text-gray-800">{step.HeSoLuong.toFixed(2)}</p>
                      
                      <HasPermission requiredRoles={['db_Admin', 'db_HR_Human']}>
                        <Popconfirm
                          title="Xóa bậc lương này?"
                          onConfirm={() => handleDeleteStep(scale.MaNgach, step.BacLuong)}
                          okText="Xóa"
                          cancelText="Hủy"
                          okButtonProps={{ danger: true, size: 'small' }}
                        >
                          <button className="absolute -top-1 -right-1 w-5 h-5 bg-red-100 text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={10} />
                          </button>
                        </Popconfirm>
                      </HasPermission>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="p-20 text-center text-gray-400 flex flex-col items-center">
              <AlertCircle size={48} className="mb-4 text-gray-100" />
              <p className="font-bold">Không tìm thấy ngạch lương nào</p>
            </div>
          )}
        </div>
      </div>

      {/* --- SCALE MODAL --- */}
      <Modal
        title={<span className="text-xl font-black text-gray-900">{editingScale ? 'Cập nhật Ngạch Lương' : 'Thêm Ngạch Lương Mới'}</span>}
        open={isScaleModalOpen}
        onCancel={() => setIsScaleModalOpen(false)}
        onOk={handleScaleSubmit}
        okText={editingScale ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
        okButtonProps={{ className: 'bg-emerald-600' }}
      >
        <Form form={scaleForm} layout="vertical" className="mt-6">
          <Form.Item
            name="MaNgach"
            label={<span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Mã Ngạch</span>}
            rules={[{ required: true, message: 'Vui lòng nhập mã ngạch' }]}
          >
            <Input disabled={!!editingScale} placeholder="Ví dụ: 01.001, 01.002..." className="rounded-lg py-2" />
          </Form.Item>
          <Form.Item
            name="TenNgach"
            label={<span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Tên Ngạch</span>}
            rules={[{ required: true, message: 'Vui lòng nhập tên ngạch' }]}
          >
            <Input placeholder="Ví dụ: Chuyên viên cao cấp, Kế toán viên..." className="rounded-lg py-2" />
          </Form.Item>
          <Form.Item
            name="NhomNgach"
            label={<span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Nhóm Ngạch</span>}
            rules={[{ required: true, message: 'Vui lòng chọn nhóm ngạch' }]}
          >
            <Select placeholder="Chọn nhóm ngạch (Ví dụ: A1, A2, B...)" className="rounded-lg h-10">
              <Select.Option value="A1">Nhóm A1 (Đại học/Cao cấp)</Select.Option>
              <Select.Option value="A2">Nhóm A2 (Chuyên viên chính)</Select.Option>
              <Select.Option value="B">Nhóm B (Cán sự/Kỹ thuật viên)</Select.Option>
              <Select.Option value="C">Nhóm C (Nhân viên/Phục vụ)</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* --- STEP MODAL --- */}
      <Modal
        title={<span className="text-xl font-black text-gray-900">Thêm Bậc Lương</span>}
        open={isStepModalOpen}
        onCancel={() => setIsStepModalOpen(false)}
        onOk={handleStepSubmit}
        okText="Thêm bậc"
        cancelText="Hủy"
        okButtonProps={{ className: 'bg-emerald-600' }}
      >
        <Form form={stepForm} layout="vertical" className="mt-6">
          <Form.Item name="MaNgach" hidden><Input /></Form.Item>
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 mb-6 flex items-center gap-3">
             <Star className="text-emerald-600" size={20} />
             <div>
                <p className="text-[10px] font-bold text-emerald-400 uppercase">Đang thêm cho Ngạch</p>
                <p className="text-sm font-bold text-emerald-700">{currentMaNgach}</p>
             </div>
          </div>
          <Form.Item
            name="BacLuong"
            label={<span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Bậc Lương (Số)</span>}
            rules={[{ required: true, message: 'Vui lòng nhập bậc' }]}
          >
            <InputNumber min={1} max={20} className="w-full rounded-lg py-1" />
          </Form.Item>
          <Form.Item
            name="HeSoLuong"
            label={<span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Hệ số Lương</span>}
            rules={[{ required: true, message: 'Vui lòng nhập hệ số' }]}
          >
            <InputNumber step={0.01} min={0} className="w-full rounded-lg py-1" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SalaryScaleList;
