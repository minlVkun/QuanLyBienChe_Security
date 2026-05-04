import React, { useState, useEffect } from 'react';
import { Modal, Input, InputNumber, Select, message, Spin, Form, Row, Col } from 'antd';
import { FileEdit, Search } from 'lucide-react';
import dayjs from 'dayjs';
import salaryService from '../../services/Payroll/salaryService';
import SalaryScaleSelect from '../shared/SalaryScaleSelect';

const AddMonthlySalaryModal = ({ isOpen, onClose, onRefresh }) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState(false);

  // Khởi tạo các giá trị tháng/năm
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = dayjs().subtract(i, 'month');
    return { value: d.format('MM/YYYY'), label: `Tháng ${d.format('MM/YYYY')}` };
  });

  useEffect(() => {
    if (isOpen) {
      form.resetFields();
      form.setFieldsValue({
        thangNam: dayjs().format('MM/YYYY'),
        luongCoBan: 2340000,
        phuCap: 500000,
        khauTru: 0,
      });
    }
  }, [isOpen, form]);

  const handleFetchCurrentSalary = async () => {
    const maNV = form.getFieldValue('maNhanVien');
    if (!maNV) {
      return message.warning("Vui lòng nhập Mã nhân viên trước");
    }

    try {
      setIsLoadingEmployee(true);
      const res = await salaryService.getCurrentSalary(maNV);
      const currentSalary = res.data;

      if (!currentSalary) {
        return message.error("Nhân viên này chưa có ngạch bậc lương hiện hành");
      }

      form.setFieldsValue({
        heSoLuong: currentSalary.HeSoLuong || 0,
        luongCoBan: 2340000, // Lương cơ sở mặc định hoặc lấy từ cấu hình
      });
      message.success("Đã lấy thông tin lương hiện hành");
    } catch (error) {
      message.error("Không tìm thấy thông tin lương của nhân viên này");
    } finally {
      setIsLoadingEmployee(false);
    }
  };

  const handleFinish = async (values) => {
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
          <span className="font-bold">Chốt Lương Cá Nhân (Thủ công)</span>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={isSubmitting}
      okText="Lưu dữ liệu"
      cancelText="Hủy bỏ"
      centered
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="mt-4"
      >
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item 
              name="maNhanVien" 
              label="Mã Nhân Viên" 
              rules={[{ required: true, message: 'Vui lòng nhập mã NV' }]}
            >
              <Input placeholder="Nhập mã nhân viên (VD: NV001)" />
            </Form.Item>
          </Col>
          <Col span={8} className="flex items-end pb-6">
            <button 
              type="button"
              onClick={handleFetchCurrentSalary}
              disabled={isLoadingEmployee}
              className="w-full h-[32px] bg-blue-50 text-blue-600 font-medium rounded-lg border border-blue-200 hover:bg-blue-100 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isLoadingEmployee ? <Spin size="small" /> : <Search size={16} />}
              Lấy HS Lương
            </button>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item 
              name="thangNam" 
              label="Kỳ Lương" 
              rules={[{ required: true, message: 'Vui lòng chọn kỳ lương' }]}
            >
              <Select options={monthOptions} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              name="heSoLuong" 
              label="Hệ Số Lương" 
              rules={[{ required: true, message: 'Vui lòng chọn hệ số lương' }]}
            >
              <SalaryScaleSelect />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item 
              name="luongCoBan" 
              label="Lương Cơ Sở" 
              rules={[{ required: true, message: 'Vui lòng nhập lương cơ sở' }]}
            >
              <InputNumber 
                className="w-full" 
                placeholder="Ví dụ: 2,340,000"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item 
              name="phuCap" 
              label="Phụ Cấp" 
              rules={[{ required: true, message: 'Vui lòng nhập phụ cấp' }]}
            >
              <InputNumber 
                className="w-full" 
                min={0}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item 
              name="khauTru" 
              label="Khấu Trừ" 
              rules={[{ required: true, message: 'Vui lòng nhập tiền khấu trừ' }]}
            >
              <InputNumber 
                className="w-full" 
                min={0}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>
          </Col>
        </Row>
        
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-2">
          <p className="text-xs text-blue-800 italic m-0">
            * <b>Thực lĩnh</b> sẽ được hệ thống tính toán tự động dựa trên công thức: <br/>
            <code>(Hệ số lương x Lương cơ sở) + Phụ cấp - Khấu trừ</code>
          </p>
        </div>
      </Form>
    </Modal>
  );
};

export default AddMonthlySalaryModal;
