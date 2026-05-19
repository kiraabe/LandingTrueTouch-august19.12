# Quick Start Guide

## 1. Environment Setup (5 minutes)

### Create .env file

```bash
cp .env.example .env
```

Edit `.env` with your Supabase PostgreSQL credentials:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres.dpdxvzbsevlazovyeqnx:@Kiru14967309@aws-1-eu-central-1.pooler.supabase.com:6543/postgres
REACT_APP_API_URL=/api
CORS_ORIGIN=http://localhost:5173
```

## 2. Install Dependencies (2 minutes)

```bash
npm install
```

## 3. Run Development Server (1 minute)

```bash
npm run dev
```

This starts:
- **Frontend**: http://localhost:5173 (Vite dev server with HMR)
- **Backend**: http://localhost:3000 (Express API server)

## 4. Verify Setup (2 minutes)

### Test Backend Health
```bash
curl http://localhost:3000/api/health
```

Response:
```json
{"status":"ok","timestamp":"2024-05-19T10:30:00.000Z"}
```

### Test API Endpoint
```bash
curl http://localhost:3000/api/static/statistics
```

### View Frontend
Open http://localhost:5173 in your browser

## Project Structure Overview

```
├── server/              ← Backend Express app
│   ├── routes/          ← API endpoints
│   ├── controllers/     ← Business logic
│   ├── queries/         ← Database queries
│   └── index.js         ← Server entry point
│
├── src/                 ← React frontend
│   ├── services/        ← API clients (new)
│   ├── hooks/           ← useApi hook (new)
│   ├── components/      ← Reusable components (new)
│   └── ...
│
├── .env                 ← Environment variables
├── vite.config.js       ← Vite + API proxy config
├── nodemon.json         ← Auto-reload for backend
└── package.json         ← Dependencies & scripts
```

## Available NPM Scripts

```bash
npm run dev                # Run frontend + backend together (recommended)
npm run dev:frontend       # Run only Vite (port 5173)
npm run dev:backend        # Run only Express (port 3000)
npm run build              # Build React app to dist/
npm run build:server       # Run production server
npm run test               # Run tests
```

## API Endpoints Quick Reference

### Jobs
```bash
GET  /api/jobs                    # List jobs (paginated)
GET  /api/jobs/featured           # Featured jobs
GET  /api/jobs/:id                # Job details
```

### Candidates
```bash
GET  /api/candidates              # List candidates
GET  /api/candidates/featured     # Featured candidates
GET  /api/candidates/:id          # Candidate details
```

### Blogs
```bash
GET  /api/blogs                   # List blogs
GET  /api/blogs/featured          # Featured blogs
GET  /api/blogs/:id               # Blog details
GET  /api/blogs/by-slug/:slug     # Blog by slug
```

### Static Data
```bash
GET  /api/static/statistics       # Site statistics
GET  /api/static/countries        # Countries list
GET  /api/static/locations        # Locations list
GET  /api/static/testimonials     # Testimonials
GET  /api/static/companies        # Companies list
```

## Common Tasks

### Fetch Jobs in a Component

```jsx
import useApi from '../hooks/useApi';
import jobsService from '../services/jobsService';
import SkeletonLoader from '../components/SkeletonLoader';

function JobsList() {
  const { data, loading, error } = useApi(
    () => jobsService.getJobs({ page: 1, limit: 10 })
  );

  if (loading) return <SkeletonLoader count={3} type="card" />;
  if (error) return <div>Error loading jobs</div>;

  return (
    <div>
      {data?.data?.map(job => (
        <div key={job.id}>{job.title}</div>
      ))}
    </div>
  );
}
```

### Replace Hardcoded Data

**Before:**
```jsx
const jobs = [
  { id: 1, title: 'Developer', salary: '$50k' },
  { id: 2, title: 'Designer', salary: '$45k' },
];
```

**After:**
```jsx
const { data } = useApi(() => jobsService.getJobs());
const jobs = data?.data || [];
```

### Test API in Browser DevTools

```javascript
// In browser console
fetch('/api/jobs?limit=5')
  .then(r => r.json())
  .then(d => console.log(d))
```

## Troubleshooting

### Port Already in Use

If port 3000 or 5173 is in use:

```bash
# Find process on port 3000
lsof -i :3000
# Kill process
kill -9 <PID>
```

Or change PORT in .env:
```env
PORT=3001
```

### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

Check your DATABASE_URL in .env and verify:
1. PostgreSQL is running
2. Credentials are correct
3. Database exists
4. Network access is allowed

### Cannot Connect to API from Frontend

Check Vite proxy in `vite.config.js`:

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
}
```

### Module Not Found Errors

```bash
npm install  # Install all dependencies
```

## Next Steps

1. **Test the setup**: Run `npm run dev` and open http://localhost:5173
2. **Check API**: Visit http://localhost:3000/api/health
3. **Replace hardcoded data**: Start with home page statistics
4. **Create new pages**: Use example components (FeaturedJobsGrid, etc.)
5. **Add filtering**: Implement search and filters using API query params
6. **Deploy**: When ready, build and deploy to production

## File Locations

- **Backend code**: `server/`
- **Frontend code**: `src/`
- **API services**: `src/services/`
- **Custom hooks**: `src/hooks/`
- **Components**: `src/components/`
- **Backend setup docs**: `BACKEND_SETUP.md`
- **Frontend integration docs**: `FRONTEND_INTEGRATION.md`
- **Integration plan**: `INTEGRATION_PLAN.md`

## Key Features

✅ Express.js backend with PostgreSQL  
✅ Read-only database access (SELECT only)  
✅ Scalable API architecture (routes/controllers/queries)  
✅ Axios HTTP client with interceptors  
✅ Custom React hooks for data fetching  
✅ Error boundaries and error handling  
✅ Skeleton loaders for better UX  
✅ Vite dev server with API proxy  
✅ Production-ready build setup  
✅ Nodemon for auto-reload in development  

## Support

For detailed documentation:
- **Backend setup**: See `BACKEND_SETUP.md`
- **Frontend integration**: See `FRONTEND_INTEGRATION.md`
- **Architecture plan**: See `INTEGRATION_PLAN.md`

Questions about specific API endpoints? Check `BACKEND_SETUP.md` > "API Endpoints" section.

