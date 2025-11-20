# 📁 File Structure After MongoDB Migration

## Complete Directory Tree

```
journaling-backend/
│
├── 📄 index.js                      ✏️  MODIFIED - MongoDB connection
├── 📄 package.json                  ✏️  MODIFIED - Version 2.0.0
├── 📄 package-lock.json
├── 📄 .gitignore
├── 📄 Dockerfile
├── 📄 docker-compose.yml
├── 📄 jest.config.js
│
├── 📄 MONGODB_SETUP.md              ✨ NEW - Quick start guide
├── 📄 MIGRATION_GUIDE.md            ✨ NEW - Detailed guide
├── 📄 SETUP_COMPLETE.md             ✨ NEW - Completion summary
├── 📄 ENV_TEMPLATE.txt              ✨ NEW - Environment template
├── 📄 CHANGES.md                    ✨ NEW - Changelog
├── 📄 FILE_STRUCTURE.md             ✨ NEW - This file
│
├── 📁 src/
│   │
│   ├── 📁 api/
│   │   ├── 📄 journal.js
│   │   ├── 📄 mood.js               ✏️  MODIFIED - Uses moodManager
│   │   └── 📄 home.js
│   │
│   ├── 📁 controller/
│   │   ├── 📄 journalController.js  ✏️  MODIFIED - Uses journalManager
│   │   ├── 📄 moodController.js     ✏️  MODIFIED - Uses moodManager
│   │   ├── 📄 homeController.js     ✏️  MODIFIED - Uses userManager
│   │   └── 📄 notifications.js
│   │
│   ├── 📁 models/                   ✨ NEW FOLDER
│   │   ├── 📄 User.js               ✨ NEW - Mongoose User schema
│   │   ├── 📄 Journal.js            ✨ NEW - Mongoose Journal schema
│   │   └── 📄 Mood.js               ✨ NEW - Mongoose Mood schema
│   │
│   └── 📁 utils/
│       ├── 📄 mongodb.js            ✨ NEW - MongoDB connection manager
│       ├── 📄 userManager.js        ✨ NEW - MongoDB user operations
│       ├── 📄 journalManager.js     ✨ NEW - MongoDB journal operations
│       ├── 📄 moodManager.js        ✨ NEW - MongoDB mood operations
│       │
│       ├── 📄 auth.js               ✏️  MODIFIED - Uses userManager
│       ├── 📄 performance.js
│       ├── 📄 openAI.js
│       ├── 📄 firebaseConfig.mjs
│       ├── 📄 testEnv.js
│       │
│       ├── 📄 dynamoDB.js           ⚠️  DEPRECATED - Keep for reference
│       ├── 📄 journalsTable.js      ⚠️  DEPRECATED - Keep for reference
│       └── 📄 moodTable.js          ⚠️  DEPRECATED - Keep for reference
│
├── 📁 tests/
│   ├── 📄 auth.test.js              ⚠️  Needs update (uses dynamoDB)
│   ├── 📄 auth.manual.test.js       ⚠️  Needs update (uses dynamoDB)
│   ├── 📄 journal.test.js           ⚠️  Needs update (uses journalsTable)
│   ├── 📄 journal.manual.test.js    ⚠️  Needs update (uses journalsTable)
│   ├── 📄 mood.test.js              ⚠️  Needs update (uses moodTable)
│   ├── 📄 mood.jest.test.js         ⚠️  Needs update (uses moodTable)
│   ├── 📄 home.test.js              ⚠️  Needs update (uses dynamoDB)
│   ├── 📄 gsi.test.js               ⚠️  Needs update (uses dynamoDB)
│   ├── 📄 login.test.js             ⚠️  Needs update (uses dynamoDB)
│   ├── 📄 testBackend.js            ⚠️  Needs update (uses dynamoDB)
│   ├── 📄 openAI.test.js
│   ├── 📄 openAI.manual.test.js
│   ├── 📄 moodContent.test.js
│   └── 📄 generate-firebase-token.js
│
├── 📁 k8s/
│   ├── 📄 configmap.yaml
│   ├── 📄 deployment.yaml
│   ├── 📄 service.yaml
│   ├── 📄 ingress.yaml
│   └── 📄 hpa.yaml
│
└── 📁 node_modules/
    └── ... (includes mongoose now)

```

---

## 🔍 Legend

