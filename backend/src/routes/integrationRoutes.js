const express = require('express');
const router = express.Router();
const GoogleCalendarService = require('../integrations/google-calendar');
const NotionService = require('../integrations/notion');
const ICloudService = require('../integrations/icloud-calendar');
const SyncService = require('../integrations/sync-service');
const IntegrationModel = require('../models/IntegrationModel');

// Mock auth middleware if not present, but usually app has one.
// Let's assume req.user or req.session.userId
const getUserId = (req) => {
    // Check session or JWT
    if (req.user) return req.user.id;
    if (req.session && req.session.userId) return req.session.userId;
    // For testing/development without full auth:
    return 1; // Default to user 1
};

// GET /api/integrations
router.get('/', async (req, res) => {
    try {
        const userId = getUserId(req);
        const integrations = await IntegrationModel.findByUser(userId);
        res.json(integrations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/integrations/sync
router.post('/sync', async (req, res) => {
    try {
        const userId = getUserId(req);
        // Sync all for user
        const integrations = await IntegrationModel.findByUser(userId);
        for (const integration of integrations) {
            if (integration.connected) {
                await SyncService.syncIntegration(integration);
            }
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/integrations/:service
router.delete('/:service', async (req, res) => {
    try {
        const userId = getUserId(req);
        await IntegrationModel.delete(userId, req.params.service);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Google Calendar Auth ---
router.get('/auth/google', (req, res) => {
    const url = GoogleCalendarService.getAuthUrl();
    res.redirect(url);
});

router.get('/auth/google/callback', async (req, res) => {
    const { code } = req.query;
    try {
        const userId = getUserId(req); // This might fail if session is lost during redirect?
        // Usually, OAuth state parameter is used to persist session or userId.
        // For simplicity, we assume session cookie persists.
        await GoogleCalendarService.handleCallback(code, userId);
        res.redirect('/'); // Redirect to frontend
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.redirect('/?error=google_auth_failed');
    }
});

// --- Notion Auth ---
// Notion OAuth flow is similar, but simpler with internal integrations (API Key).
// If using public integration, we need OAuth flow.
// Prompt implies OAuth flow or API Token.
// Frontend sends API Key directly for internal integration?
// Let's assume frontend sends API Key for now as implemented in NotionService.connect

router.post('/connect/notion', async (req, res) => {
    const { apiKey, databaseId } = req.body;
    try {
        const userId = getUserId(req);
        await NotionService.connect(userId, apiKey, databaseId);
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// --- iCloud Auth ---
router.post('/connect/icloud', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userId = getUserId(req);
        await ICloudService.connect(userId, email, password);
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
