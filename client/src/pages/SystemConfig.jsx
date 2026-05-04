import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Card, Typography, Space, Tag, Select, Popconfirm } from 'antd';
import { Settings, Edit2, Save, RefreshCw, Plus, Trash2 } from 'lucide-react';
import configService from '../services/System/configService';

const { Title, Text } = Typography;
const { Option } = Select;

const SystemConfig = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const res = await configService.getAll();
      if (res.success) {
        setConfigs(res.data);
      }
    } catch (error) {
      message.error('Không thể tải danh sách cấu hình');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleOpenCreate = () => {
    setIsCreateMode(true);
    setEditingConfig(null);
    form.resetFields();
    form.setFieldsValue({ ValueType: 'string' });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setIsCreateMode(false);
    setEditingConfig(record);
    form.setFieldsValue({
      ConfigKey: record.ConfigKey,
      ConfigValue: record.ConfigValue,
      Description: record.Description,
      ValueType: record.ValueType || 'string'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (key) => {
    try {
      const res = await configService.delete(key);
      if (res.success) {
        message.success(res.message);
        fetchConfigs();
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi xóa cấu hình');
    }
  };

  const handleSubmit = async (values) => {
    setSubmitLoading(true);
    try {
      if (isCreateMode) {
        const res = await configService.create({
          key: values.ConfigKey,
          value: values.ConfigValue,
          description: values.Description,
          type: values.ValueType
        });
        if (res.success) {
          message.success(res.message);
          setIsModalOpen(false);
          fetchConfigs();
        }
      } else {
        const res = await configService.update(
          editingConfig.ConfigKey, 
          values.ConfigValue, 
          values.Description
        );
        if (res.success) {
          message.success(res.message);
          setIsModalOpen(false);
          fetchConfigs();
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Lỗi khi xử lý cấu hình';
      message.error(errorMsg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const columns = [
    {
      title: 'Key',
      dataIndex: 'ConfigKey',
      key: 'ConfigKey',
      render: (text) => <Text strong className="text-blue-600">{text}</Text>
    },
    {
      title: 'Giá trị',
      dataIndex: 'ConfigValue',
      key: 'ConfigValue',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Tag color="blue">{text}</Tag>
          <Text type="secondary" style={{ fontSize: '10px' }}>Type: {record.ValueType}</Text>
        </Space>
      )
    },
    {
      title: 'Mô tả',
      dataIndex: 'Description',
      key: 'Description',
      render: (text) => <Text type="secondary">{text}</Text>
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<Edit2 size={16} className="text-blue-500" />} 
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Xác nhận xóa?"
            description="Dữ liệu cấu hình sẽ bị xóa vĩnh viễn và ghi vào audit log."
            onConfirm={() => handleDelete(record.ConfigKey)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button 
              type="text" 
              danger
              icon={<Trash2 size={16} />} 
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card 
        title={
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            <Title level={4} style={{ margin: 0 }}>Cấu hình Hệ thống</Title>
          </div>
        }
        extra={
          <Space>
            <Button 
              type="primary"
              icon={<Plus size={16} />}
              onClick={handleOpenCreate}
            >
              Thêm mới
            </Button>
            <Button 
              icon={<RefreshCw size={16} className={loading ? 'animate-spin' : ''} />} 
              onClick={fetchConfigs}
              loading={loading}
            >
              Làm mới
            </Button>
          </Space>
        }
      >
        <Table 
          columns={columns} 
          dataSource={configs} 
          rowKey="ConfigKey"
          loading={loading}
          pagination={false}
          bordered
        />
      </Card>

      <Modal
        title={
          <div className="flex items-center gap-2">
            {isCreateMode ? <Plus className="w-5 h-5 text-blue-600" /> : <Edit2 className="w-5 h-5 text-blue-600" />}
            <span>{isCreateMode ? 'Thêm cấu hình mới' : 'Chỉnh sửa Cấu hình'}</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submitLoading}
        destroyOnHidden
        okText={isCreateMode ? "Tạo mới" : "Lưu thay đổi"}
        cancelText="Hủy"
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item 
            label="Tên cấu hình (Key)" 
            name="ConfigKey"
            rules={[
              { required: true, message: 'Vui lòng nhập Key' },
              { pattern: /^[A-Z0-9_]+$/, message: 'Key chỉ gồm chữ hoa, số và dấu gạch dưới' }
            ]}
          >
            <Input disabled={!isCreateMode} placeholder="VD: DEFAULT_WORK_HOURS" className={!isCreateMode ? "bg-gray-50" : ""} />
          </Form.Item>

          <Form.Item label="Kiểu dữ liệu" name="ValueType" rules={[{ required: true }]}>
            <Select disabled={!isCreateMode}>
              <Option value="string">String (Chuỗi)</Option>
              <Option value="int">Integer (Số nguyên)</Option>
              <Option value="bool">Boolean (Đúng/Sai)</Option>
              <Option value="json">JSON (Cấu trúc)</Option>
            </Select>
          </Form.Item>

          <Form.Item 
            label="Giá trị (Value)" 
            name="ConfigValue" 
            rules={[{ required: true, message: 'Vui lòng nhập giá trị' }]}
          >
            <Input.TextArea autoSize={{ minRows: 2 }} placeholder="Nhập giá trị cấu hình..." />
          </Form.Item>

          <Form.Item label="Mô tả" name="Description">
            <Input.TextArea autoSize={{ minRows: 2 }} placeholder="Nhập mô tả cho cấu hình này..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SystemConfig;
