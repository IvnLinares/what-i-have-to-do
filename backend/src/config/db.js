const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  // Users Table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Error creating users table:', err.message);
    else console.log('Users table ready');
  });

  // Categories Table
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#6366f1',
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `, (err) => {
      if (err) console.error('Error creating categories table:', err.message);
      else console.log('Categories table ready');
  });

  // Tags Table
  db.run(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#10b981',
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `, (err) => {
      if (err) console.error('Error creating tags table:', err.message);
      else console.log('Tags table ready');
  });

  // Tasks Table
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      completed BOOLEAN DEFAULT 0,
      priority TEXT DEFAULT 'medium',
      user_id INTEGER,
      category_id INTEGER,
      due_date DATETIME,
      reminder_sent BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(category_id) REFERENCES categories(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating tasks table:', err.message);
    } else {
      console.log('Tasks table ready');

      // Check existing columns (migration)
      db.all("PRAGMA table_info(tasks)", [], (err, rows) => {
        if (err) {
          console.error("Error checking table info:", err);
          return;
        }

        const hasPriority = rows.some(row => row.name === 'priority');
        if (!hasPriority) {
          console.log("Adding priority column to tasks table...");
          db.run("ALTER TABLE tasks ADD COLUMN priority TEXT DEFAULT 'medium'");
        }

        const hasUserId = rows.some(row => row.name === 'user_id');
        if (!hasUserId) {
           console.log("Adding user_id column to tasks table...");
           db.run("ALTER TABLE tasks ADD COLUMN user_id INTEGER REFERENCES users(id)");
        }

        const hasCategoryId = rows.some(row => row.name === 'category_id');
        if (!hasCategoryId) {
           console.log("Adding category_id column to tasks table...");
           db.run("ALTER TABLE tasks ADD COLUMN category_id INTEGER REFERENCES categories(id)");
        }

        const hasDueDate = rows.some(row => row.name === 'due_date');
        if (!hasDueDate) {
           console.log("Adding due_date column to tasks table...");
           db.run("ALTER TABLE tasks ADD COLUMN due_date DATETIME");
        }

        const hasReminderSent = rows.some(row => row.name === 'reminder_sent');
        if (!hasReminderSent) {
           console.log("Adding reminder_sent column to tasks table...");
           db.run("ALTER TABLE tasks ADD COLUMN reminder_sent BOOLEAN DEFAULT 0");
        }
      });
    }
  });

  // Task Tags Join Table
  db.run(`
    CREATE TABLE IF NOT EXISTS task_tags (
      task_id INTEGER,
      tag_id INTEGER,
      PRIMARY KEY (task_id, tag_id),
      FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `, (err) => {
      if (err) console.error('Error creating task_tags table:', err.message);
      else console.log('Task_Tags table ready');
  });
}

// Promisify DB methods
const query = {
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  },
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  },
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  close() {
    return new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

module.exports = query;
