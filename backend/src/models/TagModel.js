const db = require('../config/db');

class TagModel {
  static async findAll(userId) {
    const sql = 'SELECT * FROM tags WHERE user_id = ? OR user_id IS NULL ORDER BY name ASC';
    return await db.all(sql, [userId]);
  }

  static async findById(id) {
    const sql = 'SELECT * FROM tags WHERE id = ?';
    return await db.get(sql, [id]);
  }

  static async create(tag) {
    const { name, color, user_id } = tag;
    const sql = 'INSERT INTO tags (name, color, user_id) VALUES (?, ?, ?)';
    const result = await db.run(sql, [name, color || '#10b981', user_id]);
    return { id: result.lastID, ...tag };
  }

  static async update(id, tag) {
    const { name, color } = tag;
    const sql = `
      UPDATE tags
      SET name = COALESCE(?, name),
          color = COALESCE(?, color)
      WHERE id = ?
    `;
    const result = await db.run(sql, [name, color, id]);
    return result.changes > 0;
  }

  static async delete(id) {
    const sql = 'DELETE FROM tags WHERE id = ?';
    const result = await db.run(sql, [id]);
    return result.changes > 0;
  }
}

module.exports = TagModel;
