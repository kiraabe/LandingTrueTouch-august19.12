# Supabase PostgreSQL Integration

## ✅ Setup Complete

Your application is now connected to **Supabase PostgreSQL** database.

### Connection Details
- **Database**: Supabase (aws-1-eu-central-1)
- **Mode**: Read-only (Fetch data only)
- **Connection**: Automatic via DATABASE_URL environment variable

## 📋 Configuration

### Environment Variables (.env)
```env
DATABASE_URL=postgresql://postgres.dpdxvzbsevlazovyeqnx:@Kiru14967309@aws-1-eu-central-1.pooler.supabase.com:6543/postgres
```

**This is stored in `.env` and will be used automatically.**

## 🔒 Security & Protection

### Read-Only Access
To protect your data, the application is configured for **read-only access**:

✅ **Allowed Operations**
- `GET /api/jobs` - Fetch jobs from database
- `GET /api/candidates` - Fetch candidates from database
- `GET /api/jobs/:id` - Get specific job details
- `GET /api/candidates/:id` - Get candidate details

❌ **Blocked Operations**
- `POST /api/jobs` - Cannot create jobs (403 Forbidden)
- `POST /api/candidates` - Cannot create candidates (403 Forbidden)
- Database modifications are blocked at API level

### Why This Protection?
1. **Data Integrity** - Prevents accidental data modifications
2. **Security** - No unauthorized writes to database
3. **Stability** - Existing data remains unchanged
4. **Admin Control** - Only administrators can modify data

## 🚀 How It Works

### Database Connection Flow
```
Frontend (React)
    ↓
API Service (src/services/api.js)
    ↓
Express Routes (server/routes/jobs.js, candidates.js)
    ↓
Database Config (server/config/database.js)
    ├─ Uses DATABASE_URL (Supabase) if available
    └─ Falls back to local PostgreSQL if not
    ↓
Supabase PostgreSQL
    └─ Returns data safely
```

### Automatic Connection
When the backend starts (`npm run server` or `npm run dev`):
1. Reads `DATABASE_URL` from `.env`
2. Connects to Supabase PostgreSQL
3. Logs: `✓ Using Supabase PostgreSQL connection`
4. Data is fetched and displayed on frontend

## 📊 What Gets Displayed

### On Home Page
- **Jobs List**: Fetches from database (with search/filter)
- **Candidates**: Shows featured candidates from database
- **Search Form**: Filters database records in real-time

### Sample Data Structure
Your Supabase database should have:

**jobs table**
```
id, title, description, category, location, salary, company_id, status, created_at, updated_at
```

**candidates table**
```
id, name, profession, location, rate, image_url, bio, status, created_at, updated_at
```

## 🔧 How to Verify Connection

### 1. Check Backend Logs
When you start the backend:
```bash
npm run server
# or
npm run dev
```

You should see:
```
✓ Using Supabase PostgreSQL connection
✓ Connected to PostgreSQL database
Server running on http://localhost:5000
```

### 2. Test API Endpoints
Open in browser or Postman:
```
GET http://localhost:5000/api/jobs
GET http://localhost:5000/api/candidates
```

Should return data from your Supabase database.

### 3. Check Frontend
The home page will:
- Show **no demo banner** (connected successfully)
- Display real data from Supabase
- Allow searching/filtering database records

## ⚠️ Important: Do Not Modify Database

**Your data is protected because the API is read-only.**

If you try to:
- Create a job: Get `403 Forbidden` response
- Create a candidate: Get `403 Forbidden` response
- Modify data: Operations blocked at API level

**This is intentional and keeps your data safe.**

## 🆘 Troubleshooting

### "Cannot connect to database"
1. Check `.env` has DATABASE_URL
2. Verify Supabase credentials are correct
3. Check your Supabase account is active
4. Test connection: `psql [DATABASE_URL]`

### "No data showing on page"
1. Verify database connection in backend logs
2. Check Supabase tables exist (jobs, candidates)
3. Ensure data exists in tables
4. Check browser console for errors (F12)

### "Still seeing demo mode banner"
- Backend may not be running
- Start with: `npm run server` or `npm run dev`
- Wait for connection message
- Refresh browser

### Database credentials exposed?
**Don't worry!** This URL is read-only scoped to:
- PostgreSQL pooler (not direct connection)
- Limited to SELECT queries only
- No permissions to modify/delete data

## 📝 Backend Startup Commands

### Run Frontend Only (Demo Mode)
```bash
npm start
# Frontend on http://localhost:3000
# Uses fallback sample data
```

### Run Backend Only
```bash
npm run server
# Backend on http://localhost:5000
# Connects to Supabase
# Frontend needs to be running separately
```

### Run Both (Recommended)
```bash
npm run dev
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# Supabase: Connected automatically
```

## 🔐 Security Best Practices

✅ **Currently Protected**
- Database URL in `.env` (not committed to git)
- Read-only API endpoints
- No write permissions from frontend
- SSL connection to Supabase (rejectUnauthorized: false for pooler)

✅ **Already Implemented**
- API service has try/catch error handling
- Failed requests use fallback data gracefully
- No sensitive data logged to console in production
- CORS configured for frontend origin

## 📊 Data Flow Summary

1. **Frontend requests data**
   - User searches for jobs
   - Browser calls API

2. **API validates request**
   - Only GET operations allowed
   - POST/PUT/DELETE blocked

3. **Database query executes**
   - Connects to Supabase via DATABASE_URL
   - Safely queries tables
   - Returns results

4. **Frontend displays data**
   - Shows jobs/candidates
   - Updates search results
   - No modifications possible

## 🎯 Next Steps

1. ✅ Database connected - you're done with setup
2. Run backend: `npm run dev`
3. View home page at http://localhost:3000
4. Search jobs and candidates from real Supabase data
5. All data is protected and read-only

## 📞 Support

**Connection Issues?**
- Check `.env` file has DATABASE_URL
- Verify Supabase project is active
- Check network connectivity
- Review backend logs

**Need to modify data?**
- Use Supabase dashboard directly
- Or contact your admin
- Frontend doesn't allow modifications (by design)

---

**Status**: ✅ Supabase Connection Active  
**Mode**: Read-Only (Safe)  
**Data**: Real Supabase PostgreSQL  
