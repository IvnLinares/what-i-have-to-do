const cron = require('node-cron');
const IntegrationModel = require('../models/IntegrationModel');
const TaskModel = require('../models/taskModel');
const GoogleCalendarService = require('./google-calendar');
const NotionService = require('./notion');
const ICloudService = require('./icloud-calendar');

class SyncService {
    constructor() {
        this.startCron();
    }

    startCron() {
        // Run every hour
        cron.schedule('0 * * * *', () => {
            console.log('Running scheduled sync...');
            this.syncAll();
        });
    }

    async syncAll() {
        const integrations = await IntegrationModel.getAllActiveIntegrations();
        for (const integration of integrations) {
            try {
                await this.syncIntegration(integration);
            } catch (error) {
                console.error(`Sync failed for integration ${integration.id}:`, error);
                await IntegrationModel.logSync(integration.id, 'error', error.message);
            }
        }
    }

    async syncIntegration(integration) {
        console.log(`Syncing integration ${integration.service} for user ${integration.user_id}`);

        try {
            if (integration.service === 'google-calendar') {
                const events = await GoogleCalendarService.listEvents(integration.user_id);
                // Process events -> Create/Update tasks
                for (const event of events) {
                    // Check if task exists (by external ID? We don't store external ID yet. Use title match for simplicity)
                    // In a real app, we should store external_id in a separate table or column.
                    // For now, let's just log it.
                    // await TaskModel.create({ ... });
                }
            } else if (integration.service === 'icloud-calendar') {
                console.log('Syncing iCloud Calendar integration');
                // iCloud sync logic - get tasks from local database and sync to iCloud
                const tasks = await TaskModel.findByUser(integration.user_id);
                for (const task of tasks) {
                    if (!task.synced_to_icloud) {
                        try {
                            await ICloudService.createTask(integration.user_id, task);
                            // Update task to mark as synced
                            await TaskModel.update(task.id, { synced_to_icloud: 1 });
                        } catch (error) {
                            console.error(`Failed to sync task ${task.id} to iCloud:`, error.message);
                        }
                    }
                }
            } else if (integration.service === 'notion') {
                // Notion sync logic
            }

            await IntegrationModel.updateLastSync(integration.id, 'success');
            await IntegrationModel.logSync(integration.id, 'success', 'Sync completed successfully');
        } catch (error) {
            console.error(`Error syncing ${integration.service}:`, error);
            await IntegrationModel.updateLastSync(integration.id, 'error');
            await IntegrationModel.logSync(integration.id, 'error', error.message);
            // Don't rethrow to avoid stopping loop
        }
    }
}

module.exports = new SyncService();
