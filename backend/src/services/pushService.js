const webpush = require('web-push');

// Use env variables in production!
const publicVapidKey = process.env.VAPID_PUBLIC_KEY || 'BFrVvTkrskdMY4k8zeTm6_ANLUEy_UzwLjB6udyYGcDr3u9OPIj7LnSZbk1GCe9MZWcf8tDmFHLug6-RK5ck81M';
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || '1udyiLZuKeRWoSnKhdDIGl49dYESss3uU7jQfFQMp_8';

webpush.setVapidDetails(
  'mailto:test@example.com',
  publicVapidKey,
  privateVapidKey
);

const sendNotification = async (subscription, payload) => {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    console.log('Push notification sent');
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
};

const getPublicKey = () => publicVapidKey;

module.exports = {
  sendNotification,
  getPublicKey
};
