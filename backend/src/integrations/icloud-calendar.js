const { DAVClient } = require('tsdav');
const IntegrationModel = require('../models/IntegrationModel');

class ICloudService {
    async connect(userId, email, appPassword) {
        const client = new DAVClient({
            serverUrl: 'https://caldav.icloud.com',
            credentials: {
                username: email,
                password: appPassword
            },
            authMethod: 'Basic',
            defaultAccountType: 'caldav'
        });

        try {
            await client.login();
            const calendars = await client.fetchCalendars();

            // Assume the first writeable calendar is the main one?
            const mainCalendar = calendars.find(c => c.components.includes('VEVENT'));

            if (!mainCalendar) throw new Error('No calendar found');

            await IntegrationModel.createOrUpdate({
                user_id: userId,
                service: 'icloud-calendar',
                access_token: email, // Store email as access_token for convenience
                refresh_token: appPassword, // Store password as refresh_token (encrypted in real app!)
                settings: JSON.stringify({ calendarUrl: mainCalendar.url }),
                connected: 1
            });
            return true;
        } catch (error) {
            console.error('iCloud connection failed:', error);
            throw new Error('Invalid iCloud credentials');
        }
    }

    async getClient(userId) {
        const integration = await IntegrationModel.findByService(userId, 'icloud-calendar');
        if (!integration || !integration.connected) throw new Error('iCloud not connected');

        const client = new DAVClient({
            serverUrl: 'https://caldav.icloud.com',
            credentials: {
                username: integration.access_token,
                password: integration.refresh_token
            },
            authMethod: 'Basic',
            defaultAccountType: 'caldav'
        });
        await client.login();
        return { client, settings: JSON.parse(integration.settings) };
    }

    async createTask(userId, task) {
        const { client, settings } = await this.getClient(userId);

        const event = {
            start: new Date(task.due_date).toISOString().replace(/-|:|T|\.\d{3}Z/g, ''), // Format for iCal? tsdav handles it?
            summary: task.title,
            description: task.description,
            // tsdav uses object structure
            data: {
                title: task.title,
                start: task.due_date,
                end: new Date(new Date(task.due_date).getTime() + 3600000),
                description: task.description
            }
        };

        // tsdav createEvent
        await client.createCalendarObject({
            calendarUrl: settings.calendarUrl,
            filename: `${Date.now()}.ics`,
            iCalString: `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//My App//EN
BEGIN:VEVENT
UID:${Date.now()}
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${new Date(task.due_date).toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${new Date(new Date(task.due_date).getTime() + 3600000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${task.title}
DESCRIPTION:${task.description || ''}
END:VEVENT
END:VCALENDAR`
        });
    }
}

module.exports = new ICloudService();
