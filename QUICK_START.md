# Quick Start Guide

## Installation & Setup (One-time)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
The `.env` file has been created with your database credentials.

Verify it contains:
```
DATABASE_URL=postgresql://postgres.dpdxvzbsevlazovyeqnx:@Kiru14967309@aws-1-eu-central-1.pooler.supabase.com:6543/postgres
NODE_ENV=development
PORT=3000
VITE_API_URL=http://localhost:3000
```

### 3. Verify Database Tables
Ensure your PostgreSQL database has these tables (you can inspect via Supabase):
- `candidates`
- `jobs`
- `employers`
- `locations`
- `blogs`

## Running the Application

### Development Mode
```bash
npm start
```

This will:
- Start Express server on `http://localhost:3000`
- Integrate Vite for React HMR (hot reload)
- Serve both frontend and API from the same URL
- Enable database connection with read-only access

### Building for Production
```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

### Preview Production Build
```bash
npm run preview
```

## What's Working Now

### ✅ Backend
- Express.js server
- PostgreSQL connection pool (read-only)
- 7 API route groups (landing, candidates, jobs, companies, locations, blogs, contact)
- Error handling middleware
- CORS enabled
- Static file serving for uploads

### ✅ Frontend  
- React with Vite
- React Router for navigation
- Axios API client with centralized configuration
- Custom hooks for data fetching (useLanding, useCandidates, useJobs, etc.)
- Error boundaries and loading skeletons
- Home page connected to live data:
  - Job statistics from database
  - Featured candidates from database
  - Featured locations from database
  - Featured companies from database
  - Latest blog posts from database

### ✅ Single Server Architecture
- Both frontend and API served from `http://localhost:3000`
- No separate ports or CORS issues
- Production-ready configuration

## API Examples

### Test Backend Connectivity
```bash
# Check if server is running
curl http://localhost:3000/api/health

# Get landing page data
curl http://localhost:3000/api/landing

# Get featured candidates
curl http://localhost:3000/api/landing/candidates

# Get jobs with filters
curl "http://localhost:3000/api/jobs?limit=10&search=developer"
```

### Using Frontend API Clients
```javascript
import landingAPI from '@/services/landing.api';

// Fetch all landing data
const data = await landingAPI.getAll();

// Fetch featured candidates
const candidates = await landingAPI.getFeaturedCandidates(8);
```

## Integrating More Pages with Live Data

The home page is already integrated. To integrate other pages:

1. **Import hooks** from `src/hooks/`
2. **Replace hardcoded data** with API calls
3. **Add loading and error states** using LoadingSkeleton and ErrorBoundary

Example:
```javascript
import { useCandidatesList } from '@/hooks/useCandidates';
import LoadingSkeleton from '@/components/LoadingSkeleton';

function CandidatesPage() {
  const { data, loading, error } = useCandidatesList({ 
    limit: 20, 
    offset: 0 
  });

  if (loading) return <LoadingSkeleton count={8} type="card" />;
  if (error) return <div>Error loading candidates</div>;

  return (
    <div className="candidates-list">
      {data?.data.map(candidate => (
        <CandidateCard key={candidate.id} candidate={candidate} />
      ))}
    </div>
  );
}
```

## File Structure Summary

```
Root
├── server.js                 ← Express entry point
├── server/                   ← Backend code
│   ├── config/              ← Database configuration
│   ├── routes/              ← API endpoints
│   ├── services/            ← Database query logic
│   └── middleware/          ← Express middleware
├── src/                     ← React frontend
│   ├── services/            ← Axios API clients
│   ├── hooks/               ← Custom data-fetching hooks
│   ├── components/          ← Reusable UI components
│   └── app/                 ← Page components
├── public/                  ← Static files & uploads
├── index.html               ← React entry point
├── vite.config.js           ← Vite configuration
├── package.json             ← Dependencies & scripts
└── .env                     ← Environment variables
```

## Database Schema Expectations

### candidates table
```sql
id, first_name, last_name, title, location, expected_salary, 
profile_image, is_featured, is_active, created_at
```

### jobs table
```sql
id, title, description, location_id, employer_id, is_featured, 
status, created_at
```

### employers table
```sql
id, company_name, logo_path, website, is_featured, 
is_active, created_at
```

### locations table
```sql
id, name, country, image_path, is_featured, is_active
```

### blogs table
```sql
id, title, content, excerpt, author, featured_image, 
published_date, is_published
```

## Troubleshooting

### Server Won't Start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill process on port 3000 if needed
kill -9 <PID>
```

### Database Connection Error
```bash
# Verify DATABASE_URL in .env is correct
# Check if PostgreSQL is accessible
DATABASE_URL="your_url" node -e "
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  pool.query('SELECT 1').then(console.log).catch(console.error);
"
```

### React Components Not Updating
- Check browser console for errors
- Verify API endpoints in browser Network tab
- Check if hooks are properly imported
- Ensure error boundaries wrap components

### Images Not Showing
- Verify image paths are correct
- Check if `/public/uploads` folder exists
- Ensure paths are served correctly via Express

## Next Steps

1. **Integrate Remaining Pages** - Apply the same pattern to other pages
2. **Add Search/Filtering** - Use existing query parameters in API
3. **Add Pagination** - Use `limit` and `offset` parameters
4. **Setup Logging** - Add Winston or similar for production logs
5. **Configure Caching** - Add Redis for performance
6. **Add Authentication** - If needed for protected routes
7. **Setup CI/CD** - GitHub Actions or similar

## Documentation

See `BACKEND_SETUP.md` for detailed architecture and configuration information.
