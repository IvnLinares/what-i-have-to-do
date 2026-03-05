# 📋 Data Retention Policy

**Version:** 1.0  
**Effective Date:** March 5, 2026  
**Last Updated:** March 5, 2026

---

## 🎯 Overview

This is a demo/testing application with **automatic data retention policies** to prevent unauthorized usage, ensure fair storage usage, and keep the database clean and performant.

---

## 📊 Retention Limits

### Task Limits

| Status | TTL | Action |
|--------|-----|--------|
| ✅ **Completed Tasks** | 3 days | Auto-deleted after 3 days |
| ⏳ **Incomplete Tasks** | 30 days | Auto-deleted after 30 days |
| **Max per User** | 50 | Rejected if user exceeds 50 active tasks |

### User Account

| Metric | Duration | Action |
|--------|----------|--------|
| Inactive Account | 30 days | Auto-deleted if no login for 30 days |
| Protected Accounts | ∞ | Never deleted: `linaresivn@gmail.com`, `testuser` |

---

## 🔄 Auto-Cleanup Schedule

- **Frequency:** Every 12 hours
- **Timing:** Automatic, no user action required
- **Trigger:** Server startup + every 12 hours thereafter
- **Protected:** Demo/test accounts are never auto-deleted

---

## 💾 How It Works

### 1. Task Expiration (TTL)

When you complete a task:
```
✅ Task marked as completed
↓
⏰ Expiration set to: NOW + 3 days
↓
(After 3 days)
🗑️ Task automatically deleted
```

When you create an incomplete task:
```
📝 Task created (incomplete)
↓
⏰ Expiration set to: NOW + 30 days
↓
(After 30 days OR if user becomes inactive)
🗑️ Task automatically deleted
```

### 2. Task Limit (Per User)

**Maximum: 50 active tasks per user**

When you try to create a task and already have 50:
```json
{
  "error": "Task limit reached",
  "details": {
    "count": 50,
    "limit": 50,
    "message": "⚠️ Limit reached: 50/50 tasks. Delete some completed tasks."
  }
}
```

**Solution:** Delete some completed tasks (they expire in 3 days anyway)

### 3. User Account Deletion

Inactive accounts (no login for 30+ days) are auto-deleted including:
- ✅ All tasks
- 📁 All categories
- 🏷️ All tags
- 🔗 All integrations
- 📜 All data associated with the account

**Exception:** Test accounts (`linaresivn@gmail.com`, `testuser`) are never deleted.

---

## 🔐 What's Protected

### Never Deleted Accounts

```javascript
PROTECTED_USERS = [
  'linaresivn@gmail.com',  // Demo account
  'testuser'               // Test account
]
```

These accounts will never be auto-deleted, even if inactive.

### What Stays

- User authentication system
- Application code and features
- API infrastructure

---

## 📱 API Endpoints

### Get Current Retention Policy
```bash
GET /api/tasks/policy/retention
```

Response:
```json
{
  "limits": {
    "MAX_TASKS_PER_USER": 50,
    "COMPLETED_TASK_TTL_DAYS": 3,
    "INCOMPLETE_TASK_TTL_DAYS": 30,
    "INACTIVE_USER_DAYS": 30,
    "PROTECTED_USERS": ["linaresivn@gmail.com", "testuser"]
  },
  "policy": {
    "description": "Automatic data retention policy for demo",
    "completedTasksTTL": "3 days",
    "incompleteTasksTTL": "30 days",
    "inactiveUserTTL": "30 days",
    "maxTasksPerUser": 50
  },
  "cleanupSchedule": "Every 12 hours",
  "protectedAccounts": ["linaresivn@gmail.com", "testuser"]
}
```

### Create Task (with limit check)
```bash
POST /api/tasks
Content-Type: application/json

{
  "title": "My Task",
  "description": "Task description"
}
```

Response (if OK):
```json
{
  "message": "Task created successfully",
  "task": { ... },
  "limit": {
    "allowed": true,
    "count": 23,
    "limit": 50,
    "message": "✅ OK: 23/50 tasks"
  }
}
```

