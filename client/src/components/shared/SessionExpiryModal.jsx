import React, { useState, useEffect } from 'react';
import { Modal, Input, message } from 'antd';
import { ShieldAlert } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

const SessionExpiryModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, updateToken, logout } = useAuth();

  useEffect(() => {
    const handleExpiry = () => setIsOpen(true);
    window.addEventListener('auth:expired', handleExpiry);
    return () => window.removeEventListener('auth:expired', handleExpiry);
  }, []);

  const handleConfirm = async () => {
    if (!password) {
      message.error("Vui lòng nhập mật khẩu");
      return;
    }
    setLoading(true);
    try {
      // Dùng username lưu trong user state (thường là Username)
      const res = await axiosClient.post('/auth/login', { 
        username: user?.Username || user?.username, 
        password 
      });

      // Kiểm tra cấu trúc dữ liệu trả về từ axios (res.data)
      const apiData = res.data;
      // Backend trả về: { success: true, data: { token, user }, message }
      if (apiData && apiData.data && apiData.data.token) {
        // Cập nhật token và state (Silent Re-auth)
        updateToken(apiData.data.token, apiData.data.user);
        
        message.success('Phiên làm việc đã được gia hạn thành công!');
        setPassword('');
        setIsOpen(false);
      } else {
        throw new Error("Phản hồi từ máy chủ không hợp lệ");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Mật khẩu không đúng hoặc lỗi kết nối";
      message.error(errorMsg);
      // Thông báo cho axiosClient nếu refresh thất bại (để reject hàng chờ)
      const { onTokenRefreshFailed } = require('../../api/axiosClient');
      onTokenRefreshFailed(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    logout();
    window.location.href = '/login';
  };

  // Ẩn modal nếu chưa mở
  if (!isOpen) return null;

  return (
    <Modal
      title={<div className="flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-red-500" />Phiên làm việc hết hạn</div>}
      open={isOpen}
      centered
      closable={false}
      mask={{ closable: false }}
      onOk={handleConfirm}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Tiếp tục làm việc"
      cancelText="Đăng xuất"
      keyboard={false}
      zIndex={9999}
    >
      <p className="mb-4 text-gray-600">
        Phiên đăng nhập của bạn đã hết hạn để đảm bảo an toàn. Vui lòng nhập lại mật khẩu để tiếp tục mà không bị mất dữ liệu đang nhập dở.
      </p>
      <Input.Password
        placeholder="Nhập mật khẩu"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onPressEnter={handleConfirm}
      />
    </Modal>
  );
};

export default SessionExpiryModal;
