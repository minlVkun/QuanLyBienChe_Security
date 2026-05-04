// src/utils/tokenBlacklist.js
/**
 * In-memory cache lưu danh sách các jti (JWT ID) bị thu hồi.
 * Dùng cho chức năng "Đăng xuất khỏi thiết bị này".
 */
class TokenBlacklist {
    static blacklist = new Set();

    static add(jti) {
        if (jti) {
            this.blacklist.add(jti.toString());
        }
    }

    static remove(jti) {
        if (jti) {
            this.blacklist.delete(jti.toString());
        }
    }

    static has(jti) {
        if (!jti) return false;
        return this.blacklist.has(jti.toString());
    }
}

module.exports = TokenBlacklist;
