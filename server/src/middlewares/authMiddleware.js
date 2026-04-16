const jwt = require('jsonwebtoken');


const authorize = (allwanceRoles = []) => {
    return (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];  

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Bạn chưa đăng nhập hoặc token không hợp lệ' 
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;

            if (allwanceRoles.length > 0 && !allwanceRoles.includes(req.user.role)) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'Ban không có quyền truy cập tài nguyên này' 
                });
            }
            next();
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: 'Token không hợp lệ hoặc đã hết hạn'
            });
        }
    };
};

module.exports = {
    authorize
};