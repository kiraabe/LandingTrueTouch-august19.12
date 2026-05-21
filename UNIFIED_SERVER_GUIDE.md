# Unified Frontend + Backend Server

Everything now runs on a single Express server. No separate ports needed.

## Development Mode

Start both frontend and backend together on separate ports with hot reloading:

```bash
npm run dev
```

This runs:
- **Frontend (Vite):** http://localhost:5173 (with hot reload)
- **Backend (Express):** http://localhost:3001 (serving static files and API)

Open http://localhost:5173 in your browser. The frontend automatically proxies API calls to the backend.

---

## Production Mode

Build the React app and serve everything from a single Express server:

```bash
npm run prod
```

This:
1. Builds the React app into the `build/` folder
2. Starts Express on port 3001
3. Serves both frontend and API from http://localhost:3001

**Everything is on one server - no separate ports!**

---

## How It Works

### Architecture

```
Single Express Server (Port 3001)
├── Static Files (React app from build/)
│   ├── /
│   ├── /index.html
│   └── /assets/*
├── API Routes
│   ├── /api/candidates/featured
│   └── /health
└── Fallback (SPA routing)
    └── All unknown routes → index.html
```

### Development Flow (npm run dev)

1. Vite builds React app and serves on port 5173
2. Express serves static files and API on port 3001
3. React app makes requests to `/api/*` (relative URLs)
4. Express proxies these to the API routes
5. Hot reload works for both frontend and backend

### Production Flow (npm run prod)

1. React app is built into `build/` folder
2. Express serves the built app as static files
3. API routes are served from the same Express instance
4. Everything accessible from one URL

---

## API Endpoints

All endpoints are available at:
- **Development:** `http://localhost:3001/api/*` (from React requests)
- **Production:** `http://localhost:3001/api/*`

### Example Endpoints

- `GET /api/candidates/featured` - Get featured candidates
- `GET /health` - Server health check

---

## File Structure

```
project/
├── src/                    # React source code
│   └── ...
├── public/                 # Static assets
│   └── ...
├── build/                  # Built React app (after npm run build)
│   ├── index.html
│   └── assets/
├── routes/                 # Backend routes
│   └── candidates.js
├── db.js                   # Database connection
├── server.js               # Express server
├── .env                    # Environment variables (DATABASE_URL)
├── .env.local              # Local dev variables
└── package.json
```

---

## Environment Variables

### .env (Required)
```
DATABASE_URL=postgresql://user:pass@host/db
PORT=3001
```

### .env.local (Optional)
```
NODE_ENV=development
```

---

## Common Tasks

### Start Full-Stack Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Test Backend API Locally
```bash
npm run test-api
```

### Start Production Server
```bash
npm run prod
```

---

## Deployment

For production deployment:

1. Build the app:
   ```bash
   npm run build
   ```

2. Deploy the entire folder (with `build/`, `server.js`, `routes/`, `db.js`, and `node_modules/`)

3. Set environment variables on your server:
   ```
   DATABASE_URL=your-supabase-url
   PORT=3000
   NODE_ENV=production
   ```

4. Start the server:
   ```bash
   node server.js
   ```

Now everything runs on a single port with zero configuration needed for routing!

---

## Troubleshooting

**Port 3001 already in use?**
```bash
lsof -i :3001
kill -9 <PID>
```

**Port 5173 already in use?**
Vite will automatically try 5174, 5175, etc.

**React app not loading in production?**
Make sure you ran `npm run build` first - the `build/` folder must exist.

**API calls returning 404?**
Check that routes are mounted at `/api` prefix in `server.js`.

**Database connection error?**
Verify `DATABASE_URL` in `.env` and test with `npm run test-api`.
