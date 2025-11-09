# Law4Us - AI Context Guide

## Project Overview

**Law4Us** is a legal document automation platform for the Israeli family law market, specializing in divorce proceedings. The platform guides users through a multi-step wizard to collect information and automatically generates legal documents (claims, court forms) in Hebrew, which are then stored in Google Drive and emailed to both the user and administrators.

**Key Features:**
- Multi-step wizard with session persistence and recovery
- Programmatic generation of 5 claim types (property, custody, alimony, divorce, divorce agreement)
- Hebrew language support with RTL layout
- Google Drive integration for document storage and retrieval
- Email notifications with document attachments
- Sanity CMS for blog content and wizard session storage
- Responsive design with custom design system

**Target Users:** Israeli citizens seeking affordable legal assistance for family law matters, particularly divorce proceedings.

## Tech Stack

### Core Framework
- **Next.js 14.2.18** with App Router architecture
- **React 18.3.1** for UI
- **TypeScript 5.7.2** with strict mode enabled
- Deployed on **Vercel** with serverless functions

### Styling & Design
- **Tailwind CSS 3.4.15** with custom design tokens ([/lib/design-tokens/](lib/design-tokens/))
- **Pure CSS animations** with IntersectionObserver for scroll-triggered effects
- Custom semantic design system with tokens for colors, typography, spacing, shadows
- PostCSS with Autoprefixer for cross-browser compatibility

### State Management & Forms
- **Zustand 5.0.2** for client-side state with localStorage persistence
- **React Hook Form 7.54.0** with **Zod 3.23.8** for validation
- **React Signature Canvas 1.0.7** for digital signatures

### Content Management
- **Sanity CMS 3.99.0** (Headless CMS)
  - Blog posts (migrated from WordPress)
  - Wizard session storage (temporary user data)
  - Studio accessible at `/studio` route
- **@portabletext/react** for rich text rendering
- **MDX** support for markdown content

### Document Generation Stack
- **pdf-lib** + **@pdf-lib/fontkit** - PDF creation and font embedding
- **docx** + **docxtemplater** - Word document generation from templates
- **Puppeteer 23.10.4** - PDF rendering from HTML
- **Sharp 0.34.4** - Image processing and optimization
- **pizzip** - ZIP handling for DOCX files
- **open-docxtemplater-image-module** - Image insertion in documents

### Third-Party Integrations
- **Google Drive API** (googleapis 164.1.0) - Primary file storage with service account
- **Google Workspace SMTP** (nodemailer 7.0.10) - Email delivery
- **Groq AI SDK 0.34.0** - Text transformation for custody and alimony claims
- **date-fns 4.1.0** - Date formatting and manipulation

### Development Tools
- **ESLint 8.57.0** with Next.js config
- **tsx 4.20.6** for TypeScript script execution
- **patch-package 8.0.1** for dependency patches
- No testing framework currently installed

## Project Structure