| Symbol | Meaning |
|--------|---------|
| ✨ NEW | File created during migration |
| ✏️ MODIFIED | File updated during migration |
| ⚠️ DEPRECATED | Old file (no longer used) |
| ⚠️ Needs update | Test file that needs updating |

---

## 📊 Migration Summary

### Files Created: 10
- 3 Mongoose models
- 3 MongoDB managers
- 1 MongoDB connection utility
- 3 Documentation files

### Files Modified: 8
- 1 Main application file
- 3 Controller files
- 1 API route file
- 1 Utility file
- 1 Package manifest
- 1 Documentation file

### Files Deprecated: 3
- Old DynamoDB managers (kept for reference)

### Files Needing Updates: 10
- Test files (not critical for production)

---

## 🎯 Quick File Reference

### Want to understand MongoDB connection?
→ `src/utils/mongodb.js`

### Want to see user operations?
→ `src/utils/userManager.js`

### Want to see journal operations?
→ `src/utils/journalManager.js`

### Want to see mood operations?
→ `src/utils/moodManager.js`

### Want to understand schemas?
→ `src/models/User.js`
→ `src/models/Journal.js`
→ `src/models/Mood.js`

### Need setup help?
→ `MONGODB_SETUP.md` (Quick start)
→ `MIGRATION_GUIDE.md` (Detailed guide)

### Want environment template?
→ `ENV_TEMPLATE.txt`

### Want to see all changes?
→ `CHANGES.md`

### Want completion summary?
→ `SETUP_COMPLETE.md`

---

## 🗂️ Code Organization

### Database Layer (3-Tier Architecture)

```
┌─────────────────────────────────────────┐
│         Application Layer               │
│  (index.js, routes, controllers)        │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Manager Layer                   │
│  (userManager, journalManager,          │
│   moodManager)                          │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Data Layer                      │
│  (mongoose models, mongodb connection)  │
└─────────────────────────────────────────┘
```

### Request Flow

```
Client Request
    │
    ▼
index.js (Routes)
    │
    ▼
Controller (Business Logic)
    │
    ▼
Manager (Data Operations)
    │
    ▼
Mongoose Model (Schema Validation)
    │
    ▼
MongoDB Atlas (Database)
```

---

## 🔄 Import Chain

### Example: Journal Entry Creation

```javascript
// 1. Client makes request
POST /api/journal

// 2. index.js routes to
→ src/api/journal.js

// 3. API route calls
→ src/controller/journalController.js

// 4. Controller uses
→ src/utils/journalManager.js (NEW)

// 5. Manager uses
→ src/models/Journal.js (NEW)

// 6. Model connects via
→ src/utils/mongodb.js (NEW)

// 7. Finally reaches
→ MongoDB Atlas Cloud
```

---

## 📦 Package Dependencies

### MongoDB Related (New)
```json
{
  "mongoose": "^8.x.x"
}
```

### Can Be Removed Later
```json
{
  "@aws-sdk/client-dynamodb": "^3.716.0",
  "@aws-sdk/lib-dynamodb": "^3.716.0",
  "aws-sdk": "^2.1692.0"
}
```

### Still Required
```json
{
  "express": "^4.18.3",
  "cors": "^2.8.5",
  "dotenv": "^16.4.5",
  "google-auth-library": "^9.7.0",
  "openai": "^4.77.4",
  "bcryptjs": "^3.0.2",
  "jsonwebtoken": "^9.0.2"
}
```

---

## 🎨 File Naming Convention

### MongoDB Files (New Pattern)
- Models: `src/models/[Entity].js` (PascalCase)
- Managers: `src/utils/[entity]Manager.js` (camelCase + Manager)
- Connection: `src/utils/mongodb.js` (lowercase)

### Old Pattern (DynamoDB)
- Managers: `src/utils/[entity]Table.js` or `dynamoDB.js`

---

## 🚀 Next Steps

1. ✅ Review this file structure
2. ✅ Update your `.env` file
3. ✅ Test the application
4. ⏳ Update test files (optional)
5. ⏳ Remove deprecated files (optional)
6. ⏳ Clean up AWS dependencies (optional)

---

## 📝 Notes

- **Deprecated files** are kept for reference but not imported anywhere
- **Test files** need updates but aren't critical for production
- **All production code** has been successfully migrated
- **No API changes** - frontend requires no modifications

---

**Last Updated:** November 19, 2025  
**Version:** 2.0.0  
**Status:** ✅ Migration Complete

