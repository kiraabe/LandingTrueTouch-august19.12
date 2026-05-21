# Backend API Setup Guide

## Quick Start (Local Development with Cloud Access)

### 1. Start the Backend Server
In your terminal, run:
```bash
npm run server
```

You should see: `Server running on port 3001`

### 2. Expose to Cloud (Using ngrok)

The Builder.io cloud frontend cannot reach `localhost:3001`. To make it accessible, use ngrok:

#### Install ngrok (first time only):
```bash
npm install -g ngrok
```

#### Start ngrok in a new terminal:
```bash
ngrok http 3001
```

You'll see output like:
```
Forwarding                    https://abc123xyz.ngrok.io -> http://localhost:3001
```

Copy the HTTPS URL (e.g., `https://abc123xyz.ngrok.io`)

### 3. Configure the Frontend

Update `.env.local` with your ngrok URL:
```
VITE_API_URL=https://abc123xyz.ngrok.io
```

Restart the dev server if needed (refresh the preview in Builder.io)

### 4. Test It Out

The featured candidates section should now load data from your Supabase database!

---

## Required Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   - `.env` file already has `DATABASE_URL` and `PORT`
   - Backend connects to Supabase automatically

3. **Database Requirements:**
   - Your Supabase database must have a `candidates` table
   - Required columns: `id`, `full_name`, `job_title`, `location`, `profile_picture`, `featured`
   - Optional columns: `hourly_rate`, `daily_rate`, `rate_type`

---

## API Endpoints

### GET /api/candidates/featured
Returns featured candidates (featured = true in database)

**Response:**
```json
[
  {
    "id": 1,
    "full_name": "John Doe",
    "job_title": "Senior Developer",
    "location": "New York",
    "profile_picture": "https://...",
    "hourly_rate": 50,
    "rate_type": "Hour"
  }
]
```

---

## Troubleshooting

**"Failed to fetch" error?**
- Check backend is running: `npm run server`
- Check ngrok is running: `ngrok http 3001`
- Check API_URL in `.env.local` is correct
- Check CORS is enabled (it is in server.js)

**Database connection error?**
- Verify `DATABASE_URL` in `.env`
- Ensure Supabase SSL is allowed (already configured)
- Check your firewall allows outbound connections

**No data showing?**
- Verify `candidates` table exists in Supabase
- Verify at least one candidate has `featured = true`
- Check browser console for detailed error messages
