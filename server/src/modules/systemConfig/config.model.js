const { sql, poolPromise } = require('../../config/db');

// In-memory cache & Single-flight handler để chống Cache Stampede
const configCache = new Map();
let fetchPromise = null;

class ConfigModel {
    /**
     * Lấy toàn bộ danh sách cấu hình (Anti-Stampede Loading)
     */
    static async getAllConfigs() {
        // Trả về từ cache nếu có sẵn
        if (configCache.size > 0) {
            return Array.from(configCache.values());
        }

        // Cơ chế Single-flight: Nếu đang có 1 request gọi DB, các request khác sẽ đợi chung 1 Promise
        if (fetchPromise) {
            return fetchPromise;
        }

        fetchPromise = (async () => {
            try {
                const pool = await poolPromise;
                const result = await pool.request().query(`
                    EXEC sp_set_session_context @key = N'SystemAuth', @value = 1, @read_only = 0;
                    SELECT ConfigKey, ConfigValue, Description, ISNULL(ValueType, 'string') as ValueType FROM [System].[Config];
                    EXEC sp_set_session_context @key = N'SystemAuth', @value = 0, @read_only = 0;
                `);

                configCache.clear();
                result.recordset.forEach(item => {
                    configCache.set(item.ConfigKey, item);
                });

                return result.recordset;
            } finally {
                fetchPromise = null; // Giải phóng lock sau khi xong
            }
        })();

        return fetchPromise;
    }

    /**
     * Cập nhật cấu hình (Có Transaction, Audit Log & Check Tồn Tại)
     */
    static async updateConfig(reqUser, key, newValue, newDescription) {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        
        try {
            await transaction.begin();
            
            // 1. Kiểm tra tồn tại & Lấy giá trị cũ + ValueType
            const currentData = await transaction.request()
                .input('Key', sql.VarChar(50), key)
                .query(`SELECT ConfigValue, Description, ValueType FROM [System].[Config] WHERE ConfigKey = @Key`);
            
            if (currentData.recordset.length === 0) {
                throw new Error('CONFIG_NOT_FOUND');
            }
            const { ConfigValue: oldValue, Description: oldDescription, ValueType } = currentData.recordset[0];

            // 2. Validate dữ liệu theo ValueType (Server-side defense)
            this.validateValueByType(newValue, ValueType);

            // 3. Thực thi UPDATE & Check @@ROWCOUNT
            // Cập nhật cả ConfigValue và Description
            const updateResult = await transaction.request()
                .input('ConfigKey', sql.VarChar(50), key)
                .input('ConfigValue', sql.NVarChar(4000), newValue)
                .input('Description', sql.NVarChar(500), newDescription || oldDescription)
                .query(`
                    EXEC sp_set_session_context @key = N'SystemAuth', @value = 1, @read_only = 0;
                    UPDATE [System].[Config] 
                    SET ConfigValue = @ConfigValue, 
                        Description = @Description
                    WHERE ConfigKey = @ConfigKey;
                    SELECT @@ROWCOUNT AS AffectedRows;
                    EXEC sp_set_session_context @key = N'SystemAuth', @value = 0, @read_only = 0;
                `);

            if (updateResult.recordset[0].AffectedRows === 0) {
                throw new Error('UPDATE_FAILED');
            }

            // 4. Ghi Audit Log chuyên sâu
            await transaction.request()
                .input('ConfigKey', sql.VarChar(50), key)
                .input('OldValue', sql.NVarChar(4000), `Value: ${oldValue} | Desc: ${oldDescription}`)
                .input('NewValue', sql.NVarChar(4000), `Value: ${newValue} | Desc: ${newDescription}`)
                .input('UpdatedBy', sql.VarChar(20), reqUser.MaNV || 'ADMIN')
                .query(`
                    INSERT INTO [System].[ConfigAuditLog] (ConfigKey, OldValue, NewValue, UpdatedBy, UpdatedAt)
                    VALUES (@ConfigKey, @OldValue, @NewValue, @UpdatedBy, GETDATE());
                `);

            await transaction.commit();

            // 5. Đồng bộ lại Cache
            if (configCache.has(key)) {
                const item = configCache.get(key);
                item.ConfigValue = newValue;
                item.Description = newDescription || item.Description;
                configCache.set(key, item);
            }
            
            return true;
        } catch (err) {
            if (transaction) await transaction.rollback();
            throw err;
        }
    }

