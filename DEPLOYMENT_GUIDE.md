# 🚀 Mentixo-AI Deployment Guide

Complete guide to deploy Mentixo-AI to production using Supabase, Vercel, and Railway/Render.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup (Supabase)](#database-setup-supabase)
3. [Backend Deployment (Railway/Render)](#backend-deployment-railwayrender)
4. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
5. [Environment Configuration](#environment-configuration)
6. [Post-Deployment](#post-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:
- GitHub account with repository pushed
- Supabase account (free tier available)
- Vercel account (free tier available)
- Railway or Render account (for backend)
- Google Gemini API key
- Domain name (optional, but recommended)

---

## Database Setup (Supabase)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Name**: mentixo-ai-prod
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait for project to initialize (5-10 minutes)

### Step 2: Get Connection String

1. Go to **Settings** → **Database**
2. Copy the connection string under "Connection string"
3. Format: `postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres?pgbouncer=true`
4. Save this for later

### Step 3: Initialize Database Schema

1. In your local project, update `.env`:
   ```env
   DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres?pgbouncer=true
   ```

2. Run initialization script:
   ```bash
   cd server
   node scripts/init-db.js
   ```

3. Verify tables created in Supabase dashboard:
   - Go to **SQL Editor**
   - Run: `SELECT * FROM information_schema.tables WHERE table_schema='public';`

---

## Backend Deployment (Railway/Render)

### Option A: Deploy to Railway

#### Step 1: Connect Repository

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Authorize and select your repository
5. Select the `server` directory as root

#### Step 2: Configure Environment Variables

1. In Railway dashboard, go to **Variables**
2. Add the following:
   ```
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres?pgbouncer=true
   GEMINI_API_KEY=your_gemini_api_key
   JWT_SECRET=generate_strong_random_string
   ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   ```

#### Step 3: Deploy

1. Railway auto-deploys on push to main
2. Monitor deployment in **Deployments** tab
3. Get your backend URL from **Settings** → **Domains**

#### Step 4: Verify Deployment

```bash
curl https://your-railway-url.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

---

### Option B: Deploy to Render

#### Step 1: Create Web Service

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Select the repository and branch (main)

#### Step 2: Configure Service

1. **Name**: mentixo-ai-server
2. **Environment**: Node
3. **Build Command**: `npm install`
4. **Start Command**: `npm run start`
5. **Root Directory**: `server`

#### Step 3: Add Environment Variables

1. Go to **Environment**
2. Add variables:
   ```
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres?pgbouncer=true
   GEMINI_API_KEY=your_gemini_api_key
   JWT_SECRET=generate_strong_random_string
   ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   ```

#### Step 4: Deploy

1. Click "Create Web Service"
2. Render auto-deploys
3. Get your URL from the dashboard

---

## Frontend Deployment (Vercel)

### Step 1: Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Select the repository

### Step 2: Configure Project

1. **Framework Preset**: Vite
2. **Root Directory**: `client`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`

### Step 3: Add Environment Variables

1. Go to **Settings** → **Environment Variables**
2. Add:
   ```
   VITE_API_URL=https://your-backend-url.com/api
   ```
   (Replace with your actual backend URL)

### Step 4: Deploy

1. Click "Deploy"
2. Vercel auto-deploys on push to main
3. Get your frontend URL from the dashboard

### Step 5: Configure Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (up to 48 hours)

---

## Environment Configuration

### Backend Environment Variables

```env
# Server
NODE_ENV=production
PORT=5000

# Database (Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres?pgbouncer=true

# API Keys
GEMINI_API_KEY=your_gemini_api_key_here

# Authentication
JWT_SECRET=generate_with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://app.yourdomain.com
```

### Frontend Environment Variables

```env
VITE_API_URL=https://your-backend-url.com/api
```

### Generate Secure JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Post-Deployment

### Step 1: Test Authentication

```bash
# Test signup
curl -X POST https://your-backend-url.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123"
  }'

# Test login
curl -X POST https://your-backend-url.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

### Step 2: Test Chat Endpoint

```bash
# Get token from login response, then:
curl -X POST https://your-backend-url.com/api/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is machine learning?"}'
```

### Step 3: Monitor Logs

**Railway:**
- Go to **Logs** tab in dashboard

**Render:**
- Go to **Logs** in service dashboard

**Vercel:**
- Go to **Deployments** → **Logs**

### Step 4: Setup Error Tracking (Optional)

Consider adding error tracking:
- [Sentry](https://sentry.io) - Error tracking
- [LogRocket](https://logrocket.com) - Session replay
- [Datadog](https://www.datadoghq.com) - Monitoring

---

## Troubleshooting

### Database Connection Issues

**Error**: `ECONNREFUSED` or `connection timeout`

**Solution**:
1. Verify DATABASE_URL is correct
2. Check Supabase project is running
3. Ensure IP whitelist allows your server
4. Test connection locally first

### CORS Errors

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
1. Update `ALLOWED_ORIGINS` in backend
2. Include protocol (https://)
3. Restart backend after changes
4. Clear browser cache

### 401 Unauthorized Errors

**Error**: `Invalid email or password` or `Unauthorized`

**Solution**:
1. Verify JWT_SECRET is same on all instances
2. Check token expiration
3. Verify user exists in database
4. Check Authorization header format: `Bearer TOKEN`

### Gemini API Errors

**Error**: `API key invalid` or `quota exceeded`

**Solution**:
1. Verify GEMINI_API_KEY is correct
2. Check API quota in Google Cloud Console
3. Ensure API is enabled
4. Check billing is active

### Database Migration Issues

**Error**: `Table does not exist`

**Solution**:
1. Run initialization script again:
   ```bash
   node scripts/init-db.js
   ```
2. Verify all tables in Supabase dashboard
3. Check DATABASE_URL is correct

### Build Failures

**Frontend build fails:**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

**Backend build fails:**
```bash
# Check Node version
node --version  # Should be 16+

# Clear cache
rm -rf node_modules
npm install
npm run build
```

---

## Performance Optimization

### Database Optimization

1. **Enable Connection Pooling**:
   - Already configured in DATABASE_URL with `pgbouncer=true`

2. **Add Indexes**:
   - Already created in schema (check `prisma/schema.prisma`)

3. **Monitor Queries**:
   - Use Supabase dashboard → **SQL Editor**

### Backend Optimization

1. **Enable Compression**:
   - Already enabled in `server.js`

2. **Rate Limiting**:
   - Already configured in middleware

3. **Caching**:
   - Browser localStorage on frontend
   - Consider Redis for backend (optional)

### Frontend Optimization

1. **Code Splitting**:
   - Vite handles automatically

2. **Image Optimization**:
   - Use optimized images in public folder

3. **Bundle Analysis**:
   ```bash
   npm run build -- --analyze
   ```

---

## Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] ALLOWED_ORIGINS is restricted to your domain
- [ ] .env file is in .gitignore
- [ ] Database password is strong
- [ ] HTTPS is enabled (automatic on Vercel/Railway/Render)
- [ ] Rate limiting is enabled
- [ ] CORS is properly configured
- [ ] Sensitive data is not logged
- [ ] API keys are not exposed in frontend code
- [ ] Database backups are enabled (Supabase auto-backups)

---

## Scaling Considerations

### When to Scale

- **Database**: When queries slow down (check Supabase metrics)
- **Backend**: When CPU/memory usage is high
- **Frontend**: When build times exceed 5 minutes

### Scaling Options

**Database**:
- Upgrade Supabase plan
- Add read replicas
- Optimize queries

**Backend**:
- Upgrade Railway/Render plan
- Add more instances
- Implement caching

**Frontend**:
- Use CDN (Vercel does this automatically)
- Optimize bundle size
- Implement lazy loading

---

## Monitoring & Maintenance

### Daily Checks

- Monitor error logs
- Check database performance
- Verify API response times

### Weekly Checks

- Review user analytics
- Check storage usage
- Update dependencies (if needed)

### Monthly Checks

- Review security logs
- Backup database
- Update documentation
- Plan scaling if needed

---

## Rollback Procedure

### If Deployment Fails

**Railway/Render:**
1. Go to **Deployments**
2. Select previous working deployment
3. Click "Redeploy"

**Vercel:**
1. Go to **Deployments**
2. Click "..." on previous deployment
3. Select "Promote to Production"

**Database:**
1. Supabase auto-backups daily
2. Go to **Backups** in Supabase dashboard
3. Restore from backup if needed

---

## Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Render Docs**: https://render.com/docs

---

## Quick Reference

### Useful Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Database operations
npx prisma studio          # Open Prisma Studio
node scripts/init-db.js    # Initialize database

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Important URLs

- **Supabase Dashboard**: https://app.supabase.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Railway Dashboard**: https://railway.app/dashboard
- **Render Dashboard**: https://dashboard.render.com

---

**Last Updated**: May 10, 2026
**Version**: 2.0
**Status**: Production Ready
