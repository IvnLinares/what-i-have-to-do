const cron = require('node-cron');
const db = require('../config/db');
const emailService = require('./emailService');
const pushService = require('./pushService');

const checkDueTasks = async () => {
    try {
        console.log('Checking for due tasks...');
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

        // Find tasks due within next 24 hours, not completed, and not yet reminded
        const sql = `
            SELECT t.*, u.username as user_email
            FROM tasks t
            LEFT JOIN users u ON t.user_id = u.id
            WHERE t.completed = 0
            AND t.reminder_sent = 0
            AND t.due_date IS NOT NULL
            AND t.due_date <= ?
            AND t.due_date > ?
        `;

        const tasks = await db.all(sql, [tomorrow.toISOString(), now.toISOString()]);

        for (const task of tasks) {
            console.log(`Sending reminder for task: ${task.title}`);

            // 1. Send email
            const recipient = task.user_email && task.user_email.includes('@') ? task.user_email : 'user@example.com';
            await emailService.sendEmail(
                recipient,
                `Reminder: Task "${task.title}" is due soon`,
                `Your task "${task.title}" is due on ${new Date(task.due_date).toLocaleString()}. Priority: ${task.priority}.`,
                `<p>Your task <strong>${task.title}</strong> is due on ${new Date(task.due_date).toLocaleString()}.</p><p>Priority: ${task.priority}</p>`
            );

            // 2. Send Push Notification (if user has subscription)
            if (task.user_id) {
                const subs = await db.all('SELECT * FROM push_subscriptions WHERE user_id = ?', [task.user_id]);
                for (const sub of subs) {
                    const subscription = {
                        endpoint: sub.endpoint,
                        keys: {
                            auth: sub.keys_auth,
                            p256dh: sub.keys_p256dh
                        }
                    };

                    await pushService.sendNotification(subscription, {
                        title: 'Tarea Vence Pronto',
                        body: `"${task.title}" vence el ${new Date(task.due_date).toLocaleTimeString()}`,
                        url: '/'
                    });
                }
            }

            // Mark as reminded
            await db.run('UPDATE tasks SET reminder_sent = 1 WHERE id = ?', [task.id]);
        }
    } catch (error) {
        console.error('Error in reminder service:', error);
    }
};

const start = () => {
    // Run every minute
    cron.schedule('* * * * *', checkDueTasks);
    console.log('Reminder service started');
};

module.exports = {
    start
};
