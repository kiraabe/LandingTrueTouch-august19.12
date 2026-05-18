# Quick Start Guide

## Rapid Setup (5 minutes)

### 1. Install dependencies
```bash
npm install
```

### 2. Setup PostgreSQL Database
Make sure PostgreSQL is running, then create the database:
```bash
psql -U postgres -c "CREATE DATABASE jobzilla;"
```

### 3. Initialize database schema
```bash
node server/init/init-db.js
```

### 4. Update .env with your database credentials
Edit `.env` file with your PostgreSQL credentials:
```env
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jobzilla
SERVER_PORT=5000
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:5000/api
```

### 5. Run both frontend and backend together
```bash
npm run dev
```

Your app will run at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## What's Integrated

✅ **Frontend** - React 18 with Vite  
✅ **Backend** - Express.js server  
✅ **Database** - PostgreSQL with jobs & candidates tables  
✅ **API Service** - Centralized API calls from frontend  
✅ **CORS** - Configured for local development  
✅ **Home Page** - Updated to fetch real data from database  

## Test the Integration

1. Open http://localhost:5173 in your browser
2. The home page will load candidates from the database
3. Use the search form to search for jobs (by title, category, or location)
4. Click "All Candidates" to see all featured candidates

## API Endpoints

### Jobs
- `GET /api/jobs` - List all jobs
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create new job

### Candidates
- `GET /api/candidates` - List all candidates
- `GET /api/candidates/:id` - Get candidate by ID
- `POST /api/candidates` - Create new candidate

### Health
- `GET /api/health` - Check server status

## Troubleshooting

**Can't connect to database?**
- Verify PostgreSQL is running
- Check credentials in `.env`
- Run `psql -U postgres -c "SELECT 1"` to test connection

**Port 5000 in use?**
- Change `SERVER_PORT` in `.env`
- Update `VITE_API_URL` accordingly

**CORS errors?**
- Verify `FRONTEND_URL` in `.env` matches your frontend URL

## Next Steps

Read `BACKEND_SETUP.md` for detailed setup instructions and advanced configuration.
