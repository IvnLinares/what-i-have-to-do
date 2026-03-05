const { DAVClient } = require('tsdav');
const IntegrationModel = require('../models/IntegrationModel');
const crypto = require('crypto');

// Encryption key from environment
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-insecure-key-change-in-production';

class ICloudService {
    encryptCredential(credential) {
        try {
            const algorithm = 'aes-256-cbc';
            const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv(algorithm, key, iv);
            
            let encrypted = cipher.update(credential, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            // Prepend IV to encrypted data
            return iv.toString('hex') + ':' + encrypted;
        } catch (error) {
            console.error('Encryption failed:', error);
            throw new Error('Failed to encrypt credentials');
        }
    }

    decryptCredential(encryptedWithIv) {
        try {
            const algorithm = 'aes-256-cbc';
            const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
            
            // Extract IV and encrypted data
            const [ivHex, encrypted] = encryptedWithIv.split(':');
            const iv = Buffer.from(ivHex, 'hex');
            
            const decipher = crypto.createDecipheriv(algorithm, key, iv);
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
        } catch (error) {
            console.error('Decryption failed:', error);
            throw new Error('Failed to decrypt credentials');
        }
    }

    async connect(userId, email, appPassword) {
        try {
            // Validate inputs
            email = email.trim();
            appPassword = appPassword.trim();

            if (!email || !appPassword) {
                throw new Error('Email and password are required');
            }

            console.log(`Attempting to connect iCloud for user ${userId}...`);
            console.log(`Email: ${email.substring(0, 3)}...`);

            const client = new DAVClient({
                serverUrl: 'https://caldav.icloud.com',
                credentials: {
                    username: email,
                    password: appPassword
                },
                authMethod: 'Basic',
                defaultAccountType: 'caldav',
                rejectUnauthorized: false // For development only
            });

            console.log('Logging in to iCloud...');
            await client.login();
            
            console.log('Fetching calendars...');
            const calendars = await client.fetchCalendars();

            if (!calendars || calendars.length === 0) {
                throw new Error('No calendars found in iCloud account');
            }

            console.log(`Found ${calendars.length} calendars`);

            // Find a writeable calendar with VEVENT support
            const mainCalendar = calendars.find(c => 
                c.components && c.components.includes('VEVENT') && !c.readOnly
            );

            if (!mainCalendar) {
                console.warn('No writeable VEVENT calendar found, using first available');
                // Try any calendar with VEVENT
                const anyCalendar = calendars.find(c => c.components && c.components.includes('VEVENT'));
                if (!anyCalendar) {
                    throw new Error('No suitable calendar found for syncing tasks');
                }
            }

            const selectedCalendar = mainCalendar || calendars[0];

            console.log(`Using calendar: ${selectedCalendar.displayName}`);

            // Store encrypted credentials
            await IntegrationModel.createOrUpdate({
                user_id: userId,
                service: 'icloud-calendar',
                access_token: this.encryptCredential(email),
                refresh_token: this.encryptCredential(appPassword),
                settings: JSON.stringify({ 
                    calendarUrl: selectedCalendar.url,
                    calendarName: selectedCalendar.displayName
                }),
                connected: 1
            });

            console.log('✅ iCloud connection successful!');
            return true;
        } catch (error) {
            console.error('❌ iCloud connection failed:', error.message);
            console.error('Full error:', error);
            throw new Error(`iCloud connection failed: ${error.message}`);
        }
    }

    async getClient(userId) {
        const integration = await IntegrationModel.findByService(userId, 'icloud-calendar');
        if (!integration || !integration.connected) {
            throw new Error('iCloud not connected');
        }

        try {
            const email = this.decryptCredential(integration.access_token);
            const appPassword = this.decryptCredential(integration.refresh_token);

            const client = new DAVClient({
                serverUrl: 'https://caldav.icloud.com',
                credentials: {
                    username: email,
                    password: appPassword
                },
                authMethod: 'Basic',
                defaultAccountType: 'caldav',
                rejectUnauthorized: false
            });

            await client.login();
            return { client, settings: JSON.parse(integration.settings) };
        } catch (error) {
            console.error('Failed to get iCloud client:', error);
            throw new Error('Failed to authenticate with iCloud');
        }
    }

    escapeICalText(text) {
        if (!text) return '';
        return text
            .replace(/\\/g, '\\\\')
            .replace(/\n/g, '\\n')
            .replace(/,/g, '\\,')
            .replace(/;/g, '\\;')
            .replace(/"/g, '\\"');
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
        const escapedTitle = this.escapeICalText(task.title);
        const escapedDescription = this.escapeICalText(task.description || '');

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
SUMMARY:${escapedTitle}
DESCRIPTION:${escapedDescription}
END:VEVENT
END:VCALENDAR`
        });
    }
}

module.exports = new ICloudService();
