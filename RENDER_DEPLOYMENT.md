# 🚀 Render Deployment - Step by Step

Deploy your EdgeLearn AI backend to Render for free in 10 minutes.

---

## 📋 Prerequisites

- [ ] GitHub account with your code pushed
- [ ] Render account ([Sign up free at render.com](https://render.com))
- [ ] Supabase database created ([See DEPLOYMENT.md](DEPLOYMENT.md#1%EF%B8%8F⃣-create-supabase-database-3-minutes))
- [ ] Supabase DATABASE_URL ready with **port 6543**

---

## 🚀 Step-by-Step Deployment

### Step 1: Sign In to Render

1. Go to [render.com](https://render.com)
2. Click **"Get Started for Free"**
3. Choose **"Sign in with GitHub"**
4. Authorize Render to access your repositories

---

### Step 2: Create New Web Service

1. From Dashboard, click **"New +"** (top right)
2. Select **"Web Service"**
3. Click **"Build and deploy from a Git repository"**
4. Click **"Connect"** next to your `edgelearn-ai` repository
   - If you don't see it, click "Configure account" to grant access

---

### Step 3: Configure Service Settings

Fill in the form:

**Name:**
```
edgelearn-backend
```

**Region:**
```
Oregon (US West) or closest to your users
```

**Branch:**
```
main
```

**Root Directory:**
```
backend
```

**Runtime:**
```
Python 3.12.8
```
⚠️ **Important:** Use Python 3.12 - pandas and other dependencies don't support Python 3.14 yet

**Build Command:**
```
pip install -r requirements.txt
```

**Start Command:**
```
uvicorn main:app --host 0.0.0.0 --port $PORT
```

**Instance Type:**
```
Free
```

---

### Step 4: Add Environment Variables

Scroll down to **"Environment Variables"** section and click **"Add Environment Variable"** for each:

#### Required Variables:

**DATABASE_URL**
```
postgresql://postgres:[YOUR-PASSWORD]@db.ovbqcgecpzsgyslgaiag.supabase.co:6543/postgres
```
⚠️ **Important:** Replace `[YOUR-PASSWORD]` with your actual Supabase password  
⚠️ **Use port 6543** (not 5432) for connection pooling

**SECRET_KEY**
```bash
# Generate locally:
python -c "import secrets; print(secrets.token_urlsafe(32))"
# Copy the output and paste as value
```

**DEBUG**
```
False
```

**CORS_ORIGINS** (Temporary - update after Vercel deployment)
```
http://localhost:3000,http://localhost:3001
```

#### Optional Variables:

**OPENAI_API_KEY** (Only if using AI features)
```
sk-your-openai-api-key-here
```

---

### Step 5: Deploy

1. Click **"Create Web Service"** (bottom of page)
2. Render starts building your app
3. **Wait 3-5 minutes** for:
   - Installing dependencies
   - Starting server
   - Health checks

**Watch the logs:**
- You'll see logs in real-time
- Look for: ✅ "Build successful"
- Then: "Application startup complete"

---

### Step 6: Get Your Backend URL

1. Once deployed, find your URL at the top:
   ```
   https://edgelearn-backend.onrender.com
   ```
2. **Copy this URL** - you'll need it for Vercel!

---

### Step 7: Test Your Backend

Visit your Render URL + `/docs`:
```
https://edgelearn-backend.onrender.com/docs
```

You should see **FastAPI's Swagger UI** (interactive API documentation).

**Test the health endpoint:**
1. Find **GET /health**
2. Click "Try it out"
3. Click "Execute"
4. Should return:
```json
{
  "status": "healthy",
  "database": "connected",
  "api": "running"
}
```

✅ **If you see the docs and health check passes, your backend is live!**

---

### Step 8: Update CORS_ORIGINS (After Vercel Deployment)

Once you deploy frontend to Vercel:

1. Go to Render Dashboard
2. Click on your service: **edgelearn-backend**
3. Go to **"Environment"** tab
4. Find **CORS_ORIGINS**
5. Click "Edit" and update to:
```
https://your-app.vercel.app,http://localhost:3000,http://localhost:3001
```
6. Click "Save Changes"
7. Render will auto-redeploy (~2 min)

---

## 🔍 How to View Logs

1. Click on your service in Dashboard
2. Go to **"Logs"** tab
3. See real-time logs

**Common log entries:**
```
✅ Database tables created/verified
✅ Seeded default concepts
INFO: Application startup complete
INFO: Uvicorn running on http://0.0.0.0:10000
```

---

## 🐛 Troubleshooting

### Build Failed

**Check:**
- Root directory is set to `backend`
- `requirements.txt` exists in backend folder
- Build command is correct
- Python version is 3.12 (not 3.14)

**View logs:**
- Logs tab shows exact error message

**Common build errors:**

**Error:** `pandas` compilation fails with Python 3.14 errors
```
error: too few arguments to function '_PyLong_AsByteArray'
```
**Fix:** Go to Settings → Build & Deploy → Runtime, change to `Python 3.12.8`

---

### Database Connection Failed

**Error:** `could not connect to server` or `FATAL: password authentication failed`

**Fix:**
1. Verify DATABASE_URL is correct in Environment tab
2. Check Supabase database is not paused:
   - Supabase dashboard → Your project
   - If paused, click "Restore project"
3. Ensure you're using **port 6543** (not 5432)
4. Check password has no unencoded special characters

---

### App Crashes on Startup

**Check Environment tab:**
- DATABASE_URL is set ✅
- SECRET_KEY is set ✅
- DEBUG=False ✅

**Check Logs for errors:**
- Look for Python exceptions
- Database migration errors
- Missing dependencies

---

### CORS Errors (After deploying frontend)

**Error:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Fix:**
1. Update CORS_ORIGINS in Environment tab
2. Must include exact Vercel URL
3. Render will auto-redeploy

---

### Free Tier Sleep Mode

⚠️ **Render free tier services spin down after 15 minutes of inactivity**

**What happens:**
- First request after sleep takes ~30 seconds (cold start)
- Subsequent requests are normal speed
- This is normal for free tier

**Solutions:**
- Upgrade to paid plan ($7/mo) for 24/7 uptime
- Use a service like UptimeRobot to ping your app every 14 min
- Acceptable for development/demo apps

---

## 💰 Render Free Tier

**Included:**
- ✅ 750 hours/month (enough for 1 service running 24/7)
- ✅ Automatic SSL/HTTPS
- ✅ Automatic deploys from GitHub
- ✅ Custom domains
- ⚠️ Spins down after 15 min inactivity
- ⚠️ 512MB RAM, 0.1 CPU

**Paid Starter ($7/mo):**
- No sleep mode (24/7)
- 512MB RAM, 0.5 CPU
- Better performance

**Usage monitoring:**
- Dashboard → Billing → Usage

---

## 🔄 Auto-Deploy on Git Push

Render automatically redeploys when you push to GitHub:

```bash
git add .
git commit -m "Update backend"
git push origin main
```

Render detects the push and starts a new deployment (~3 min).

**Disable auto-deploy:**
- Service Settings → "Auto-Deploy" toggle

---

## ⚙️ Advanced Settings

### Environment-Specific Variables

Create separate services for staging/production:
- `edgelearn-backend-staging`
- `edgelearn-backend-production`
- Different environment variables for each

### Custom Domain

1. Service Settings → Custom Domain
2. Add your domain (e.g., `api.yourdomain.com`)
3. Add CNAME record to your DNS:
   - Name: `api`
   - Value: `your-service.onrender.com`

### Health Check Path

Render uses `/` by default for health checks.

To customize:
- Settings → Health Check Path: `/health`

---

## 📊 Summary

✅ **Render Service Created** → Backend deployed  
✅ **Environment Variables Set** → Database connected  
✅ **Custom URL Generated** → `https://your-service.onrender.com`  
✅ **Auto-Deploy Enabled** → Push to deploy  

**Your Backend URL:**
```
https://edgelearn-backend.onrender.com
```

**Next Steps:**
1. Test `/docs` endpoint
2. Deploy frontend to Vercel → [See DEPLOYMENT.md](DEPLOYMENT.md)
3. Update CORS_ORIGINS with Vercel URL

---

## 🔗 Quick Links

- [Render Dashboard](https://dashboard.render.com)
- [Render Docs](https://render.com/docs)
- [Render Community](https://community.render.com)
- [Render Status](https://status.render.com)

---

## 📝 Render vs Railway

| Feature | Render | Railway |
|---------|--------|---------|
| Free Tier | 750 hrs/mo | $5 credit/mo |
| Sleep Mode | After 15 min | No sleep |
| Build Time | 3-5 min | 2-3 min |
| Cold Start | ~30 sec | N/A |
| Best For | Demos, testing | Production |

**Render is perfect for:**
- Learning & demos
- Personal projects
- Low-traffic apps
- Tight budgets

---

**Questions?** Check logs first, then Render Community forum! 🚀
