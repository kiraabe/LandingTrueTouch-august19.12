# Node.js/Express Backend Integration Plan
## Technical Specification for Jobzilla React Application

**Project**: Jobzilla Job Board Platform  
**Frontend Stack**: Vite + React 18 + React Router v6  
**Backend Stack**: Node.js + Express + PostgreSQL  
**Date**: May 2024  
**Status**: Technical Specification

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Project Structure](#project-structure)
3. [Express Setup & Configuration](#express-setup--configuration)
4. [Database Layer](#database-layer)
5. [API Endpoints](#api-endpoints)
6. [Frontend Refactoring](#frontend-refactoring)
7. [React Router Architecture](#react-router-architecture)
8. [Code Splitting & Lazy Loading](#code-splitting--lazy-loading)
9. [Error Handling & Loading States](#error-handling--loading-states)
10. [Development Server](#development-server)
11. [Production Build & Deployment](#production-build--deployment)
12. [Implementation Timeline](#implementation-timeline)

---

## 1. Project Overview

### Current State
- **Frontend**: Vite-based React SPA with 18+ homepage variations
- **Routing**: React Router v6 configured for public, candidate, and employer routes
- **Data**: Currently using hardcoded data in components
- **Build Output**: `build/` directory for Vite

### Target State
- **Unified Server**: Single Express server serving both API and static frontend
- **Database-Driven**: All data served from PostgreSQL (read-only access)
- **Scalable Architecture**: Separate concerns between frontend, API, and database
- **Development Efficiency**: Concurrent frontend (Vite) and backend development
- **Production Ready**: Single deployment artifact with optimized builds

### Key Requirements
- PostgreSQL with read-only SELECT-only queries
- REST API for all data entities
- Zero-downtime deployments capability
- Development and production parity

---

## 2. Project Structure

### Recommended Folder Layout

```
/root/app/code/
├── src/                                    # React frontend source
│   ├── app/                                # Application components
│   │   ├── common/                         # Shared components
│   │   │   ├── header/
│   │   │   ├── footer/
│   │   │   ├── popups/
│   │   │   └── floating/
│   │   ├── pannels/                        # Page panels/sections
│   │   │   └── public-user/components/
│   │   └── form-processing/
│   ├── layouts/                            # Layout wrappers
│   ├── routing/                            # Route definitions
│   ├── globals/                            # Global configs & constants
│   ├── hooks/                              # Custom React hooks (NEW)
│   │   ├── useApi.js                       # API data fetching hook
│   │   ├── useCache.js                     # Client-side caching
│   │   └── useErrorHandler.js              # Error handling
│   ├── services/                           # API service layer (NEW)
│   │   ├── api.js                          # Base API client
│   │   ├── candidates.js                   # Candidate API calls
│   │   ├── jobs.js                         # Job API calls
│   │   ├── blogs.js                        # Blog API calls
│   │   ├── employers.js                    # Employer API calls
│   │   ├── locations.js                    # Location API calls
│   │   ├── countries.js                    # Country API calls
│   │   └── statistics.js                   # Statistics API calls
│   ├── contexts/                           # React Context (NEW)
│   │   └── DataContext.js                  # Global data context
│   ├── components/                         # Data-driven components (NEW)
│   │   ├── JobGrid.jsx
│   │   ├── JobList.jsx
│   │   ├── CandidateGrid.jsx
│   │   ├── BlogGrid.jsx
│   │   └── ErrorBoundary.jsx
│   ├── App.jsx
│   └── index.jsx
│
├── server/                                  # Backend source (NEW)
│   ├── config/
│   │   ├── database.js                     # PostgreSQL connection pool
│   │   ├── environment.js                  # Environment variables
│   │   └── constants.js                    # API constants
│   ├── routes/                             # API route handlers
│   │   ├── index.js                        # Route aggregator
│   │   ├── candidates.js
│   │   ├── jobs.js
│   │   ├── blogs.js
│   │   ├── employers.js
│   │   ├── locations.js
│   │   ├── countries.js
│   │   ├── statistics.js
│   │   ├── testimonials.js
│   │   ├── contact.js
│   │   └── logos.js
│   ├── controllers/                        # Business logic
│   │   ├── candidateController.js
│   │   ├── jobController.js
│   │   ├── blogController.js
│   │   ├── employerController.js
│   │   ├── locationController.js
│   │   ├── countryController.js
│   │   ├── statisticsController.js
│   │   ├── testimonialController.js
│   │   └── contactController.js
│   ├── queries/                            # Raw SQL queries (NEW)
│   │   ├── candidates.sql
│   │   ├── jobs.sql
│   │   ├── blogs.sql
│   │   ├── employers.sql
│   │   ├── locations.sql
│   │   ├── countries.sql
│   │   ├── statistics.sql
│   │   ├── testimonials.sql
│   │   └── logos.sql
│   ├── middleware/                         # Express middleware
│   │   ├── errorHandler.js                 # Global error handling
│   │   ├── logging.js                      # Request logging
│   │   ├── cors.js                         # CORS configuration
│   │   ├── rateLimiter.js                  # Rate limiting
│   │   └── compression.js                  # Response compression
│   ├── utils/                              # Utility functions
│   │   ├── queryBuilder.js                 # SQL query helpers
│   │   ├── responseFormatter.js            # Standard response format
│   │   ├── caching.js                      # Redis/memory caching
│   │   └── validation.js                   # Input validation
│   ├── app.js                              # Express app initialization
│   ├── server.js                           # Server entry point
│   └── .env.example                        # Environment variables template
│
├── public/                                  # Static assets
│   └── assets/                              # CSS, images, fonts, JS libs
│
├── tests/                                   # Test suite (NEW)
│   ├── frontend/
│   │   └── __tests__/
│   └── backend/
│       ├── unit/
│       └── integration/
│
├── build/                                   # Vite build output (generated)
├── node_modules/                            # Dependencies
├── dist/                                    # Backend distribution (NEW)
│
├── .env.example                             # Environment template
├── .env.local                               # Local environment (git-ignored)
├── .gitignore
├── package.json                             # Updated with server deps
├── vite.config.js                           # Vite configuration
├── INTEGRATION_PLAN.md                      # This document
├── API_DOCUMENTATION.md                     # API specs (NEW)
└── DEPLOYMENT_GUIDE.md                      # Production guide (NEW)
```

### Directory Creation Steps
```bash
# Backend structure
mkdir -p server/config
mkdir -p server/routes
mkdir -p server/controllers
mkdir -p server/queries
mkdir -p server/middleware
mkdir -p server/utils

# Frontend enhancements
mkdir -p src/hooks
mkdir -p src/services
mkdir -p src/contexts
mkdir -p src/components

# Testing
mkdir -p tests/frontend/__tests__
mkdir -p tests/backend/unit
mkdir -p tests/backend/integration
```

---

## 3. Express Setup & Configuration

### 3.1 Updated package.json

Add the following dependencies to `package.json`:

```json
{
  "name": "jobzilla",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "dependencies": {
    "@vitejs/plugin-react": "^6.0.2",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "chart.js": "^4.4.0",
    "react": "^18.2.0",
    "react-chartjs-2": "^5.2.0",
    "react-countup": "^6.4.2",
    "react-dom": "^18.2.0",
    "react-dropzone-component": "^3.2.0",
    "react-router-dom": "^6.14.0",
    "react-scripts": "5.0.1",
    "sharp": "^0.34.5",
    "vite": "^8.0.13",
    "web-vitals": "^2.1.4",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "pg": "^8.11.3",
    "pg-pool": "^3.6.1",
    "compression": "^1.7.4",
    "helmet": "^7.0.0",
    "express-rate-limit": "^7.0.0",
    "uuid": "^9.0.1",
    "joi": "^17.10.2",
    "redis": "^4.6.10",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.7.0",
    "@testing-library/react": "^13.4.0",
    "supertest": "^6.3.3"
  },
  "scripts": {
    "start": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "jest",
    "server": "node --watch server/server.js",
    "dev": "concurrently \"npm start\" \"npm run server\"",
    "build:all": "npm run build && npm run build:server",
    "build:server": "tsc server/**/*.js --outDir dist --skipLibCheck",
    "start:prod": "NODE_ENV=production node dist/server.js"
  }
}
```

### 3.2 server/server.js

```javascript
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import middleware
import errorHandler from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import apiRoutes from './routes/index.js';
import { connectDatabase } from './config/database.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get environment variables
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const VITE_BUILD_DIR = path.join(__dirname, '../build');

// ====================
// Middleware Stack
// ====================

// Security
app.use(helmet());

// CORS Configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Compression
app.use(compression());

// Logging
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting
app.use(rateLimiter());

// ====================
// API Routes
// ====================

// Mount API routes under /api prefix
app.use('/api', apiRoutes);

// ====================
// Health Check
// ====================
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

// ====================
// Static Files & Frontend
// ====================

// In production, serve the Vite build
if (NODE_ENV === 'production') {
  // Serve static files from build directory
  app.use(express.static(VITE_BUILD_DIR));

  // SPA fallback: redirect all non-API routes to index.html
  app.get('*', (req, res) => {
    // Don't redirect API calls
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(VITE_BUILD_DIR, 'index.html'));
    }
  });
}

// ====================
// Error Handling
// ====================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    message: 'The requested endpoint does not exist'
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// ====================
// Database & Server Startup
// ====================

async function startServer() {
  try {
    // Verify database connection
    await connectDatabase();
    console.log('✓ Database connection established');

    // Start Express server
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════╗
║           Jobzilla Server Running           ║
╚════════════════════════════════════════════╝
Environment: ${NODE_ENV}
Port: ${PORT}
API: http://localhost:${PORT}/api
Health: http://localhost:${PORT}/health
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
```

### 3.3 server/app.js

```javascript
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';

import errorHandler from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import apiRoutes from './routes/index.js';

const app = express();
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security & Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(compression());
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(rateLimiter());

// Routes
app.use('/api', apiRoutes);
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.path });
});
app.use(errorHandler);

export default app;
```

### 3.4 server/config/database.js

```javascript
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Connection pool configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'jobzilla',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Event handlers
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Test connection
export async function connectDatabase() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Database connected at:', result.rows[0].now);
    return result;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    throw error;
  }
}

// Wrapper for safe queries (read-only enforced)
export async function queryDatabase(sql, values = []) {
  // Security: Only allow SELECT queries
  const trimmedSql = sql.trim().toUpperCase();
  if (!trimmedSql.startsWith('SELECT')) {
    throw new Error('Only SELECT queries are allowed');
  }

  try {
    const result = await pool.query(sql, values);
    return result.rows;
  } catch (error) {
    console.error('Query error:', error.message);
    throw error;
  }
}

// Get pool for advanced usage
export function getPool() {
  return pool;
}

// Close pool on shutdown
export async function closeDatabase() {
  await pool.end();
}
```

### 3.5 server/config/environment.js

```javascript
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_PREFIX: '/api',
  
  // Database
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 5432,
  DB_NAME: process.env.DB_NAME || 'jobzilla',
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:3000',
    'http://localhost:5000'
  ],
  
  // Caching
  CACHE_TTL: parseInt(process.env.CACHE_TTL || '300', 10), // 5 minutes
  REDIS_URL: process.env.REDIS_URL,
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
  
  // Features
  ENABLE_CACHING: process.env.ENABLE_CACHING !== 'false',
  ENABLE_LOGGING: process.env.ENABLE_LOGGING !== 'false'
};

export default config;
```

---

## 4. Database Layer

### 4.1 Database Schema Overview

```sql
-- Core Tables (Read-Only from Backend)

CREATE TABLE countries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(3) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  country_id INTEGER REFERENCES countries(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE employers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location_id INTEGER REFERENCES locations(id),
  logo_url VARCHAR(500),
  website VARCHAR(500),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE candidates (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  title VARCHAR(255),
  location_id INTEGER REFERENCES locations(id),
  bio TEXT,
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  employer_id INTEGER REFERENCES employers(id),
  location_id INTEGER REFERENCES locations(id),
  salary_min DECIMAL(10, 2),
  salary_max DECIMAL(10, 2),
  job_type VARCHAR(50),
  experience_level VARCHAR(50),
  posted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deadline DATE,
  views_count INTEGER DEFAULT 0
);

CREATE TABLE blogs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  content TEXT,
  excerpt VARCHAR(500),
  author VARCHAR(255),
  featured_image VARCHAR(500),
  category VARCHAR(100),
  published_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  views_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true
);

CREATE TABLE testimonials (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE company_logos (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  logo_url VARCHAR(500) NOT NULL,
  link VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE statistics (
  id SERIAL PRIMARY KEY,
  metric_key VARCHAR(100) UNIQUE NOT NULL,
  metric_value INTEGER NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contact_submissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'new',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX idx_jobs_employer ON jobs(employer_id);
CREATE INDEX idx_jobs_location ON jobs(location_id);
CREATE INDEX idx_jobs_posted_date ON jobs(posted_date DESC);
CREATE INDEX idx_candidates_location ON candidates(location_id);
CREATE INDEX idx_blogs_published ON blogs(is_published, published_date DESC);
CREATE INDEX idx_blogs_category ON blogs(category);
```

### 4.2 Read-Only User Setup

```sql
-- Create read-only database user
CREATE USER api_reader WITH PASSWORD 'secure_password_here';

-- Grant SELECT privileges on all tables
GRANT CONNECT ON DATABASE jobzilla TO api_reader;
GRANT USAGE ON SCHEMA public TO api_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO api_reader;

-- Ensure future tables are readable
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO api_reader;
```

### 4.3 server/config/database.js (Complete)

See section 3.4 above - includes safety checks for SELECT-only queries.

### 4.4 Query Helper Utilities

**server/utils/queryBuilder.js**
```javascript
export class QueryBuilder {
  static paginate(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    return { offset, limit };
  }

  static buildWhereClause(filters = {}) {
    const conditions = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(filters)) {
      if (value !== null && value !== undefined) {
        conditions.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    return {
      where: conditions.length ? 'WHERE ' + conditions.join(' AND ') : '',
      values
    };
  }

  static buildSortClause(sortBy = 'id', direction = 'ASC') {
    const validDirections = ['ASC', 'DESC'];
    const dir = validDirections.includes(direction?.toUpperCase()) ? direction : 'ASC';
    return `ORDER BY ${sortBy} ${dir}`;
  }
}

export default QueryBuilder;
```

---

## 5. API Endpoints

### 5.1 API Response Standard Format

All endpoints follow this response structure:

```javascript
// Success (200)
{
  "success": true,
  "data": { /* payload */ },
  "metadata": {
    "timestamp": "2024-05-19T10:30:00Z",
    "page": 1,
    "limit": 20,
    "total": 150
  }
}

// Error (4xx, 5xx)
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested resource does not exist",
    "details": null
  },
  "metadata": {
    "timestamp": "2024-05-19T10:30:00Z",
    "requestId": "req-uuid-here"
  }
}
```

### 5.2 Complete API Endpoint List

#### **Jobs Endpoints**

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | `/api/jobs` | Get all jobs | `page`, `limit`, `location_id`, `employer_id`, `job_type`, `salary_min`, `salary_max`, `sort_by`, `sort_dir` |
| GET | `/api/jobs/:id` | Get job by ID | - |
| GET | `/api/jobs/search` | Search jobs | `q` (query), `filters` |
| POST | `/api/jobs/:id/view` | Increment view count | - |
| GET | `/api/jobs/featured` | Get featured jobs | `limit` |

#### **Candidates Endpoints**

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | `/api/candidates` | Get all candidates | `page`, `limit`, `location_id`, `title`, `sort_by` |
| GET | `/api/candidates/:id` | Get candidate by ID | - |
| GET | `/api/candidates/search` | Search candidates | `q`, `title`, `location_id` |
| GET | `/api/candidates/featured` | Get featured candidates | `limit` |

#### **Employers/Companies Endpoints**

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | `/api/employers` | Get all employers | `page`, `limit`, `location_id`, `sort_by` |
| GET | `/api/employers/:id` | Get employer by ID | - |
| GET | `/api/employers/:id/jobs` | Get employer's jobs | `page`, `limit` |
| GET | `/api/employers/search` | Search employers | `q` |

#### **Blogs Endpoints**

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | `/api/blogs` | Get all blog posts | `page`, `limit`, `category`, `sort_by`, `sort_dir` |
| GET | `/api/blogs/:id` | Get blog by ID | - |
| GET | `/api/blogs/slug/:slug` | Get blog by slug | - |
| GET | `/api/blogs/category/:category` | Get blogs by category | `page`, `limit` |
| POST | `/api/blogs/:id/view` | Increment view count | - |
| GET | `/api/blogs/featured` | Get featured blogs | `limit` |

#### **Locations Endpoints**

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | `/api/locations` | Get all locations | `page`, `limit`, `country_id`, `sort_by` |
| GET | `/api/locations/:id` | Get location by ID | - |
| GET | `/api/locations/country/:country_id` | Get locations by country | `page`, `limit` |
| GET | `/api/locations/search` | Search locations | `q` |

#### **Countries Endpoints**

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | `/api/countries` | Get all countries | `page`, `limit`, `sort_by` |
| GET | `/api/countries/:id` | Get country by ID | - |
| GET | `/api/countries/code/:code` | Get country by code | - |

#### **Testimonials Endpoints**

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | `/api/testimonials` | Get all testimonials | `page`, `limit`, `sort_by` |
| GET | `/api/testimonials/:id` | Get testimonial by ID | - |
| GET | `/api/testimonials/featured` | Get featured testimonials | `limit` |

#### **Statistics Endpoints**

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | `/api/statistics` | Get all statistics | - |
| GET | `/api/statistics/:metric_key` | Get specific metric | - |
| GET | `/api/statistics/summary` | Get summary stats | - |

#### **Company Logos Endpoints**

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | `/api/logos` | Get all company logos | `page`, `limit` |
| GET | `/api/logos/:id` | Get logo by ID | - |

#### **Contact Endpoints**

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/api/contact/submit` | Submit contact form | `{ name, email, subject, message }` |
| GET | `/api/contact/status/:id` | Check submission status | - |

### 5.3 Route Implementation Examples

**server/routes/index.js**
```javascript
import express from 'express';
import jobRoutes from './jobs.js';
import candidateRoutes from './candidates.js';
import blogRoutes from './blogs.js';
import employerRoutes from './employers.js';
import locationRoutes from './locations.js';
import countryRoutes from './countries.js';
import testimonialRoutes from './testimonials.js';
import logoRoutes from './logos.js';
import statisticsRoutes from './statistics.js';
import contactRoutes from './contact.js';

const router = express.Router();

router.use('/jobs', jobRoutes);
router.use('/candidates', candidateRoutes);
router.use('/blogs', blogRoutes);
router.use('/employers', employerRoutes);
router.use('/locations', locationRoutes);
router.use('/countries', countryRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/logos', logoRoutes);
router.use('/statistics', statisticsRoutes);
router.use('/contact', contactRoutes);

export default router;
```

**server/routes/jobs.js** (Example)
```javascript
import express from 'express';
import jobController from '../controllers/jobController.js';

const router = express.Router();

router.get('/', jobController.getAll);
router.get('/featured', jobController.getFeatured);
router.get('/search', jobController.search);
router.get('/:id', jobController.getById);
router.post('/:id/view', jobController.incrementViews);

export default router;
```

**server/controllers/jobController.js** (Example)
```javascript
import { queryDatabase } from '../config/database.js';
import QueryBuilder from '../utils/queryBuilder.js';

class JobController {
  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 20, location_id, employer_id, job_type } = req.query;
      const { offset, limit: parsedLimit } = QueryBuilder.paginate(page, limit);

      const filters = {};
      if (location_id) filters.location_id = location_id;
      if (employer_id) filters.employer_id = employer_id;
      if (job_type) filters.job_type = job_type;

      const { where, values } = QueryBuilder.buildWhereClause(filters);

      const query = `
        SELECT * FROM jobs 
        ${where}
        ORDER BY posted_date DESC
        LIMIT $${values.length + 1} OFFSET $${values.length + 2}
      `;

      const jobs = await queryDatabase(query, [
        ...values,
        parsedLimit,
        offset
      ]);

      const countQuery = `SELECT COUNT(*) as total FROM jobs ${where}`;
      const countResult = await queryDatabase(countQuery, values);
      const total = parseInt(countResult[0].total);

      res.json({
        success: true,
        data: jobs,
        metadata: {
          timestamp: new Date().toISOString(),
          page: parseInt(page),
          limit: parsedLimit,
          total
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const jobs = await queryDatabase('SELECT * FROM jobs WHERE id = $1', [id]);

      if (jobs.length === 0) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Job not found' }
        });
      }

      res.json({
        success: true,
        data: jobs[0],
        metadata: { timestamp: new Date().toISOString() }
      });
    } catch (error) {
      next(error);
    }
  }

  async incrementViews(req, res, next) {
    try {
      const { id } = req.params;
      // Note: This requires UPDATE permission, adjust database user accordingly
      const result = await queryDatabase(
        'UPDATE jobs SET views_count = views_count + 1 WHERE id = $1 RETURNING *',
        [id]
      );

      res.json({
        success: true,
        data: result[0],
        metadata: { timestamp: new Date().toISOString() }
      });
    } catch (error) {
      next(error);
    }
  }

  async search(req, res, next) {
    try {
      const { q = '', page = 1, limit = 20 } = req.query;
      const { offset, limit: parsedLimit } = QueryBuilder.paginate(page, limit);

      const searchQuery = `
        SELECT * FROM jobs 
        WHERE title ILIKE $1 OR description ILIKE $1
        ORDER BY posted_date DESC
        LIMIT $2 OFFSET $3
      `;

      const jobs = await queryDatabase(searchQuery, [
        `%${q}%`,
        parsedLimit,
        offset
      ]);

      res.json({
        success: true,
        data: jobs,
        metadata: { timestamp: new Date().toISOString(), page, limit: parsedLimit }
      });
    } catch (error) {
      next(error);
    }
  }

  async getFeatured(req, res, next) {
    try {
      const { limit = 10 } = req.query;
      const jobs = await queryDatabase(
        'SELECT * FROM jobs ORDER BY views_count DESC LIMIT $1',
        [limit]
      );

      res.json({
        success: true,
        data: jobs,
        metadata: { timestamp: new Date().toISOString() }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new JobController();
```

---

## 6. Frontend Refactoring

### 6.1 API Service Layer

**src/services/api.js** (Base Client)
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.timeout = 30000;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ApiError(
          error.error?.message || 'API request failed',
          response.status,
          error
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(error.message, 0, error);
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

class ApiError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
  }
}

export default new ApiClient();
export { ApiError };
```

**src/services/jobs.js**
```javascript
import api from './api.js';

export const jobService = {
  // Get all jobs with filters
  getAll: (params = {}) => api.get('/jobs', { params }),

  // Get single job
  getById: (id) => api.get(`/jobs/${id}`),

  // Search jobs
  search: (query, filters = {}) =>
    api.get('/jobs/search', { params: { q: query, ...filters } }),

  // Get featured jobs
  getFeatured: (limit = 10) =>
    api.get('/jobs/featured', { params: { limit } }),

  // Increment view count
  incrementViews: (id) => api.post(`/jobs/${id}/view`, {})
};

export default jobService;
```

**src/services/candidates.js, blogs.js, etc.**
Create similar files for each data type.

### 6.2 Custom Hooks

**src/hooks/useApi.js**
```javascript
import { useState, useEffect, useCallback } from 'react';

export function useApi(apiFunction, params = {}, options = {}) {
  const {
    skip = false,
    dependencies = [],
    cache = true,
    onSuccess,
    onError
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (skip) return;

    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction(params);
      setData(result.data || result);
      onSuccess?.(result);
    } catch (err) {
      setError(err);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  }, [apiFunction, params, skip, onSuccess, onError]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  return { data, loading, error, refetch: fetchData };
}

export default useApi;
```

**src/hooks/useErrorHandler.js**
```javascript
import { useState, useCallback } from 'react';

export function useErrorHandler() {
  const [error, setError] = useState(null);

  const handleError = useCallback((err) => {
    console.error('Error caught:', err);
    setError({
      message: err.message || 'An unexpected error occurred',
      status: err.status,
      details: err.response
    });
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { error, handleError, clearError };
}

export default useErrorHandler;
```

### 6.3 Data-Driven Components

**src/components/JobGrid.jsx**
```javascript
import React, { Suspense } from 'react';
import { useApi } from '../hooks/useApi';
import jobService from '../services/jobs';
import JobCard from './JobCard';
import Loader from '../app/common/loader';
import ErrorFallback from './ErrorFallback';

function JobGrid({ filters = {}, limit = 20 }) {
  const { data: jobsData, loading, error, refetch } = useApi(
    () => jobService.getAll({ limit, ...filters }),
    { limit, ...filters }
  );

  if (error) {
    return <ErrorFallback error={error} onRetry={refetch} />;
  }

  return (
    <div className="job-grid">
      {loading && <Loader />}
      {jobsData?.data?.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}

export default JobGrid;
```

### 6.4 Update Vite Config for API Proxy

**vite.config.js** (Updated)
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
    fs: {
      allow: [path.resolve(__dirname, '.'), path.resolve(__dirname, 'public')]
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  },
  build: {
    outDir: 'build',
    sourcemap: false,
  },
  env: {
    VITE_API_URL: '/api'
  }
});
```

---

## 7. React Router Architecture

### 7.1 Enhanced Route Structure

**src/routing/app-routes.jsx** (Updated)
```javascript
import { Routes, Route, Outlet } from "react-router-dom";
import { Suspense, lazy } from "react";
import PublicUserLayout from "../layouts/public-user-layout";
import Loader from "../app/common/loader";
import { base } from "../globals/route-names";

// Lazy load routes
const JobGrid = lazy(() => import("../app/pannels/jobs/JobGrid"));
const JobList = lazy(() => import("../app/pannels/jobs/JobList"));
const JobDetail = lazy(() => import("../app/pannels/jobs/JobDetail"));
const BlogGrid = lazy(() => import("../app/pannels/blogs/BlogGrid"));
const BlogDetail = lazy(() => import("../app/pannels/blogs/BlogDetail"));
const CandidateGrid = lazy(() => import("../app/pannels/candidates/CandidateGrid"));
const CandidateDetail = lazy(() => import("../app/pannels/candidates/CandidateDetail"));

function AppRoutes() {
  return (
    <Routes>
      <Route path={base.PUBLIC_PRE + "/*"} element={<PublicUserLayout />} />
      
      {/* Jobs Routes */}
      <Route path="/jobs">
        <Route index element={<Suspense fallback={<Loader />}><JobGrid /></Suspense>} />
        <Route path=":id" element={<Suspense fallback={<Loader />}><JobDetail /></Suspense>} />
      </Route>

      {/* Blogs Routes */}
      <Route path="/blogs">
        <Route index element={<Suspense fallback={<Loader />}><BlogGrid /></Suspense>} />
        <Route path=":id" element={<Suspense fallback={<Loader />}><BlogDetail /></Suspense>} />
      </Route>

      {/* Candidates Routes */}
      <Route path="/candidates">
        <Route index element={<Suspense fallback={<Loader />}><CandidateGrid /></Suspense>} />
        <Route path=":id" element={<Suspense fallback={<Loader />}><CandidateDetail /></Suspense>} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
```

### 7.2 Dynamic Route Generation

**src/globals/route-names.jsx** (Partially Updated)
```javascript
// Keep existing routes, add new dynamic routes
export const apiRoutes = {
  jobs: '/api/jobs',
  candidates: '/api/candidates',
  blogs: '/api/blogs',
  employers: '/api/employers',
  locations: '/api/locations',
  countries: '/api/countries'
};

// Client-side routes (UI navigation)
export const uiRoutes = {
  jobs: '/jobs',
  candidates: '/candidates',
  blogs: '/blogs',
  employers: '/employers'
};
```

---

## 8. Code Splitting & Lazy Loading

### 8.1 Lazy Loading Strategy

```javascript
// Use React.lazy for route-based code splitting
const JobGrid = lazy(() => import('../pages/JobGrid'));
const BlogDetail = lazy(() => import('../pages/BlogDetail'));
const CandidateProfile = lazy(() => import('../pages/CandidateProfile'));

// Wrap with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Route path="/jobs" element={<JobGrid />} />
</Suspense>
```

### 8.2 Dynamic Imports for Heavy Components

```javascript
// Large components imported on demand
const StatisticsChart = lazy(() => 
  import('../components/StatisticsChart')
);

const MapComponent = lazy(() =>
  import('../components/MapComponent')
);
```

### 8.3 Build Optimization

**vite.config.js** (Optimization Settings)
```javascript
export default defineConfig({
  build: {
    outDir: 'build',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          'ui-vendor': ['react-countup']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
```

---

## 9. Error Handling & Loading States

### 9.1 Error Boundary Component

**src/components/ErrorBoundary.jsx**
```javascript
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  reset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container p-5 text-center">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Something went wrong</h4>
            <p>{this.state.error?.message}</p>
            {process.env.NODE_ENV === 'development' && (
              <pre className="text-start text-muted">
                {this.state.errorInfo?.componentStack}
              </pre>
            )}
            <button 
              className="btn btn-primary mt-3"
              onClick={this.reset}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### 9.2 Error Fallback Component

**src/components/ErrorFallback.jsx**
```javascript
function ErrorFallback({ error, onRetry }) {
  return (
    <div className="alert alert-warning" role="alert">
      <h4>Failed to load data</h4>
      <p>{error?.message || 'An error occurred while fetching data'}</p>
      <button className="btn btn-sm btn-outline-warning" onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}

export default ErrorFallback;
```

### 9.3 Loading States

**src/components/SkeletonLoader.jsx**
```javascript
function SkeletonLoader({ count = 5 }) {
  return (
    <div className="skeleton-loader">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="skeleton-card animate-pulse">
          <div className="skeleton-image"></div>
          <div className="skeleton-text"></div>
        </div>
      ))}
    </div>
  );
}

export default SkeletonLoader;
```

### 9.4 Global Error Handler Middleware

**server/middleware/errorHandler.js**
```javascript
export default function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV === 'development';

  console.error('Error:', {
    message: err.message,
    status,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  res.status(status).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: isDevelopment ? err.message : 'An error occurred',
      details: isDevelopment ? err.stack : null
    },
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: req.id
    }
  });
}
```

---

## 10. Development Server

### 10.1 Concurrent Development Setup

**package.json** (Dev Scripts)
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
    "dev:frontend": "vite",
    "dev:backend": "node --watch server/server.js",
    "dev:backend:debug": "node --inspect-brk server/server.js"
  }
}
```

### 10.2 Install Concurrently

```bash
npm install --save-dev concurrently
```

### 10.3 .env.local for Development

```env
# Frontend
VITE_API_URL=http://localhost:5000/api

# Backend
NODE_ENV=development
PORT=5000
DB_USER=api_reader
DB_PASSWORD=secure_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jobzilla

# Features
ENABLE_CACHING=true
ENABLE_LOGGING=true

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5000
```

### 10.4 Development Workflow

```bash
# Terminal 1: Start dev server (runs both frontend + backend)
npm run dev

# Terminal 2 (optional): Debug backend
npm run dev:backend:debug

# OR run separately:
# Terminal 1: npm start (Vite on :3000)
# Terminal 2: npm run server (Express on :5000)
```

---

## 11. Production Build & Deployment

### 11.1 Build Process

```bash
# Build frontend
npm run build

# Result: /build directory with Vite output
# This directory is served by Express in production
```

### 11.2 Express Production Configuration

The Express server (from section 3.2) handles:
1. Serving static files from `/build`
2. Fallback to `index.html` for SPA routing (non-API requests)
3. API endpoints under `/api` prefix

### 11.3 Production Start Command

```bash
# Set environment
export NODE_ENV=production

# Start server (serves frontend + API)
npm run start:prod

# Server runs on configured PORT (default: 5000)
# Frontend: http://localhost:5000
# API: http://localhost:5000/api
# Health check: http://localhost:5000/health
```

### 11.4 Docker Deployment Example

**Dockerfile**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm install --save-dev vite @vitejs/plugin-react

# Copy source
COPY . .

# Build frontend
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy server code
COPY server/ ./server/

# Copy built frontend
COPY --from=builder /app/build ./build

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start server
CMD ["npm", "run", "start:prod"]
```

**docker-compose.yml**
```yaml
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: jobzilla
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build: .
    environment:
      NODE_ENV: production
      PORT: 5000
      DB_USER: api_reader
      DB_PASSWORD: secure_password
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: jobzilla
      CORS_ORIGIN: http://localhost:5000
    ports:
      - "5000:5000"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./server:/app/server

volumes:
  postgres_data:
```

### 11.5 Environment Variables for Production

```env
# Server
NODE_ENV=production
PORT=5000

# Database
DB_USER=api_reader
DB_PASSWORD=<secure_password>
DB_HOST=db.example.com
DB_PORT=5432
DB_NAME=jobzilla_prod

# CORS
CORS_ORIGIN=https://example.com

# Caching
ENABLE_CACHING=true
CACHE_TTL=600
REDIS_URL=redis://cache.example.com:6379

# Monitoring
LOG_LEVEL=info
SENTRY_DSN=<your_sentry_dsn>
```

---

## 12. Implementation Timeline

### Phase 1: Backend Foundation (Week 1-2)
- [ ] Set up Express server structure
- [ ] Configure PostgreSQL connection
- [ ] Create database schema
- [ ] Implement Jobs API endpoints
- [ ] Implement Candidates API endpoints

### Phase 2: Extended APIs (Week 2-3)
- [ ] Implement Blogs API endpoints
- [ ] Implement Employers/Companies API
- [ ] Implement Locations & Countries APIs
- [ ] Implement Statistics & Testimonials APIs
- [ ] Set up error handling middleware

### Phase 3: Frontend Integration (Week 3-4)
- [ ] Create API service layer
- [ ] Create custom hooks (useApi, useErrorHandler)
- [ ] Update Vite config for API proxy
- [ ] Refactor JobGrid component
- [ ] Refactor BlogGrid component
- [ ] Refactor CandidateGrid component

### Phase 4: Advanced Features (Week 4-5)
- [ ] Implement code splitting & lazy loading
- [ ] Create Error Boundary component
- [ ] Add loading states with Skeleton loaders
- [ ] Implement caching strategy
- [ ] Add request retry logic

### Phase 5: Development & Testing (Week 5-6)
- [ ] Set up concurrent dev server (concurrently)
- [ ] Test all API endpoints
- [ ] Integration testing (frontend + backend)
- [ ] Performance testing & optimization
- [ ] Load testing

### Phase 6: Production Ready (Week 6-7)
- [ ] Docker containerization
- [ ] Database migrations strategy
- [ ] Environment configuration
- [ ] CI/CD pipeline setup
- [ ] Documentation & deployment guide
- [ ] Staging deployment
- [ ] Production deployment

---

## Key Architectural Decisions

### 1. **API-First Design**
- All data flows through REST APIs
- Enables future mobile app development
- Facilitates third-party integrations

### 2. **Read-Only Database User**
- Security: Backend can only SELECT
- Prevents accidental data modifications
- Separate write-only user for admin operations

### 3. **Single Express Instance**
- Unified deployment artifact
- Simplified DevOps & scaling
- Both static assets and APIs on same port

### 4. **Lazy Loading by Default**
- Route-based code splitting
- Optimized initial load time
- Progressive enhancement

### 5. **Middleware Stack**
- Security (Helmet, CORS)
- Performance (Compression, Caching)
- Reliability (Rate limiting, Error handling)

### 6. **Environment Parity**
- Development can mirror production setup
- Same code runs in dev and prod
- Docker containers for consistency

---

## Performance Optimization Checklist

- [ ] Enable Gzip compression on responses
- [ ] Implement response caching headers
- [ ] Add database query caching (Redis)
- [ ] Lazy load images and heavy components
- [ ] Minify and bundle CSS/JS
- [ ] Use database indexes for frequent queries
- [ ] Implement pagination for large datasets
- [ ] Rate limit to prevent abuse
- [ ] Monitor API response times
- [ ] Set up CDN for static assets
- [ ] Enable HTTP/2 Server Push
- [ ] Implement service workers for offline support

---

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Validate all API inputs (Joi/validator)
- [ ] Implement rate limiting
- [ ] Use helmet for HTTP headers
- [ ] Enable CORS appropriately
- [ ] Sanitize database queries
- [ ] Store secrets in environment variables
- [ ] Use parameterized queries (prevent SQL injection)
- [ ] Implement request signing for sensitive endpoints
- [ ] Set secure cookies (httpOnly, sameSite)
- [ ] Monitor for suspicious activity
- [ ] Regular security audits

---

## Monitoring & Logging

**Recommended Tools:**
- **Logging**: Winston, Morgan
- **Error Tracking**: Sentry, Rollbar
- **Performance Monitoring**: New Relic, DataDog
- **Database Monitoring**: pgAdmin, pgBadger
- **APM**: Elastic APM, Datadog

**Key Metrics:**
- API response times
- Error rates
- Database query performance
- Cache hit rates
- Frontend performance (Core Web Vitals)

---

## Next Steps After Plan Approval

1. **Create database schema** using provided SQL
2. **Set up PostgreSQL instance** with read-only user
3. **Create server directory structure** as outlined
4. **Implement core API controllers** starting with jobs
5. **Create API service layer** in frontend
6. **Refactor frontend components** to use APIs
7. **Test locally** with concurrent dev server
8. **Deploy to staging** environment
9. **Perform load & security testing**
10. **Deploy to production**

---

## References & Resources

- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Client Library](https://node-postgres.com/)
- [React Router v6](https://reactrouter.com/)
- [Vite Documentation](https://vitejs.dev/)
- [REST API Best Practices](https://restfulapi.net/)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/sql-syntax.html)

---

**Document Version**: 1.0  
**Last Updated**: May 2024  
**Status**: Ready for Implementation
