import React from 'react';
import { History, Briefcase, Calendar, Building2, ArrowRightLeft } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const TabWorkHistory = ({ workHistories, onTransfer }) => {
  const { user } = useAuth();
  const canTransfer = ['db_Admin', 'db_HR_Human'].includes(user?.role);

  const formatDate = (dateString) => {
    if (!dateString) return "---";
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="animate-in fade-in duration-300 p-6">
      {/* Header với nút Điều động */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider flex items-center gap-2">
          <History className="w-4 h-4 text-blue-500" /> Quá trình công tác
        </h3>
        {canTransfer && onTransfer && (
          <button
            onClick={onTransfer}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-100"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Điều động / Bổ nhiệm
          </button>
        )}
      </div>

      {workHistories && workHistories.length > 0 ? (
        <div className="relative space-y-6 pl-6 ml-2">
          <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-gray-200"></div>
          
          {workHistories.map((item) => (
            <div key={item.ID_CT} className="relative group">
              <div className="absolute -left-[29px] mt-1.5 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm group-hover:scale-125 group-hover:bg-blue-600 transition-transform"></div>
              
              <div className="bg-white border border-gray-100 rounded-xl p-5 hover:border-blue-200 hover:shadow-md transition-all shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <h4 className="font-bold text-gray-900 text-lg flex items-center">
                    <Briefcase className="w-4 h-4 mr-2 text-blue-600" />
                    {item.TenChucVu}
                  </h4>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 shrink-0">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDate(item.TuNgay)} 
                    <span className="mx-1 text-gray-400">→</span> 
                    <span className={!item.DenNgay ? "text-emerald-600 font-bold" : ""}>
                      {item.DenNgay ? formatDate(item.DenNgay) : "Nay"}
                    </span>
                  </div>
                </div>
                
                <p className="text-blue-700 font-medium text-sm mb-3 flex items-center">
                  <Building2 className="w-4 h-4 mr-2 text-blue-400" />
                  {item.TenDonVi}
                </p>
                
                {item.NoiDung && (
                  <div className="bg-gray-50/80 p-3 rounded-lg border border-gray-100">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <span className="font-semibold text-gray-900 mr-1">Nội dung:</span> 
                      {item.NoiDung}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <History className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Chưa có dữ liệu quá trình công tác.</p>
        </div>
      )}
    </div>
  );
};

export default TabWorkHistory;