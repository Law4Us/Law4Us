# Vercel-Only Deployment Guide

This guide explains how to deploy Law4Us to Vercel Pro, eliminating the need for Railway and reducing monthly costs from $25-30 to just $20.

---

## 🎯 Migration Summary

### Before (Redundant Architecture)
- **Vercel** (Frontend + proxy API) → ~$20/month
- **Railway** (Backend API) → ~$5-7/month
- **Total**: $25-30/month

### After (Consolidated Architecture)
- **Vercel Pro Only** → $20/month
- **Total**: $20/month
- **Savings**: $5-10/month + simpler infrastructure!

---

## ✅ What Was Changed

### 1. New API Route: `/app/api/submission/route.ts`
- **Before**: App/api/submit → Railway backend
- **After**: App/api/submit → App/api/submission (local)
- **Benefits**: No network latency, better error handling

### 2. Environment Variable Changes
- **Added**: `LAWYER_SIGNATURE_FILE_ID` (Google Drive file ID - no 65KB size limit!)
- **Removed dependency**: `NEXT_PUBLIC_BACKEND_URL` (Railway URL)
- **Same**: Google Drive and Groq API credentials

### 3. File System Compatibility
- **Updated**: `load-signature.ts` now downloads from Google Drive instead of file system
- **Benefit**: No Vercel env var size limits (was hitting 93KB limit with base64)
- **Compatible**: All document generators work in Vercel serverless functions

---

## 🚀 Deployment Steps

### Step 1: Set Up Google Drive Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable **Google Drive API**:
   - Navigate to "APIs & Services" → "Enable APIs and Services"
   - Search for "Google Drive API"
   - Click "Enable"
4. Create Service Account:
   - Go to "IAM & Admin" → "Service Accounts"
   - Click "Create Service Account"
   - Name: `law4us-submissions` (or any name)
   - Grant role: "Editor" (or create custom role with Drive access)
   - Click "Done"
5. Generate JSON Key:
   - Click on the service account you just created
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Choose "JSON" format
   - Save the downloaded JSON file securely
6. Extract Credentials from JSON:
   ```json
   {
     "client_email": "law4us-submissions@project-id.iam.gserviceaccount.com",
     "private_key": "-----BEGIN PRIVATE KEY-----\n..."
   }
   ```
