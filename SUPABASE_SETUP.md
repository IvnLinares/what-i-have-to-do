# Supabase Backend Setup

## Project Information

**Project Name:** copilot-testing-backend  
**Project ID:** pemudfoinavlslhkgjlk  
**Region:** US East 1  
**Status:** ✅ Active & Healthy

---

## Database Connection

### Connection Details
- **Host:** `db.pemudfoinavlslhkgjlk.supabase.co`
- **Port:** `5432` (default PostgreSQL)
- **Database:** `postgres`
- **User:** `postgres`
- **Password:** Check Supabase dashboard > Project Settings > Database

### Connection String
```
postgresql://postgres:[PASSWORD]@db.pemudfoinavlslhkgjlk.supabase.co:5432/postgres
```

---

## Setup Instructions

### 1. Get Your Supabase Credentials

1. Go to: https://supabase.com/dashboard/project/pemudfoinavlslhkgjlk/settings/database
2. Copy the database password under "Database Password"
3. Copy your connection credentials

### 2. Update Backend Configuration

#### Edit `backend/src/config/db.js`

Replace the SQLite configuration with PostgreSQL:

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: 'db.pemudfoinavlslhkgjlk.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

const db = {
  run: (sql, params = []) => {
    return pool.query(sql, params);
  },
  get: (sql, params = []) => {
    return pool.query(sql, params).then(res => res.rows[0]);
  },
  all: (sql, params = []) => {
    return pool.query(sql, params).then(res => res.rows);
  }
};

module.exports = db;
```

#### Create `.env` file in backend:

```env
DB_HOST=db.pemudfoinavlslhkgjlk.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=[YOUR_SUPABASE_PASSWORD]
DB_SSL=true

JWT_SECRET=your_jwt_secret_here
PORT=3000
NODE_ENV=production
```

### 3. Install PostgreSQL Driver

```bash
cd backend
npm install pg
npm uninstall sqlite3
```

### 4. Update Query Syntax

Some queries may need adjustment for PostgreSQL compatibility:

#### Before (SQLite):
```javascript
db.run('INSERT INTO users (username, password) VALUES (?, ?)', [user, pass])
```

#### After (PostgreSQL with pg):
```javascript
db.run('INSERT INTO users (username, password) VALUES ($1, $2)', [user, pass])
```

**Note:** Replace `?` with `$1`, `$2`, etc. for PostgreSQL parameterized queries.

### 5. Test Connection

```bash
cd backend
npm run dev
```

You should see: `Connected to PostgreSQL database`

---

## Database Schema

The following tables have been created:

- ✅ **users** - User accounts and authentication
- ✅ **categories** - Task categories
- ✅ **tags** - Task tags
- ✅ **tasks** - Task items
- ✅ **task_tags** - Task-tag relationships
- ✅ **task_dependencies** - Task dependencies
- ✅ **push_subscriptions** - Push notification subscriptions
- ✅ **integrations** - Third-party service connections
- ✅ **sync_logs** - Integration sync status logs

---

## Test User

**Username:** `linaresivn@gmail.com`  
**Password:** Will be created during first login or use your own

---

## Supabase Dashboard

Access your Supabase dashboard: https://supabase.com/dashboard/project/pemudfoinavlslhkgjlk

### Key Features:
- **SQL Editor:** Write and execute custom queries
- **Table Editor:** Browse and edit data directly
- **Authentication:** Built-in user management (optional)
- **Real-time:** Subscribe to database changes
- **Storage:** File storage service
- **Edge Functions:** Serverless functions

---

## Next Steps

1. ✅ Project created and schema initialized
2. ⏳ Update backend code for PostgreSQL
3. ⏳ Deploy backend to production
4. ⏳ Update frontend environment variables to point to production API
5. ⏳ Test full integration

---

## Troubleshooting

### Connection Issues
- Verify IP whitelist in Supabase (usually all IPs allowed by default)
- Check database password is correct
- Ensure `pg` package is installed: `npm install pg`

### Query Errors
- PostgreSQL uses `$1`, `$2` instead of `?` for parameters
- Check for SQLite-specific syntax that needs conversion

### Performance
- Supabase handles backups and scaling automatically
- Add indexes for frequently queried columns (already included)

---

## Cost

**Free Tier Benefits:**
- Up to 500 MB database size
- Up to 2GB storage
- 50MB bandwidth
- Unlimited API requests

Perfect for demo and testing!

Upgrade to Pro ($25/month) as needed for more resources.

---

## Support

- Supabase Docs: https://supabase.com/docs
- Discord Community: https://discord.supabase.io
- Project Dashboard: https://supabase.com/dashboard/project/pemudfoinavlslhkgjlk
