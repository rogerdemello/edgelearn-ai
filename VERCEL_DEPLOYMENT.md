# 🚀 Vercel Frontend Deployment Guide

Deploy your **EdgeLearn AI frontend** to Vercel in 5 minutes — completely **FREE**!

---

## 📋 Prerequisites

Before deploying to Vercel, you need:

1. ✅ **Vercel Account** — Sign up at [vercel.com](https://vercel.com) (free)
2. ✅ **GitHub Account** — Your code must be pushed to GitHub
3. ✅ **Backend Deployed** — You need your Render backend URL (e.g., `https://edgelearn-backend.onrender.com`)
4. ✅ **Code Pushed** — Your `edgelearn-ai` repository is on GitHub

---

## 🎯 Step-by-Step Deployment

### Step 1: Sign in to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** or **"Login"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub repositories

---

### Step 2: Import Your Project

1. Click **"Add New..."** → **"Project"** (top right)
   - Or go directly to: [vercel.com/new](https://vercel.com/new)

2. **Import Git Repository** section will appear
   - Click **"Import"** next to your `edgelearn-ai` repository
   - If you don't see it, click **"Adjust GitHub App Permissions"** to grant access

---

### Step 3: Configure Project Settings

Vercel will show the **"Configure Project"** screen:

#### 3.1 Project Name
```
edgelearn-ai
```
*(or choose your own custom name)*

#### 3.2 Framework Preset
- **Framework Preset**: `Next.js` ← Should auto-detect
- If not detected, select it manually from dropdown

#### 3.3 Root Directory
**IMPORTANT:** Your frontend code is in a subdirectory!

1. Click **"Edit"** next to Root Directory
2. Select: **`frontend`**
3. Vercel will now build from the `frontend/` folder

#### 3.4 Build Settings (Auto-configured)
Vercel automatically detects:
- **Build Command**: `next build`  
- **Output Directory**: `.next`
- **Install Command**: `pnpm install` *(detected from pnpm-lock.yaml)*

**✅ Leave these as default — no changes needed!**

---

### Step 4: Add Environment Variables

**CRITICAL STEP!** Your frontend needs to know where your backend is.

1. Expand **"Environment Variables"** section
2. Add this variable:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://edgelearn-backend.onrender.com` |

**Replace with YOUR actual Render backend URL!**

**Example:**
```
Key:   NEXT_PUBLIC_API_URL
Value: https://edgelearn-backend-abc123.onrender.com
```

**⚠️ Must start with `NEXT_PUBLIC_`** — This makes it available to the browser.

3. Click **"Add"** to save the environment variable

---

### Step 5: Deploy!

1. Click **"Deploy"** button
2. Vercel will:
   - 📦 Install dependencies (`pnpm install`)
   - 🔨 Build your Next.js app (`next build`)
   - 🚀 Deploy to global CDN
   - ⚡ Generate HTTPS URL automatically

**Deployment takes ~2-3 minutes**

You'll see real-time logs:
```
Running "pnpm install"...
Running "next build"...
Build Completed in 1m 23s
Deploying...
✓ Deployment Complete!
```

---

### Step 6: Get Your Frontend URL

Once deployment succeeds:

1. You'll see: **"🎉 Congratulations! Your project has been deployed."**
2. Your URL will be shown:
   ```
   https://edgelearn-ai-abc123.vercel.app
   ```
3. Click **"Visit"** to open your deployed app
4. **Copy this URL** — you'll need it for CORS configuration!

---

### Step 7: Update Backend CORS

**IMPORTANT:** Tell your backend to accept requests from your new Vercel URL!

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your **edgelearn-backend** service
3. Click **"Environment"** tab
4. Find `CORS_ORIGINS` variable
5. Click **"Edit"** 
6. Update to:
   ```
   https://edgelearn-ai-abc123.vercel.app,http://localhost:3000
   ```
   *(Replace with YOUR actual Vercel URL)*

7. Click **"Save Changes"**
8. Render will automatically redeploy (~2 min)

**Why both URLs?**
- `https://your-app.vercel.app` — Production frontend
- `http://localhost:3000` — Local development (so you can still test locally)

---

### Step 8: Test Your Deployment

1. **Open your Vercel URL**: `https://your-app.vercel.app`

2. **Test the pages:**
   - ✅ Landing page loads
   - ✅ Sign up / Login forms work
   - ✅ Dashboard loads after login
   - ✅ API calls work (check browser console for errors)

3. **Check browser console** (F12):
   - Should see no CORS errors
   - API calls should succeed (200 OK status)

4. **Test full flow:**
   ```
   1. Sign up → Create new account
   2. Login → Access dashboard  
   3. Practice → Start a practice session
   4. Check data → Verify database connection
   ```

---

## 🎉 Success!

Your frontend is now live at: **`https://your-app.vercel.app`**

### What You Get (FREE):
- ✅ Unlimited bandwidth
- ✅ Automatic HTTPS/SSL
- ✅ Global CDN (fast worldwide)
- ✅ Auto-deploy on git push
- ✅ Preview deployments for PRs
- ✅ 100 deployments/day

---

## 🔄 Automatic Deployments

Every time you push to GitHub, Vercel automatically redeploys!

```bash
# Make changes
git add .
git commit -m "Update landing page"
git push origin main

# Vercel automatically:
# 1. Detects the push
# 2. Builds your app
# 3. Deploys to production
# 4. Updates your URL
```

**Deployment Status:**
- Check: Dashboard → Your Project → Deployments
- Get notifications via email or Slack integration

---

## 🐛 Troubleshooting

### Build Failed

**Error:** `Build failed with exit code 1`

**Solutions:**
1. Check build logs in Vercel dashboard
2. Verify `package.json` has all dependencies
3. Test build locally first:
   ```bash
   cd frontend
   pnpm install
   pnpm run build
   ```
4. Check Node.js version compatibility (Vercel uses Node 18+)

---

### "Module not found" Error

**Error:** `Module './components/xyz' not found`

**Solutions:**
1. Check import paths are correct (case-sensitive!)
2. Verify `tsconfig.json` paths configuration
3. Run `pnpm install` to ensure all deps installed

---

### Environment Variable Not Working

**Error:** Frontend shows "undefined" for API URL

**Solutions:**
1. Verify variable name starts with `NEXT_PUBLIC_`
2. Redeploy after adding env var (click "Redeploy" in dashboard)
3. Check env var in: Settings → Environment Variables
4. Clear cache: Settings → General → Clear Cache

---

### CORS Error in Browser Console

**Error:** `Access to fetch blocked by CORS policy`

**Solutions:**
1. Check Render backend has correct `CORS_ORIGINS`:
   ```
   https://your-actual-vercel-url.vercel.app,http://localhost:3000
   ```
2. Wait for Render to redeploy after CORS update
3. Verify `NEXT_PUBLIC_API_URL` matches your Render backend
4. Check browser network tab → verify request is going to correct URL

---

### Page Shows 404 Not Found

**Error:** Page routes don't work after refresh

**Solutions:**
1. This shouldn't happen with Next.js App Router
2. Verify you're using `app/` directory structure (not old `pages/`)
3. Check Vercel logs for routing errors
4. Ensure all route files follow Next.js conventions

---

### Slow First Load (Backend Cold Start)

**Symptom:** First page load takes 30+ seconds

**Explanation:**
- Render free tier sleeps after 15 min inactivity
- First request wakes it up (~30 sec cold start)
- This is **normal** for free tier

**Solutions:**
1. Upgrade Render to paid tier ($7/mo) for always-on backend
2. Use backend warming service (ping every 10 min)
3. Show loading state to users during initial wake

---

## ⚙️ Advanced Configuration

### Custom Domain

Want your own domain? (e.g., `edgelearn.ai`)

1. Go to: Project Settings → Domains
2. Click **"Add"**
3. Enter your domain: `edgelearn.ai`
4. Update DNS records:
   ```
   Type: CNAME
   Name: @  (or www)
   Value: cname.vercel-dns.com
   ```
5. Wait for DNS propagation (~24 hours)
6. Vercel auto-generates SSL certificate

**Don't forget to update CORS!**
```
CORS_ORIGINS=https://edgelearn.ai,http://localhost:3000
```

---

### Environment Variables per Environment

Set different values for Production vs Preview:

1. Settings → Environment Variables
2. Choose scope for each variable:
   - ✅ **Production** — Live site
   - ✅ **Preview** — PR deployments  
   - ✅ **Development** — Local dev

**Example:**
```
Production:  NEXT_PUBLIC_API_URL=https://backend.onrender.com
Preview:     NEXT_PUBLIC_API_URL=https://staging-backend.onrender.com
Development: NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

### Analytics & Monitoring

Enable free analytics:

1. Project → Analytics tab
2. Click **"Enable Analytics"**
3. View:
   - Page views
   - Top pages
   - Visitor countries
   - Load times

**Speed Insights (FREE):**
- Real User Monitoring (RUM)
- Core Web Vitals
- Performance scores

---

## 🔐 Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env` files
- ✅ Use Vercel's Environment Variables UI
- ✅ Rotate secrets regularly

### 2. Enable Two-Factor Authentication
1. Account Settings → Security
2. Enable 2FA via authenticator app

### 3. Deploy Hooks
**Secret URL to trigger deployments:**
1. Settings → Git → Deploy Hooks
2. Generate hook URL (keep it secret!)
3. Use for automated rebuilds

---

## 📊 Monitoring Your App

### Vercel Dashboard

**Real-time Logs:**
1. Project → Deployments → Latest
2. Click "View Function Logs"
3. See server-side errors in real-time

**Deployment History:**
- View all past deployments
- Roll back to previous version instantly
- Compare deployment sizes

**Analytics:**
- Track visitor metrics
- Monitor performance
- Detect errors

---

## 🚀 Next Steps

### 1. Update Documentation URLs

In your README, replace placeholder URLs:
```markdown
**Live Demo:** https://your-actual-app.vercel.app
```

### 2. Test Everything
- [ ] User signup/login
- [ ] All dashboard features
- [ ] API connectivity
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

### 3. Share Your App!
```
🎉 EdgeLearn AI is now live!
Frontend: https://edgelearn-ai.vercel.app
Backend:  https://edgelearn-backend.onrender.com
```

### 4. Monitor Performance
- Set up Vercel Analytics
- Enable Speed Insights
- Check error rates regularly

### 5. Plan for Scale

**When you outgrow free tier:**

| Service | Free Tier Limit | Paid Plan |
|---------|----------------|-----------|
| Vercel | Hobby (personal use) | Pro: $20/mo |
| Render | 750 hrs/mo (sleeps) | Starter: $7/mo (always on) |
| Supabase | 500MB database | Pro: $25/mo (8GB) |

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel CLI](https://vercel.com/docs/cli) — Deploy from terminal
- [Vercel GitHub Integration](https://vercel.com/docs/deployments/git/vercel-for-github)

---

## 🆘 Get Help

**Issues?**
1. Check [Vercel Status](https://www.vercel-status.com/)
2. Browse [Vercel Community](https://github.com/vercel/vercel/discussions)
3. Review deployment logs in dashboard
4. Check backend Render logs

**Common Commands:**
```bash
# Test build locally
cd frontend
pnpm run build

# Run production build locally
pnpm run start

# Check for TypeScript errors
pnpm run type-check
```

---

**🎉 Congratulations! Your frontend is deployed!**

Your EdgeLearn AI app is now accessible worldwide at:
**`https://your-app.vercel.app`**

Start sharing and get users! 🚀
