const db = require('../config/db');

class CategoryModel {
  static async findAll(userId) {
    const sql = 'SELECT * FROM categories WHERE user_id = ? OR user_id IS NULL ORDER BY name ASC';
    return await db.all(sql, [userId]);
  }

  static async findById(id) {
    const sql = 'SELECT * FROM categories WHERE id = ?';
    return await db.get(sql, [id]);
  }

  static async create(category) {
    const { name, color, user_id } = category;
    const sql = 'INSERT INTO categories (name, color, user_id) VALUES (?, ?, ?)';
    const result = await db.run(sql, [name, color || '#6366f1', user_id]);
    return { id: result.lastID, ...category };
  }

  static async update(id, category) {
    const { name, color } = category;
    const sql = `
      UPDATE categories
      SET name = COALESCE(?, name),
          color = COALESCE(?, color)
      WHERE id = ?
    `;
    const result = await db.run(sql, [name, color, id]);
    return result.changes > 0;
  }

  static async delete(id) {
    // Optionally we might want to set tasks category_id to NULL before deleting
    await db.run('UPDATE tasks SET category_id = NULL WHERE category_id = ?', [id]);

    const sql = 'DELETE FROM categories WHERE id = ?';
    const result = await db.run(sql, [id]);
    return result.changes > 0;
  }
}

module.exports = CategoryModel;
