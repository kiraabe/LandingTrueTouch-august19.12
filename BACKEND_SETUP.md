# Backend Integration Setup Guide

## Overview
This document outlines the setup and usage of the Node.js/Express backend integrated with the Jobzilla React frontend.

## Project Structure

```
├── server/                    # Express.js backend
│   ├── config/               # Configuration files
│   │   ├── database.js       # PostgreSQL connection pool
│   │   └── environment.js    # Environment configuration
│   ├── routes/               # API route handlers
│   │   ├── index.js          # Main API router
│   │   ├── jobs.js           # Jobs endpoints
│   │   ├── candidates.js     # Candidates endpoints
│   │   ├── blogs.js          # Blogs endpoints
│   │   └── static.js         # Static data endpoints
│   ├── controllers/          # Business logic
│   │   ├── jobsController.js
│   │   ├── candidatesController.js
│   │   ├── blogsController.js
│   │   └── staticController.js
│   ├── queries/              # Database queries (read-only)
│   │   ├── jobs.js
│   │   ├── candidates.js
│   │   ├── blogs.js
│   │   └── static.js
│   ├── middleware/           # Express middleware
│   │   ├── errorHandler.js
│   │   └── requestLogger.js
│   ├── utils/                # Helper functions
│   │   └── helpers.js
│   └── index.js              # Server entry point
│
├── src/                      # React frontend
│   ├── services/             # API service layer
│   │   ├── api.js            # Base Axios client
│   │   ├── jobsService.js
│   │   ├── candidatesService.js
│   │   ├── blogsService.js
│   │   └── staticService.js
│   ├── hooks/                # Custom React hooks
│   │   └── useApi.js         # Data fetching hook
│   ├── components/           # Reusable components
│   │   ├── ErrorBoundary.jsx
│   │   └── SkeletonLoader.jsx
│   └── ...                   # Existing React app structure
│
├── vite.config.js            # Vite configuration with API proxy
├── package.json              # Dependencies including Express, Axios, pg
└── .env.example              # Environment variables template
```

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Update `.env` with your database credentials:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@host:port/dbname
REACT_APP_API_URL=/api
CORS_ORIGIN=http://localhost:5173
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- **Backend**: Express, PostgreSQL (pg), dotenv
- **Frontend**: React, Axios, React Router, etc.
- **Dev Tools**: Concurrently, Nodemon

### 3. Verify Database Connection

Before running the server, ensure your PostgreSQL database is accessible and contains the required tables:

```bash
# Test the connection
psql $DATABASE_URL
```

Required tables (read-only access):
- `jobs` - Job listings
- `candidates` - Candidate profiles
- `blogs` - Blog articles
- `companies` - Company information
- `countries` - Country data
- `locations` - Location data
- `testimonials` - Customer testimonials

### 4. Running Development Server

Run both frontend (Vite) and backend (Express) concurrently:

```bash
npm run dev
```

This starts:
- **Backend**: Express on `http://localhost:3000`
- **Frontend**: Vite on `http://localhost:5173`

The Vite dev server is configured with a proxy that forwards `/api` requests to the Express backend.

### 5. Accessing the Application

- **Frontend**: http://localhost:5173
- **API**: http://localhost:3000/api
- **API Health Check**: http://localhost:3000/api/health

## API Endpoints

### Jobs
- `GET /api/jobs` - List all jobs with pagination
- `GET /api/jobs/featured` - Get featured jobs
- `GET /api/jobs/:id` - Get job details

Query parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `jobType` - Filter by job type
- `location` - Filter by location
- `experienceLevel` - Filter by experience level
- `featured` - Show only featured jobs (true/false)

### Candidates
- `GET /api/candidates` - List all candidates
- `GET /api/candidates/featured` - Get featured candidates
- `GET /api/candidates/:id` - Get candidate details

Query parameters:
- `page`, `limit` - Pagination
- `location` - Filter by location
- `experienceYears` - Filter by minimum experience

### Blogs
- `GET /api/blogs` - List all blogs
- `GET /api/blogs/featured` - Get featured blogs
- `GET /api/blogs/:id` - Get blog details
- `GET /api/blogs/by-slug/:slug` - Get blog by URL slug

