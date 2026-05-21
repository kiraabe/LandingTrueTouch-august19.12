# Troubleshooting "Failed to Fetch" Error

## Quick Checklist

- [ ] Backend running? `npm run server`
- [ ] API URL correct? Check `.env.local` 
- [ ] ngrok running? `ngrok http 3001`
- [ ] Frontend refreshed? Hard refresh the preview
- [ ] Database configured? `.env` has `DATABASE_URL`

---

## Step-by-Step Fix

### 1. Test Backend is Running

**Terminal 1 - Start Backend:**
```bash
npm run server
```

You should see:
```
✓ Server running on port 3001
✓ Test it: curl http://localhost:3001/health
✓ If using ngrok, expose it: ngrok http 3001
```

### 2. Test Backend Locally

In a new terminal, test if backend responds:
```bash
npm run test-api
```

Expected output:
```
✓ /health: HTTP 200
✓ /api/candidates/featured: HTTP 200
```

If both pass, skip to step 4.
If they fail, your database connection is broken.

### 3. Expose Backend to Cloud (ngrok)

The cloud-hosted frontend at `739e341d70c84476b20c-shine-signal-qc7zuzvc.builderio.dev` cannot reach `localhost:3001`.

**Terminal 2 - Start ngrok:**
```bash
ngrok http 3001
```

You'll see:
```
Forwarding    https://abc123xyz.ngrok.io -> http://localhost:3001
```

Copy the HTTPS URL.

### 4. Update Frontend Configuration

Edit `.env.local`:
```
VITE_API_URL=https://abc123xyz.ngrok.io
```

(Replace `abc123xyz.ngrok.io` with your actual ngrok URL)

### 5. Refresh Preview

Hard refresh the Builder.io preview:
- `Ctrl+Shift+R` (Windows/Linux)
- `Cmd+Shift+R` (Mac)

---

## Common Issues & Fixes

### "Failed to fetch" - Backend not running
**Fix:** Run `npm run server` in terminal

### "Failed to fetch" - ngrok not running  
**Fix:** Run `ngrok http 3001` in separate terminal

### "Failed to fetch" - Wrong API URL
**Fix:** Check `.env.local` matches your ngrok URL

### "HTTP 500" error
**Fix:** Database issue. Check:
1. `.env` has valid `DATABASE_URL`
2. Supabase connection is working
3. `candidates` table exists
4. At least one candidate has `featured = true`

### "HTTP 404" error
**Fix:** Route not found. Make sure:
1. Backend is running (not an old process)
2. `routes/candidates.js` exists
3. Route is `/api/candidates/featured` (case sensitive)

### Getting "Cannot connect" message in browser
**Fix:** Check browser console for the actual API URL being used and verify it's correct

---

## Testing the Database Connection

To test if the backend can reach your Supabase database:

```bash
npm run server
```

Then in another terminal:
```bash
curl http://localhost:3001/api/candidates/featured
```

You should get back JSON with candidate data, or an error explaining the connection issue.

---

## Still Stuck?

1. Check `npm run server` terminal for error messages
2. Check browser DevTools console (F12) for detailed errors
3. Check ngrok terminal for any connection issues
4. Verify `.env.local` path and syntax
5. Try restarting both backend and ngrok services
