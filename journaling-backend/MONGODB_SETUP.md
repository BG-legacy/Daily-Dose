# MongoDB Atlas Setup - Quick Start

## ✅ Migration Complete!

Your Daily Dose backend has been successfully migrated from AWS DynamoDB to MongoDB Atlas.

## 🚀 Quick Setup (3 Steps)

### Step 1: Update Your `.env` File

Add this line to your `.env` file:

```bash
MONGODB_URI=mongodb+srv://bginnjr20_db_user:iQosiKK0oPB01uke@cluster0.nwdw3it.mongodb.net/?appName=Cluster0
```

### Step 2: Remove Old AWS Variables

**Delete** these lines from your `.env` file (they're no longer needed):
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`

### Step 3: Start the Server

```bash
npm start
```

## 🧪 Test the Connection

### Check Health Endpoint

```bash
curl http://localhost:3011/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-19T...",
  "services": {
    "database": "ok",
    "auth": "ok"
  }
}
```

If `database` shows `"unhealthy"`, check:
1. Is the MongoDB URI correct in `.env`?
2. Is your IP whitelisted in MongoDB Atlas?
3. Are the credentials correct?

## 📦 What Changed?

### New Dependencies
- ✅ `mongoose` - MongoDB ODM (already installed)

### New Files Created
- `src/utils/mongodb.js` - Connection manager
- `src/models/User.js` - User schema
- `src/models/Journal.js` - Journal schema
- `src/models/Mood.js` - Mood schema
- `src/utils/userManager.js` - User operations
- `src/utils/journalManager.js` - Journal operations
- `src/utils/moodManager.js` - Mood operations

### Files Updated
- `index.js` - MongoDB connection on startup
- `src/controller/journalController.js` - Uses MongoDB managers
- `src/controller/moodController.js` - Uses MongoDB manager
- `src/api/mood.js` - Uses MongoDB manager

## 🗄️ Database Collections

Your MongoDB database has 3 collections:

1. **users** - User accounts
2. **journals** - Journal entries with AI insights
3. **moods** - Daily mood tracking

## 🔍 MongoDB Atlas Dashboard

Access your database at: https://cloud.mongodb.com

**Your Connection String:**
```
mongodb+srv://cluster0.nwdw3it.mongodb.net
```

**Database User:** `bginnjr20_db_user`

## ⚡ API Endpoints (Unchanged)

All your existing API endpoints work the same way:

- `POST /register` - Create new user
- `POST /auth/login` - User login
- `GET /auth/session` - Check session
- `POST /api/journal` - Create journal entry
- `GET /api/journal` - Get all journals
- `DELETE /api/journal/:id` - Delete journal
- `POST /api/mood` - Log mood
- `GET /api/mood/summary/weekly` - Weekly mood chart

## 🆘 Troubleshooting

### "Failed to connect to MongoDB"

**Solution:**
1. Check `.env` file has `MONGODB_URI`
2. Verify MongoDB Atlas network access (IP whitelist)
3. Check credentials are correct

### "Cannot find module 'mongoose'"

**Solution:**
```bash
npm install mongoose
```

### Server starts but database shows "unhealthy"

**Solution:**
1. Check MongoDB Atlas is online
2. Verify connection string format
3. Check network connectivity

## 📚 Full Documentation

See `MIGRATION_GUIDE.md` for:
- Detailed migration information
- Data migration scripts
- Performance optimization
- Rollback procedures

## 🎉 Benefits of MongoDB Atlas

- ✅ No AWS credentials needed
- ✅ Easier local development
- ✅ Better query capabilities
- ✅ Built-in backup and monitoring
- ✅ More flexible schema management
- ✅ Free tier available

---

**Need Help?** Check the logs or refer to the full migration guide.

**All Set?** Start your server and enjoy MongoDB Atlas! 🚀