```
/Law4Us
├── app/                          # Next.js App Router
│   ├── (site)/                   # Public pages route group
│   │   ├── page.tsx              # Homepage
│   │   ├── about/                # About page
│   │   ├── blog/                 # Blog pages
│   │   ├── contact/              # Contact page
│   │   ├── wizard/               # Multi-step form wizard
│   │   │   ├── page.tsx          # Step 1: Claim type selection
│   │   │   ├── step-2/           # Personal details
│   │   │   ├── step-3/           # Partner details
│   │   │   ├── step-4/           # Claim-specific questions
│   │   │   ├── step-5/           # Supporting documents upload
│   │   │   └── step-6/           # Signature and submission
│   │   └── layout.tsx            # Site layout with header/footer
│   ├── api/                      # API routes (serverless functions)
│   │   ├── submission/           # Form submission handler
│   │   ├── generate-document/    # Document generation endpoint
│   │   ├── contact/              # Contact form handler
│   │   ├── sessions/             # Wizard session management
│   │   ├── blog/latest/          # Latest blog posts
│   │   └── cron/send-reminders/  # Vercel Cron job (daily at 10:00 AM)
│   ├── studio/                   # Sanity CMS Studio
│   └── globals.css               # Global styles and Tailwind imports
│
├── components/                   # React components
│   ├── home/                     # Homepage sections
│   │   ├── hero-section.tsx
│   │   ├── benefits-section.tsx
│   │   ├── claim-types-section.tsx
│   │   ├── faq-section.tsx
│   │   └── video-section.tsx
│   ├── wizard/                   # Wizard-specific components
│   │   ├── question-renderer.tsx # Dynamic question rendering
│   │   └── progress-bar.tsx
│   ├── layout/                   # Layout components
│   │   ├── header.tsx
│   │   └── footer.tsx
│   └── ui/                       # Reusable UI components
│
├── lib/                          # Business logic and utilities
│   ├── api/services/             # Document generators (17 generators)
│   │   ├── document-generator.ts               # Main orchestrator
│   │   ├── property-claim-generator.ts         # Property division
│   │   ├── custody-claim-generator.ts          # Child custody
│   │   ├── alimony-claim-generator.ts          # Alimony/child support
│   │   ├── divorce-claim-generator.ts          # Divorce petition
│   │   ├── divorce-agreement-generator.ts      # Divorce agreement
│   │   ├── form4-generator.ts                  # Court form 4
│   │   ├── backup-document-generator.ts        # Q&A backup document
│   │   └── [other generators for attachments]
│   ├── services/                 # Service layer
│   │   ├── email-service.ts      # Nodemailer email sender
│   │   ├── groq-service.ts       # Groq AI integration
│   │   └── wizard-session-service.ts # Sanity session management
│   ├── constants/                # Application constants
│   │   ├── questions.ts          # Wizard questions configuration
│   │   └── claims.ts             # Claim types and definitions
│   ├── design-tokens/            # Design system tokens
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   ├── shadows.ts
│   │   ├── border-radius.ts
│   │   └── animations.ts
│   ├── schemas/                  # Zod validation schemas
│   ├── stores/                   # Zustand state stores
│   ├── types/                    # TypeScript type definitions
│   └── utils/                    # Utility functions
│
├── sanity/                       # Sanity CMS configuration
│   ├── schemas/                  # Content schemas
│   │   ├── blogPost.ts           # Blog post schema
│   │   └── wizardSession.ts      # Wizard session schema
│   └── lib/                      # Sanity utilities
│
├── templates/                    # Document templates (.docx)
│   ├── property-claim.docx       # Property division template
│   ├── custody-claim.docx        # Custody claim template
│   ├── alimony-claim.docx        # Alimony claim template
│   ├── divorce-claim.docx        # Divorce petition template
│   ├── divorce-agreement.docx    # Divorce agreement template
│   ├── form4.docx                # Court form 4
│   └── _archive/                 # Archived old templates
│
├── public/                       # Static assets
│   ├── images/                   # Images
│   ├── logos/                    # Logo files
│   ├── documents/                # Document samples
│   └── form4-templates/          # Court form templates
│
├── scripts/                      # Utility scripts
│   ├── migrate-blog-to-sanity.ts         # WordPress migration
│   ├── upload-blog-images-to-sanity.ts   # Image migration
│   ├── generate-redirects.ts             # SEO redirects
│   └── test-document-generation.ts       # Document testing
│
├── tests/                        # Test files
│   ├── test-submission.js        # Submission testing
│   └── test-divorce-agreement-only.js
│
├── docs/                         # Documentation
│   ├── DESIGN_SYSTEM.md          # Design system guide
│   ├── SANITY_SETUP.md           # CMS setup instructions
│   ├── VERCEL_DEPLOYMENT.md      # Deployment guide
│   ├── form-examples/            # Court form screenshots
│   └── archive/                  # Historical documentation
│
├── tmp/                          # Temporary test output (gitignored)
├── .next/                        # Next.js build output (gitignored)
└── node_modules/                 # Dependencies (gitignored)
```

## Architecture & Key Decisions

### Why Serverless?
- **Cost-effective**: Pay only for execution time, ideal for variable traffic
- **Scalability**: Automatic scaling during peak usage
- **Simplicity**: No server management, focus on business logic
- **Vercel integration**: Seamless deployment with Next.js

### Why Google Drive for Storage?
- **Accessibility**: Lawyers can access client folders directly
- **Collaboration**: Easy sharing and organization
- **Cost**: Generous free tier + affordable storage
- **Reliability**: Google's infrastructure with 99.9% uptime
- **Hierarchical structure**: `/submissions/YYYY-MM-DD/HH-MM-SS-ClientName/`

### Why Sanity CMS?
- **Structured content**: Portable Text for rich blog posts
- **Real-time editing**: WYSIWYG studio interface
- **API-first**: GraphQL/GROQ queries for content
- **Free tier**: Generous limits for small projects
- **Session storage**: Temporary wizard data with TTL

### Why Zustand over Redux?
- **Simplicity**: Minimal boilerplate, hooks-based API
- **Performance**: No context/provider overhead
- **Persistence**: Built-in localStorage middleware
- **TypeScript**: Excellent type inference
- **Size**: 1KB vs 10KB+ for Redux

### Why Docxtemplater over PDF-lib?
- **Templates**: Lawyers can modify .docx templates without code changes
- **Hebrew support**: Better RTL and font handling
- **Editability**: Clients can modify generated documents
- **Compatibility**: Works with Microsoft Word, Google Docs, LibreOffice
- **Images**: Easy insertion of signatures and attachments

## Document Generation Flow

