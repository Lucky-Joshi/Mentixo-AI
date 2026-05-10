# 🔧 Troubleshooting Guide

## CORS Error: "No 'Access-Control-Allow-Origin' header"

### Symptoms
```
Access to XMLHttpRequest at 'https://mentixo-ai.onrender.com/api/auth/login' 
from origin 'https://mentixo.netlify.app' has been blocked by CORS policy
```

### Root Causes & Solutions

#### 1. ALLOWED_ORIGINS Not Set Correctly

**Problem**: Backend doesn't know which domains to allow

**Solution**:
1. Go to Render Dashboard → Your backend service
2. Click **Environment**
3. Set `ALLOWED_ORIGINS`:
   ```
   https://mentixo.netlify.app,https://www.mentixo.netlify.app,http://localhost:5173
   ```
4. **Important**: No trailing slashes, comma-separated, no spaces
5. Click **Save** → Render auto-redeploys

#### 2. Backend Not Running

**Problem**: Render service crashed or didn't start

**Solution**:
1. Go to Render Dashboard → Your service
2. Check **Logs** tab for errors
3. Look for:
   - Database connection errors
   - Missing environment variables
   - Port binding issues
4. If crashed, click **Manual Deploy** to restart

#### 3. Wrong API URL in Frontend

**Problem**: Client calling wrong backend URL

**Solution**:
1. Check `client/.env`:
   ```env
   VITE_API_URL=https://mentixo-ai.onrender.com/api
   ```
2. Verify the domain is correct (check Render dashboard for actual URL)
3. Must include `/api` at the end
4. No trailing slash

#### 4. Netlify Environment Variables Not Set

**Problem**: Frontend can't find backend URL

**Solution**:
1. Go to Netlify → Site settings → Build & deploy → Environment
2. Add `VITE_API_URL`:
   ```
   https://mentixo-ai.onrender.com/api
   ```
3. Trigger new deploy

---

## Testing Checklist

### ✅ Backend Health Check

Test if backend is running:
```bash
curl https://mentixo-ai.onrender.com/health
```

Expected response:
```json
{"status":"ok","env":"production"}
```

### ✅ CORS Preflight Check

Test CORS headers:
```bash
curl -X OPTIONS https://mentixo-ai.onrender.com/api/auth/login \
  -H "Origin: https://mentixo.netlify.app" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

Look for response headers:
```
Access-Control-Allow-Origin: https://mentixo.netlify.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### ✅ Login Endpoint Test

```bash
curl -X POST https://mentixo-ai.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://mentixo.netlify.app" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## Common Issues & Fixes

### Issue: "net::ERR_FAILED"
- Backend is down or unreachable
- Check Render logs
- Verify database connection
- Check if service is in "Suspended" state

### Issue: "ERR_NAME_NOT_RESOLVED"
- DNS can't resolve the domain
- Wait a few minutes for DNS propagation
- Check if Render URL is correct
- Try accessing backend directly in browser

### Issue: "ERR_CONNECTION_REFUSED"
- Backend port not listening
- Check if service started correctly
- Verify PORT environment variable is set
- Check Render logs for startup errors

### Issue: "401 Unauthorized"
- JWT_SECRET mismatch between deployments
- Database doesn't have user
- Token expired
- Wrong credentials

### Issue: "500 Internal Server Error"
- Database connection failed
- Missing environment variables
- Unhandled exception in code
- Check Render logs for details

---

## Environment Variables Checklist

### Backend (Render)
- [ ] `NODE_ENV=production`
- [ ] `PORT=5000`
- [ ] `DATABASE_URL=postgresql://...`
- [ ] `GEMINI_API_KEY=...`
- [ ] `JWT_SECRET=...` (strong random string)
- [ ] `ALLOWED_ORIGINS=https://mentixo.netlify.app,...`

### Frontend (Netlify)
- [ ] `VITE_API_URL=https://mentixo-ai.onrender.com/api`

### Local Development
- [ ] `server/.env` with all backend variables
- [ ] `client/.env` with `VITE_API_URL=http://localhost:5000/api`

---

## Quick Fixes

### 1. Backend Not Responding
```bash
# Check if backend is running
curl https://mentixo-ai.onrender.com/health

# If fails, go to Render and:
# 1. Check Logs tab
# 2. Click "Manual Deploy"
# 3. Wait 2-3 minutes
```

### 2. CORS Still Failing
```bash
# Clear browser cache
# Ctrl+Shift+Delete → Select "All time" → Clear data

# Hard refresh
# Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

# Try incognito mode
# Ctrl+Shift+N
```

### 3. Wrong API URL
```bash
# Check what URL frontend is using
# Open DevTools (F12) → Network tab
# Try to login
# Look at request URL in Network tab
# Should be: https://mentixo-ai.onrender.com/api/auth/login
```

---

## Getting Help

1. **Check Render Logs**:
   - Render Dashboard → Service → Logs
   - Look for error messages

2. **Check Browser Console**:
   - F12 → Console tab
   - Look for error messages

3. **Check Network Tab**:
   - F12 → Network tab
   - Click on failed request
   - Check Response headers for CORS info

4. **Test Endpoints Directly**:
   - Use curl or Postman
   - Test `/health` endpoint first
   - Then test `/api/auth/login`

---

**Last Updated**: May 10, 2026
