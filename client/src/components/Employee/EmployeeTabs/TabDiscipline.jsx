import React from 'react';
import { Award, Plus, Edit, Trash2 } from 'lucide-react';

const TabDiscipline = ({ disciplines, onAdd, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "---";
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex justify-end mb-4 px-6 pt-6">
        <button 
          onClick={onAdd}
          className="flex items-center text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Thêm quyết định
        </button>
      </div>

      <div className="px-6 pb-6">
        {disciplines && disciplines.length > 0 ? (
          <div className="space-y-4">
            {disciplines.map((item, index) => (
              <div key={item.RecordID || `discipline-${index}`} className={`group relative p-5 border rounded-xl flex flex-col sm:flex-row sm:items-start gap-4 transition-all hover:shadow-sm ${item.Loai === 'Khen thưởng' ? 'border-emerald-100 bg-emerald-50/20 hover:border-emerald-300' : 'border-red-100 bg-red-50/20 hover:border-red-300'}`}>
                
                <Award className={`w-8 h-8 shrink-0 mt-1 ${item.Loai === 'Khen thưởng' ? 'text-emerald-500' : 'text-red-500'}`} />
                
                <div className="flex-1 pr-16">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-900 text-base">{item.Loai}</h4>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white border text-gray-600 shadow-sm">
                      Ngày QĐ: {formatDate(item.NgayQuyetDinh)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mt-2">{item.NoiDung}</p>
                </div>

                <div className="absolute top-4 right-4 flex gap-2 opacity-50 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button 
                    onClick={() => onEdit(item)} 
                    className="p-1.5 text-gray-500 hover:text-blue-600 bg-white rounded-md shadow-sm border hover:border-blue-200"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDelete(item.RecordID)} 
                    className="p-1.5 text-gray-500 hover:text-red-600 bg-white rounded-md shadow-sm border hover:border-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
            <Award className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Chưa có dữ liệu khen thưởng/kỷ luật.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TabDiscipline;