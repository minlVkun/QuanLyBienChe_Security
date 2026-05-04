import React, { useState, useEffect } from 'react';
import { Layout, Menu, Breadcrumb, Avatar, Dropdown, Badge, Drawer } from 'antd';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS, canAccessMenu } from '../utils/rbac';
import SessionExpiryModal from '../components/shared/SessionExpiryModal';
import ChangePasswordModal from '../components/shared/ChangePasswordModal';
import {
  LayoutDashboard,
  Users,
  Wallet,
  Settings,
  User,
  LogOut,
  Bell,
  ShieldCheck,
  Building2,
  UserCog,
  Briefcase,
  Layers,
  Menu as MenuIcon,
  LogIn
} from 'lucide-react';


const { Header, Content, Sider } = Layout;

const MainLayout = () => {
  const { user, logout } = useAuth(); // Dùng custom hook useAuth
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Kiểm tra kích thước màn hình để bật chế độ Mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // Breakpoint LG (1024px)
      if (window.innerWidth >= 1024) {
        setDrawerVisible(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // --- CẤU HÌNH MENU ITEMS ---
  const allMenuItems = [
    {
      key: '/dashboard',
      icon: <LayoutDashboard size={18} />,
      label: <Link to="/dashboard">Trang chủ</Link>,
    },
    {
      key: '/employees',
      icon: <Users size={18} />,
      label: <Link to="/employees">Danh sách nhân viên</Link>,
    },
    {
      key: '/departments',
      label: <Link to="/departments">Sơ đồ tổ chức</Link>,
      icon: <Building2 size={20} />,
    },
    {
      key: '/salary',
      icon: <Wallet size={18} />,
      label: <Link to="/salary">Quản lý lương</Link>,
    },
    {
      key: '/positions',
      icon: <Briefcase size={18} />,
      label: <Link to="/positions">Danh mục Chức vụ</Link>,
    },
    {
      key: '/salary-scales',
      icon: <Layers size={18} />,
      label: <Link to="/salary-scales">Ngạch/Bậc Lương</Link>,
    },
    {
      key: '/users',
      icon: <UserCog size={18} />,
      label: <Link to="/users">Quản trị tài khoản</Link>,
    },
    {
      key: '/audit',
      icon: <ShieldCheck size={18} />,
      label: <Link to="/audit">Nhật ký hệ thống</Link>,
    },
    {
      key: '/login-logs',
      icon: <LogIn size={18} />,
      label: <Link to="/login-logs">Nhật ký đăng nhập</Link>,
    }
  ];

  // Lọc menu theo quyền từ rbac.js
  const menuItems = allMenuItems.filter(item =>
    canAccessMenu(user?.role, item.key)
  );

  // Menu cho Dropdown Avatar
  const userDropdownItems = [
    {
      key: 'profile',
      label: 'Hồ sơ cá nhân',
      icon: <User size={16} />,
      onClick: () => navigate('/profile')
    },
    {
      key: 'settings',
      label: 'Đổi Mật Khẩu',
      icon: <Settings size={16} />,
      onClick: () => setIsChangePasswordModalOpen(true)
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogOut size={16} />,
      danger: true,
      onClick: handleLogout
    },
  ];

  // Giao diện chung của Menu và Logo (Để tái sử dụng cho cả Sider và Drawer)
  const SidebarContent = (
    <div className="h-full flex flex-col bg-white">
      <div className="h-16 flex items-center justify-center border-b border-gray-50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-200">
            <ShieldCheck className="text-white" size={20} />
          </div>
          {(!collapsed || isMobile) && (
            <span className="text-lg font-bold text-gray-800 tracking-tighter">
              SECURITY <span className="text-blue-600">PRO</span>
            </span>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          className="mt-4 border-none px-3"
          items={menuItems}
          onClick={() => {
            if (isMobile) setDrawerVisible(false); // Tự đóng drawer khi click trên mobile
          }}
        />
      </div>
    </div>
  );

  return (
    <Layout className="min-h-screen bg-[#f8fafc]">
      {/* 1. SIDEBAR CHO MÀN HÌNH LỚN (PC/Tablet) */}
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          theme="light"
          className="shadow-xl fixed left-0 top-0 bottom-0 z-50 h-screen"
          width={260}
          collapsedWidth={80}
        >
          {SidebarContent}
        </Sider>
      )}

      {/* 2. DRAWER CHO MÀN HÌNH NHỎ (Mobile) */}
      <Drawer
        placement="left"
        closable={false}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        styles={{ body: { padding: 0 }, wrapper: { width: 280 } }}
      >
        {SidebarContent}
      </Drawer>

      {/* 3. WRAPPER CHỨA HEADER & CONTENT (Đẩy lề theo trạng thái Sidebar) */}
      <Layout
        style={{
          marginLeft: isMobile ? 0 : (collapsed ? 80 : 260),
          transition: 'margin-left 0.2s ease',
          minHeight: '100vh'
        }}
      >
        {/* HEADER (Cố định ở trên cùng) */}
        <Header className="bg-white px-4 md:px-6 flex items-center justify-between shadow-sm border-b border-gray-100 sticky top-0 z-40 h-16 w-full">

          <div className="flex items-center gap-4">
            {/* Nút Hamburger (Chỉ hiện trên Mobile) */}
            {isMobile && (
              <button
                onClick={() => setDrawerVisible(true)}
                className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MenuIcon size={24} />
              </button>
            )}

            {/* Breadcrumb (Ẩn trên màn hình quá nhỏ) */}
            <div className="hidden sm:block">
              <Breadcrumb
                items={[
                  { title: <span className="text-gray-400">Hệ thống</span> },
                  { title: <span className="font-semibold text-gray-700 capitalize">{location.pathname.replace('/', '') || 'DASHBOARD'}</span> },
                ]}
              />
            </div>
          </div>

          {/* Menu Phải: Notification & Profile */}
          <div className="flex items-center gap-4 md:gap-5">
            {/* Chuông thông báo */}
            <Badge count={3} size="small" className="cursor-pointer">
              <Bell className="text-gray-500 hover:text-blue-600 transition-colors" size={20} />
            </Badge>

            <div className="w-[1px] h-6 bg-gray-200"></div>

            {/* User Profile */}
            <Dropdown menu={{ items: userDropdownItems }} placement="bottomRight" trigger={['click']} arrow>
              <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-lg transition-all">
                {/* Thông tin Text (Ẩn trên Mobile) */}
                <div className="text-right hidden sm:flex flex-col justify-center h-full">
                  <p className="text-sm font-bold text-gray-800 m-0 leading-none">
                    {user?.HoTen || user?.username || 'Thành viên'}
                  </p>
                  <p className="text-[10px] text-blue-600 font-semibold m-0 mt-1 uppercase tracking-wider leading-none">
                    {ROLE_LABELS[user?.role] || 'Nhân viên'}
                  </p>
                </div>

                {/* Avatar Tròn */}
                <Avatar
                  size={36}
                  className="bg-blue-600 flex items-center justify-center shadow-sm flex-shrink-0"
                  icon={<User size={18} />}
                />
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* CONTENT AREA (Vùng chứa nội dung trang con) */}
        <Content className="relative flex flex-col w-full h-full">
          <div className="max-w-7xl mx-auto w-full flex-1">
            <Outlet />
          </div>
        </Content>

        {/* FOOTER */}
        <footer className="bg-transparent py-4 px-8 text-center text-gray-400 text-[11px] mt-auto">
          © 2026 Hệ thống Quản lý Nhân sự Bảo mật - SCA Duy Tan University
        </footer>
      </Layout>

      {/* OVERRIDE STYLE CHO ANT DESIGN MƯỢT MÀ HƠN */}
      <style>{`
        .ant-menu-item {
          border-radius: 8px !important;
          margin-bottom: 4px !important;
        }
        .ant-menu-item-selected {
          background-color: #eff6ff !important;
          color: #2563eb !important;
          font-weight: 600;
        }
        .ant-layout-sider-trigger {
          background: #f9fafb !important;
          color: #1f2937 !important;
          border-top: 1px solid #f3f4f6;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: #94a3b8;
        }
      `}</style>
      <SessionExpiryModal />
      <ChangePasswordModal 
        isOpen={isChangePasswordModalOpen} 
        onClose={() => setIsChangePasswordModalOpen(false)} 
      />
    </Layout>
  );
};

export default MainLayout;