### Static Data
- `GET /api/static/countries` - List all countries
- `GET /api/static/locations` - List locations
- `GET /api/static/locations/:countryId` - Locations by country
- `GET /api/static/statistics` - Get statistics (job count, candidate count, etc.)
- `GET /api/static/testimonials` - Get testimonials
- `GET /api/static/companies` - List companies
- `GET /api/static/companies/:id` - Get company details

## API Response Format

### Success Response (200 OK)

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### Single Item Response

```json
{
  "data": { ... }
}
```

### Error Response (4xx/5xx)

```json
{
  "error": "Error message",
  "message": "Detailed error information"
}
```

## Frontend API Usage

### Using the useApi Hook

```jsx
import useApi from '../hooks/useApi';
import jobsService from '../services/jobsService';

function JobsList() {
  const { data, loading, error } = useApi(() => jobsService.getJobs({ page: 1, limit: 20 }));

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.data.map(job => (
        <div key={job.id}>{job.title}</div>
      ))}
    </div>
  );
}
```

### Direct Service Usage

```jsx
import jobsService from '../services/jobsService';

async function fetchFeaturedJobs() {
  try {
    const response = await jobsService.getFeaturedJobs(10);
    console.log(response.data);
  } catch (error) {
    console.error('Failed to fetch jobs:', error);
  }
}
```

## Database Security

### Read-Only Access

The backend uses read-only SELECT queries to ensure data integrity:

```javascript
// Query layer only executes SELECT statements
const sql = `SELECT * FROM jobs WHERE id = $1`;
const result = await query(sql, [id]);
```

### Parameterized Queries

All queries use parameterized statements to prevent SQL injection:

```javascript
// ✓ SAFE - parameterized
const result = await query('SELECT * FROM jobs WHERE id = $1', [id]);

// ✗ UNSAFE - string concatenation
const result = await query(`SELECT * FROM jobs WHERE id = ${id}`);
```

## Error Handling

### Error Boundary

The frontend includes an Error Boundary component that catches React errors:

```jsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### API Error Handling

The Axios client automatically handles 401 unauthorized responses:

```javascript
// Automatically logs out user and redirects to login
apiClient.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## Production Build

### Build the Frontend

```bash
npm run build
```

Outputs to `dist/` directory.

### Run Production Server

```bash
NODE_ENV=production npm run build:server
```

The Express server serves the built React app and API endpoints from the same port.

## Troubleshooting

### Database Connection Errors

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

- Check DATABASE_URL in .env
- Verify PostgreSQL is running
- Ensure database exists and is accessible

### API Not Responding

```
Cannot GET /api/jobs
```

- Verify backend is running (`npm run dev:backend`)
- Check that API endpoints match the defined routes
- Review Express logs for errors

### CORS Errors

- Frontend Vite proxy is configured in `vite.config.js`
- In production, Express serves both frontend and API from same origin

### Module Not Found Errors

```
Cannot find module 'express'
```

Run `npm install` to install all dependencies.

## Development Tips

1. **Use Nodemon**: Backend auto-reloads on file changes (`npm run dev:backend`)
2. **Check Logs**: Express logs all requests in development mode
3. **API Testing**: Use curl, Postman, or built-in browser DevTools
4. **Hot Module Reloading**: Vite provides HMR for frontend changes
5. **Database Inspection**: Use tools like pgAdmin for database exploration

## Performance Optimization

- Pagination: Use `limit` and `page` parameters for large datasets
- Caching: Consider adding Redis for frequently accessed data
- Indexing: Ensure database tables have proper indexes on frequently queried columns
- Code Splitting: React lazy loading for components
- Static Compression: Gzip compression for API responses (built into Express)

## Next Steps

1. Replace hardcoded data in homepage with API calls
2. Create additional pages (Candidates List, Blog List)
3. Implement filtering and search functionality
4. Add more API endpoints as needed
5. Deploy to production (Docker, Heroku, AWS, etc.)

## Support

For issues or questions:
1. Check error logs in console
2. Review API response in browser DevTools
3. Test endpoints directly with curl: `curl http://localhost:3000/api/health`
4. Check database connectivity: `psql $DATABASE_URL`
