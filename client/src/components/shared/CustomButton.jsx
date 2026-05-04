import React from 'react';
import { Loader2 } from 'lucide-react';

const CustomButton = ({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  isDisabled = false, 
  icon: Icon, 
  onClick, 
  className = '', 
  type = 'button',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2";
  const sizeStyles = "px-4 py-2 text-sm";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm shadow-blue-200 border border-transparent",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 border border-transparent",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-sm shadow-red-200 border border-transparent",
    outline: "bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500 border border-gray-200 shadow-sm"
  };

  const disabledStyles = (isDisabled || isLoading) ? "opacity-60 cursor-not-allowed pointer-events-none" : "active:scale-[0.98]";

  return (
    <button
      type={type}
      className={`${baseStyles} ${sizeStyles} ${variants[variant]} ${disabledStyles} ${className}`}
      onClick={onClick}
      disabled={isDisabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : Icon ? (
        <Icon className={`w-4 h-4 ${children ? 'mr-2' : ''}`} />
      ) : null}
      {children}
    </button>
  );
};

export default CustomButton;
