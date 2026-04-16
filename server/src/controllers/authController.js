const AuthModel = require('../models/authModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await AuthModel.getUserByUsername(username);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Tên đăng nhập hoặc mật khẩu không đúng'
            });
        }

            const dbHash = user.PasswordHash.toString('utf-8').replace(/\0/g, '').trim();

            const isMatch = await bcrypt.compare(password, dbHash);

            if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Tên đăng nhập hoặc mật khẩu không đúng'
            });
        }

        const payload = {
            userID: user.UserID,
            username: user.Username,
            role: user.RoleName,
            MaNV: user.MaNV
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            success: true,
            token: token,
            user: {
                username: user.Username,
                role: user.RoleName,
                MaNV: user.MaNV
            }       
        }); 
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra trong quá trình đăng nhập'
        });
    }
};

module.exports = { login };