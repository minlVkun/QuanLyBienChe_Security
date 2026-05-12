import React from 'react';
import { Plus, BookOpen, Building2, Edit, Trash2 } from 'lucide-react';

const TabDegrees = ({ degrees, onAdd, onEdit, onDelete, canEdit }) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {canEdit && (
        <div className="flex justify-end mb-4 px-6 pt-6">
          <button 
            onClick={onAdd}
            className="flex items-center text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Thêm bằng cấp
          </button>
        </div>
      )}

      <div className="px-6 pb-6 space-y-4">
        {degrees && degrees.length > 0 ? (
          degrees.map((deg) => (
            <div key={deg.ID_Bang} className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-all gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900 mb-1">{deg.LoaiBang} - {deg.ChuyenNganh}</h4>
                  <p className="text-sm text-gray-500 flex items-center">
                    <Building2 className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> {deg.NoiDaoTao}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-3 shrink-0">
                <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 w-fit">
                  Năm tốt nghiệp: {deg.NamTotNghiep}
                </span>
                
                {canEdit && (
                  <div className="flex gap-2 opacity-50 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button 
                      onClick={() => onEdit(deg)} 
                      className="p-2 text-gray-500 hover:text-blue-600 bg-white rounded-lg shadow-sm border hover:border-blue-200 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(deg.ID_Bang)} 
                      className="p-2 text-gray-500 hover:text-red-600 bg-white rounded-lg shadow-sm border hover:border-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-8 text-sm">Chưa có thông tin bằng cấp.</p>
        )}
      </div>
    </div>
  );
};

export default TabDegrees;