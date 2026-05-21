# Backend Integration Guide

## Architecture Overview

This project integrates a Node.js/Express.js backend with the React frontend, serving both from the same server at `http://localhost:3000`.

### Project Structure

```
├── server.js                      # Main Express server entry point
├── server/
│   ├── config/
│   │   └── database.js           # PostgreSQL connection pool
│   ├── middleware/
│   │   └── error-handler.js      # Global error handling
│   ├── routes/
│   │   ├── index.js              # API routes registry
│   │   ├── landing.js            # Landing page data
│   │   ├── candidates.js         # Candidates endpoints
│   │   ├── jobs.js               # Jobs endpoints
│   │   ├── companies.js          # Companies endpoints
│   │   ├── locations.js          # Locations endpoints
│   │   ├── blogs.js              # Blog endpoints
│   │   └── contact.js            # Contact form
│   ├── services/
│   │   ├── landing.service.js    # Landing page queries
│   │   ├── candidates.service.js # Candidates queries
│   │   ├── jobs.service.js       # Jobs queries
│   │   ├── companies.service.js  # Companies queries
│   │   ├── locations.service.js  # Locations queries
│   │   └── blogs.service.js      # Blogs queries
│   └── vite-dev-server.js        # Vite integration
├── src/
│   ├── services/
│   │   ├── api.js                # Axios client
│   │   ├── landing.api.js        # Landing API client
│   │   ├── candidates.api.js     # Candidates API client
│   │   ├── jobs.api.js           # Jobs API client
│   │   ├── companies.api.js      # Companies API client
│   │   ├── locations.api.js      # Locations API client
│   │   └── blogs.api.js          # Blogs API client
│   ├── hooks/
│   │   ├── useLanding.js         # Landing data hooks
│   │   ├── useCandidates.js      # Candidates hooks
│   │   ├── useJobs.js            # Jobs hooks
│   │   ├── useCompanies.js       # Companies hooks
│   │   ├── useBlogs.js           # Blogs hooks
│   └── components/
│       ├── ErrorBoundary.jsx     # Error boundary wrapper
│       └── LoadingSkeleton.jsx   # Loading skeleton UI
└── .env                          # Environment variables
```

## API Endpoints

### Landing Page Data
- `GET /api/landing` - Get all landing page data (stats, candidates, companies, locations, countries)
- `GET /api/landing/stats` - Get site statistics
- `GET /api/landing/candidates?limit=8` - Get featured candidates
- `GET /api/landing/companies?limit=10` - Get featured companies
- `GET /api/landing/locations?limit=10` - Get featured locations
- `GET /api/landing/countries` - Get all countries

### Candidates
- `GET /api/candidates` - Get candidates with pagination and filters
- `GET /api/candidates/:id` - Get single candidate

### Jobs
- `GET /api/jobs` - Get jobs with pagination and filters
- `GET /api/jobs/featured?limit=10` - Get featured jobs
- `GET /api/jobs/:id` - Get single job

### Companies
- `GET /api/companies` - Get companies with pagination
- `GET /api/companies/featured?limit=10` - Get featured companies
- `GET /api/companies/:id` - Get single company

### Locations
- `GET /api/locations` - Get locations with pagination and filters
- `GET /api/locations/featured?limit=10` - Get featured locations
- `GET /api/locations/countries` - Get all countries
- `GET /api/locations/:id` - Get single location

### Blogs
- `GET /api/blogs` - Get blogs with pagination
- `GET /api/blogs/latest?limit=10` - Get latest blogs
- `GET /api/blogs/:id` - Get single blog

### Contact
- `POST /api/contact` - Submit contact form

## Database Requirements

The system expects the following tables in PostgreSQL (read-only access):

### Required Tables
- `candidates` - Featured candidates with profiles
- `jobs` - Job listings
- `employers` - Company/employer information
- `locations` - Geographic locations and job markets
- `blogs` - Blog articles and content

