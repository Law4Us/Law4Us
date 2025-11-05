# Law4Us Complete Deployment Guide

Step-by-step guide to deploy Law4Us to production with Railway (backend) and Vercel (frontend).

## Prerequisites

Before starting, you need:
- ✅ GitHub account
- ✅ Vercel account (sign up at https://vercel.com)
- ✅ Railway account (sign up at https://railway.app)
- ✅ Groq API key (get from https://console.groq.com/keys)
- ✅ Git installed locally
- ✅ Node.js 18+ installed

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (Next.js)                                         │
│  Deployed on Vercel                                          │
│  URL: https://law4us.vercel.app                            │
└────────────┬────────────────────────────────────────────────┘
             │ API calls
             ▼
┌─────────────────────────────────────────────────────────────┐
│  Backend (Express.js)                                        │
│  Deployed on Railway                                         │
│  URL: https://law4us-api.up.railway.app                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 1: Create GitHub Repositories

### 1.1 Create Frontend Repository

```bash
cd /Users/dortagger/Law4Us

# Initialize git (if not already done)
git init

# Create .gitignore (already exists)
# Make sure these are ignored:
# - node_modules/
# - .env.local
# - .next/
# - dist/

# Commit everything
git add .
git commit -m "Initial commit - Law4Us frontend"

# Create repository on GitHub
# Go to https://github.com/new
# Name: law4us-frontend
# Public or Private: Your choice
# DON'T initialize with README (already have one)

# Add remote and push
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/law4us-frontend.git
git push -u origin main
```

### 1.2 Create Backend Repository

```bash
cd /Users/dortagger/Law4Us/Law4Us-API

# Initialize git
git init

# Commit everything
git add .
git commit -m "Initial commit - Law4Us API backend"

# Create repository on GitHub
# Go to https://github.com/new
# Name: law4us-api
# Public or Private: Your choice

# Add remote and push
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/law4us-api.git
git push -u origin main
```

**Important**: Add your Word templates to the backend repo before pushing:

```bash
cd Law4Us-API
cp ../templates/*.docx ./templates/
git add templates/
git commit -m "Add document templates"
git push
```

---

## Part 2: Deploy Backend to Railway

### 2.1 Connect GitHub to Railway

1. **Go to Railway**: https://railway.app
2. **Sign up / Log in** (use GitHub for easy auth)
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Authorize Railway** to access your GitHub
6. **Select repository**: `law4us-api`

### 2.2 Configure Railway Project

Railway will automatically:
- ✅ Detect Node.js project
- ✅ Install dependencies
- ✅ Run build script
- ✅ Start the server

**Wait for deployment** (~2-3 minutes)

### 2.3 Add Environment Variables

In Railway dashboard:

1. **Click on your service**
2. **Go to "Variables" tab**
3. **Add these variables:**

```env
NODE_ENV=production
GROQ_API_KEY=your_groq_api_key_here
FRONTEND_URL=https://law4us.vercel.app
```

(We'll update `FRONTEND_URL` after deploying frontend)

4. **Click "Add"** for each variable
5. **Railway will auto-redeploy** with new variables

### 2.4 Get Your Backend URL

1. **Go to "Settings" tab**
2. **Under "Networking"** → **Generate Domain**
3. **Copy the URL** (e.g., `https://law4us-api-production.up.railway.app`)
4. **Save this URL** - you'll need it for the frontend!

### 2.5 Test Backend

```bash
# Health check
curl https://law4us-api-production.up.railway.app/api/health

# Should return:
# {
#   "status": "healthy",
#   "timestamp": "...",
#   ...
# }
```

✅ **Backend is live!**

---

## Part 3: Deploy Frontend to Vercel

### 3.1 Connect GitHub to Vercel

1. **Go to Vercel**: https://vercel.com
2. **Sign up / Log in** (use GitHub)
3. **Click "Add New..." → "Project"**
4. **Import Git Repository**
5. **Select**: `law4us-frontend`

### 3.2 Configure Vercel Project

**Project Settings:**
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)

**Environment Variables:**

Add these in the "Environment Variables" section:

```env
# Backend API URL (from Railway)
NEXT_PUBLIC_BACKEND_URL=https://law4us-api-production.up.railway.app

# Groq API Key (same as backend)
GROQ_API_KEY=your_groq_api_key_here

# Make.com Webhook (if still using)
NEXT_PUBLIC_MAKE_WEBHOOK_URL=https://hook.eu1.make.com/your-webhook-id
```

### 3.3 Deploy

1. **Click "Deploy"**
2. **Wait for build** (~2-3 minutes)
3. **Vercel will give you a URL** like: `https://law4us.vercel.app`

### 3.4 Update Backend CORS

Now that you have the frontend URL, update Railway:

1. **Go back to Railway dashboard**
2. **Variables tab**
3. **Edit `FRONTEND_URL`**:
   ```
   FRONTEND_URL=https://law4us.vercel.app
   ```
4. **Save** (Railway will redeploy)

### 3.5 Test Frontend

1. **Open your Vercel URL**: https://law4us.vercel.app
2. **Navigate to the wizard**
3. **Fill out a test form**
4. **Upload test attachments**
5. **Generate document**

✅ **Frontend is live!**

---

## Part 4: Custom Domain (Optional)

### 4.1 Add Custom Domain to Vercel

1. **In Vercel dashboard** → **Project Settings** → **Domains**
2. **Add domain**: `law4us.co.il` (or your domain)
3. **Follow DNS instructions** (add CNAME record)
4. **Wait for DNS propagation** (~5-60 minutes)

### 4.2 Update Backend CORS Again

```env
FRONTEND_URL=https://law4us.co.il
```

### 4.3 Add Custom Domain to Railway (Optional)

1. **Railway dashboard** → **Settings** → **Networking**
2. **Custom Domain** → Add `api.law4us.co.il`
3. **Update frontend** environment variable:
   ```env
   NEXT_PUBLIC_BACKEND_URL=https://api.law4us.co.il
   ```

---

## Part 5: Verify Everything Works

### 5.1 Test Backend Directly

```bash
# Health check
curl https://law4us-api-production.up.railway.app/api/health

# Check templates
curl https://law4us-api-production.up.railway.app/api/document/templates
```

### 5.2 Test Frontend → Backend Integration

1. Open frontend in browser
2. Open browser DevTools (F12)
3. Go to Network tab
4. Fill out wizard form
5. Submit
6. **Check Network requests:**
   - Should see POST to `/api/document/generate`
   - Status should be 200
   - Response should be a .docx file

### 5.3 Test Document Generation End-to-End

**Complete flow:**

1. ✅ Open wizard
2. ✅ Select claim type (Property)
3. ✅ Fill basic info
4. ✅ Fill form questions
5. ✅ Upload attachments (PDFs, images)
6. ✅ Review and submit
7. ✅ Download generated document
8. ✅ Open document in Word
9. ✅ Verify:
   - User data filled correctly
   - AI-transformed text is legal third-person
   - Attachments appear as pages at end
   - Hebrew text displays correctly (RTL)

---

## Part 6: Monitoring & Maintenance

### 6.1 Railway Logs

View backend logs in real-time:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# View logs
railway logs
```

Or view in Railway dashboard → Deployments → Click deployment → Logs

### 6.2 Vercel Logs

View frontend logs:

1. **Vercel dashboard** → **Project** → **Deployments**
2. **Click on deployment**
3. **View "Build Logs"** and "Function Logs"**

### 6.3 Error Tracking

**Set up Sentry (recommended):**

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Add to Vercel environment variables:
```env
SENTRY_DSN=your_sentry_dsn
```

### 6.4 Cost Monitoring

**Railway:**
- Dashboard shows usage and costs
- Set up billing alerts
- Free tier: $5/month included

**Vercel:**
- Dashboard shows bandwidth and function usage
- Hobby tier: Free
- Pro tier: $20/month

**Groq:**
- Dashboard: https://console.groq.com
- Very cheap: ~$2-10/month for typical usage

---

## Part 7: Troubleshooting

### Backend Won't Start

**Check Railway logs:**
```bash
railway logs
```

**Common issues:**
- ❌ Missing environment variables → Add in Railway dashboard
- ❌ Port binding error → Railway sets PORT automatically
- ❌ Template files missing → Commit templates to repo

### Frontend Can't Connect to Backend

**Check browser console for errors:**

**Common issues:**
- ❌ CORS error → Update `FRONTEND_URL` in Railway
- ❌ 404 error → Check `NEXT_PUBLIC_BACKEND_URL` is correct
- ❌ Timeout → Backend might be cold starting (wait 10s)

### Document Generation Fails

**Check:**
1. ✅ Groq API key is valid (test at https://console.groq.com)
2. ✅ Templates exist in `templates/` directory
3. ✅ Templates have correct placeholders
4. ✅ File uploads are < 10MB
5. ✅ PDF files are valid (not corrupted)

### Hebrew Text Wrong Direction

**Check:**
- ✅ Frontend has `dir="rtl"` in `app/layout.tsx`
- ✅ Word templates have RTL formatting
- ✅ Font supports Hebrew (Assistant font)

---

## Part 8: Rollback Strategy

### If Deployment Breaks

**Vercel:**
1. **Go to Deployments** tab
2. **Find last working deployment**
3. **Click "..." → "Promote to Production"**

**Railway:**
1. **Go to Deployments** tab
2. **Click on previous deployment**
3. **Click "Redeploy"**

**GitHub:**
```bash
# Revert to previous commit
git log  # Find last working commit hash
git revert <commit-hash>
git push
```

Vercel and Railway will auto-deploy the reverted version.

---

## Part 9: Updates & New Features

### Deploying Updates

**For Frontend:**
```bash
cd /Users/dortagger/Law4Us
git add .
git commit -m "Add new feature"
git push
```
Vercel auto-deploys on push to `main` branch.

**For Backend:**
```bash
cd /Users/dortagger/Law4Us/Law4Us-API
git add .
git commit -m "Add new feature"
git push
```
Railway auto-deploys on push to `main` branch.

### Adding New Templates

```bash
cd Law4Us-API
cp ~/new-template.docx ./templates/
git add templates/
git commit -m "Add new template"
git push
```

Railway will redeploy with new template.

---

## Part 10: Cost Optimization

### Reduce Costs

1. **Optimize Images:**
   ```bash
   # Use smaller image sizes in PDFs
   # Compress PDFs before upload
   ```

2. **Cache Groq Responses:**
   ```typescript
   // Add Redis caching for repeated transformations
   ```

3. **Limit File Sizes:**
   ```typescript
   // Reduce max file size from 10MB to 5MB
   ```

4. **Use Railway Free Tier Efficiently:**
   - Delete old deployments
   - Remove unused services
   - Monitor usage dashboard

### Current Monthly Costs

```
Railway Free Tier:    $0 (up to $5 credit)
Vercel Hobby:         $0
Groq API:             $2-5 (100 cases/month)
────────────────────────────────────
TOTAL:                $2-5/month 🎉
```

**When exceeding free tier:**
```
Railway:              $10-15/month (500 cases)
Vercel Pro:           $20/month (optional)
Groq API:             $5-10/month (500 cases)
────────────────────────────────────
TOTAL:                $35-45/month
```

Still **MUCH cheaper** than:
- Make.com automation ($50-100/month)
- Document automation SaaS ($100-500/month)
- Dedicated server ($50-100/month)

---

## Congratulations! 🎉

Your Law4Us platform is now live in production!

**URLs:**
- 🌐 Frontend: https://law4us.vercel.app
- 🔧 Backend API: https://law4us-api-production.up.railway.app
- 📊 Railway Dashboard: https://railway.app
- 📊 Vercel Dashboard: https://vercel.com

**Next Steps:**
1. Test with real data
2. Share with beta users
3. Monitor logs and errors
4. Iterate based on feedback
5. Add more features!

---

**Need Help?**
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Groq Docs: https://console.groq.com/docs

**Questions?** Check the logs first! 90% of issues are visible in Railway/Vercel logs.

---

**Version**: 1.0.0
**Last Updated**: January 2025
**Built with ❤️ for Law4Us**
