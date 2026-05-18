# Backend Setup Guide - Express.js + PostgreSQL

This guide explains how to set up and run the integrated Node.js/Express backend with your React frontend.

## Project Structure

```
project-root/
├── server/
│   ├── config/
│   │   └── database.js          # PostgreSQL connection config
│   ├── routes/
│   │   ├── jobs.js              # Jobs API endpoints
│   │   └── candidates.js        # Candidates API endpoints
│   ├── init/
│   │   ├── schema.sql           # Database schema
│   │   └── init-db.js           # Database initialization script
│   └── index.js                 # Express server entry point
├── src/
│   └── services/
│       └── api.js               # Frontend API service
├── .env.example                 # Environment variables template
├── package.json                 # Dependencies
└── vite.config.js              # Vite configuration
```

## Prerequisites

- Node.js (v14+)
- PostgreSQL (v12+)
- npm or yarn

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

This installs both frontend and backend dependencies including:
- express
- pg (PostgreSQL client)
- cors
- dotenv

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update the `.env` file with your PostgreSQL credentials:

```env
# Database Configuration
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jobzilla

# Server Configuration
SERVER_PORT=5000
FRONTEND_URL=http://localhost:5173

# Frontend Configuration
VITE_API_URL=http://localhost:5000/api
```

### 3. Create PostgreSQL Database

Create the database first (if it doesn't exist):

```bash
psql -U postgres -c "CREATE DATABASE jobzilla;"
```

### 4. Initialize Database Schema

Run the database initialization script:

```bash
node server/init/init-db.js
```

This will:
- Create the `jobs` table with columns: id, title, description, category, location, salary, company_id, status, created_at, updated_at
- Create the `candidates` table with columns: id, name, profession, location, rate, image_url, bio, status, created_at, updated_at
- Create the `companies` table for future use
- Create indexes for better query performance
- Insert sample data for testing

### 5. Update Frontend Import

The home page component has been updated to use the API service. Make sure the old `index18.jsx` file is replaced with the new `Home18.jsx` file, or update your routes to point to the new component.

Update your route configuration if needed:

```javascript
// In your routes file
import Home18Page from 'path/to/Home18.jsx'
```

## Running the Application

### Option 1: Run Frontend and Backend Together

```bash
npm run dev
```

This uses `concurrently` to run both:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### Option 2: Run Separately

Terminal 1 - Frontend only:
```bash
npx vite
```

Terminal 2 - Backend only:
```bash
node server/index.js
```

## API Endpoints

### Jobs Endpoints

- **GET** `/api/jobs` - Get all jobs with optional filters
  - Query params: `title`, `category`, `location`, `limit`, `offset`
  - Example: `/api/jobs?title=developer&location=saudi%20arabia`

- **GET** `/api/jobs/:id` - Get a specific job
- **POST** `/api/jobs` - Create a new job (requires authentication)

### Candidates Endpoints

- **GET** `/api/candidates` - Get all candidates with optional filters
  - Query params: `title`, `location`, `limit`, `offset`
  - Example: `/api/candidates?title=accountant&limit=8`

- **GET** `/api/candidates/:id` - Get a specific candidate
- **POST** `/api/candidates` - Create a new candidate

### Health Check

- **GET** `/api/health` - Server health check

## Frontend API Service

Use the API service in your components:

```javascript
import api from '@/services/api.js'

// Get jobs
const response = await api.getJobs({ 
  title: 'developer', 
  location: 'saudi arabia',
  limit: 10 
})

// Get candidates
const candidates = await api.getCandidates({ 
  limit: 8 
})

// Health check
const health = await api.healthCheck()
```

## Database Management

### View Tables

```bash
psql -U postgres -d jobzilla -c "\dt"
```

### View Table Structure

```bash
psql -U postgres -d jobzilla -c "\d jobs"
```

### Query Data

```bash
psql -U postgres -d jobzilla -c "SELECT * FROM jobs LIMIT 5;"
```

### Backup Database

```bash
pg_dump -U postgres jobzilla > backup.sql
```

### Restore Database

```bash
psql -U postgres -d jobzilla < backup.sql
```

## Troubleshooting

### Port Already in Use

If port 5000 is already in use, change `SERVER_PORT` in `.env`:

```env
SERVER_PORT=3001
```

### Database Connection Error

1. Verify PostgreSQL is running:
   ```bash
   psql -U postgres -c "SELECT 1"
   ```

2. Check credentials in `.env` match your PostgreSQL setup

3. Ensure database exists:
   ```bash
   psql -U postgres -l | grep jobzilla
   ```

### CORS Errors

Make sure `FRONTEND_URL` in `.env` matches your frontend URL:

```env
FRONTEND_URL=http://localhost:5173
```

### Module Not Found

If you get "Cannot find module" errors:

```bash
rm -rf node_modules
npm install
```

## Next Steps

1. **Add Authentication** - Implement JWT or session-based auth
2. **Add Validation** - Validate input data in API routes
3. **Add Pagination** - Improve large dataset handling
4. **Add Filtering** - Enhance search with more filters
5. **Add Error Handling** - Implement comprehensive error handling
6. **Add Tests** - Create unit and integration tests
7. **Deploy** - Deploy to production environment

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `DB_USER` | PostgreSQL username | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | `your_password` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `jobzilla` |
| `SERVER_PORT` | Express server port | `5000` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `VITE_API_URL` | API URL for frontend | `http://localhost:5000/api` |

## Support

For issues or questions, check:
1. Server logs in console
2. Browser console for frontend errors
3. PostgreSQL logs
4. Verify all environment variables are set correctly
