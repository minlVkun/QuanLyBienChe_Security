import React from 'react';
import { Modal, Descriptions, Tag, Divider, Typography, Row, Col } from 'antd';
import { PrinterOutlined, DollarOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

/**
 * PayslipModal - Hiển thị chi tiết phiếu lương (Thực lĩnh = Lương + Phụ cấp - Khấu trừ)
 */
const PayslipModal = ({ open, onClose, payslip }) => {
  if (!payslip) return null;

  // Định dạng tiền tệ
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <DollarOutlined className="text-emerald-500" />
          <span>Chi tiết phiếu lương - {payslip.ThangNam}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      centered
      className="payslip-modal"
    >
      <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
        
        {/* Header Thông tin nhân viên */}
        <Row gutter={24} className="mb-6">
          <Col span={12}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                <UserOutlined />
              </div>
              <div>
                <Title level={5} style={{ margin: 0 }}>{payslip.HoTen}</Title>
                <Text type="secondary" className="text-xs">{payslip.MaNV}</Text>
              </div>
            </div>
          </Col>
          <Col span={12} className="text-right">
            <Text type="secondary" className="text-xs uppercase font-bold block mb-1">Kỳ lương</Text>
            <Tag color="blue" icon={<CalendarOutlined />} className="m-0 font-bold px-3 py-1 rounded-lg">
              {payslip.ThangNam}
            </Tag>
          </Col>
        </Row>

        <Divider className="my-4 border-gray-200" />

        {/* Bảng chi tiết lương */}
        <Descriptions 
          column={1} 
          bordered 
          size="small" 
          className="bg-white rounded-xl overflow-hidden shadow-sm"
          labelStyle={{ background: '#fafafa', fontWeight: 'bold', width: '250px' }}
        >
          <Descriptions.Item label="Lương cơ sở (Quy định)">
            {formatMoney(payslip.LuongCoSo || 0)}
          </Descriptions.Item>
          <Descriptions.Item label="Hệ số lương">
            <Tag color="purple" className="m-0 font-bold">x {payslip.HeSoLuong || 0}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Lương tính theo hệ số">
            <Text strong className="text-blue-600">
              {formatMoney((payslip.LuongCoSo || 0) * (payslip.HeSoLuong || 1))}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Phụ cấp">
            <Text className="text-emerald-600">
              + {formatMoney(payslip.PhuCap || 0)}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Các khoản khấu trừ (Bảo hiểm, Thuế...)">
            <Text type="danger">
              - {formatMoney(payslip.TienKhauTruBH || payslip.KhauTru || 0)}
            </Text>
          </Descriptions.Item>
        </Descriptions>

        {/* Tổng kết Thực lĩnh */}
        <div className="mt-6 p-5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-100 text-white flex justify-between items-center">
          <div>
            <Text className="text-emerald-50 block uppercase text-[10px] font-bold tracking-widest mb-1">Thực lĩnh tháng này</Text>
            <Title level={3} style={{ color: '#fff', margin: 0, fontWeight: 900 }}>
              {formatMoney(payslip.ThucLanh || 0)}
            </Title>
          </div>
          <PrinterOutlined className="text-3xl text-white/50 cursor-pointer hover:text-white transition-all" />
        </div>

        <div className="mt-4 text-center">
          <Text italic className="text-[10px] text-gray-400">
            Dữ liệu được trích xuất từ hệ thống HRM Security. Mọi thắc mắc vui lòng liên hệ phòng nhân sự.
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default PayslipModal;