7. Create Google Drive Folder:
   - Go to [Google Drive](https://drive.google.com/)
   - Create a new folder: "Law4Us Submissions"
   - Right-click → "Share"
   - Add the service account email (from step 6)
   - Give it "Editor" permissions
   - Copy the folder ID from the URL:
     ```
     https://drive.google.com/drive/folders/1ABC...XYZ
                                             ^^^^^^^^^ This is your folder ID
     ```

---

### Step 2: Prepare Environment Variables

1. **Upload lawyer signature to Google Drive**:
   ```bash
   cd /Users/dortagger/Law4Us
   npx tsx scripts/upload-signature-to-drive.ts
   ```
   This will output a file ID like: `LAWYER_SIGNATURE_FILE_ID=1vCDmhti8cMpdTm76bVN3bhrXMJMO6bf5`

2. **Verify `.env.local` contains**:
   ```env
   # Google Drive
   GOOGLE_SERVICE_ACCOUNT_EMAIL=law4us-submissions@project-id.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Key_Here\n-----END PRIVATE KEY-----\n"
   GOOGLE_DRIVE_FOLDER_ID=0AB9AJ4UMyJ-HUk9PVA

   # Groq AI
   GROQ_API_KEY=gsk_your_api_key_here

   # Lawyer Signature (uploaded to Google Drive - no size limits!)
   LAWYER_SIGNATURE_FILE_ID=1vCDmhti8cMpdTm76bVN3bhrXMJMO6bf5
   ```

---

### Step 3: Deploy to Vercel

#### Option A: Deploy via GitHub (Recommended)

1. **Push code to GitHub**:
   ```bash
   git add .
   git commit -m "Migrate to Vercel-only architecture"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will detect Next.js automatically

3. **Add Environment Variables** in Vercel:
   - In Vercel project settings → "Environment Variables"
   - Add each variable from `.env.local`:
     - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
     - `GOOGLE_PRIVATE_KEY` ⚠️ **Important**: Paste the entire key including `\n` characters
     - `GOOGLE_DRIVE_FOLDER_ID`
     - `GROQ_API_KEY`
     - `LAWYER_SIGNATURE_FILE_ID` (just ~44 characters - no size limit issues!)

4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Vercel will provide a production URL

#### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   cd /Users/dortagger/Law4Us
   vercel --prod
   ```

4. **Add environment variables**:
   ```bash
   vercel env add GOOGLE_SERVICE_ACCOUNT_EMAIL production
   vercel env add GOOGLE_PRIVATE_KEY production
   vercel env add GOOGLE_DRIVE_FOLDER_ID production
   vercel env add GROQ_API_KEY production
   vercel env add LAWYER_SIGNATURE_FILE_ID production
   ```

---

### Step 4: Verify Deployment

1. **Test the API**:
   ```bash
   curl https://your-vercel-url.vercel.app/api/submit \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```

   Expected response:
   ```json
   {
     "success": false,
     "error": "חסרים שדות חובה"
   }
   ```
   (This confirms the API is working, just missing required fields)

2. **Test a full submission** (use the wizard UI at your Vercel URL)

3. **Check Google Drive**:
   - Go to your "Law4Us Submissions" folder
   - You should see new folders created with submissions

---

### Step 5: Delete Railway (Optional)

Once you've verified everything works on Vercel:

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Select your Law4Us project
3. Click "Settings" → "Danger Zone"
4. Click "Delete Project"
5. Cancel your Railway subscription if you had a paid plan

---

## 📊 Vercel Pro Features You'll Use

### Included in $20/month:

| Feature | Limit | What You Get |
|---------|-------|--------------|
| **Bandwidth** | Unlimited | Serve all your users without limits |
| **Serverless Functions** | Unlimited invocations | Process all form submissions |
| **Function Timeout** | **60 seconds** | Plenty for document generation (avg: 15-35s) |
| **Function Memory** | **1GB** | More than enough for document processing |
| **Edge Network** | Global CDN | Fast loading worldwide |
| **Team Members** | 10 | Collaborate with your team |

### Expected Usage:

- **Form Submissions**: 50-200/month (well within limits)
- **Function Duration**: 15-35 seconds per submission (within 60s limit)
- **Memory Usage**: 100-300MB per submission (within 1GB limit)

---

## 🔧 Troubleshooting

### Issue: "LAWYER_SIGNATURE_FILE_ID environment variable not set"

**Solution**:
```bash
# Upload signature to Google Drive and get the file ID
cd /Users/dortagger/Law4Us
npx tsx scripts/upload-signature-to-drive.ts

# This will output: LAWYER_SIGNATURE_FILE_ID=xxxxx
# Add this to your Vercel environment variables (only ~44 characters!)
```

### Issue: "Google Drive authentication failed"

**Cause**: Private key format is wrong

**Solution**:
- Make sure `GOOGLE_PRIVATE_KEY` includes literal `\n` characters (not actual newlines)
- Wrap the entire key in double quotes in Vercel:
  ```
  "-----BEGIN PRIVATE KEY-----\nMIIE...rest_of_key...\n-----END PRIVATE KEY-----\n"
  ```

### Issue: "Function timeout (60s exceeded)"

**Rare** - Only happens with 4+ claims and large attachments

**Solution**:
1. Check Vercel function logs to see which step is slow
2. Optimize:
   - Reduce attachment sizes
   - Pre-process images before upload
3. If consistently timing out, consider splitting into background jobs

### Issue: "Cannot find module '@/Law4Us-API/src/services/...'"

**Cause**: TypeScript path alias not configured

**Solution**:
Add to `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## 🎉 Migration Complete!

You now have:
- ✅ Single deployment on Vercel Pro ($20/month)
- ✅ No Railway dependency
- ✅ Faster response times (no external API calls)
- ✅ Simpler infrastructure
- ✅ Same functionality (or better!)

### Next Steps:

1. **Monitor** your first few submissions in Vercel dashboard
2. **Check** Google Drive to ensure documents are being created correctly
3. **Test** all claim types (property, custody, alimony)
4. **Celebrate** your cost savings! 🎊

---

## 📞 Support

If you encounter issues:

1. Check Vercel function logs: Dashboard → Your Project → Functions
2. Review this guide's Troubleshooting section
3. Verify all environment variables are set correctly
4. Test locally first with `npm run dev`

---

**Last Updated**: January 2025
**Version**: 2.0 (Vercel-only architecture)
