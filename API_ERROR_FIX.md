# API Error Fix - Backend Setup Guide

## Problem Fixed

The frontend was throwing "Failed to fetch" errors because the Node.js/Express backend server was not running. 

**Error Details:**
- Frontend tried to fetch from `http://localhost:5000/api`
- Backend server wasn't listening on port 5000
- API requests failed with `TypeError: Failed to fetch`

## Solution Applied

### 1. **Graceful Fallback System**
The API service now:
- ✅ Attempts to connect to the backend with a 5-second timeout
- ✅ Falls back to sample data if backend is unavailable
- ✅ Includes a demo mode indicator on the page
- ✅ Shows warning banner when using sample data

### 2. **Demo Mode Indicator**
A yellow banner displays at the top when backend is offline:
```
⚠️ Demo Mode: Backend server not running. Showing sample data. 
To connect to real database, start the Node.js backend with npm run dev
```

### 3. **Improved Error Handling**
- Added `AbortSignal.timeout(5000)` to prevent hanging requests
- Graceful degradation to fallback data
- Console warnings for debugging
- Responses include `isOffline: true` flag

## Current State

✅ **Frontend is working** - Shows sample data for jobs and candidates  
✅ **Search/Filter works** - Filters the sample data  
✅ **No errors** - API service handles missing backend gracefully  
⚠️ **Backend not connected** - Data is not persisted to database

## To Connect Real Backend

### Option 1: Run Backend in Same Container

Terminal 1 - Start both frontend and backend:
```bash
npm run dev
```

This uses `concurrently` to run:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Option 2: Start Backend Separately

Terminal 1 - Frontend:
```bash
npm start
```

Terminal 2 - Backend:
```bash
npm run server
```

## Prerequisites for Backend

Before running the backend, ensure:

1. **PostgreSQL is installed and running**
   ```bash
   # Check if PostgreSQL is running
   psql -U postgres -c "SELECT 1"
   ```

2. **Database is created**
   ```bash
   psql -U postgres -c "CREATE DATABASE jobzilla;"
   ```

3. **Environment variables are configured**
   - Update `.env` with your database credentials
   - Default PostgreSQL user is `postgres`

4. **Database schema is initialized**
   ```bash
   node server/init/init-db.js
   ```

## Environment Variables

Create/update `.env` with:
```env
# Database Configuration
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jobzilla

# Server Configuration
SERVER_PORT=5000
FRONTEND_URL=http://localhost:3000

# Frontend Configuration
VITE_API_URL=http://localhost:5000/api
```

## What Changes When Backend is Connected

### Before (Demo Mode - Current)
- ❌ Data is not saved
- ✅ Search works with sample data
- ✅ Page loads instantly
- ✅ No database required

### After (Real Backend)
- ✅ Data is saved to PostgreSQL
- ✅ Search queries the real database
- ✅ Can add new jobs/candidates
- ✅ Data persists between sessions
- ⚠️ Requires PostgreSQL running

## API Endpoints (When Backend is Running)

### Jobs
- `GET /api/jobs` - List all jobs
- `GET /api/jobs?title=developer` - Search jobs by title
- `GET /api/jobs?location=qatar` - Filter by location
- `GET /api/jobs/:id` - Get specific job
- `POST /api/jobs` - Create new job

### Candidates
- `GET /api/candidates` - List all candidates
- `GET /api/candidates?title=developer` - Search candidates
- `GET /api/candidates/:id` - Get specific candidate
- `POST /api/candidates` - Create new candidate

### Health
- `GET /api/health` - Check backend status

## Troubleshooting

### Can't find PostgreSQL?
```bash
# Install PostgreSQL
# macOS with Homebrew:
brew install postgresql@15

# Start PostgreSQL service:
brew services start postgresql@15

# Ubuntu/Debian:
sudo apt-get install postgresql
sudo systemctl start postgresql
```

### Database already exists?
```bash
# Drop and recreate:
psql -U postgres -c "DROP DATABASE jobzilla;"
psql -U postgres -c "CREATE DATABASE jobzilla;"
node server/init/init-db.js
```

### Port 5000 already in use?
Change `SERVER_PORT` in `.env`:
```env
SERVER_PORT=3001
```

Then update `VITE_API_URL`:
```env
VITE_API_URL=http://localhost:3001/api
```

### Still seeing "Failed to fetch"?
1. Check browser console (F12) for detailed errors
2. Verify `.env` file exists and has correct values
3. Ensure PostgreSQL is running: `psql -U postgres -c "SELECT 1"`
4. Run initialization: `node server/init/init-db.js`
5. Start backend: `npm run server`
6. Refresh frontend at http://localhost:3000

## File Structure

```
project-root/
├── src/
│   └── services/
│       └── api.js              ← Updated with fallback data
├── server/
│   ├── index.js               ← Express server
│   ├── config/database.js     ← PostgreSQL config
│   ├── routes/
│   │   ├── jobs.js
│   │   └── candidates.js
│   └── init/
│       ├── schema.sql         ← Database schema
│       └── init-db.js         ← Initialization script
├── .env                       ← Your credentials
└── package.json              ← Scripts
```

## Next Steps

1. ✅ Frontend is working in demo mode
2. 📦 Install PostgreSQL on your machine
3. 🔧 Configure `.env` with your credentials
4. 🗄️ Create database and run initialization
5. 🚀 Start backend with `npm run dev` or `npm run server`
6. 🎉 Page will automatically use real database data

---

**Current State:** Demo mode with sample data ✅  
**Next Step:** Set up PostgreSQL and start backend 📦
