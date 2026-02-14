const db = require('../config/db');
const pushService = require('../services/pushService');

const subscribe = async (req, res, next) => {
  try {
    const subscription = req.body;
    const userId = req.user ? req.user.id : null;

    // Save to DB
    await db.run(
      'INSERT INTO push_subscriptions (user_id, endpoint, keys_auth, keys_p256dh) VALUES (?, ?, ?, ?) ON CONFLICT(endpoint) DO NOTHING',
      [userId, subscription.endpoint, subscription.keys.auth, subscription.keys.p256dh]
    );

    res.status(201).json({ message: 'Subscription saved' });
  } catch (error) {
    next(error);
  }
};

const getPublicKey = (req, res) => {
  res.json({ publicKey: pushService.getPublicKey() });
};

module.exports = {
  subscribe,
  getPublicKey
};
