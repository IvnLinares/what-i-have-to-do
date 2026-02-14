const db = require('../config/db');

class IntegrationModel {
    static async createOrUpdate(data) {
        const { user_id, service, access_token, refresh_token, settings, connected } = data;

        // Check if exists
        const existing = await db.get(
            'SELECT * FROM integrations WHERE user_id = ? AND service = ?',
            [user_id, service]
        );

        if (existing) {
            const sql = `
                UPDATE integrations
                SET access_token = COALESCE(?, access_token),
                    refresh_token = COALESCE(?, refresh_token),
                    settings = COALESCE(?, settings),
                    connected = COALESCE(?, connected),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            await db.run(sql, [access_token, refresh_token, settings, connected, existing.id]);
            return this.findById(existing.id);
        } else {
            const sql = `
                INSERT INTO integrations (user_id, service, access_token, refresh_token, settings, connected)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const result = await db.run(sql, [user_id, service, access_token, refresh_token, settings, connected || 1]);
            return this.findById(result.lastID);
        }
    }

    static async findById(id) {
        return db.get('SELECT * FROM integrations WHERE id = ?', [id]);
    }

    static async findByUser(userId) {
        return db.all('SELECT * FROM integrations WHERE user_id = ?', [userId]);
    }

    static async findByService(userId, service) {
        return db.get('SELECT * FROM integrations WHERE user_id = ? AND service = ?', [userId, service]);
    }

    static async updateLastSync(id) {
        return db.run('UPDATE integrations SET last_sync = CURRENT_TIMESTAMP WHERE id = ?', [id]);
    }

    static async delete(userId, service) {
        return db.run('DELETE FROM integrations WHERE user_id = ? AND service = ?', [userId, service]);
    }

    static async logSync(integrationId, status, details) {
        return db.run(
            'INSERT INTO sync_logs (integration_id, status, details) VALUES (?, ?, ?)',
            [integrationId, status, details]
        );
    }

    static async getLogs(integrationId, limit = 50) {
        return db.all(
            'SELECT * FROM sync_logs WHERE integration_id = ? ORDER BY created_at DESC LIMIT ?',
            [integrationId, limit]
        );
    }

    static async getAllActiveIntegrations() {
        return db.all('SELECT * FROM integrations WHERE connected = 1');
    }
}

module.exports = IntegrationModel;
