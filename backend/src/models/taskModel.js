const db = require('../config/db');

class TaskModel {
  static async findAll(userId) {
    // We now fetch dependencies too (simple group concat)
    const sql = `
      SELECT t.*,
             c.name as category_name, c.color as category_color,
             GROUP_CONCAT(DISTINCT tg.id) as tag_ids,
             GROUP_CONCAT(DISTINCT tg.name) as tag_names,
             GROUP_CONCAT(DISTINCT tg.color) as tag_colors,
             GROUP_CONCAT(DISTINCT td.dependency_id) as dependency_ids
      FROM tasks t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN task_tags tt ON t.id = tt.task_id
      LEFT JOIN tags tg ON tt.tag_id = tg.id
      LEFT JOIN task_dependencies td ON t.id = td.task_id
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

      const dependencies = row.dependency_ids ? row.dependency_ids.split(',').map(Number) : [];

      const { category_name, category_color, tag_ids, tag_names, tag_colors, dependency_ids, ...task } = row;
      return {
        ...task,
        category: row.category_id ? { id: row.category_id, name: category_name, color: category_color } : null,
        tags,
        dependencies
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

    // Fetch tags
    const tags = await db.all(`
      SELECT tg.* FROM tags tg
      JOIN task_tags tt ON tg.id = tt.tag_id
      WHERE tt.task_id = ?
    `, [id]);

    // Fetch dependencies (full objects)
    const dependencies = await db.all(`
      SELECT t.* FROM tasks t
      JOIN task_dependencies td ON t.id = td.dependency_id
      WHERE td.task_id = ?
    `, [id]);

    // Fetch subtasks
    const subtasks = await db.all(`
      SELECT * FROM tasks WHERE parent_id = ?
    `, [id]);

    const { category_name, category_color, ...taskData } = task;
    return {
      ...taskData,
      category: task.category_id ? { id: task.category_id, name: category_name, color: category_color } : null,
      tags,
      dependencies,
      subtasks
    };
  }

  static async create(task) {
    const { title, description, priority, category_id, user_id, tags, due_date, parent_id, dependencies } = task;
    const sql = 'INSERT INTO tasks (title, description, priority, category_id, user_id, due_date, parent_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const result = await db.run(sql, [title, description, priority || 'medium', category_id || null, user_id, due_date || null, parent_id || null]);
    const taskId = result.lastID;

    if (tags && Array.isArray(tags)) {
      for (const tagId of tags) {
        await db.run('INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)', [taskId, tagId]);
      }
    }

    if (dependencies && Array.isArray(dependencies)) {
      for (const depId of dependencies) {
        await db.run('INSERT INTO task_dependencies (task_id, dependency_id) VALUES (?, ?)', [taskId, depId]);
      }
    }

    return this.findById(taskId);
  }

  static async update(id, task) {
    const { title, description, completed, priority, category_id, tags, due_date, reminder_sent, parent_id, dependencies } = task;

    let fields = [];
    let params = [];

    if (title !== undefined) { fields.push('title = ?'); params.push(title); }
    if (description !== undefined) { fields.push('description = ?'); params.push(description); }
    if (completed !== undefined) { fields.push('completed = ?'); params.push(completed); }
    if (priority !== undefined) { fields.push('priority = ?'); params.push(priority); }
    if (category_id !== undefined) { fields.push('category_id = ?'); params.push(category_id); }
    if (due_date !== undefined) { fields.push('due_date = ?'); params.push(due_date); }
    if (reminder_sent !== undefined) { fields.push('reminder_sent = ?'); params.push(reminder_sent); }
    if (parent_id !== undefined) { fields.push('parent_id = ?'); params.push(parent_id); }

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

    if (dependencies !== undefined && Array.isArray(dependencies)) {
      await db.run('DELETE FROM task_dependencies WHERE task_id = ?', [id]);
      for (const depId of dependencies) {
        await db.run('INSERT INTO task_dependencies (task_id, dependency_id) VALUES (?, ?)', [id, depId]);
      }
    }

    return true;
  }

  static async delete(id) {
    // Delete dependencies where this task is the child or parent
    // The CASCADE DELETE on FKs handles this but sqlite needs PRAGMA foreign_keys = ON;
    // By default it might be off.
    // Let's manually clean to be safe or ensure foreign keys enabled.
    await db.run('PRAGMA foreign_keys = ON');

    const sql = 'DELETE FROM tasks WHERE id = ?';
    const result = await db.run(sql, [id]);
    return result.changes > 0;
  }
}

module.exports = TaskModel;
