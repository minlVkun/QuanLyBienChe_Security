import React, { useState, useCallback } from 'react';
import { Download, Plus, Trash2, Edit, Blocks } from 'lucide-react';

// Nhập các Reusable UI Components vừa tạo
import CustomButton from '../components/shared/CustomButton';
import SearchBar from '../components/shared/SearchBar';
import CustomSelect from '../components/shared/CustomSelect';
import Pagination from '../components/shared/Pagination';

const ComponentDemo = () => {
  // State quản lý cho Pagination
  const [currentPage, setCurrentPage] = useState(1);
  
  // State quản lý cho SearchBar
  const [searchValue, setSearchValue] = useState('');
  
  // State quản lý cho CustomSelect
  const [roleFilter, setRoleFilter] = useState('');
  
  // State quản lý Loading cho Button
  const [isSimulatingLoad, setIsSimulatingLoad] = useState(false);

  // Giả lập danh sách options cho Select
  const roleOptions = [
    { value: 'admin', label: 'Quản trị viên' },
    { value: 'manager', label: 'Quản lý' },
    { value: 'staff', label: 'Nhân viên' }
  ];

  // Callback hứng giá trị từ SearchBar (Debounced)
  const handleSearch = useCallback((val) => {
    setSearchValue(val);
    setCurrentPage(1); // Reset page về 1 khi tìm kiếm mới
  }, []);

  // Hàm test trạng thái Loading của Button
  const handleSimulateLoad = () => {
    setIsSimulatingLoad(true);
    // Giả lập API call mất 2 giây
    setTimeout(() => setIsSimulatingLoad(false), 2000);
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50/50 font-sans">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <Blocks className="text-blue-600" size={28} />
            </div>
            Thư viện UI Components
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            Ví dụ trực quan về cách tái sử dụng các components trong dự án. Các components được thiết kế linh hoạt, nhận dữ liệu qua Props.
          </p>
        </div>

        {/* 1. CustomButton Demo */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs">1</span> 
            Custom Buttons
          </h2>
          
          <div className="flex flex-wrap gap-4 items-center">
            {/* Primary Button */}
            <CustomButton variant="primary" icon={Plus}>
              Thêm Mới
            </CustomButton>
            
            {/* Secondary Button */}
            <CustomButton variant="secondary" icon={Edit}>
              Chỉnh Sửa
            </CustomButton>
            
            {/* Danger Button */}
            <CustomButton variant="danger" icon={Trash2}>
              Xóa Dữ Liệu
            </CustomButton>
            
            {/* Outline Button */}
            <CustomButton variant="outline" icon={Download}>
              Xuất Excel
            </CustomButton>
            
            {/* Loading Button */}
            <CustomButton 
              variant="primary" 
              isLoading={isSimulatingLoad} 
              onClick={handleSimulateLoad}
            >
              Test Loading API
            </CustomButton>
            
            {/* Disabled Button */}
            <CustomButton variant="primary" isDisabled>
              Vô hiệu hóa
            </CustomButton>
          </div>
        </section>

        {/* 2. Filters & Search Demo */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs">2</span> 
            Search & Select (Toolbar)
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
            {/* Search Bar */}
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Tìm kiếm bằng Debounce (500ms)
              </label>
              <SearchBar 
                onSearch={handleSearch} 
                placeholder="Nhập từ khóa tìm kiếm..."
              />
            </div>
            
            {/* Custom Select */}
            <div className="w-full sm:w-64">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Dropdown Filter
              </label>
              <CustomSelect 
                options={roleOptions}
                value={roleFilter}
                onChange={setRoleFilter}
                placeholder="Tất cả chức vụ"
              />
            </div>
          </div>

          {/* Hiển thị State để test */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800 font-mono">
            <strong>Trạng thái State hiện tại (từ Component cha):</strong>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Từ khóa Search: <span className="font-bold bg-white px-2 py-0.5 rounded text-blue-600">{searchValue || 'Trống'}</span></li>
              <li>Chức vụ Select: <span className="font-bold bg-white px-2 py-0.5 rounded text-blue-600">{roleFilter || 'Trống'}</span></li>
            </ul>
          </div>
        </section>

        {/* 3. Pagination Demo */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs">3</span> 
            Pagination (Phân trang logic)
          </h2>
          
          <p className="text-sm text-gray-500 mb-6 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
            Thử click vào các trang khác nhau để xem thuật toán rút gọn số trang (dấu ba chấm ...) hoạt động.
          </p>
          
          {/* Pagination Component */}
          <Pagination 
            currentPage={currentPage}
            totalPages={12} // Giả lập tổng số trang là 12
            onPageChange={setCurrentPage}
          />

          <div className="mt-8 text-center text-sm font-medium text-gray-500">
            Đang hiển thị dữ liệu của trang <span className="text-blue-600 font-black text-xl mx-1">{currentPage}</span>
          </div>
        </section>

      </div>
    </div>
  );
};

export default ComponentDemo;
