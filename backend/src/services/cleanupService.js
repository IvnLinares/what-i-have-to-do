const db = require('../config/db');

/**
 * Data Retention & Cleanup Service
 * Ensures database stays clean and doesn't exceed size limits
 */
const cleanupService = {
  // Límites de demo
  LIMITS: {
    MAX_TASKS_PER_USER: 50,
    COMPLETED_TASK_TTL_DAYS: 3,
    INCOMPLETE_TASK_TTL_DAYS: 30,
    INACTIVE_USER_DAYS: 30,
    PROTECTED_USERS: ['linaresivn@gmail.com', 'testuser'] // Never delete
  },

  /**
   * Clean up expired data from database
   * Should be called periodically (every 12 hours recommended)
   */
  async cleanupExpiredData() {
    try {
      console.log('🧹 Starting data cleanup...');
      
      // Delete expired tasks
      const tasksDeleted = await this.deleteExpiredTasks();
      
      // Delete inactive users
      const usersDeleted = await this.deleteInactiveUsers();
      
      console.log(`✅ Cleanup completed: ${tasksDeleted} tasks, ${usersDeleted} users deleted`);
      
      return { tasksDeleted, usersDeleted };
    } catch (error) {
      console.error('❌ Cleanup error:', error.message);
      throw error;
    }
  },

  /**
   * Delete tasks that have exceeded their TTL
   * - Completed tasks: 3 days
   * - Incomplete tasks: 30 days
   */
  async deleteExpiredTasks() {
    try {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      // Delete completed tasks older than 3 days
      const result1 = await db.run(
        `DELETE FROM tasks 
         WHERE completed = 1 
         AND updated_at < ?
         AND expires_at < datetime('now')`,
        [threeDaysAgo]
      );

      // Delete incomplete tasks older than 30 days (optional for very old)
      const result2 = await db.run(
        `DELETE FROM tasks 
         WHERE completed = 0 
         AND updated_at < ?
         AND expires_at < datetime('now')`,
        [thirtyDaysAgo]
      );

      const total = (result1?.changes || 0) + (result2?.changes || 0);
      console.log(`  📋 Deleted ${total} expired tasks`);
      return total;
    } catch (error) {
      console.error('  ❌ Error deleting tasks:', error.message);
      return 0;
    }
  },

  /**
   * Delete users that haven't logged in for 30+ days
   * Protects demo accounts
   */
  async deleteInactiveUsers() {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      
      // Get users to delete (excluding protected)
      const inactiveUsers = await db.all(
        `SELECT id, username FROM users 
         WHERE (last_login IS NULL OR last_login < ?)
         AND username NOT IN (${this.LIMITS.PROTECTED_USERS.map(() => '?').join(',')})`,
        [thirtyDaysAgo, ...this.LIMITS.PROTECTED_USERS]
      );

      if (inactiveUsers.length === 0) {
        console.log('  👤 No inactive users to delete');
        return 0;
      }

      // Delete their data
      for (const user of inactiveUsers) {
        await db.run('DELETE FROM users WHERE id = ?', [user.id]);
      }

      console.log(`  👤 Deleted ${inactiveUsers.length} inactive users`);
      return inactiveUsers.length;
    } catch (error) {
      console.error('  ❌ Error deleting users:', error.message);
      return 0;
    }
  },

  /**
   * Check if user has reached task limit
   * Returns: { allowed: boolean, count: number, limit: number, message: string }
   */
  async checkTaskLimit(userId) {
    try {
      const result = await db.get(
        'SELECT COUNT(*) as total FROM tasks WHERE user_id = ?',
        [userId]
      );

      const count = result?.total || 0;
      const limit = this.LIMITS.MAX_TASKS_PER_USER;
      const allowed = count < limit;

      return {
        allowed,
        count,
        limit,
        message: allowed 
          ? `✅ OK: ${count}/${limit} tasks`
          : `⚠️ Limit reached: ${count}/${limit} tasks. Delete some completed tasks.`
      };
    } catch (error) {
      console.error('❌ Error checking task limit:', error.message);
      return { allowed: false, error: error.message };
    }
  },

  /**
   * Get retention policy info for frontend
   */
  getRetentionPolicy() {
    return {
      limits: this.LIMITS,
      policy: {
        description: 'Automatic data retention policy for demo',
        completedTasksTTL: `${this.LIMITS.COMPLETED_TASK_TTL_DAYS} days`,
        incompleteTasksTTL: `${this.LIMITS.INCOMPLETE_TASK_TTL_DAYS} days`,
        inactiveUserTTL: `${this.LIMITS.INACTIVE_USER_DAYS} days`,
        maxTasksPerUser: this.LIMITS.MAX_TASKS_PER_USER
      },
      cleanupSchedule: 'Every 12 hours',
      protectedAccounts: this.LIMITS.PROTECTED_USERS
    };
  },

  /**
   * Update user last_login timestamp
   */
  async updateLastLogin(userId) {
    try {
      const now = new Date().toISOString();
      await db.run(
        'UPDATE users SET last_login = ? WHERE id = ?',
        [now, userId]
      );
    } catch (error) {
      console.error('❌ Error updating last_login:', error.message);
    }
  }
};

// Export for scheduling in server.js
module.exports = cleanupService;