Response (if limit reached):
```json
{
  "error": "Task limit reached",
  "details": {
    "allowed": false,
    "count": 50,
    "limit": 50,
    "message": "⚠️ Limit reached: 50/50 tasks. Delete some completed tasks."
  }
}
```

---

## 🛡️ Why These Limits?

### Security
- Prevents abuse and resource exhaustion
- Ensures fair access for all demo users
- Protects Supabase database from unlimited growth

### Performance
- Keeps database responsive
- Reduces storage costs
- Maintains fast query times

### Data Privacy
- Automatically deletes unused accounts
- Reduces personal data retention
- Complies with demo usage guidelines

---

## 📞 What Happens

### Scenarios

#### Scenario 1: You're actively using the app
```
✅ Login regularly
✅ Create/complete tasks
✅ Your account stays active (30-day timer resets on each login)
✅ No cleanup affects you
✅ Max 50 tasks allowed at once
```

#### Scenario 2: You stop using the app
```
1. Day 0-29: Account active, cleanup ignores you
2. Day 30: No login detected
3. Cleanup runs: Account and all data deleted
```

#### Scenario 3: You have 50 tasks
```
1. UserA has 50 tasks (50/50)
2. UserA tries to create task #51
3. ❌ API returns: "Task limit reached"
4. UserA deletes some completed tasks
5. ✅ Now they can create new tasks
```

#### Scenario 4: You complete a task
```
1. Task marked ✅ completed
2. Expiration set to: NOW + 3 days
3. Day 3: Cleanup runs
4. 🗑️ Task deleted automatically
```

---

## 🔧 For Developers

### Cleanup Service Location
```
backend/src/services/cleanupService.js
```

### Key Methods
```javascript
// Check if user can create more tasks
const result = await cleanupService.checkTaskLimit(userId);
// Returns: { allowed, count, limit, message }

// Get retention policy info
const policy = cleanupService.getRetentionPolicy();

// Run cleanup manually (normally automatic)
await cleanupService.cleanupExpiredData();

// Update user login timer
await cleanupService.updateLastLogin(userId);
```

### Configuration
Edit limits in `cleanupService.js`:
```javascript
LIMITS: {
  MAX_TASKS_PER_USER: 50,
  COMPLETED_TASK_TTL_DAYS: 3,
  INCOMPLETE_TASK_TTL_DAYS: 30,
  INACTIVE_USER_DAYS: 30,
  PROTECTED_USERS: ['linaresivn@gmail.com', 'testuser']
}
```

---

## ❓ FAQ

**Q: Will my data be deleted?**  
A: Only if you're inactive for 30+ days or exceed limits. Stay active to keep your data.

**Q: Can I increase the task limit?**  
A: Yes! Edit `cleanupService.js` and change `MAX_TASKS_PER_USER`. For Supabase, it won't charge extra.

**Q: How do I prevent auto-deletion?**  
A: Login at least once every 30 days. Your `last_login` timestamp updates automatically.

**Q: Can completed tasks be recovered?**  
A: No, they're permanently deleted after 3 days. If important, keep them incomplete.

**Q: Does this apply to the protected accounts?**  
A: No. `linaresivn@gmail.com` and `testuser` are never auto-deleted.

**Q: Can I request a longer TTL?**  
A: Yes, modify `cleanupService.js` - it's your app!

---

## 📈 Supabase Impact

With these retention policies:

- **Database Size:** < 10 MB (instead of unlimited)
- **Cost:** ✅ Always FREE (Supabase free tier = 500 MB limit)
- **Cleanup Overhead:** < 1ms per run (every 12 hours)
- **Performance:** No impact (runs in background)

---

## 📝 Changes Log

### Version 1.0 (March 5, 2026)
- ✅ Initial retention policy
- ✅ Task TTL (3 days completed, 30 days incomplete)
- ✅ User account TTL (30 days inactive)
- ✅ 50 tasks per user limit
- ✅ Protected accounts: linaresivn@gmail.com, testuser
- ✅ Automatic cleanup every 12 hours

---

## 🤝 Need Help?

- **Questions:** Check the FAQ above
- **Issues:** GitHub Issues
- **Support:** Check DEMO.md or README.md

---

**Last Updated:** April 5, 2025  
**Policy Version:** 1.0  
**Status:** ✅ Active
