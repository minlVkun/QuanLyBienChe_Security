import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Clock, CheckCircle2, AlertCircle, Plus, Edit, Trash2 } from 'lucide-react';
import { Typography, Spin, message, Tag, Button, Popconfirm, Space, Tooltip } from 'antd';
import dayjs from 'dayjs';
import contractService from '../../../services/Payroll/contractService';
import ContractFormModal from '../ContractFormModal';

const { Title } = Typography;

const TabContract = ({ employeeId }) => {
    const [loading, setLoading] = useState(false);
    const [contracts, setContracts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedContract, setSelectedContract] = useState(null);

    useEffect(() => {
        if (employeeId) {
            fetchContracts();
        }
    }, [employeeId]);

    const fetchContracts = async () => {
        setLoading(true);
        try {
            const res = await contractService.getByEmployeeId(employeeId);
            if (res.success) {
                setContracts(res.data);
            }
        } catch (error) {
            message.error('Không tải được danh sách hợp đồng');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setSelectedContract(null);
        setIsModalOpen(true);
    };

    const handleEdit = (contract) => {
        setSelectedContract(contract);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            const res = await contractService.delete(id);
            if (res.success) {
                message.success('Đã xóa hợp đồng');
                fetchContracts();
            } else {
                message.error(res.message || 'Lỗi khi xóa');
            }
        } catch (error) {
            message.error('Lỗi hệ thống');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pt-2">
            {/* --- HEADER --- */}
            <div className="flex items-center justify-between mb-4">
                <Title level={5} className="flex items-center gap-2 !mb-0 text-gray-800">
                    <FileText className="w-5 h-5 text-blue-600" /> Danh sách hợp đồng
                </Title>
                <Button
                    type="primary"
                    icon={<Plus className="w-4 h-4 mr-1 inline" />}
                    onClick={handleAdd}
                    className="bg-blue-600"
                >
                    Thêm hợp đồng
                </Button>
            </div>

            {/* --- CONTENT AREA --- */}
            {loading ? (
                <div className="flex justify-center py-12"><Spin /></div>
            ) : contracts && contracts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contracts.map((contract) => (
                        <div key={contract.MaHopDong} className="p-5 border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all relative">

                            {/* Header của từng thẻ Hợp đồng */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                    <h4 className="text-base font-bold text-gray-900">{contract.MaHopDong}</h4>
                                    <p className="text-sm font-medium text-blue-600">{contract.LoaiHopDong}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <Tag color={contract.TrangThai === 'Đang hiệu lực' ? 'success' : 'default'} className="rounded-full px-3 font-semibold border-0 m-0">
                                        {contract.TrangThai}
                                    </Tag>
                                    <Space>
                                        <Tooltip title="Chỉnh sửa">
                                            <Button
                                                size="small"
                                                icon={<Edit className="w-3.5 h-3.5" />}
                                                onClick={() => handleEdit(contract)}
                                                className="text-gray-400 hover:text-blue-600 border-none bg-transparent shadow-none"
                                            />
                                        </Tooltip>
                                        <Tooltip title="Xóa">
                                            <Popconfirm
                                                title="Xóa hợp đồng?"
                                                description="Hành động này không thể hoàn tác."
                                                onConfirm={() => handleDelete(contract.MaHopDong)}
                                                okText="Xóa"
                                                cancelText="Hủy"
                                                okButtonProps={{ danger: true, className: 'bg-red-600' }}
                                            >
                                                <Button
                                                    size="small"
                                                    danger
                                                    icon={<Trash2 className="w-3.5 h-3.5" />}
                                                    className="border-none bg-transparent shadow-none opacity-50 hover:opacity-100"
                                                />
                                            </Popconfirm>
                                        </Tooltip>
                                    </Space>
                                </div>
                            </div>

                            {/* Nội dung chi tiết (Ngày tháng) */}
                            <div className="space-y-2 mt-4 bg-gray-50/50 p-4 rounded-lg border border-gray-50">
                                <div className="flex items-center text-sm">
                                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                    <span className="text-gray-500 w-28">Ngày ký:</span>
                                    <span className="font-semibold text-gray-900">{dayjs(contract.NgayKy).format('DD/MM/YYYY')}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" />
                                    <span className="text-gray-500 w-28">Hiệu lực:</span>
                                    <span className="font-semibold text-gray-900">{dayjs(contract.NgayCoHieuLuc).format('DD/MM/YYYY')}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <Clock className="w-4 h-4 mr-2 text-rose-400" />
                                    <span className="text-gray-500 w-28">Hết hạn:</span>
                                    <span className="font-semibold text-gray-900">{contract.NgayHetHan ? dayjs(contract.NgayHetHan).format('DD/MM/YYYY') : 'Không thời hạn'}</span>
                                </div>
                            </div>

                            {/* SECURE DOWNLOAD BUTTON */}
                            {contract.TepDinhKem && (
                                <div className="mt-4 pt-4 border-t border-gray-100 text-right">
                                    <Button
                                        type="link"
                                        onClick={async () => {
                                            try {
                                                const response = await contractService.downloadFile(contract.TepDinhKem);
                                                const url = window.URL.createObjectURL(new Blob([response]));
                                                const link = document.createElement('a');
                                                link.href = url;
                                                link.setAttribute('download', contract.TepDinhKem);
                                                document.body.appendChild(link);
                                                link.click();
                                                link.remove();
                                            } catch (error) {
                                                message.error("Không có quyền tải file hoặc file không tồn tại!");
                                            }
                                        }}
                                        className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors p-0"
                                    >
                                        <FileText className="w-4 h-4 mr-1" /> Tải/Xem bản scan PDF
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/30">
                    <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-base font-semibold text-gray-600">Chưa có hợp đồng nào</h3>
                    <p className="text-sm text-gray-400 mt-1">Nhân viên này chưa được ghi nhận hợp đồng trong hệ thống.</p>
                </div>
            )}

            {/* --- MODAL --- */}
            <ContractFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onRefresh={fetchContracts}
                employeeId={employeeId}
                initialData={selectedContract}
            />
        </div>
    );
};

export default TabContract; 