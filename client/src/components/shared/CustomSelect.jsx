import React from 'react';
import { ChevronDown } from 'lucide-react';

const CustomSelect = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Chọn tùy chọn...", 
  className = "",
  disabled = false
}) => {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
        <ChevronDown className={`w-4 h-4 ${disabled ? 'text-gray-300' : 'text-gray-500'}`} />
      </div>
    </div>
  );
};

export default CustomSelect;
