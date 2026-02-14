const { google } = require('googleapis');
const IntegrationModel = require('../models/IntegrationModel');

class GoogleCalendarService {
    constructor() {
        this.oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );
    }

    getAuthUrl() {
        const scopes = [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events'
        ];
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent' // Force refresh token
        });
    }

    async handleCallback(code, userId) {
        const { tokens } = await this.oauth2Client.getToken(code);
        this.oauth2Client.setCredentials(tokens);

        await IntegrationModel.createOrUpdate({
            user_id: userId,
            service: 'google-calendar',
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token, // Only returned on first consent or forced prompt
            settings: JSON.stringify({}),
            connected: 1
        });

        return true;
    }

    async getClient(userId) {
        const integration = await IntegrationModel.findByService(userId, 'google-calendar');
        if (!integration || !integration.connected) throw new Error('Google Calendar not connected');

        const client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        client.setCredentials({
            access_token: integration.access_token,
            refresh_token: integration.refresh_token
        });

        // Handle token refresh automatically handled by googleapis?
        // We might need to listen to 'tokens' event if we want to update DB,
        // but googleapis usually handles it if refresh_token is present.
        // However, we should save new tokens if they are refreshed.

        client.on('tokens', async (tokens) => {
            if (tokens.refresh_token) {
                // store the refresh_token in my database!
                await IntegrationModel.createOrUpdate({
                    user_id: userId,
                    service: 'google-calendar',
                    refresh_token: tokens.refresh_token,
                    access_token: tokens.access_token // usually present too
                });
            } else {
                 await IntegrationModel.createOrUpdate({
                    user_id: userId,
                    service: 'google-calendar',
                    access_token: tokens.access_token
                });
            }
        });

        return google.calendar({ version: 'v3', auth: client });
    }

    async listEvents(userId, timeMin = new Date().toISOString()) {
        const calendar = await this.getClient(userId);
        const res = await calendar.events.list({
            calendarId: 'primary',
            timeMin: timeMin,
            maxResults: 50,
            singleEvents: true,
            orderBy: 'startTime',
        });
        return res.data.items;
    }

    async createEvent(userId, task) {
        const calendar = await this.getClient(userId);
        const event = {
            summary: task.title,
            description: task.description,
            start: { dateTime: new Date(task.due_date).toISOString() }, // Tasks usually have due date
            end: { dateTime: new Date(new Date(task.due_date).getTime() + 60*60*1000).toISOString() }, // Default 1 hour duration
        };

        const res = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
        });
        return res.data;
    }
}

module.exports = new GoogleCalendarService();
