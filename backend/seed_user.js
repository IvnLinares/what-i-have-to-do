const db = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function seed() {
  const password = await bcrypt.hash('password123', 10);

  try {
    const existing = await db.get(`SELECT id FROM users WHERE username = 'testuser'`);

    if (existing) {
        await db.run(`UPDATE users SET password = ? WHERE id = ?`, [password, existing.id]);
        console.log('User updated');
    } else {
        await db.run(`INSERT INTO users (username, password) VALUES ('testuser', ?)`, [password]);
        console.log('User created');
    }
  } catch (e) {
    console.log('Error seeding user:', e.message);
  }

  // Also create a task to show dashboard is working
  try {
      const user = await db.get("SELECT id FROM users WHERE username = 'testuser'");
      await db.run(`INSERT INTO tasks (title, user_id, due_date) VALUES ('Test Task', ?, ?)`, [user.id, new Date().toISOString()]);
  } catch (e) {
      console.log('Error creating task', e);
  }
}

seed().then(() => {
    setTimeout(() => process.exit(0), 1000);
});
