import React, { useState, useEffect } from 'react';
import { Modal, Input, InputNumber, Select, message, Spin, Form, Row, Col, Divider, Statistic, Alert } from 'antd';
import { FileEdit, Search, Calculator, CheckCircle2 } from 'lucide-react';
import dayjs from 'dayjs';
import salaryService from '../../services/Payroll/salaryService';
import SalaryScaleSelect from '../shared/SalaryScaleSelect';

const AddMonthlySalaryModal = ({ isOpen, onClose, onRefresh }) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  // Khởi tạo các giá trị tháng/năm
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = dayjs().subtract(i, 'month');
    return { value: d.format('MM/YYYY'), label: `Tháng ${d.format('MM/YYYY')}` };
  });

  useEffect(() => {
    if (isOpen) {
      form.resetFields();
      setPreviewData(null);
      form.setFieldsValue({
        thangNam: dayjs().format('MM/YYYY'),
        luongCoBan: 2340000,
        phuCap: 0,
        khauTru: 0,
      });
    }
  }, [isOpen, form]);

  // HÀM QUAN TRỌNG: Gọi API Preview để tính toán từ Chấm công
  const handleCalculatePreview = async () => {
    try {
      const values = await form.validateFields(['maNhanVien', 'thangNam', 'luongCoBan']);
      setIsCalculating(true);
      
      const [thang, nam] = values.thangNam.split('/');
      const res = await salaryService.calculatePreview({
        maNhanVien: values.maNhanVien,
        thang: parseInt(thang, 10),
        nam: parseInt(nam, 10),
        luongCoBan: values.luongCoBan
      });

      if (res.success) {
        setPreviewData(res.data);
        form.setFieldsValue({
          heSoLuong: res.data.heSoLuong,
          phuCap: res.data.phuCap,
          khauTru: res.data.khauTruBH + res.data.tienPhatTre
        });
        message.success("Đã tính toán lương dựa trên Chấm công & Hồ sơ");
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi khi tính toán xem trước");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleFinish = async (values) => {
    if (!previewData) {
      return message.warning("Vui lòng nhấn 'Xem trước & Tính toán' trước khi lưu.");
    }

    try {
      setIsSubmitting(true);
      const [thang, nam] = values.thangNam.split('/');
      
      const payload = {
        maNhanVien: values.maNhanVien,
        thang: parseInt(thang, 10),
        nam: parseInt(nam, 10),
        heSoLuong: values.heSoLuong,
        luongCoBan: values.luongCoBan,
        phuCap: values.phuCap,
        khauTru: values.khauTru
      };

      await salaryService.postMonthlySalary(payload);
      
      message.success("Chốt lương cá nhân thành công!");
      onRefresh();
      onClose();
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi khi chốt lương");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-blue-600">
          <FileEdit size={20} />
          <span className="font-bold">Chốt Lương Cá Nhân (Tích hợp Chấm công)</span>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={isSubmitting}
      okText="Chốt & Lưu Lương"
      cancelText="Đóng"
      centered
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="mt-4"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item 
              name="maNhanVien" 
              label="Mã Nhân Viên" 
              rules={[{ required: true, message: 'Nhập mã NV' }]}
            >
              <Input placeholder="NV001..." />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              name="thangNam" 
              label="Kỳ Lương" 
              rules={[{ required: true, message: 'Chọn kỳ lương' }]}
            >
              <Select options={monthOptions} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item 
              name="luongCoBan" 
              label="Lương Cơ Sở" 
              rules={[{ required: true }]}
            >
              <InputNumber 
                className="w-full" 
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>
          </Col>
          <Col span={12} className="flex items-end pb-6">
            <button 
              type="button"
              onClick={handleCalculatePreview}
              disabled={isCalculating}
              className="w-full h-[32px] bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-sm"
            >
              {isCalculating ? <Spin size="small" /> : <Calculator size={16} />}
              Xem trước & Tính toán công
            </button>
          </Col>
        </Row>

        {previewData && (
          <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <Alert
              message={<span className="font-bold text-indigo-900">KẾT QUẢ TÍNH TOÁN DỰ KIẾN</span>}
              description={
                <div className="mt-2">
                  <Row gutter={[16, 16]}>
                    <Col span={6}>
                      <Statistic title="Ngày công" value={previewData.ngayCong} suffix="/ 26" valueStyle={{ fontSize: 16 }} />
                    </Col>
                    <Col span={6}>
                      <Statistic title="Phút trễ" value={previewData.tongPhutTre} valueStyle={{ fontSize: 16, color: '#cf1322' }} />
                    </Col>
                    <Col span={6}>
                      <Statistic title="Hệ số" value={previewData.heSoLuong} valueStyle={{ fontSize: 16 }} />
                    </Col>
                    <Col span={6}>
                      <Statistic 
                        title="Thực lĩnh" 
                        value={previewData.tongLuong} 
                        precision={0}
                        valueStyle={{ fontSize: 18, color: '#3f51b5', fontWeight: 'bold' }} 
                        suffix="đ"
                      />
                    </Col>
                  </Row>
                  <Divider className="my-2" />
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Lương theo công:</span>
                      <span className="font-medium text-gray-700">{previewData.luongTheoCong.toLocaleString()} đ</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phụ cấp cố định:</span>
                      <span className="font-medium text-gray-700">+{previewData.phuCap.toLocaleString()} đ</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Khấu trừ BH (10.5%):</span>
                      <span className="font-medium text-red-600">-{previewData.khauTruBH.toLocaleString()} đ</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phạt đi trễ/sớm:</span>
                      <span className="font-medium text-red-600">-{previewData.tienPhatTre.toLocaleString()} đ</span>
                    </div>
                  </div>
                </div>
              }
              type="info"
              showIcon
              icon={<CheckCircle2 className="text-indigo-600" />}
              className="bg-indigo-50 border-indigo-100"
            />
            
            <Divider orientation="left" plain><span className="text-xs text-gray-400">ĐIỀU CHỈNH THỦ CÔNG (NẾU CẦN)</span></Divider>
            
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="heSoLuong" label="Hệ số">
                   <SalaryScaleSelect />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="phuCap" label="Phụ cấp">
                  <InputNumber className="w-full" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="khauTru" label="Khấu trừ">
                  <InputNumber className="w-full" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                </Form.Item>
              </Col>
            </Row>
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default AddMonthlySalaryModal;
