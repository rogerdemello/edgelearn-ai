# 🚀 FREE DEPLOYMENT GUIDE
## Deploy EdgeLearn AI for $0/month

Deploy EdgeLearn AI completely free using **Vercel** (frontend), **Render** (backend), and **Supabase** (database).

**No Docker needed!** All platforms deploy directly from GitHub.

---

## 📋 Prerequisites

- GitHub account (free)
- Vercel account ([vercel.com](https://vercel.com) - free)
- Render account ([render.com](https://render.com) - free)
- Supabase account ([supabase.com](https://supabase.com) - free)
- Git installed locally
- Your code pushed to GitHub

---

## ⚡ Quick Start Checklist

### 1️⃣ Create Supabase Database (3 minutes)

1. Go to [supabase.com](https://supabase.com) → Sign in → "New project"
2. Fill in project details:
   - **Name**: edgelearn-ai
   - **Database Password**: (generate a strong password - save it!)
   - **Region**: Choose closest to your users
3. Wait ~2 minutes for database to provision
4. Go to **Settings** → **Database** → Connection string section
5. Click on **"URI"** tab
6. Copy the connection string - it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.ovbqcgecpzsgyslgaiag.supabase.co:5432/postgres
   ```
7. **IMPORTANT:** Change port from `5432` to `6543` for Render:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.ovbqcgecpzsgyslgaiag.supabase.co:6543/postgres
   ```
8. Replace `[YOUR-PASSWORD]` with your actual database password you created in step 2
9. **Save this DATABASE_URL** - you'll need it for Render!

### 2️⃣ Push to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 3️⃣ Deploy Backend to Render (5 minutes)

📖 **[See detailed step-by-step guide: RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)**

**Quick steps:**
1. Go to [render.com/new](https://dashboard.render.com) → New → Web Service
2. Connect your GitHub → Select `edgelearn-ai` repository
3. Configure:
   - Name: `edgelearn-backend`
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables:
   ```env
   DATABASE_URL=postgresql://postgres:YourPassword@db.ovbqcgecpzsgyslgaiag.supabase.co:6543/postgres
   SECRET_KEY=<generate-random-string>
   CORS_ORIGINS=http://localhost:3000
   DEBUG=False
   ```
   ⚠️ **Remember:** Use port **6543** (not 5432) for Render!  
   **Generate SECRET_KEY:** `python -c "import secrets; print(secrets.token_urlsafe(32))"`
5. Click "Create Web Service" → Wait 3-5 minutes
6. Copy your Render URL: `https://edgelearn-backend.onrender.com`
7. Test: Visit `https://your-backend.onrender.com/docs`

### 4️⃣ Deploy Frontend to Vercel (3 minutes)

📖 **[See detailed step-by-step guide: VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)**

**Quick steps:**
1. Go to [vercel.com/new](https://vercel.com/new) → Import from GitHub
2. Select `edgelearn-ai` repository
3. Configure:
   - Root Directory: `frontend`
   - Framework: Next.js (auto-detected)
4. Add environment variable:
   ```env
   NEXT_PUBLIC_API_URL=https://edgelearn-backend.onrender.com
   ```
   *(Replace with your actual Render URL)*
5. Deploy → Copy your frontend URL

### 5️⃣ Update CORS

Go back to Render → Your service → Environment:
```env
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000
```
Render will auto-redeploy.

### 6️⃣ Test Deployment

- Backend API: `https://your-backend.onrender.com/docs`
- Frontend: `https://your-app.vercel.app`
- Database: Check Supabase dashboard → Table Editor (tables auto-created on first run)

⚠️ **Note:** First request to Render may take ~30 seconds (cold start after 15 min inactivity on free tier)

---

## 🎯 Deployment Architecture

```
┌─────────────────┐
│   User Browser  │
└────────┬────────┘
         │
    ┌────▼────┐
    │ Vercel  │  ← Frontend (Next.js) - FREE
    │  CDN    │  ← Deploys from GitHub automatically
    └────┬────┘
         │
    ┌────▼────────┐         ┌──────────────┐
    │   Render    │ ───────→│  Supabase    │
    │  Backend    │         │  PostgreSQL  │
    │  (FastAPI)  │         │  Database    │
    │             │         │  FREE Tier   │
    └─────────────┘         └──────────────┘
    
    Both FREE tiers!
```

**No Docker needed!** All platforms deploy directly from your GitHub repository.

---

## � Detailed Instructions

### Setting Up Supabase Database

1. **Create Project**
   - Sign up at [supabase.com](https://supabase.com)
   - Click "New project"
   - Organization: Select or create
   - Name: `edgelearn-ai`
   - Database Password: Generate strong password (save it!)
   - Region: Choose closest to your users (e.g., `us-west-1`)
   
2. **Get Connection String**
   - After provisioning (~2 min), go to **Settings** → **Database**
   - Scroll to **Connection string** → **URI** tab
   - Copy: `postgresql://postgres.[ref]:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres`
   - Replace `[password]` with your actual database password
   
3. **Connection Pooling** (Recommended)
   - Use the **Session Mode** connection string for better performance
   - Port 6543 uses connection pooling (recommended for serverless)
   - Port 5432 is direct connection (use for migrations)

---

## 🔄 Continuous Deployment

Both platforms auto-deploy on git push:

```bash
git add .
git commit -m "Feature update"
git push origin main
```

- **Render**: Auto-deploys backend in ~3-5 min
- **Vercel**: Auto-deploys frontend in ~1 min

---

## 💰 Free Tier Limits

### Vercel (Free Hobby Plan)
- ✅ Unlimited bandwidth
- ✅ Automatic SSL
- ✅ Global CDN
- ✅ 100 deployments/day
- ⚠️ Commercial use requires Pro ($20/mo)

### Render (Free Tier)
- ✅ 750 hours/month compute time
- ✅ Automatic SSL 
- ✅ Free custom domains
- ⚠️ Spins down after 15 min of inactivity
- ⚠️ Cold start takes ~30 seconds

### Supabase (Free Tier)
- ✅ 500 MB database space
- ✅ Unlimited API requests
- ✅ 50,000 monthly active users  
- ✅ 2 GB file storage
- ✅ Automatic backups
- ⚠️ Paused after 1 week of inactivity (easily resumed)

### Total Cost
**$0/month** with free tiers! 🎉

### Upgrade Path
When you need more:
- Render Starter: $7/mo (always on, no cold starts)
- Vercel Pro: $20/mo per user
- Supabase Pro: $25/mo (8 GB database, no pausing)

---

## 🐛 Troubleshooting

### Backend won't start
- Check Render logs for errors (Dashboard → Logs tab)
- Verify DATABASE_URL is set correctly
- Check Python version (should be 3.11)
- Ensure Supabase database is not paused
- Verify `PORT` environment variable is used correctly

### Database connection failed
- Verify DATABASE_URL format: `postgresql://postgres.[ref]:[password]@...`
- Check Supabase dashboard - database might be paused (resume it)
- Use connection pooling port 6543 (not 5432) for Render
- Ensure password doesn't have special characters that need URL encoding

### Frontend can't reach backend
- Verify `NEXT_PUBLIC_API_URL` in Vercel
- Check CORS_ORIGINS in Render includes Vercel URL
- Try visiting `/docs` endpoint directly
- Check if backend is sleeping (first request takes ~30s on free tier)

### Build failures
- Check build logs in respective dashboard
- Verify all environment variables are set
- Check package.json/requirements.txt versions

---

## 📊 Monitoring

### Render
- Dashboard → Service → "Metrics" (CPU, Memory, Network)
- View logs in real-time (Logs tab)
- Monitor deployments (Events tab)

### Vercel
- Dashboard → Analytics (free)
- Speed Insights (free)
- Real-time logs

### Supabase
- Dashboard → Database → "Table Editor" (view data)
- Dashboard → "Logs" (query logs)
- Dashboard → "Reports" (database size, API usage)

---

## 🔐 Security Checklist

Before going live:

- ✅ Change `SECRET_KEY` to random string
- ✅ Set `DEBUG=False` in production
- ✅ Add your domain to CORS_ORIGINS
- ✅ Enable 2FA on Vercel, Render & Supabase accounts
- ✅ Store Supabase password securely (use environment variable)
- ✅ Enable Row Level Security (RLS) in Supabase if needed
- ✅ Set up custom domains (optional)

---

## 🌐 Custom Domain (Optional)

### Vercel
1. Dashboard → Project → "Settings" → "Domains"
2. Add your domain (e.g., `edgelearn.ai`)
3. Update DNS records as instructed

### Render
1. Service → "Settings" → "Custom Domains"
2. Add custom domain
3. Update DNS CNAME record as instructed

---

## 📝 Quick Reference

```bash
# Generate secret key
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Run migrations locally
cd backend
alembic upgrade head

# Test local build
cd frontend
pnpm run build
```

---

## 🎉 You're Live!

Your app is now deployed for free! 

**Frontend**: `https://your-app.vercel.app`
**Backend**: `https://your-backend.onrender.com`

Share your app and start getting users! 🚀

---

## 📚 Additional Resources

- [Render Documentation](https://docs.render.com)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
