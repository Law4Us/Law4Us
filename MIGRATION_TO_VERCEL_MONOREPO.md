# Migration to Vercel-Only Monorepo

**Date**: November 5, 2024
**Status**: ✅ Completed
**Purpose**: Consolidate Law4Us-API backend into main Next.js monorepo, eliminate Railway dependency

---

## Table of Contents

1. [Overview](#overview)
2. [Before & After Structure](#before--after-structure)
3. [Files Moved](#files-moved)
4. [Import Path Changes](#import-path-changes)
5. [Files Deleted](#files-deleted)
6. [Dependencies](#dependencies)
7. [Testing Checklist](#testing-checklist)
8. [Rollback Instructions](#rollback-instructions)

---

## Overview

### What Changed

- **Removed**: Separate Law4Us-API Express.js backend deployed to Railway
- **Added**: All backend services integrated into Next.js App Router API routes
- **Result**: Single monorepo deployed to Vercel only

### Why

1. **Cost Reduction**: From $25-30/month (Vercel + Railway) → $20/month (Vercel only)
2. **Simplified Deployment**: Single git repository, single deployment target
3. **Better Developer Experience**: No separate repos, consistent imports
4. **Faster Development**: No need to sync changes between repos

---

## Before & After Structure

### BEFORE: Dual-Repo Architecture

```
Law4Us/                                    # Main Next.js frontend
├── app/
│   └── api/
│       └── submission/route.ts           # → HTTP fetch to Railway backend
└── ...

Law4Us-API/                                # Separate Express.js backend
├── .git/                                  # ❌ Separate git repository!
├── railway.json                           # ❌ Railway deployment config
├── src/
│   ├── index.ts                          # Express server entry
│   ├── routes/                           # Express routes
│   │   ├── submission.ts
│   │   ├── document.ts
│   │   └── health.ts
│   ├── services/                         # Document generators
│   │   ├── document-generator.ts
│   │   ├── property-claim-generator.ts
│   │   ├── custody-claim-generator.ts
│   │   ├── alimony-claim-generator.ts
│   │   ├── divorce-agreement-generator.ts
│   │   ├── shared-document-generators.ts
│   │   ├── google-drive.ts
│   │   ├── groq-service.ts
│   │   └── ... (11 total)
│   ├── types/
│   │   ├── index.ts
│   │   └── docx.d.ts
│   └── utils/
│       └── load-signature.ts
├── templates/
│   └── *.docx                            # Word templates
├── dist/                                 # Compiled JavaScript
└── test-*.js                             # 20+ test files

Deployment: Frontend (Vercel) + Backend (Railway)
```

### AFTER: Unified Monorepo

```
Law4Us/                                    # Single Next.js monorepo
├── app/
│   └── api/
│       └── submission/route.ts           # ✅ Direct imports from lib/api/
├── lib/
│   └── api/                              # ✅ NEW: Backend services
│       ├── services/                     # Document generators
│       │   ├── document-generator.ts
│       │   ├── property-claim-generator.ts
│       │   ├── custody-claim-generator.ts
│       │   ├── alimony-claim-generator.ts
│       │   ├── divorce-agreement-generator.ts
│       │   ├── shared-document-generators.ts
│       │   ├── google-drive.ts
│       │   ├── groq-service.ts
│       │   ├── document-attachment-inserter.ts
│       │   ├── form4-filler.ts
│       │   ├── data-formatter.ts
│       │   ├── form4-png-overlay.ts
│       │   ├── pdf-converter.ts
│       │   ├── form4-text-overlay.ts
│       │   └── property-claim-generator-old.ts (archived)
│       ├── types/
│       │   ├── index.ts
│       │   └── docx.d.ts
│       ├── utils/
│       │   └── load-signature.ts
│       └── templates/
│           └── *.docx                    # Word templates
├── tests/                                # ✅ NEW: Organized test files
│   ├── test-submission.js
│   ├── test-property-comprehensive.js
│   ├── test-custody-claim.js
│   ├── test-alimony-claim.js
│   ├── test-divorce-agreement.js
│   └── ... (20 total)
├── docs/
│   └── archive/                          # ✅ NEW: Old documentation
│       ├── START_HERE.md
│       ├── DEPLOYMENT_GUIDE.md
│       ├── BACKEND_IMPLEMENTATION_COMPLETE.md
│       └── IMPLEMENTATION_SUMMARY.md
└── ... (other files unchanged)

Deployment: Vercel only (monorepo)
```

---

## Files Moved

### Services (11 files)
**From**: `Law4Us-API/src/services/`
**To**: `lib/api/services/`

| File | Description |
|------|-------------|
| `document-generator.ts` | Main document generation orchestrator |
| `property-claim-generator.ts` | Property claim (תביעת רכושית) generator |
| `custody-claim-generator.ts` | Custody claim (תביעת משמורת) generator |
| `alimony-claim-generator.ts` | Alimony claim (תביעת מזונות) generator |
| `divorce-agreement-generator.ts` | Divorce agreement (הסכם גירושין) generator |
| `shared-document-generators.ts` | Shared document components (~900 lines) |
| `google-drive.ts` | Google Drive API integration |
| `groq-service.ts` | Groq AI text transformation |
| `document-attachment-inserter.ts` | Attachment handling for documents |
| `form4-filler.ts` | Form 4 (הרצאת פרטים) generation |
| `data-formatter.ts` | Data formatting utilities |
| `form4-png-overlay.ts` | PNG image overlay for Form 4 |
| `pdf-converter.ts` | PDF conversion utilities |
| `form4-text-overlay.ts` | Text overlay for Form 4 |
| `property-claim-generator-old.ts` | Old version (archived) |

### Types (2 files)
**From**: `Law4Us-API/src/types/`
**To**: `lib/api/types/`

| File | Description |
|------|-------------|
| `index.ts` | Type definitions for API |
| `docx.d.ts` | TypeScript declarations for docx library |

### Utils (1 file)
**From**: `Law4Us-API/src/utils/`
**To**: `lib/api/utils/`

| File | Description |
|------|-------------|
| `load-signature.ts` | Lawyer signature loading utility |

### Templates (2 files)
**From**: `Law4Us-API/templates/`
**To**: `lib/api/templates/`

| File | Description |
|------|-------------|
| `תביעת רכושית.docx` | Property claim Word template |
| `תביעת-רכושית.docx` | Property claim Word template (variant) |
| `.gitkeep` | Git placeholder |

### Tests (20 files)
**From**: `Law4Us-API/` (root)
**To**: `tests/`

| File | Description |
|------|-------------|
| `test-submission.js` | Full submission flow test |
| `test-property-comprehensive.js` | Comprehensive property claim test |
| `test-custody-claim.js` | Custody claim generation test |
| `test-alimony-claim.js` | Alimony claim generation test |
| `test-divorce-agreement.js` | Divorce agreement test |
| `test-divorce-agreement-new.js` | Updated divorce agreement test |
| `test-divorce-agreement-compact.js` | Compact divorce agreement test |
| `test-all-claims-updated.js` | Test all claim types |
| `test-all-four-claims.js` | Test all four main claims |
| `test-all-three.js` | Test three claim types |
| `test-direct-property.js` | Direct property claim test |
| `test-multiple-claims.js` | Multiple claims submission test |
| `test-property-extreme.js` | Edge cases for property claims |
| `test-income-disparity.js` | Income disparity scenarios |
| `test-drive-access.js` | Google Drive access test |
| `test-folder-upload.js` | Folder upload test |
| `test-form4-png-debug.js` | Form 4 PNG debugging |
| `create-test-images.js` | Test image creation utility |

---

## Import Path Changes

### API Routes Updated (2 files)

#### 1. `app/api/submission/route.ts`

**BEFORE**:
```typescript
import { generateDocument } from '@/Law4Us-API/src/services/document-generator';
import { uploadToDrive, createFolder, searchFolders, downloadFile } from '@/Law4Us-API/src/services/google-drive';
```

**AFTER**:
```typescript
import { generateDocument } from '@/lib/api/services/document-generator';
import { uploadToDrive, createFolder, searchFolders, downloadFile } from '@/lib/api/services/google-drive';
```

#### 2. Internal Service Imports

All services that imported from relative paths updated to use `@/lib/api/` alias:

**BEFORE** (in service files):
```typescript
import { createCourtHeader } from './shared-document-generators';
import type { BasicInfo } from '../types';
import { loadSignature } from '../utils/load-signature';
```

**AFTER**:
```typescript
import { createCourtHeader } from '@/lib/api/services/shared-document-generators';
import type { BasicInfo } from '@/lib/api/types';
import { loadSignature } from '@/lib/api/utils/load-signature';
```

### Path Alias Configuration

The `tsconfig.json` already includes the path alias:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

This allows `@/lib/api/services/...` to resolve correctly.

---

## Files Deleted

### Railway Configuration
- ❌ `Law4Us-API/railway.json` - Railway deployment config
- ❌ `Law4Us-API/.git/` - Separate git repository folder

### Express.js Backend Files
- ❌ `Law4Us-API/src/index.ts` - Express server entry point (not needed in Next.js)
- ❌ `Law4Us-API/src/routes/submission.ts` - Replaced by `app/api/submission/route.ts`
- ❌ `Law4Us-API/src/routes/document.ts` - Replaced by integrated API routes
- ❌ `Law4Us-API/src/routes/health.ts` - Not needed in Vercel

### Build Artifacts
- ❌ `Law4Us-API/dist/` - Compiled JavaScript (generated, not source)
- ❌ `Law4Us-API/node_modules/` - Dependencies (duplicated in root)

### Entire Directory
- ❌ `Law4Us-API/` - Entire directory deleted after migration

### Documentation (Archived, not deleted)
Moved to `docs/archive/`:
- `START_HERE.md` → `docs/archive/START_HERE.md`
- `DEPLOYMENT_GUIDE.md` → `docs/archive/DEPLOYMENT_GUIDE.md`
- `BACKEND_IMPLEMENTATION_COMPLETE.md` → `docs/archive/BACKEND_IMPLEMENTATION_COMPLETE.md`
- `IMPLEMENTATION_SUMMARY.md` → `docs/archive/IMPLEMENTATION_SUMMARY.md`
- `DOCUMENT_GENERATION.md` → `docs/archive/DOCUMENT_GENERATION.md`

### Duplicate Files
- ❌ `claude.md` (lowercase) - Duplicate of `CLAUDE.md`

---

## Dependencies

### Law4Us-API Dependencies (from package.json)

All dependencies from `Law4Us-API/package.json` should exist in root `package.json`:

```json
{
  "dependencies": {
    "express": "^4.18.2",              // ❌ Not needed (Next.js replaces Express)
    "cors": "^2.8.5",                  // ❌ Not needed (Next.js handles CORS)
    "docx": "^8.5.0",                  // ✅ Required - Word document generation
    "googleapis": "^128.0.0",          // ✅ Required - Google Drive API
    "groq-sdk": "^0.5.0",              // ✅ Required - AI text transformation
    "canvas": "^2.11.2",               // ✅ Required - Image processing
    "sharp": "^0.33.0",                // ✅ Required - Image resizing
    "dotenv": "^16.3.1",               // ✅ Already in Next.js
    "@types/node": "^20.8.0",          // ✅ Already in Next.js
    "typescript": "^5.2.2"             // ✅ Already in Next.js
  },
  "devDependencies": {
    "@types/express": "^4.17.20",      // ❌ Not needed
    "@types/cors": "^2.8.15",          // ❌ Not needed
    "nodemon": "^3.0.1",               // ❌ Not needed (Next.js has hot reload)
    "ts-node": "^10.9.1"               // ❌ Not needed
  }
}
```

### Action Items

1. ✅ Verify these packages exist in root `package.json`:
   - `docx`
   - `googleapis`
   - `groq-sdk`
   - `canvas`
   - `sharp`

2. ❌ Remove if accidentally added:
   - `express`
   - `cors`
   - `nodemon`
   - `ts-node`

---

## Testing Checklist

### Pre-Deployment Testing

- [ ] **TypeScript Compilation**
  ```bash
  npm run type-check
  # Should complete with no errors
  ```

- [ ] **Import Resolution**
  ```bash
  # Check that all @/lib/api/ imports resolve
  grep -r "@/lib/api/" app/ lib/ --include="*.ts" --include="*.tsx"
  ```

- [ ] **Dependency Installation**
  ```bash
  npm install
  # Verify no missing dependencies
  ```

### Functional Testing

- [ ] **API Route - Health Check**
  ```bash
  curl http://localhost:3000/api/submission
  # Should return 405 Method Not Allowed (only POST allowed)
  ```

- [ ] **Document Generation - Property Claim**
  ```bash
  cd tests/
  node test-property-comprehensive.js
  # Should generate document successfully
  ```

- [ ] **Document Generation - Custody Claim**
  ```bash
  node test-custody-claim.js
  # Should generate document with AI transformations
  ```

- [ ] **Document Generation - Alimony Claim**
  ```bash
  node test-alimony-claim.js
  # Should generate document successfully
  ```

- [ ] **Full Submission Flow**
  ```bash
  node test-submission.js
  # Should complete full submission to Google Drive
  ```

- [ ] **Google Drive Upload**
  ```bash
  node test-drive-access.js
  # Should upload test file to Google Drive
  ```

### Vercel Deployment Testing

- [ ] **Deploy to Vercel**
  ```bash
  git push origin main
  # Vercel should auto-deploy
  ```

- [ ] **Environment Variables**
  - Verify all env vars are set in Vercel dashboard:
    - `GOOGLE_PRIVATE_KEY`
    - `GOOGLE_CLIENT_EMAIL`
    - `GOOGLE_DRIVE_FOLDER_ID`
    - `GROQ_API_KEY`
    - `LAWYER_SIGNATURE_FILE_ID`

- [ ] **Production API Test**
  ```bash
  # Test production endpoint
  curl -X POST https://law4us.vercel.app/api/submission \
    -H "Content-Type: application/json" \
    -d '{"basicInfo": {...}, "selectedClaims": [...], ...}'
  ```

- [ ] **Production Document Generation**
  - Submit real test form through wizard
  - Verify documents generated and uploaded to Google Drive
  - Check document formatting and Hebrew text rendering

---

## Rollback Instructions

### If Something Goes Wrong

#### Quick Rollback (Restore from Git)

1. **Restore Law4Us-API directory** (if deleted):
   ```bash
   git checkout HEAD~1 -- Law4Us-API/
   ```

2. **Restore old API routes** (if modified):
   ```bash
   git checkout HEAD~1 -- app/api/submission/route.ts
   git checkout HEAD~1 -- app/api/submit/route.ts
   ```

3. **Remove new structure** (if needed):
   ```bash
   rm -rf lib/api/
   rm -rf tests/
   rm -rf docs/archive/
   ```

4. **Reinstall dependencies**:
   ```bash
   npm install
   ```

#### Full Rollback (Revert Git Commit)

```bash
# Find the commit hash before migration
git log --oneline | head -5

# Revert to previous commit (replace COMMIT_HASH)
git revert COMMIT_HASH

# Or hard reset (DANGER: loses all changes)
git reset --hard HEAD~1
```

#### Restore Law4Us-API GitHub Repository

If you archived the separate Law4Us-API repository:

1. Go to https://github.com/Law4Us/Law4Us-API
2. Unarchive the repository (Settings → Archive → Unarchive)
3. Clone locally: `git clone https://github.com/Law4Us/Law4Us-API.git`
4. Move into main repo: `mv Law4Us-API /Users/dortagger/Law4Us/`

---

## Archive Information

### Law4Us-API GitHub Repository

- **URL**: https://github.com/Law4Us/Law4Us-API.git
- **Status**: Archived (November 5, 2024)
- **Reason**: Consolidated into main Law4Us repository
- **History Preserved**: All commits preserved in archived repo

### Railway Deployment

- **Service**: Railway (https://railway.app)
- **Status**: Discontinued (November 5, 2024)
- **Cost Savings**: ~$5-10/month
- **Replacement**: Vercel serverless functions

---

## Success Criteria

Migration is considered successful when:

1. ✅ TypeScript compiles with no errors
2. ✅ All imports resolve correctly (`@/lib/api/...`)
3. ✅ All test files pass in `tests/` directory
4. ✅ API route `/api/submission` accepts POST requests
5. ✅ Documents generate correctly (property, custody, alimony, divorce)
6. ✅ Google Drive uploads work
7. ✅ Vercel deployment succeeds
8. ✅ Production submission flow works end-to-end
9. ✅ No Railway references remain in codebase
10. ✅ Documentation updated (`CLAUDE.md`)

---

## Contact

If you encounter issues during or after migration:

1. **Check this document first** - Rollback instructions above
2. **Check Vercel logs** - https://vercel.com/law4us/law4us/logs
3. **Check Git history** - `git log` to see what changed
4. **Review tests** - Run tests in `tests/` directory to diagnose

---

**Migration completed by**: Claude (AI Assistant)
**Documentation version**: 1.0
**Last updated**: November 5, 2024
