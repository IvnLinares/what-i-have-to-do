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
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    } else {
      console.log('Users table ready');
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      completed BOOLEAN DEFAULT 0,
      priority TEXT DEFAULT 'medium',
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating tasks table:', err.message);
    } else {
      console.log('Tasks table ready');

      // Check if priority column exists (migration for existing DB)
      db.all("PRAGMA table_info(tasks)", [], (err, rows) => {
        if (err) {
          console.error("Error checking table info:", err);
          return;
        }
        const hasPriority = rows.some(row => row.name === 'priority');
        if (!hasPriority) {
          console.log("Adding priority column to tasks table...");
          db.run("ALTER TABLE tasks ADD COLUMN priority TEXT DEFAULT 'medium'", (err) => {
             if (err) console.error("Error adding priority column:", err);
             else console.log("Priority column added.");
          });
        }

        const hasUserId = rows.some(row => row.name === 'user_id');
        if (!hasUserId) {
           console.log("Adding user_id column to tasks table...");
           db.run("ALTER TABLE tasks ADD COLUMN user_id INTEGER REFERENCES users(id)", (err) => {
             if (err) console.error("Error adding user_id column:", err);
             else console.log("User ID column added.");
           });
        }
      });
    }
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
