import React, { useState, useEffect } from 'react';
import { Select, Tag, Spin } from 'antd';
import salaryService from '../../services/Payroll/salaryService';

const SalaryScaleSelect = ({ value, onChange, placeholder = "Chọn hệ số lương", ...props }) => {
  const [loading, setLoading] = useState(false);
  const [scales, setScales] = useState([]);

  useEffect(() => {
    const fetchScales = async () => {
      try {
        setLoading(true);
        const res = await salaryService.getScales();
        if (res.success) {
          // Format dữ liệu: Group theo mã ngạch để dễ nhìn
          const formatted = res.data.map(item => ({
            value: item.HeSoLuong, // Giá trị lưu là hệ số
            label: (
              <div className="flex justify-between items-center w-full">
                <span>
                  <Tag color="blue" className="mr-2">{item.MaNgach}</Tag>
                  <span className="text-gray-500 text-xs">Bậc {item.BacLuong}</span>
                </span>
                <span className="font-bold text-blue-600">HS: {item.HeSoLuong}</span>
              </div>
            ),
            searchLabel: `${item.MaNgach} ${item.HeSoLuong} Bậc ${item.BacLuong}`, // Dùng để search
            heSo: item.HeSoLuong,
            maNgach: item.MaNgach,
            bac: item.BacLuong
          }));
          setScales(formatted);
        }
      } catch (error) {
        console.error("Lỗi lấy danh mục ngạch bậc:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchScales();
  }, []);

  return (
    <Select
      showSearch
      loading={loading}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      optionFilterProp="searchLabel"
      notFoundContent={loading ? <Spin size="small" /> : "Không có dữ liệu"}
      className="w-full"
      {...props}
    >
      {scales.map((item, index) => (
        <Select.Option key={index} value={item.value} searchLabel={item.searchLabel}>
          {item.label}
        </Select.Option>
      ))}
    </Select>
  );
};

export default SalaryScaleSelect;
