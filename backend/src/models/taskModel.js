const db = require('../config/db');

class TaskModel {
  static async findAll(userId) {
    const sql = `
      SELECT t.*,
             c.name as category_name, c.color as category_color,
             GROUP_CONCAT(tg.id) as tag_ids,
             GROUP_CONCAT(tg.name) as tag_names,
             GROUP_CONCAT(tg.color) as tag_colors
      FROM tasks t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN task_tags tt ON t.id = tt.task_id
      LEFT JOIN tags tg ON tt.tag_id = tg.id
      WHERE t.user_id = ?
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `;
    const rows = await db.all(sql, [userId]);

    return rows.map(row => {
      const tags = [];
      if (row.tag_ids) {
        const ids = row.tag_ids.split(',');
        const names = row.tag_names.split(',');
        const colors = row.tag_colors.split(',');
        for (let i = 0; i < ids.length; i++) {
          tags.push({ id: ids[i], name: names[i], color: colors[i] });
        }
      }

      const { category_name, category_color, tag_ids, tag_names, tag_colors, ...task } = row;
      return {
        ...task,
        category: row.category_id ? { id: row.category_id, name: category_name, color: category_color } : null,
        tags
      };
    });
  }

  static async findById(id) {
    const sql = `
      SELECT t.*,
             c.name as category_name, c.color as category_color
      FROM tasks t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?
    `;
    const task = await db.get(sql, [id]);

    if (!task) return null;

    const tagsSql = `
      SELECT tg.* FROM tags tg
      JOIN task_tags tt ON tg.id = tt.tag_id
      WHERE tt.task_id = ?
    `;
    const tags = await db.all(tagsSql, [id]);

    const { category_name, category_color, ...taskData } = task;
    return {
      ...taskData,
      category: task.category_id ? { id: task.category_id, name: category_name, color: category_color } : null,
      tags
    };
  }

  static async create(task) {
    const { title, description, priority, category_id, user_id, tags } = task;
    const sql = 'INSERT INTO tasks (title, description, priority, category_id, user_id) VALUES (?, ?, ?, ?, ?)';
    const result = await db.run(sql, [title, description, priority || 'medium', category_id || null, user_id]);
    const taskId = result.lastID;

    if (tags && Array.isArray(tags)) {
      for (const tagId of tags) {
        await db.run('INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)', [taskId, tagId]);
      }
    }

    return this.findById(taskId);
  }

  static async update(id, task) {
    const { title, description, completed, priority, category_id, tags } = task;

    let fields = [];
    let params = [];

    if (title !== undefined) { fields.push('title = ?'); params.push(title); }
    if (description !== undefined) { fields.push('description = ?'); params.push(description); }
    if (completed !== undefined) { fields.push('completed = ?'); params.push(completed); }
    if (priority !== undefined) { fields.push('priority = ?'); params.push(priority); }
    if (category_id !== undefined) { fields.push('category_id = ?'); params.push(category_id); }

    fields.push('updated_at = CURRENT_TIMESTAMP');

    if (fields.length > 0) {
        const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`;
        params.push(id);
        await db.run(sql, params);
    }

    if (tags !== undefined && Array.isArray(tags)) {
      await db.run('DELETE FROM task_tags WHERE task_id = ?', [id]);
      for (const tagId of tags) {
        await db.run('INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)', [id, tagId]);
      }
    }

    return true;
  }

  static async delete(id) {
    const sql = 'DELETE FROM tasks WHERE id = ?';
    const result = await db.run(sql, [id]);
    return result.changes > 0;
  }
}

module.exports = TaskModel;