### High-Level Process
1. **User completes wizard** → Data stored in Zustand + Sanity session
2. **Submission API called** → `/api/submission` receives form data
3. **Document generator orchestrates** → `lib/api/services/document-generator.ts`
4. **Individual generators execute** → Claim-specific generators run in parallel
5. **Template population** → Docxtemplater fills `.docx` templates
6. **Google Drive upload** → Files organized in hierarchical folders
7. **Email notification** → Nodemailer sends confirmation with attachments
8. **Session cleanup** → Sanity session marked as submitted

### Document Types Generated
1. **Property Claim** (`property-claim-generator.ts`) - Asset division between spouses
2. **Custody Claim** (`custody-claim-generator.ts`) - Child custody arrangements
3. **Alimony Claim** (`alimony-claim-generator.ts`) - Spousal/child support
4. **Divorce Petition** (`divorce-claim-generator.ts`) - Official divorce request
5. **Divorce Agreement** (`divorce-agreement-generator.ts`) - Mutual agreement
6. **Court Form 4** (`form4-generator.ts`) - Standard court submission form
7. **Backup Q&A Document** (`backup-document-generator.ts`) - Complete question/answer record

### Key Generators

#### Main Document Generator
- **File**: [lib/api/services/document-generator.ts](lib/api/services/document-generator.ts)
- **Role**: Orchestrates all document generation
- **Logic**:
  - Determines which documents to generate based on selected claims
  - Calls individual generators in parallel
  - Handles errors and fallbacks
  - Returns array of generated documents

#### Backup Document Generator
- **File**: [lib/api/services/backup-document-generator.ts](lib/api/services/backup-document-generator.ts)
- **Role**: Creates Q&A backup document with all user responses
- **Format**: Tables with questions and answers, includes file attachments list
- **Purpose**: Legal record-keeping and lawyer reference

#### Form 4 Generator
- **File**: [lib/api/services/form4-generator.ts](lib/api/services/form4-generator.ts)
- **Role**: Generates Israeli court Form 4 (תופס 4)
- **Special handling**: Court form requirements, specific formatting

## Environment Variables

### Required for Production
```bash
# Google Drive (Service Account)
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY=...
GOOGLE_DRIVE_FOLDER_ID=...
LAWYER_SIGNATURE_FILE_ID=...

# Email (Google Workspace SMTP)
EMAIL_USER=...
EMAIL_PASS=...
EMAIL_TO=...

# Groq AI
GROQ_API_KEY=...

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=...

# Next.js
NEXT_PUBLIC_BASE_URL=https://law-4-us.co.il
```

See [.env.local.example](.env.local.example) for full details.

## Key Conventions

