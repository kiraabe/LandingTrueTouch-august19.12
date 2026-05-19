# Frontend Integration Guide - API Data Replacement

This guide shows how to replace hardcoded data in the Jobzilla frontend with live API calls.

## Table of Contents

1. [API Service Layer](#api-service-layer)
2. [Custom Hooks](#custom-hooks)
3. [Component Patterns](#component-patterns)
4. [Error Handling](#error-handling)
5. [Loading States](#loading-states)
6. [Example Implementations](#example-implementations)
7. [Common Patterns](#common-patterns)

---

## API Service Layer

The frontend uses a centralized API service layer that wraps Axios and handles all communication with the backend.

### Base API Client (`src/services/api.js`)

```javascript
import apiClient from './api.js';

// Automatically handles:
// - Base URL configuration
// - Request/response interceptors
// - Authentication tokens
// - Error handling
```

### Service Modules

Each data type has its own service module:

#### Jobs Service

```javascript
import jobsService from '../services/jobsService';

// Get paginated jobs with filters
const response = await jobsService.getJobs({
  page: 1,
  limit: 20,
  location: 'New York',
  jobType: 'Full-time'
});

// Get featured jobs
const featured = await jobsService.getFeaturedJobs(10);

// Get specific job
const job = await jobsService.getJobById(jobId);
```

#### Candidates Service

```javascript
import candidatesService from '../services/candidatesService';

// Get all candidates
const response = await candidatesService.getCandidates({
  page: 1,
  limit: 10,
  location: 'New York'
});

// Get featured candidates
const featured = await candidatesService.getFeaturedCandidates(6);
```

#### Blogs Service

```javascript
import blogsService from '../services/blogsService';

// Get all blogs
const response = await blogsService.getBlogs({ page: 1, limit: 10 });

// Get blog by ID
const blog = await blogsService.getBlogById(blogId);

// Get blog by slug
const blog = await blogsService.getBlogBySlug('my-blog-post');

// Get featured blogs
const featured = await blogsService.getFeaturedBlogs(5);
```

#### Static Data Service

```javascript
import staticService from '../services/staticService';

// Countries
const countries = await staticService.getCountries();

// Locations (with optional country filter)
const locations = await staticService.getLocations({ countryId: 1 });
const countryLocations = await staticService.getLocationsByCountry(1);

// Statistics
const stats = await staticService.getStatistics();

// Testimonials
const testimonials = await staticService.getTestimonials(10);

// Companies
const response = await staticService.getCompanies({ page: 1, limit: 10 });
const company = await staticService.getCompanyById(companyId);
```

---

## Custom Hooks

The `useApi` hook simplifies data fetching in React components.

### useApi Hook

Located at `src/hooks/useApi.js`

```javascript
import useApi from '../hooks/useApi';
import jobsService from '../services/jobsService';

function MyComponent() {
  const { data, loading, error, refetch } = useApi(
    () => jobsService.getFeaturedJobs(10),
    [] // dependencies
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {data?.map(job => <div key={job.id}>{job.title}</div>)}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### Hook Parameters

- **apiFunction**: Function that calls the API (required)
- **dependencies**: Array of dependencies to re-fetch data (optional, defaults to empty)

### Hook Return Values

- **data**: Response data from API
- **loading**: Boolean indicating if request is in progress
- **error**: Error object if request failed
- **refetch**: Function to manually refetch data

---

## Component Patterns

### Pattern 1: Simple Data Display

Replace hardcoded lists with API data:

**Before (Hardcoded):**
```jsx
function FeaturedJobs() {
  const jobs = [
    { id: 1, title: 'Senior Developer', company: 'ACME Inc.' },
    { id: 2, title: 'UI Designer', company: 'TechCorp' },
  ];

  return (
    <div>
      {jobs.map(job => (
        <div key={job.id}>{job.title}</div>
      ))}
    </div>
  );
}
```

**After (API-Driven):**
```jsx
import useApi from '../hooks/useApi';
import jobsService from '../services/jobsService';

function FeaturedJobs() {
  const { data, loading, error } = useApi(
    () => jobsService.getFeaturedJobs(10)
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorFallback error={error} />;

  return (
    <div>
      {data?.map(job => (
        <div key={job.id}>{job.title}</div>
      ))}
    </div>
  );
}
```

### Pattern 2: Filtering and Search

```jsx
import { useState } from 'react';
import useApi from '../hooks/useApi';
import jobsService from '../services/jobsService';

function JobSearch() {
  const [filters, setFilters] = useState({ page: 1, location: '' });
  
  const { data, loading } = useApi(
    () => jobsService.getJobs(filters),
    [filters]
  );

  const handleLocationChange = (location) => {
    setFilters({ page: 1, location });
  };

  return (
    <div>
      <input
        onChange={(e) => handleLocationChange(e.target.value)}
        placeholder="Filter by location"
      />
      {loading ? (
        <Skeleton />
      ) : (
        data?.data?.map(job => <JobCard key={job.id} job={job} />)
      )}
    </div>
  );
}
```

### Pattern 3: Pagination

```jsx
import { useState } from 'react';
import useApi from '../hooks/useApi';
import jobsService from '../services/jobsService';

function JobsList() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, loading } = useApi(
    () => jobsService.getJobs({ page, limit }),
    [page]
  );

  const pagination = data?.pagination || {};

  return (
    <div>
      {data?.data?.map(job => (
        <JobCard key={job.id} job={job} />
      ))}
      <Pagination
        current={page}
        total={pagination.pages}
        onPageChange={setPage}
      />
    </div>
  );
}
```

### Pattern 4: Detail Page

```jsx
import { useParams } from 'react-router-dom';
import useApi from '../hooks/useApi';
import jobsService from '../services/jobsService';

function JobDetail() {
  const { jobId } = useParams();
  const { data: job, loading, error } = useApi(
    () => jobsService.getJobById(jobId),
    [jobId]
  );

  if (loading) return <Skeleton type="detail" />;
  if (error) return <ErrorPage />;

  return (
    <div>
      <h1>{job.title}</h1>
      <p>{job.description}</p>
      {/* More job details */}
    </div>
  );
}
```

---

## Error Handling

### Error Boundary (Top Level)

```jsx
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Your routes */}
      </Routes>
    </ErrorBoundary>
  );
}
```

### Component Level Error Handling

```jsx
function MyComponent() {
  const { data, error } = useApi(fetchData);

  if (error) {
    return (
      <div className="error-container">
        <h2>Failed to load data</h2>
        <p>{error.message}</p>
        <button onClick={refetch}>Try Again</button>
      </div>
    );
  }

  return <div>{/* content */}</div>;
}
```

### API Client Error Handling

The Axios client automatically handles:

1. **Network errors**: Connection failures
2. **HTTP errors**: 4xx and 5xx responses
3. **Authentication errors**: 401 status (auto-redirects to login)

```javascript
try {
  const response = await jobsService.getJobs();
} catch (error) {
  console.error('API Error:', error.message);
  // Handle error...
}
```

---

## Loading States

### Skeleton Loader Component

```jsx
import SkeletonLoader from '../components/SkeletonLoader';

function MyComponent() {
  const { data, loading } = useApi(fetchData);

  if (loading) {
    return <SkeletonLoader count={3} type="card" />;
  }

  return <div>{/* actual content */}</div>;
}
```

### Custom Loading States

```jsx
function JobsList() {
  const { data, loading } = useApi(fetchJobs);

  return (
    <div>
      {loading && (
        <div className="loading-overlay">
          <spinner className="spinner" />
          <p>Loading jobs...</p>
        </div>
      )}
      {data?.map(job => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
```

---

## Example Implementations

### 1. Featured Jobs Section (Home Page)

**File**: `src/components/FeaturedJobsGrid.jsx`

Shows how to:
- Fetch featured jobs from API
- Display with company logos
- Show salary ranges
- Handle loading/error states

```jsx
import useApi from '../hooks/useApi';
import jobsService from '../services/jobsService';
import SkeletonLoader from './SkeletonLoader';

function FeaturedJobsGrid({ limit = 10 }) {
  const { data, loading, error } = useApi(
    () => jobsService.getFeaturedJobs(limit),
    [limit]
  );

  if (loading) return <SkeletonLoader count={3} type="card" />;
  if (error) return <div className="error-message">Failed to load jobs</div>;

  return (
    <div className="jobs-grid">
      {data?.map(job => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
```

### 2. Featured Candidates Section

**File**: `src/components/FeaturedCandidatesGrid.jsx`

Shows how to:
- Fetch featured candidates
- Display profile images
- Show experience and skills
- Link to candidate profiles

### 3. Statistics Section

**File**: `src/components/StatisticsSection.jsx`

Shows how to:
- Fetch statistics (job count, candidate count, etc.)
- Use CountUp for animated numbers
- Update dynamically from database

```jsx
import CountUp from 'react-countup';
import useApi from '../hooks/useApi';
import staticService from '../services/staticService';

function StatisticsSection() {
  const { data: stats } = useApi(
    () => staticService.getStatistics()
  );

  return (
    <div className="stats-grid">
      <Stat label="Total Jobs" value={stats?.totalJobs} />
      <Stat label="Total Candidates" value={stats?.totalCandidates} />
      <Stat label="Total Companies" value={stats?.totalCompanies} />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat-card">
      <CountUp end={value || 0} duration={2.5} separator="," />
      <p>{label}</p>
    </div>
  );
}
```

---

## Common Patterns

### Pattern: Dependent Data Fetching

Fetch related data in sequence:

```jsx
function JobDetailWithCompany() {
  const { jobId } = useParams();
  
  // Fetch job first
  const { data: job, loading: jobLoading } = useApi(
    () => jobsService.getJobById(jobId),
    [jobId]
  );

  // Then fetch company info
  const { data: company, loading: companyLoading } = useApi(
    () => job?.company_id ? staticService.getCompanyById(job.company_id) : null,
    [job?.company_id]
  );

  return (
    <div>
      {jobLoading ? <Skeleton /> : <JobInfo job={job} />}
      {companyLoading ? <Skeleton /> : <CompanyInfo company={company} />}
    </div>
  );
}
```

### Pattern: Multiple Data Sources

Fetch multiple resources in parallel:

```jsx
function Dashboard() {
  const { data: jobs } = useApi(() => jobsService.getFeaturedJobs());
  const { data: candidates } = useApi(() => candidatesService.getFeaturedCandidates());
  const { data: stats } = useApi(() => staticService.getStatistics());

  return (
    <div>
      <Section title="Jobs" data={jobs} />
      <Section title="Candidates" data={candidates} />
      <Section title="Stats" data={stats} />
    </div>
  );
}
```

### Pattern: Search with Debounce

```jsx
import { useState, useRef, useEffect } from 'react';
import useApi from '../hooks/useApi';
import jobsService from '../services/jobsService';

function JobSearch() {
  const [query, setQuery] = useState('');
  const debounceTimer = useRef(null);
  const [filters, setFilters] = useState({ q: '' });

  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setFilters({ q: query });
    }, 300);

    return () => clearTimeout(debounceTimer.current);
  }, [query]);

  const { data, loading } = useApi(
    () => jobsService.searchJobs(filters.q),
    [filters.q]
  );

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search jobs..."
      />
      {loading && <Skeleton />}
      {data?.map(job => <JobCard key={job.id} job={job} />)}
    </div>
  );
}
```

---

## Integration Checklist

Use this checklist when integrating API data:

- [ ] Import the appropriate service (jobsService, candidatesService, etc.)
- [ ] Use `useApi` hook to fetch data
- [ ] Handle loading state with SkeletonLoader
- [ ] Handle error state with ErrorFallback
- [ ] Set proper dependencies for useApi
- [ ] Use error boundary at top level
- [ ] Test with network throttling (DevTools)
- [ ] Verify pagination parameters if needed
- [ ] Check filter parameters match API spec
- [ ] Add retry/refresh functionality
- [ ] Test with empty data states
- [ ] Optimize re-renders with proper dependencies

---

## Migration Steps

For each page/component:

1. **Identify hardcoded data**: Find static arrays and objects
2. **Find matching API endpoint**: Look up in BACKEND_SETUP.md
3. **Create/use service**: Import or create the service module
4. **Replace with useApi**: Use the custom hook
5. **Add loading state**: Show skeleton or spinner
6. **Add error state**: Show error fallback UI
7. **Test thoroughly**: Check loading, success, and error states
8. **Remove hardcoded data**: Delete the static arrays
9. **Commit**: Push changes with clear commit message

---

## Performance Tips

1. **Use pagination**: Fetch smaller chunks of data
2. **Implement caching**: Consider Redis on backend for frequently accessed data
3. **Lazy load components**: Code split with React.lazy
4. **Memoize callbacks**: Use useCallback for stable function references
5. **Avoid unnecessary re-fetches**: Set proper dependencies
6. **Use Suspense**: For route-based code splitting
7. **Monitor API calls**: Use DevTools Network tab
8. **Implement request cancellation**: For unmounted components

---

## Troubleshooting

### Issue: API returns 404

```
GET /api/jobs 404 Not Found
```

- Verify backend is running on port 3000
- Check endpoint path matches API spec
- Ensure Vite proxy is configured (vite.config.js)

### Issue: CORS errors

```
Access to XMLHttpRequest blocked by CORS policy
```

- In development: Vite proxy should handle this
- In production: Ensure Express serves both frontend and API

### Issue: Stale data

Data doesn't update when user performs action:

```jsx
const { data, refetch } = useApi(fetchData, []);

const handleDelete = async () => {
  await deleteItem();
  refetch(); // Manually refresh
};
```

### Issue: Component unmounted error

```
Can't perform a React state update on an unmounted component
```

Use abort controller for requests:

```jsx
useEffect(() => {
  const controller = new AbortController();
  
  fetchData(controller.signal);
  
  return () => controller.abort();
}, []);
```

---

## Next Steps

1. Start with home page: Replace hardcoded statistics and featured jobs
2. Create Candidates list page using pagination pattern
3. Create Blogs list page using filtering pattern
4. Create detail pages for jobs, candidates, blogs
5. Add search/filter functionality
6. Implement authentication if needed
7. Deploy to production

