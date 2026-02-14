const { Client } = require('@notionhq/client');
const IntegrationModel = require('../models/IntegrationModel');

class NotionService {
    async connect(userId, apiKey, databaseId) {
        // Validate connection by listing pages or retrieving db
        const notion = new Client({ auth: apiKey });
        try {
            await notion.databases.retrieve({ database_id: databaseId });

            await IntegrationModel.createOrUpdate({
                user_id: userId,
                service: 'notion',
                access_token: apiKey, // In Notion internal integration, token is static API Key
                settings: JSON.stringify({ database_id: databaseId }),
                connected: 1
            });
            return true;
        } catch (error) {
            console.error('Notion connection failed:', error);
            throw new Error('Invalid Notion API Key or Database ID');
        }
    }

    async getClient(userId) {
        const integration = await IntegrationModel.findByService(userId, 'notion');
        if (!integration || !integration.connected) throw new Error('Notion not connected');

        return new Client({ auth: integration.access_token });
    }

    async createTask(userId, task) {
        const integration = await IntegrationModel.findByService(userId, 'notion');
        if (!integration) throw new Error('Notion not connected');

        const settings = JSON.parse(integration.settings || '{}');
        const databaseId = settings.database_id;

        const notion = await this.getClient(userId);

        const response = await notion.pages.create({
            parent: { database_id: databaseId },
            properties: {
                'Task Name': {
                    title: [
                        { text: { content: task.title } }
                    ]
                },
                'Description': {
                    rich_text: [
                        { text: { content: task.description || '' } }
                    ]
                },
                'Priority': {
                    select: { name: task.priority || 'Medium' }
                },
                'Completed': {
                    checkbox: task.completed || false
                },
                // Due date might be null
                ...(task.due_date ? {
                    'Due Date': {
                        date: { start: new Date(task.due_date).toISOString() }
                    }
                } : {})
            }
        });
        return response;
    }
}

module.exports = new NotionService();
