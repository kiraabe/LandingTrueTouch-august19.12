# Local Development Setup

## Quick Start (Everything on Localhost)

Run this one command to start both frontend and backend:

```bash
npm run dev
```

That's it! Both services will start:
- **Frontend:** http://localhost:5173 (Vite)
- **Backend:** http://localhost:3001 (Express API)

---

## What This Does

The `npm run dev` command uses `concurrently` to run:
1. Backend server on port 3001
2. Frontend dev server on port 5173

Both are completely local and don't require any tunneling.

---

## Manual Setup (If You Prefer)

If you want to run them separately in different terminals:

**Terminal 1 - Start Backend:**
```bash
npm run server
```
Shows: `✓ Server running on port 3001`

**Terminal 2 - Start Frontend:**
```bash
npm start
```
Shows: `VITE v... ready in ... ms`

Then open http://localhost:5173 in your browser.

---

## Configuration

The `.env.local` file already points to localhost:
```
VITE_API_URL=http://localhost:3001
NODE_ENV=development
```

No changes needed!

---

## Testing the API Locally

While both are running, test the API:

```bash
npm run test-api
```

You should see:
```
✓ /health: HTTP 200
✓ /api/candidates/featured: HTTP 200
```

---

## Troubleshooting

**Port 3001 already in use?**
```bash
# Find what's using port 3001
lsof -i :3001

# Kill it
kill -9 <PID>
```

**Port 5173 already in use?**
```bash
# Vite will automatically use 5173, 5174, 5175, etc.
# Or change it in vite.config.js
```

**Backend not responding?**
1. Check `.env` has valid `DATABASE_URL`
2. Check Supabase connection
3. Restart with `npm run dev`

---

## Development Workflow

1. **Start everything:** `npm run dev`
2. **Edit frontend code:** Changes hot-reload automatically
3. **Edit backend code:** Backend restarts automatically
4. **Check console:** Both frontend and backend logs appear together
5. **Stop:** Press `Ctrl+C` once to stop both

That's all you need for local development!
