// src/utils/userBlacklist.js
/**
 * In-memory cache lưu danh sách các UserID bị khóa (TrangThai = -1).
 * Giúp middleware từ chối token tức thì (Immediate Access Termination)
 * mà không cần phải thực hiện query vào database.
 */
class UserBlacklist {
    static blacklist = new Set();

    static add(userID) {
        if (userID) {
            this.blacklist.add(userID.toString());
        }
    }

    static remove(userID) {
        if (userID) {
            this.blacklist.delete(userID.toString());
        }
    }

    static has(userID) {
        if (!userID) return false;
        return this.blacklist.has(userID.toString());
    }
}

module.exports = UserBlacklist;