    /**
     * Tạo mới cấu hình
     */
    static async createConfig(reqUser, data) {
        const { key, value, description, type } = data;
        const pool = await poolPromise;
        
        // 1. Kiểm tra trùng lặp
        const check = await pool.request()
            .input('Key', sql.VarChar(50), key)
            .query(`SELECT 1 FROM [System].[Config] WHERE ConfigKey = @Key`);
        
        if (check.recordset.length > 0) {
            throw new Error('CONFIG_ALREADY_EXISTS');
        }

        // 2. Validate theo type
        this.validateValueByType(value, type || 'string');

        const transaction = new sql.Transaction(pool);
        try {
            await transaction.begin();
            
            await transaction.request()
                .input('Key', sql.VarChar(50), key)
                .input('Value', sql.NVarChar(4000), value)
                .input('Desc', sql.NVarChar(500), description || '')
                .input('Type', sql.VarChar(20), type || 'string')
                .query(`
                    EXEC sp_set_session_context @key = N'SystemAuth', @value = 1, @read_only = 0;
                    INSERT INTO [System].[Config] (ConfigKey, ConfigValue, Description, ValueType)
                    VALUES (@Key, @Value, @Desc, @Type);
                    EXEC sp_set_session_context @key = N'SystemAuth', @value = 0, @read_only = 0;
                `);

            await transaction.request()
                .input('Key', sql.VarChar(50), key)
                .input('NewValue', sql.NVarChar(4000), `Created: ${value}`)
                .input('UpdatedBy', sql.VarChar(20), reqUser.MaNV || 'ADMIN')
                .query(`
                    INSERT INTO [System].[ConfigAuditLog] (ConfigKey, OldValue, NewValue, UpdatedBy, UpdatedAt)
                    VALUES (@Key, 'NEW_RECORD', @NewValue, @UpdatedBy, GETDATE());
                `);

            await transaction.commit();
            configCache.clear(); // Clear cache để fetch lại mới
            return true;
        } catch (err) {
            if (transaction) await transaction.rollback();
            throw err;
        }
    }

    /**
     * Xóa cấu hình
     */
    static async deleteConfig(reqUser, key) {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        try {
            await transaction.begin();

            // Lấy data cũ để log
            const old = await transaction.request()
                .input('Key', sql.VarChar(50), key)
                .query(`SELECT ConfigValue FROM [System].[Config] WHERE ConfigKey = @Key`);
            
            if (old.recordset.length === 0) throw new Error('CONFIG_NOT_FOUND');

            await transaction.request()
                .input('Key', sql.VarChar(50), key)
                .query(`
                    EXEC sp_set_session_context @key = N'SystemAuth', @value = 1, @read_only = 0;
                    DELETE FROM [System].[Config] WHERE ConfigKey = @Key;
                    EXEC sp_set_session_context @key = N'SystemAuth', @value = 0, @read_only = 0;
                `);

            await transaction.request()
                .input('Key', sql.VarChar(50), key)
                .input('OldValue', sql.NVarChar(4000), old.recordset[0].ConfigValue)
                .input('UpdatedBy', sql.VarChar(20), reqUser.MaNV || 'ADMIN')
                .query(`
                    INSERT INTO [System].[ConfigAuditLog] (ConfigKey, OldValue, NewValue, UpdatedBy, UpdatedAt)
                    VALUES (@Key, @OldValue, 'DELETED', @UpdatedBy, GETDATE());
                `);

            await transaction.commit();
            configCache.clear();
            return true;
        } catch (err) {
            if (transaction) await transaction.rollback();
            throw err;
        }
    }

    /**
     * Helper validate kiểu dữ liệu config
     */
    static validateValueByType(value, type) {
        if (!type) return; // Mặc định là string, không cần validate
        
        const typeLower = type.toLowerCase();
        if (typeLower === 'int') {
            if (isNaN(parseInt(value))) throw new Error('Giá trị cấu hình phải là số nguyên (Integer)');
        } else if (typeLower === 'bool') {
            const validBools = ['true', 'false', '0', '1'];
            if (!validBools.includes(value.toLowerCase())) throw new Error('Giá trị cấu hình phải là kiểu Boolean (true/false)');
        } else if (typeLower === 'json') {
            try {
                JSON.parse(value);
            } catch (e) {
                throw new Error('Giá trị cấu hình phải là chuỗi JSON hợp lệ');
            }
        }
    }
}

module.exports = ConfigModel;
