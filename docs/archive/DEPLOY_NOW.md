# 🚀 Deploy Now - Quick Actions Required

## ✅ What I've Done (Automated)

- ✅ Copied templates to backend
- ✅ Committed all frontend code
- ✅ Committed all backend code
- ✅ Installed Railway CLI
- ✅ Installed Vercel CLI

## 🎯 What You Need to Do (3 Quick Steps)

### Step 1: Push Code to GitHub (5 minutes)

**A. Push Frontend:**

Open your terminal and run:

```bash
cd /Users/dortagger/Law4Us

# The code is already committed, just push it:
git push -u origin main
```

If you get an authentication error, GitHub will prompt you to log in via browser.

**B. Create Backend Repository:**

1. Go to: https://github.com/organizations/Law4Us/repositories/new
2. Repository name: `Law4Us-API`
3. Description: "Document generation backend"
4. Private (recommended)
5. **Don't check** "Initialize with README"
6. Click "Create repository"

**C. Push Backend:**

```bash
cd /Users/dortagger/Law4Us/Law4Us-API

# Add the remote (use YOUR actual URL from GitHub)
git remote add origin https://github.com/Law4Us/Law4Us-API.git

# Push
git branch -M main
git push -u origin main
```

---

### Step 2: Deploy Backend to Railway (5 minutes)

**Option A: Using Railway Dashboard (Easiest)**

1. Go to: https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Authorize Railway to access Law4Us organization
4. Select: `Law4Us/Law4Us-API`
5. Wait for deployment (~2 min)
6. Click on the service → **Settings** → **Networking** → **Generate Domain**
7. **COPY THE URL** (e.g., `https://law4us-api-production.up.railway.app`)
8. Go to **Variables** tab and add:
   ```
   NODE_ENV=production
   GROQ_API_KEY=your_groq_key_here
   FRONTEND_URL=https://law4us.vercel.app
   ```

**Option B: Using CLI (Fast)**

```bash
cd /Users/dortagger/Law4Us/Law4Us-API

# Login to Railway (opens browser)
railway login

# Link to new project
railway init

# Deploy!
railway up

# Add environment variables
railway variables set NODE_ENV=production
railway variables set GROQ_API_KEY=your_groq_key_here
railway variables set FRONTEND_URL=https://law4us.vercel.app

# Get your URL
railway domain
```

**Save your Railway URL!** You'll need it for Step 3.

---

### Step 3: Deploy Frontend to Vercel (5 minutes)

**Option A: Using Vercel Dashboard (Easiest)**

1. Go to: https://vercel.com/new
2. Click "Import Git Repository"
3. Select: `Law4Us/Law4Us`
4. **Environment Variables** → Add:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://your-railway-url.up.railway.app
   GROQ_API_KEY=your_groq_key_here
   ```
5. Click "Deploy"
6. Wait ~2 minutes
7. **COPY YOUR VERCEL URL**

**Option B: Using CLI (Fast)**

```bash
cd /Users/dortagger/Law4Us

# Login to Vercel (opens browser)
vercel login

# Deploy (follow prompts)
vercel

# Add environment variables
vercel env add NEXT_PUBLIC_BACKEND_URL
# Paste your Railway URL when prompted

vercel env add GROQ_API_KEY
# Paste your Groq key when prompted

# Deploy to production
vercel --prod
```

---

### Step 4: Update Backend CORS (2 minutes)

Now that you have your Vercel URL, update Railway:

**In Railway Dashboard:**
1. Go to your Law4Us-API service
2. **Variables** tab
3. Edit `FRONTEND_URL`
4. Change to your actual Vercel URL: `https://law4us.vercel.app`
5. Save (Railway will auto-redeploy)

**Or via CLI:**
```bash
cd /Users/dortagger/Law4Us/Law4Us-API
railway variables set FRONTEND_URL=https://your-actual-vercel-url.vercel.app
```

---

## 🧪 Test Everything (5 minutes)

### Test Backend

```bash
# Health check
curl https://your-railway-url.up.railway.app/api/health

# Should return: {"status":"healthy", ...}

# Check templates
curl https://your-railway-url.up.railway.app/api/document/templates
```

### Test Frontend

1. Open your Vercel URL in browser
2. Navigate to `/wizard`
3. Fill out the form with test data
4. Upload a PDF or image
5. Click "Generate Document"
6. Download should start!
7. Open the .docx file
8. Verify everything looks good!

---

## 🎉 You're Done!

### Your Production URLs

```
Frontend: https://law4us.vercel.app
Backend:  https://law4us-api-production.up.railway.app

GitHub:
- Frontend: https://github.com/Law4Us/Law4Us
- Backend:  https://github.com/Law4Us/Law4Us-API

Dashboards:
- Railway: https://railway.app
- Vercel:  https://vercel.com
- Groq:    https://console.groq.com
```

---

## ❓ Troubleshooting

### Push Failed (Authentication)

**Problem:** `fatal: could not read Username`

**Solution:**
```bash
# Use SSH instead of HTTPS
git remote set-url origin git@github.com:Law4Us/Law4Us.git
git push -u origin main
```

Or authenticate via GitHub CLI:
```bash
brew install gh
gh auth login
git push -u origin main
```

### Railway Deploy Failed

**Check logs:**
```bash
railway logs
```

Common issues:
- Missing environment variables → Add in dashboard
- Port binding → Railway sets PORT automatically, no action needed

### Vercel Deploy Failed

Check build logs in Vercel dashboard.

Common issues:
- Missing `NEXT_PUBLIC_BACKEND_URL` → Add in environment variables
- Build errors → Check `package.json` scripts are correct

### CORS Error in Browser

**Problem:** Frontend can't connect to backend

**Solution:**
- Verify `FRONTEND_URL` in Railway matches your Vercel URL exactly
- No trailing slash: `https://law4us.vercel.app` ✅
- Not: `https://law4us.vercel.app/` ❌

---

## 📊 Monitor Your Deployment

### Railway (Backend)
```bash
# View logs in real-time
railway logs --follow

# Check service status
railway status
```

### Vercel (Frontend)
- Dashboard: https://vercel.com
- Deployments → Click latest → View logs

### Costs
- Railway: Free tier ($5/month credit)
- Vercel: Free (Hobby tier)
- Groq: Free tier (generous limits)

**Total: $0/month to start!** 🎉

---

## 🚀 Ready?

**Start with Step 1** and work through each step. Should take ~15-20 minutes total!

**Questions?** Check the error message first, then:
1. Railway logs: `railway logs`
2. Vercel logs: In dashboard
3. Browser console: F12 → Console tab

---

**You've got this!** The hard work is done - just need these quick deployment steps! 💪
