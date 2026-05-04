const { z } = require('zod');
const ConfigModel = require('./config.model');

/**
 * Schema validation cho việc cập nhật cấu hình
 */
const configUpdateSchema = z.object({
    value: z.string()
        .min(1, "Giá trị cấu hình không được để trống")
        .max(4000, "Giá trị cấu hình không được vượt quá 4000 ký tự")
        .transform(val => val.trim()),
    description: z.string()
        .max(500, "Mô tả không được vượt quá 500 ký tự")
        .optional()
        .transform(val => val ? val.trim() : val)
});

const getAllConfigs = async (req, res) => {
    try {
        const configs = await ConfigModel.getAllConfigs();
        res.json({
            success: true,
            data: configs
        });
    } catch (error) {
        console.error('Error in getAllConfigs:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách cấu hình'
        });
    }
};

const updateConfig = async (req, res) => {
    try {
        const { key } = req.params;
        
        // 1. Validate payload đầu vào bằng Zod
        const validation = configUpdateSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: validation.error.errors[0].message
            });
        }

        // 2. Gọi model thực hiện cập nhật (Model đã bao gồm logic Audit và Check tồn tại)
        await ConfigModel.updateConfig(req.user, key, validation.data.value, validation.data.description);

        res.json({
            success: true,
            message: `Cập nhật cấu hình '${key}' thành công và đã ghi nhật ký thay đổi.`
        });
    } catch (error) {
        console.error('Error in updateConfig:', error.message);
        
        // Xử lý các lỗi nghiệp vụ cụ thể
        let statusCode = 500;
        let errorMessage = 'Lỗi hệ thống khi cập nhật cấu hình';

        if (error.message === 'CONFIG_NOT_FOUND') {
            statusCode = 404;
            errorMessage = 'Không tìm thấy cấu hình này trong hệ thống';
        } else if (error.message.includes('phải là')) {
            statusCode = 400;
            errorMessage = error.message;
        }

        res.status(statusCode).json({
            success: false,
            message: errorMessage
        });
    }
};

const createConfig = async (req, res) => {
    const createSchema = z.object({
        key: z.string().min(1, "Key không được để trống").max(50, "Key tối đa 50 ký tự").regex(/^[A-Z0-9_]+$/, "Key chỉ được chứa chữ hoa, số và dấu gạch dưới"),
        value: z.string().min(1, "Giá trị không được để trống").max(4000),
        description: z.string().max(500).optional(),
        type: z.enum(['string', 'int', 'bool', 'json']).default('string')
    });

    try {
        const validation = createSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, message: validation.error.errors[0].message });
        }

        await ConfigModel.createConfig(req.user, validation.data);
        res.status(201).json({ success: true, message: "Tạo cấu hình mới thành công" });
    } catch (error) {
        console.error('Error in createConfig:', error.message);
        res.status(error.message === 'CONFIG_ALREADY_EXISTS' ? 409 : 500).json({
            success: false,
            message: error.message === 'CONFIG_ALREADY_EXISTS' ? 'Key này đã tồn tại' : error.message
        });
    }
};

const deleteConfig = async (req, res) => {
    try {
        const { key } = req.params;
        await ConfigModel.deleteConfig(req.user, key);
        res.json({ success: true, message: "Xóa cấu hình thành công" });
    } catch (error) {
        console.error('Error in deleteConfig:', error.message);
        res.status(error.message === 'CONFIG_NOT_FOUND' ? 404 : 500).json({
            success: false,
            message: error.message === 'CONFIG_NOT_FOUND' ? 'Cấu hình không tồn tại' : 'Lỗi khi xóa cấu hình'
        });
    }
};

module.exports = {
    getAllConfigs,
    updateConfig,
    createConfig,
    deleteConfig
};
