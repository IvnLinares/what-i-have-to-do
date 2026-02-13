const db = require('../config/db');

class TaskModel {
  static async findAll() {
    const sql = 'SELECT * FROM tasks ORDER BY created_at DESC';
    return await db.all(sql);
  }

  static async findById(id) {
    const sql = 'SELECT * FROM tasks WHERE id = ?';
    return await db.get(sql, [id]);
  }

  static async create(task) {
    const { title, description, priority } = task;
    const sql = 'INSERT INTO tasks (title, description, priority) VALUES (?, ?, ?)';
    const result = await db.run(sql, [title, description, priority || 'medium']);
    return { id: result.lastID, ...task, priority: priority || 'medium', completed: false };
  }

  static async update(id, task) {
    const { title, description, completed, priority } = task;
    const sql = `
      UPDATE tasks
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          completed = COALESCE(?, completed),
          priority = COALESCE(?, priority),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const result = await db.run(sql, [title, description, completed, priority, id]);
    return result.changes > 0;
  }

  static async delete(id) {
    const sql = 'DELETE FROM tasks WHERE id = ?';
    const result = await db.run(sql, [id]);
    return result.changes > 0;
  }
}

module.exports = TaskModel;
