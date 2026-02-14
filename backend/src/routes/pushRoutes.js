const express = require('express');
const router = express.Router();
const pushController = require('../controllers/pushController');
const authMiddleware = require('../middleware/authMiddleware');

// Public route to get key
router.get('/key', pushController.getPublicKey);

// Subscribe endpoint (optional auth, but good to link to user)
// If you want to allow anonymous push, remove authMiddleware or make it optional in controller
router.post('/subscribe', authMiddleware, pushController.subscribe);

module.exports = router;
