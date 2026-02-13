const db = require('../config/db');

class UserModel {
  static async findByUsername(username) {
    const sql = 'SELECT * FROM users WHERE username = ?';
    return await db.get(sql, [username]);
  }

  static async findById(id) {
    const sql = 'SELECT * FROM users WHERE id = ?';
    return await db.get(sql, [id]);
  }

  static async create(username, hashedPassword, role = 'user') {
    const sql = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
    const result = await db.run(sql, [username, hashedPassword, role]);
    return { id: result.lastID, username, role };
  }
}

module.exports = UserModel;