### File Naming
- **Components**: PascalCase (`HeroSection.tsx`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: SCREAMING_SNAKE_CASE for values, camelCase for files
- **Types**: PascalCase with descriptive names (`WizardFormData`, `ClaimType`)

### Component Structure
```typescript
// 1. Imports (external, then internal)
import { useState } from 'react'
import { useWizardStore } from '@/lib/stores/wizard-store'

// 2. Types/Interfaces
interface HeroSectionProps {
  title: string
}

// 3. Component
export default function HeroSection({ title }: HeroSectionProps) {
  // a. Hooks
  const [isOpen, setIsOpen] = useState(false)
  const formData = useWizardStore(state => state.formData)

  // b. Handlers
  const handleClick = () => setIsOpen(!isOpen)

  // c. Render
  return <div>...</div>
}
```

### API Route Structure
```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate input
    const body = await request.json()

    // 2. Business logic
    const result = await processData(body)

    // 3. Return response
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error in /api/example:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Hebrew Language Handling
- **RTL Support**: `dir="rtl"` on `<html>` tag
- **Font**: Uses system Hebrew fonts (Arial, Helvetica)
- **Text Direction**: Automatic with CSS `direction: rtl`
- **Forms**: Labels and placeholders in Hebrew
- **Documents**: Hebrew content in templates with proper encoding

### Design System Usage
```typescript
import { COLORS, SPACING, TYPOGRAPHY } from '@/lib/design-tokens'

// Use semantic tokens
<div style={{
  color: COLORS.brand.primary,
  padding: SPACING.md,
  fontSize: TYPOGRAPHY.fontSize['2xl']
}} />

// Use Tailwind classes (preferred)
<div className="text-brand-primary p-4 text-2xl" />
```

## Common Tasks

### Adding a New Wizard Question
1. Open [lib/constants/questions.ts](lib/constants/questions.ts)
2. Find the relevant claim type section
3. Add question object:
```typescript
{
  id: 'unique_question_id',
  text: 'השאלה בעברית',
  type: 'text' | 'select' | 'checkbox' | 'date' | 'file',
  required: true,
  options: ['אופציה 1', 'אופציה 2'], // for select/radio
  claimTypes: [ClaimType.PROPERTY], // which claims show this
  dependsOn: 'previous_question_id', // optional conditional logic
  showIf: (value) => value === 'specific_answer' // optional
}
```
4. Update type definitions in `lib/types/wizard.ts` if needed
5. Test in wizard at `/wizard`

### Adding a New Document Generator
1. Create file: `lib/api/services/new-claim-generator.ts`
2. Implement generator:
```typescript
import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import fs from 'fs'

export async function generateNewClaim(formData: WizardFormData) {
  // 1. Load template
  const template = fs.readFileSync('templates/new-claim.docx')
  const zip = new PizZip(template)
  const doc = new Docxtemplater(zip, { /* options */ })

  // 2. Prepare data
  const data = {
    clientName: formData.step2.firstName,
    // ... map form data to template variables
  }

  // 3. Render and return
  doc.render(data)
  return doc.getZip().generate({ type: 'nodebuffer' })
}
```
3. Add to `document-generator.ts` orchestrator
4. Create `.docx` template in `/templates/`
5. Test with `npm run test:submission`

### Modifying a Document Template
1. Open `.docx` file in Microsoft Word (in `/templates/`)
2. Edit content, keeping placeholders like `{clientName}`
3. Use `{}` syntax for simple variables
4. Use `{#items}...{/items}` for arrays/loops
5. Use `{%image}` for image insertion
6. Save and test generation

### Adding a New Blog Post (Sanity)
1. Navigate to `/studio` (or https://law-4-us.co.il/studio)
2. Click "Blog Posts" → "Create new"
3. Fill in:
   - Title (Hebrew)
   - Slug (URL-friendly)
   - Excerpt (summary)
   - Content (Portable Text editor)
   - Featured image
   - Author
   - Categories/Tags
4. Publish
5. Post appears automatically on `/blog`

### Testing Document Generation Locally
```bash
# Run test script
node tests/test-submission.js

# Or use the TypeScript version
npx tsx scripts/test-document-generation.ts

# Check output in /tmp/ folder
```

### Deploying to Vercel
```bash
# Production deployment
git push origin main

# Preview deployment
git push origin feature-branch

# Manual deployment
vercel --prod
```

See [docs/VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md) for details.

### Running Locally
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Start development server
npm run dev

# Open http://localhost:3000
```

### Building for Production
```bash
# Type check
npm run type-check

# Build
npm run build

# Start production server
npm start
```

## Important Notes for AI Assistants

### Code Modification Guidelines
- **ALWAYS read files before editing** to ensure accurate context
- **Preserve Hebrew text** - Do not transliterate or translate Hebrew content
- **Test document generation** after changes to generators or templates
- **Use design tokens** instead of hardcoded values
- **Follow TypeScript strict mode** - No `any` types without justification
- **Handle errors gracefully** - All API routes should have try/catch
- **Validate user input** - Use Zod schemas for all form data

### Security Considerations
- **Never commit `.env.local`** - Contains secrets
- **Validate file uploads** - Check MIME types and sizes
- **Sanitize user input** - Prevent injection attacks in documents
- **Use service account** for Google Drive - Never user OAuth for backend
- **Rate limit API routes** - Prevent abuse (not currently implemented)

### Performance Considerations
- **Lazy load images** - Use Next.js Image component
- **Code split** - Dynamic imports for heavy components
- **Cache Sanity queries** - Use stale-while-revalidate
- **Optimize document generation** - Run generators in parallel
- **Monitor bundle size** - Keep < 500KB initial JS

### Known Issues & Limitations
1. **No automated testing** - Manual testing required for all changes
2. **Hebrew font embedding** - Limited fonts in PDF generation
3. **Large file uploads** - Max 10MB per file (Vercel limit)
4. **Session timeout** - Wizard sessions expire after 7 days
5. **Email rate limits** - Google Workspace: 500/day
6. **Document generation timeout** - 60 second Vercel function limit

### Helpful Commands
```bash
# Search for component usage
grep -r "ComponentName" app/ components/

# Find all API routes
find app/api -name "route.ts"

# Check bundle size
npm run build && npx @next/bundle-analyzer

# Clean build artifacts
rm -rf .next node_modules && npm install

# Generate redirects (after blog migration)
npm run generate:redirects

# Test email sending
npx tsx scripts/test-email.ts
```

## Related Documentation
- [Design System Guide](docs/DESIGN_SYSTEM.md)
- [Sanity CMS Setup](docs/SANITY_SETUP.md)
- [Vercel Deployment](docs/VERCEL_DEPLOYMENT.md)
- [Migration History](docs/archive/)

## Contact & Support
- **GitHub**: https://github.com/[username]/Law4Us
- **Issues**: [GitHub Issues]
- **Deployment**: https://law-4-us.co.il

---

**Last Updated**: 2025-11-09
**Version**: 1.0.0
**Maintainer**: Law4Us Team
