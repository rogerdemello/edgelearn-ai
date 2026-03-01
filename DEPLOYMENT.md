# 🚀 FREE DEPLOYMENT GUIDE
## Deploy EdgeLearn AI for $0/month

Deploy EdgeLearn AI completely free using **Vercel** (frontend) and **Railway** (backend).

**No Docker or containers needed!** Both platforms deploy directly from GitHub.

---

## 📋 Prerequisites

- GitHub account (free)
- Vercel account ([vercel.com](https://vercel.com) - free)
- Railway account ([railway.app](https://railway.app) - free)
- Git installed locally
- Your code pushed to GitHub

---

## ⚡ Quick Start Checklist

### 1️⃣ Push to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2️⃣ Deploy Backend to Railway (5 minutes)

1. Go to [railway.app/new](https://railway.app/new) → "Deploy from GitHub repo"
2. Select your `edgelearn-ai` repository
3. Add PostgreSQL: Click "+ New" → Database → PostgreSQL
4. Add Redis: Click "+ New" → Database → Redis
5. Set environment variables in backend service:
   ```env
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   SECRET_KEY=<generate-random-string>
   CORS_ORIGINS=https://your-app.vercel.app
   DEBUG=False
   OPENAI_API_KEY=sk-your-key-optional
   ```
   **Generate SECRET_KEY:** `python -c "import secrets; print(secrets.token_urlsafe(32))"`
   
6. Configure service:
   - Settings → Root Directory: `backend`
   - Settings → Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
7. Deploy and generate domain → Copy your backend URL

### 3️⃣ Deploy Frontend to Vercel (3 minutes)

1. Go to [vercel.com/new](https://vercel.com/new) → Import from GitHub
2. Select `edgelearn-ai` repository
3. Configure:
   - Root Directory: `frontend`
   - Framework: Next.js (auto-detected)
4. Add environment variable:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```
5. Deploy → Copy your frontend URL

### 4️⃣ Update CORS

Go back to Railway backend → Update environment variable:
```env
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000
```

### 5️⃣ Test Deployment

- Backend API: `https://your-backend.railway.app/docs`
- Frontend: `https://your-app.vercel.app`

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
    ┌────▼────────┐
    │  Railway    │  ← Backend (FastAPI) - FREE $5 credit/month
    │  - Backend  │  ← Builds with Nixpacks (auto-detected)
    │  - Postgres │  ← Managed PostgreSQL database
    │  - Redis    │  ← Managed Redis cache
    └─────────────┘
```

**No Docker required!** Both platforms deploy directly from your GitHub repository.

---

## 🚀 Part 1: Deploy Backend to Railway

### Step 1: Push to GitHub

```bash
# Initialize git if not already done
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Deploy on Railway

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `edgelearn-ai` repository
5. Railway will auto-detect Python and build using Nixpacks (no Docker needed!)

### Step 3: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will create a database and provide `DATABASE_URL`

### Step 4: Add Redis

1. Click **"+ New"** again
2. Select **"Database"** → **"Redis"**
3. Railway will create Redis and provide `REDIS_URL`

### Step 5: Configure Environment Variables

In Railway dashboard, go to your backend service → **"Variables"** tab:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
SECRET_KEY=your-random-secret-key-here
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000
DEBUG=False
PORT=8000
OPENAI_API_KEY=sk-your-key-if-needed
```

**Generate SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Step 6: Configure Build Settings

1. Go to **"Settings"** tab
2. Set **Root Directory**: `backend`
3. Set **Build Command**: (leave empty - Railway auto-detects)
4. Set **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Railway uses **Nixpacks** to automatically build your Python app

### Step 7: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (~2-3 minutes)
3. Click **"Generate Domain"** to get your backend URL
   - Example: `https://edgelearn-backend-production.up.railway.app`
4. **Copy this URL** - you'll need it for Vercel

### Step 8: Run Database Migrations

1. In Railway dashboard, click on your backend service
2. Go to **"Settings"** → **"Deploy"**
3. One-time setup command (run in Railway CLI or add as deploy script):

```bash
# In backend directory
alembic upgrade head
```

Or add to your backend startup in `main.py`.

---

## 🎨 Part 2: Deploy Frontend to Vercel

### Step 1: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your `edgelearn-ai` repository from GitHub
4. Vercel will auto-detect Next.js

### Step 2: Configure Build Settings

- **Framework Preset**: Next.js (auto-detected ✅)
- **Root Directory**: `frontend`
- **Build Command**: Auto-detected (`pnpm run build`)
- **Output Directory**: Auto-detected (`.next`)
- **Install Command**: Auto-detected (`pnpm install`)

Vercel automatically detects everything - no configuration files needed!

### Step 3: Set Environment Variables

Add in Vercel dashboard under **"Environment Variables"**:

```env
NEXT_PUBLIC_API_URL=https://edgelearn-backend-production.up.railway.app
```

*(Replace with your actual Railway backend URL from Part 1, Step 7)*

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build
3. You'll get a URL like: `https://edgelearn-ai.vercel.app`

### Step 5: Update Backend CORS

Go back to **Railway** → Backend service → **Variables**:

Update `CORS_ORIGINS` to include your Vercel URL:
```env
CORS_ORIGINS=https://edgelearn-ai.vercel.app,http://localhost:3000
```

---

## ✅ Part 3: Verify Deployment

### Test Backend
Visit: `https://your-backend.railway.app/docs`
- You should see FastAPI Swagger docs

### Test Frontend
Visit: `https://your-app.vercel.app`
- App should load
- Test login/signup functions

### Check Logs
- **Railway**: Dashboard → Service → "Deployments" → View logs
- **Vercel**: Dashboard → Project → "Deployments" → View logs

---

## 🔄 Continuous Deployment

Both platforms auto-deploy on git push:

```bash
git add .
git commit -m "Feature update"
git push origin main
```

- **Railway**: Auto-deploys backend in ~2 min
- **Vercel**: Auto-deploys frontend in ~1 min

---

## 💰 Free Tier Limits

### Vercel (Free Hobby Plan)
- ✅ Unlimited bandwidth
- ✅ Automatic SSL
- ✅ Global CDN
- ✅ 100 deployments/day
- ⚠️ Commercial use requires Pro ($20/mo)

### Railway (Free Trial)
- ✅ $5 credit/month (renews monthly)
- ✅ ~500 hours compute time
- ✅ Automatic SSL
- ⚠️ After credit: ~$5-10/month depending on usage

### Upgrade Path
When you need more:
- Railway Hobby: $5/mo + usage
- Vercel Pro: $20/mo per user

---

## 🐛 Troubleshooting

### Backend won't start
- Check Railway logs for errors
- Verify DATABASE_URL is set
- Check Python version (should be 3.11)

### Database connection failed
```bash
# Make sure DATABASE_URL references Railway's Postgres:
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

### Frontend can't reach backend
- Verify `NEXT_PUBLIC_API_URL` in Vercel
- Check CORS_ORIGINS in Railway includes Vercel URL
- Try visiting `/docs` endpoint directly

### Build failures
- Check build logs in respective dashboard
- Verify all environment variables are set
- Check package.json/requirements.txt versions

---

## 📊 Monitoring

### Railway
- Dashboard → Service → "Metrics" (CPU, Memory, Network)
- View logs in real-time

### Vercel
- Dashboard → Analytics (free)
- Speed Insights (free)
- Real-time logs

---

## 🔐 Security Checklist

Before going live:

- ✅ Change `SECRET_KEY` to random string
- ✅ Set `DEBUG=False` in production
- ✅ Add your domain to CORS_ORIGINS
- ✅ Enable 2FA on Vercel & Railway accounts
- ✅ Review database connection security
- ✅ Set up custom domains (optional)

---

## 🌐 Custom Domain (Optional)

### Vercel
1. Dashboard → Project → "Settings" → "Domains"
2. Add your domain (e.g., `edgelearn.ai`)
3. Update DNS records as instructed

### Railway
1. Service → "Settings" → "Domains"
2. Add custom domain
3. Update DNS CNAME

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

# View Railway logs
railway logs

# View Vercel logs
vercel logs
```

---

## 🎉 You're Live!

Your app is now deployed for free! 

**Frontend**: `https://your-app.vercel.app`
**Backend**: `https://your-backend.railway.app`

Share your app and start getting users! 🚀

---

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