### Expected Column Names

#### candidates
- id, first_name, last_name, title, location, expected_salary, profile_image, is_featured, is_active, created_at

#### jobs
- id, title, description, location_id, employer_id, is_featured, status, created_at

#### employers
- id, company_name, logo_path, website, is_featured, is_active, created_at

#### locations
- id, name, country, image_path, is_featured, is_active

#### blogs
- id, title, content, excerpt, author, featured_image, published_date, is_published

## Frontend Integration

### Data Fetching Hooks

All data fetching is abstracted into React hooks:

```javascript
// Usage examples
import { useLandingData, useFeaturedCandidates } from '@/hooks/useLanding';
import { useJobsList } from '@/hooks/useJobs';

function MyComponent() {
  const { data, loading, error } = useLandingData();
  const { candidates, loading: candLoading } = useFeaturedCandidates(8);
  const { data: jobs, loading: jobsLoading } = useJobsList({ limit: 20, offset: 0 });
}
```

### Error Handling & Loading States

```javascript
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingSkeleton from '@/components/LoadingSkeleton';

<ErrorBoundary>
  {loading ? (
    <LoadingSkeleton count={8} type="card" />
  ) : error ? (
    <div>Failed to load data</div>
  ) : (
    <Content data={data} />
  )}
</ErrorBoundary>
```

## Environment Variables

Create a `.env` file in the root:

```
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=development
PORT=3000
VITE_API_URL=http://localhost:3000
```

## Starting the Server

```bash
# Development mode (starts Express with Vite integration)
npm start

# Production build
npm run build

# Preview production build
npm run preview
```

## Database Connection

The system uses a PostgreSQL connection pool from the `pg` library:

```javascript
// server/config/database.js
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const query = async (text, params) => {
  return pool.query(text, params);
};
```

**Important: All queries are SELECT-only (read-only). No modifications are made to the database.**

## Static Assets

Static files are served from:
- `/public/uploads` - Admin-uploaded images and media
- `/public/assets` - General static assets

These are accessible via:
- `/uploads/...` for uploaded files
- `/assets/...` for other assets

## Media Handling

Images uploaded by the admin are served directly from the `/public/uploads` folder without duplication. The database stores the relative path, and the API returns the full path for the frontend to use.

Example:
```javascript
// Database stores: /uploads/candidate-profile-123.jpg
// API returns full path
// Frontend renders: <img src="/uploads/candidate-profile-123.jpg" />
```

## Performance Optimizations

1. **React Lazy Loading** - Routes use code splitting with `React.lazy` and `Suspense`
2. **Connection Pooling** - PostgreSQL uses a connection pool for efficiency
3. **Error Boundaries** - Graceful error handling prevents app crashes
4. **Loading Skeletons** - Better UX during data fetching
5. **Read-Only Queries** - Optimized SELECT statements with proper filtering

## Scalability Considerations

1. **Service Layer** - Business logic separated from routes
2. **API Clients** - Centralized API configuration
3. **Custom Hooks** - Reusable data fetching logic
4. **Middleware** - Modular request/response handling
5. **Error Handling** - Global error handler middleware

## Security Notes

- All database queries are parameterized to prevent SQL injection
- CORS is enabled for development
- No modifications to database (SELECT-only)
- Environment variables stored securely
- Request validation at API boundaries

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
DATABASE_URL="your_url" node -e "require('./server/config/database.js')"
```

### API Not Responding
1. Check if Express server is running
2. Verify database credentials in `.env`
3. Check console for error messages
4. Ensure PostgreSQL is accessible

### Frontend Not Loading
1. Verify Vite is properly integrated
2. Check browser console for errors
3. Ensure API URL is correct in `.env`

## Next Steps

1. Verify database schema matches expected tables
2. Test API endpoints manually with curl or Postman
3. Review frontend component integration
4. Configure additional API endpoints as needed
5. Set up proper logging and monitoring
