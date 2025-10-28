# Law4Us - Online Divorce Services Platform

## Project Overview

Law4Us is a Next.js-based web application that provides online divorce services in Israel. The platform allows users to file divorce claims, custody claims, property claims, and alimony claims through an intuitive multi-step wizard interface, all managed by experienced attorneys.

## Architecture

### Technology Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with RTL (Right-to-Left) support for Hebrew
- **Form Management**: React Hook Form + Zod for validation
- **State Management**: Zustand for wizard state with localStorage persistence
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Document Generation**: @react-pdf/renderer (server-side)
- **Fonts**: Google Fonts - Assistant (300-800)

### Project Structure

```
Law4Us/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx             # Root layout with RTL configuration
│   ├── page.tsx               # Home page
│   ├── globals.css            # Global styles and Tailwind directives
│   ├── about/                 # About page
│   ├── divorce/               # Divorce guide page
│   ├── help/                  # Help & FAQ page
│   ├── contact/               # Contact page
│   ├── wizard/                # Multi-step wizard
│   │   ├── layout.tsx        # Wizard-specific layout with header
│   │   ├── page.tsx          # Step 1: Claim picker
│   │   ├── step-2/           # Step 2: Dynamic form
│   │   ├── step-3/           # Step 3: Document signing
│   │   ├── step-4/           # Step 4: Payment
│   │   └── step-5/           # Step 5: Final submission
│   └── api/                   # API routes
│       ├── submit/           # Form submission endpoint
│       └── generate-pdf/     # PDF generation endpoint
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── radio.tsx
│   │   ├── textarea.tsx
│   │   └── form-field.tsx
│   ├── wizard/                # Wizard-specific components
│   │   ├── wizard-header.tsx
│   │   ├── claim-picker.tsx
│   │   ├── dynamic-form.tsx
│   │   ├── repeater.tsx
│   │   ├── needs-table.tsx
│   │   └── signature-pad.tsx
│   └── layout/                # Layout components
│       ├── header.tsx
│       ├── footer.tsx
│       └── navigation.tsx
├── lib/
│   ├── schemas/               # Zod validation schemas
│   │   ├── basic-info.ts
│   │   ├── global-questions.ts
│   │   └── claim-schemas.ts
│   ├── utils/                 # Utility functions
│   │   ├── cn.ts             # Class name merger
│   │   ├── format.ts         # Formatters (phone, ID, currency)
│   │   └── validation.ts     # Custom validators
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts
│   ├── stores/                # Zustand stores
│   │   └── wizard-store.ts
│   └── constants/             # Constants and configurations
│       └── claims.ts
├── public/                    # Static assets
│   ├── images/
│   └── icons/
├── Files from framer/         # Original Framer components (reference)
└── styles/                    # Additional style files if needed
```

## Design System

### Color Palette

```typescript
colors: {
  primary: {
    DEFAULT: "#019FB7",  // Teal - main brand color
    dark: "#018DA2",     // Darker teal for borders/hover
    light: "#B8D7DD",    // Light teal for disabled states
  },
  neutral: {
    darkest: "#0C1719", // Almost black - main text
    dark: "#515F61",    // Dark gray - secondary text
    DEFAULT: "#E3E6E8", // Medium gray - borders
    light: "#EEF2F3",   // Light gray - backgrounds
    lightest: "#F9FAFB", // Almost white - input backgrounds
  },
}
```

### Typography

The Assistant font family is used throughout with weights from 300-800. Font sizes are defined with consistent line-heights and letter-spacing optimized for Hebrew text:

- `text-display-large`: 48px (Hero headlines)
- `text-display`: 40px (Page titles)
- `text-h1`: 32px (Section titles)
- `text-h2`: 24px (Subsection titles)
- `text-h3`: 20px (Card titles)
- `text-body-large`: 18px (Large body text, buttons)
- `text-body`: 16px (Default body text)
- `text-body-small`: 14px (Input text, small labels)
- `text-caption`: 12px (Captions, helper text)

#### Reusable Design System Typography

**IMPORTANT**: Use these standardized text styles from `lib/constants/styles.ts` or Tailwind classes for consistency:

**Tailwind Classes** (recommended):
- `text-hero-h1`: 80px Bold, 100% line height, -4% letter spacing (Main hero headlines)
- `text-hero-subtitle`: 24px Medium, 130% line height, -4% letter spacing (Hero subtitles)
- `text-eyebrow`: 16px Semibold, 100% line height, -2% letter spacing (Section eyebrows like "כתבו עלינו")
- `text-cta-main`: 18px Semibold, 120% line height, 0% letter spacing (Primary CTA buttons)
- `text-cta-secondary`: 18px Semibold, 120% line height, 0% letter spacing (Secondary CTA buttons)
- `text-nav-link`: 16px Bold, 100% line height, -2% letter spacing (Navigation links)
- `text-nav-cta`: 16px Semibold, 110% line height, 0% letter spacing (Navigation CTA button)
- `text-banner-text`: 16px Semibold, 100% line height, -2% letter spacing (Banner/badge text)

**JavaScript/Style Objects** (for inline styles):
```typescript
import { TYPOGRAPHY, CTA_STYLES, BANNER_STYLES } from '@/lib/constants/styles';

// Typography
<h1 style={TYPOGRAPHY.heroH1}>...</h1>
<p style={TYPOGRAPHY.heroSubtitle}>...</p>
<span style={TYPOGRAPHY.eyebrow}>...</span>

// CTA Buttons
<Link style={CTA_STYLES.main}>Primary CTA</Link>
<Link style={CTA_STYLES.secondary}>Secondary CTA</Link>
<Link style={CTA_STYLES.nav}>Nav CTA</Link>

// Banners
<div style={BANNER_STYLES.box}>...</div>
```

### Spacing

Consistent spacing scale using Tailwind's default scale plus custom values:
- Form gaps: 24-32px between fields
- Section gaps: 48-80px between major sections
- Component padding: 16-64px depending on screen size

### Components

All components follow consistent patterns:
- Touch-friendly (minimum 44x44px touch targets)
- Accessible (ARIA labels, keyboard navigation)
- Responsive (mobile-first design)
- Animated (smooth transitions with Framer Motion)

## Key Features

### 1. Multi-Step Wizard

The wizard guides users through 5 steps:

1. **Claim Picker**: Select claim types and enter basic information
2. **Dynamic Form**: Answer questions based on selected claims
3. **Document Signing**: Review and sign legal documents
4. **Payment**: Review summary and process payment
5. **Submission**: Final review and submit to Make.com webhook

**Auto-save**: Form progress is automatically saved to localStorage every 2 seconds to prevent data loss.

### 2. Dynamic Form Renderer

The form system supports multiple question types:

- **Input**: text, number, date, email, tel
- **Textarea**: Multi-line text input
- **Select**: Dropdown with options (including dynamic name options)
- **Radio**: Radio buttons with conditional sub-questions
- **File/FileList**: File upload (single or multiple)
- **Repeater**: Add/remove rows dynamically (e.g., children, properties)
- **NeedsTable**: Special table for child support calculations
- **Heading**: Section headers
- **Shared**: Reusable field sets

### 3. Conditional Logic

- **Dynamic name replacement**: Replace placeholders like "המבקש/ת" with actual names
- **Conditional fields**: Show/hide fields based on previous answers
- **Field dependencies**: Automatically show/hide related questions

### 4. Document Generation

Legal documents (Power of Attorney, Form 3) are:
1. Filled with user data on the client
2. Previewed before signing
3. Signed using a canvas-based signature pad
4. Generated as PDFs on the server
5. Sent to Make.com for processing

#### Property Claim Generation System (תביעת רכושית)

**Special Implementation**: Property claims use a **programmatic generator** instead of template-based generation, providing superior quality and eliminating placeholder dependencies.

**Location**: `Law4Us-API/src/services/property-claim-generator.ts` (1,350+ lines)

**Architecture**:
- No LLM/AI required - fully deterministic generation
- Uses `docx` library (NOT PDF) - generates .docx format
- Complete RTL (Right-to-Left) support for Hebrew
- Structured sections with proper legal formatting
- Automatic Table of Contents with accurate page numbers

**Document Structure** (5 main sections with page breaks):

1. **Main Property Claim (כתב תביעה)** - Lines 506-787
   - Court header (Tel Aviv Family Court)
   - Plaintiff info (תובעת/תובע) with gendered terms
   - Defendant info (נתבעת/נתבע) with gendered terms
   - Nature of claim (מהות התביעה)
   - Requested remedies (הסעדים המבוקשים)
   - Summons (הזמנה לדין)
   - Section B: Main Arguments (עיקר הטענות)
   - Section C: Detailed Facts (פירוט העובדות)
     - Relationship history (מערכת היחסים)
     - Property details (הרכוש) - formatted from arrays
     - Employment (השתכרות הצדדים)
     - Determining date (היום הקובע)
   - Remedies (סעדים) - 8 numbered requests
   - Signature line

2. **Form 3 - Statement of Details (הרצאת פרטים)** - Lines 855-1023
   - Personal details (both parties)
   - Marital status
   - Children information
   - Housing details
   - Domestic violence history
   - Other family cases
   - Therapeutic contact
   - Declaration with signature

3. **Power of Attorney (יפוי כוח)** - Lines 1028-1122
   - 15 numbered legal powers granted to attorney
   - Client signature
   - Lawyer confirmation with signature/stamp

4. **Affidavit (תצהיר)** - Lines 1127-1228
   - Lawyer's attestation (4 numbered items)
   - Visual meeting confirmation (היוועדות חזותית)
   - Lawyer signature with stamp

5. **Attachments (נספחים)** - Lines 1251-1352
   - **Automatic Table of Contents** with accurate page numbers
   - Hebrew letter labels (א, ב, ג, ד...)
   - Image insertion for each attachment page
   - Proper page breaks between attachments

**Property Type Handling** (Lines 350-441):

The generator processes **6 distinct property arrays**:
- `apartments` - Real estate properties
- `vehicles` - Cars, motorcycles, etc.
- `savings` - Bank accounts, savings
- `benefits` - Pension, insurance, social benefits
- `properties` - General/miscellaneous assets
- `debts` - Mortgages, loans (separate subsection)

Each property type creates numbered items with:
- Description
- Value (in ש"ח)
- Owner (בבעלות)
- RLM markers (U+200F) after colons for proper RTL display

**Font System** (Lines 26-34):
```typescript
FONT_SIZES = {
  MAIN_TITLE: 40,    // 20pt - כתב תביעה
  SECTION: 32,       // 16pt - ב. עיקר הטענות, סעדים
  TITLE: 32,         // 16pt - Court name
  SUBSECTION: 28,    // 14pt - מערכת היחסים, הרכוש
  HEADING_2: 26,     // 13pt - Numbered items
  BODY: 24,          // 12pt - Body text
  SMALL: 22,         // 11pt - Footer, captions
}
```

**Spacing System** (Lines 36-43):
```typescript
SPACING = {
  SECTION: 600,      // Large gap between sections
  SUBSECTION: 400,   // Medium gap between subsections
  PARAGRAPH: 240,    // Standard paragraph spacing
  LINE: 120,         // Small gap between lines
  MINIMAL: 60,       // Minimal spacing
}
```

**RTL Support**:
- All paragraphs have `rightToLeft: true` and `bidirectional: true`
- RLM (Right-to-Left Mark, U+200F) inserted after punctuation
- Uses David font (standard Hebrew legal font)
- Proper alignment with `AlignmentType.START` (=right in RTL)

**Gendered Terms** (Lines 60-83):
- Automatic gender detection from basicInfo
- Plaintiff: תובעת (female) / תובע (male)
- Defendant: נתבעת (female) / נתבע (male)
- Pronouns: היא/הוא, שלה/שלו

**Table of Contents - Automatic & Accurate** (Lines 1264-1352):
- Uses Word's `TableOfContents` field (NOT manual estimation!)
- References Heading2 styles on attachment headers
- Shows **accurate page numbers** when document opens in Word
- Auto-updates in most Word configurations
- Note added: "מספרי העמודים יעודכנו אוטומטית בעת פתיחת המסמך ב-Word"

**Integration** (`document-generator.ts` lines 218-227):
```typescript
if (claimType === 'property') {
  console.log('📝 Using programmatic generator (no LLM needed)...');
  documentBuffer = await generatePropertyClaimDocument({
    basicInfo,
    formData,
    signature: options.signature,
    lawyerSignature: options.lawyerSignature,
    attachments: options.attachments,
  });
}
```

**Testing**: Use `test-property-comprehensive.js` with complete test data including all property types, children, debts, and attachments.

#### Custody Claim Generation System (תביעת משמורת)

**Special Implementation**: Like property claims, custody claims use a **programmatic generator with AI enhancement** for transforming first-person user text to third-person legal language.

**Location**: `Law4Us-API/src/services/custody-claim-generator.ts` (1,280+ lines)

**Architecture**:
- **Hybrid approach**: Programmatic structure + Groq AI for text transformation
- Uses `docx` library (NOT PDF) - generates .docx format
- Complete RTL (Right-to-Left) support for Hebrew
- Groq AI (`llama-3.3-70b-versatile`) transforms user narratives to legal language
- Automatic filtering of minors (קטינים) - only children under 18

**Document Structure** (4 main sections with page breaks):

1. **Main Custody Claim (תביעת משמורת)**
   - Court header (Tel Aviv Family Court)
   - "בעניין הקטינים" with bullet list of minors
   - Plaintiff info (מבקש/ת) with gendered terms
   - Defendant info (משיב/ה) with gendered terms
   - Title: תביעת משמורת
   - Introduction paragraph
   - Court fee: 388₪
   - Additional proceedings section
   - Summons (הזמנה לדין)
   - Section B: Main Arguments (חלק ב: עיקר הטענות)
     - 1. Brief description of parties (תיאור תמציתי של בעלי הדין)
       - Parents' marriage info + count of MINORS (קטינים not ילדים)
       - Bullet points for each minor with full details
     - 2. Summary of requested remedy (פירוט הסעד המבוקש) - **NUMBERED ITEMS**
     - 3-4. Additional legal sections
   - Section C: Detailed Facts (חלק ג: פירוט העובדות)
     - Marriage date
     - Children section with **AI-transformed** relationship descriptions
     - Current living arrangement with **AI-transformed** visitation details
     - **AI-transformed** custody summary
     - **AI-transformed** explanation of why not other parent
     - Legal section: "טובת הילד" (Best Interest of the Child)
   - Remedies (סעדים) - **NUMBERED ITEMS**

2. **Form 3 - Statement of Details (הרצאת פרטים)**
   - Personal details (both parties)
   - Marital status
   - Children information
   - Housing details
   - Domestic violence history
   - Other family cases
   - Therapeutic contact
   - Declaration with **CLIENT signature** only

3. **Power of Attorney (יפוי כוח)**
   - 15 numbered legal powers granted to attorney
   - **CLIENT signature** at "ולראיה באתי על החתום"
   - **LAWYER signature** at "אני מאשר את חתימת מרשי"

4. **Affidavit (תצהיר)**
   - Lawyer's attestation (4 numbered items)
   - Visual meeting confirmation (היוועדות חזותית)
   - **LAWYER signature** with stamp

**Key Features**:

**1. Minor Filtering (קטינים)**:
- Automatic calculation of age from birthdate
- Only children under 18 are included in custody documents
- Uses term "קטינים" instead of "ילדים" for legal accuracy

```typescript
function isMinor(birthDate: string): boolean {
  if (!birthDate) return true;
  const birth = new Date(birthDate);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  // Adjust for birthday not yet occurred this year
  return age < 18;
}
```

**2. Groq AI Text Transformation**:
- Transforms first-person user text to third-person legal language
- Used for 4 main sections:
  1. Child relationship descriptions (per child)
  2. Visitation arrangement details
  3. Custody summary (why custody should be with applicant)
  4. Why custody should NOT be with other parent

Example transformation:
```
Input (User):  "אני מבלה איתו כל יום, עוזר לו בשיעורי בית"
Output (AI):   "המבקשת מתארת מערכת יחסים קרובה עם הקטין, לרבות ליווי יומיומי וסיוע בלימודים"
```

**3. AI Prompt Configuration** (`groq-service.ts`):
```typescript
if (context.claimType === 'תביעת משמורת') {
  systemPrompt += `
כללים ספציפיים לתביעות משמורת:
8. התמקד ב"טובת הילד" כעיקרון מנחה
9. הדגש את יכולת המבקש/ת לספק סביבה יציבה ומטפחת
10. תאר את מערכת היחסים באופן מקצועי ואמפתי
11. הימנע משפה שלילית - התמקד בעובדות ובטובת הילדים
12. השתמש במונחים: "הקטינים", "טובת הילד", "הסדרי ראיה"
`;
}
```

**4. RTL Support** (Same as property claim):
- All paragraphs have `rightToLeft: true` and `bidirectional: true`
- Uses `AlignmentType.START` (=right in RTL)
- **CRITICAL**: Bullets and numbered items use `indent: { right: convertInchesToTwip(0.25) }`
- RLM (U+200F) after colons

**Font and Spacing** (Same as property claim):
- David font (standard Hebrew legal font)
- FONT_SIZES: Same hierarchy as property claim
- SPACING: Same system as property claim

**Gendered Terms**:
- Automatic gender detection from basicInfo
- Plaintiff: מבקש/מבקשת
- Defendant: משיב/משיבה
- Pronouns: הוא/היא, שלו/שלה

**Integration** (`document-generator.ts`):
```typescript
if (claimType === 'custody') {
  console.log('📝 Using programmatic generator with AI transformations...');
  documentBuffer = await generateCustodyClaim({
    basicInfo,
    formData,
    signature: options.signature,         // Client signature
    lawyerSignature: options.lawyerSignature,  // Lawyer signature
  });
}
```

**Custody Questions** (`lib/constants/questions.ts`):
1. Children repeater (inherited from property) with relationship description per child
2. Living arrangement (radio: together/with_applicant/with_respondent/split)
3. Since when date (conditional)
4. Current visitation arrangement (conditional textarea)
5. Split arrangement details (conditional textarea)
6. Requested custody arrangement (radio)
7. Visitation proposal (conditional textarea)
8. Custody summary (required textarea, 2000 chars) - **AI TRANSFORMED**
9. Why not other parent (textarea, 1000 chars) - **AI TRANSFORMED**

**Important Notes**:
- NO signature after "סעדים" section (removed in custody claims)
- Remedies sections use **numbered items** (not body paragraphs)
- Form 3 signature is CLIENT only (not lawyer)
- Power of Attorney has TWO signatures: client first, then lawyer confirmation

**Testing**: Use `test-custody-claim.js` with complete test data including children with relationship descriptions, visitation arrangements, and custody reasoning.

### 5. Validation

All forms use Zod schemas for validation:
- **Required fields**: Clear error messages
- **Format validation**: Phone numbers, emails, ID numbers
- **Custom rules**: Legal-specific validations
- **Real-time feedback**: Errors shown as user types

## State Management

### Wizard Store (Zustand)

```typescript
interface WizardState {
  currentStep: number;
  maxReachedStep: number;
  selectedClaims: ClaimType[];
  basicInfo: BasicInfo;
  formData: FormData;
  signature: string;
  paymentData: { paid: boolean; date?: Date };
  filledDocuments: { [key: string]: string };

  // Actions
  setStep: (step: number) => void;
  updateBasicInfo: (info: Partial<BasicInfo>) => void;
  updateFormData: (data: Partial<FormData>) => void;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
  reset: () => void;
}
```

The store automatically syncs to localStorage and can be restored on page reload.

## API Routes

### POST /api/submit

Submits form data to Make.com webhook.

**Request Body**:
```typescript
{
  basicInfo: BasicInfo;
  formData: FormData;
  selectedClaims: ClaimType[];
  signature: string; // base64
  paymentData: object;
}
```

**Response**:
```typescript
{
  success: boolean;
  message: string;
}
```

### POST /api/generate-pdf

Generates PDF documents from filled templates.

**Request Body**:
```typescript
{
  documentType: "powerOfAttorney" | "form3";
  data: object;
  signature: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  pdfUrl: string;
}
```

## Data Flow

1. User fills Step 1 (Claim Picker)
   → Data saved to Zustand store
   → Auto-saved to localStorage

2. User fills Step 2 (Dynamic Form)
   → Answers saved to formData in store
   → Conditional fields rendered based on answers
   → Auto-saved to localStorage

3. User signs documents (Step 3)
   → Signature captured as base64 image
   → Documents filled with user data
   → Preview shown to user

4. User reviews payment (Step 4)
   → Total calculated based on selected claims
   → Payment processed (placeholder for now)

5. Final submission (Step 5)
   → All data sent to API route
   → API route forwards to Make.com
   → Success screen shown

## Accessibility Features

- **Semantic HTML**: Proper use of headings, labels, fieldsets
- **ARIA attributes**: Labels, descriptions, live regions
- **Keyboard navigation**: Tab order, focus management
- **Screen reader support**: Descriptive labels, error announcements
- **Color contrast**: WCAG AA compliant (4.5:1 for normal text)
- **Touch targets**: Minimum 44x44px for mobile
- **Focus indicators**: Visible focus rings on all interactive elements

## Performance Optimizations

- **Code splitting**: Each wizard step lazy-loaded
- **Image optimization**: next/image for automatic optimization
- **Font optimization**: next/font with swap display
- **Lazy loading**: Components loaded on-demand
- **Memoization**: React.memo and useMemo for expensive operations
- **Debouncing**: Auto-save debounced to reduce localStorage writes

## RTL (Right-to-Left) Support

The entire application is designed for Hebrew (RTL) text:
- `dir="rtl"` set on `<html>` element
- Tailwind configured with RTL-aware utilities
- Special handling for phone/number inputs (keep RTL direction)
- Layout components mirror properly in RTL

### IMPORTANT: RTL Flexbox Behavior

**CRITICAL RTL LAYOUT RULE**: When using flexbox with RTL (`dir="rtl"`), the DOM order is REVERSED visually:
- **First element in DOM** → Appears on the RIGHT side of the screen
- **Last element in DOM** → Appears on the LEFT side of the screen

**Example Header Layout**:
```jsx
// To achieve this visual layout in RTL:
// RIGHT: Logo + Navigation Links | CENTER: Empty space | LEFT: CTA Button

<div className="flex justify-between">
  {/* This appears on the RIGHT */}
  <div>Logo + Navigation</div>

  {/* This appears on the LEFT */}
  <div>CTA Button</div>
</div>
```

**Always remember**: In RTL layouts with flexbox, think in REVERSE order when positioning elements!

### CRITICAL: Always Test RTL Behavior!

**⚠️ IMPORTANT WARNING**: RTL affects MORE than just layout - it impacts animations, transforms, and scrolling behavior!

**Common RTL Gotchas:**

1. **CSS Animations & Transforms**
   - `translateX()` values may need adjustment or reversal
   - Carousel/slider animations often break in RTL
   - **Solution**: Add `dir="ltr"` to animation containers if needed

2. **Horizontal Scrolling**
   - Scroll direction is reversed in RTL
   - `scrollLeft` values work differently
   - **Solution**: Test scroll behavior thoroughly in RTL context

3. **Positioning (left/right)**
   - `left: 0` and `right: 0` are swapped
   - Absolute/fixed positioning needs special attention
   - **Solution**: Use logical properties or test both directions

4. **Animations Example (Carousel)**
   ```jsx
   // ❌ This breaks in RTL
   <div className="animate-scroll">
     {/* Animation goes wrong direction */}
   </div>

   // ✅ Fix by overriding to LTR
   <div dir="ltr" className="animate-scroll">
     {/* Animation works correctly */}
   </div>
   ```

**BEFORE implementing any:**
- ✅ Horizontal animations
- ✅ Carousels/sliders
- ✅ Horizontal scrolling
- ✅ Left/right positioning
- ✅ Directional transforms

**→ ALWAYS test in RTL mode and consider adding `dir="ltr"` to override if needed!**

## Development

### Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Type check
npm run type-check
```

### Environment Variables

Copy `.env.local.example` to `.env.local` and fill in values:

```env
NEXT_PUBLIC_MAKE_WEBHOOK_URL=your_webhook_url
```

### Adding New Question Types

1. Define type in `lib/types/index.ts`
2. Add schema in `lib/schemas/`
3. Create renderer in wizard component
4. Add validation rules

### Adding New Claim Types

1. Add to `ClaimType` in `lib/types/index.ts`
2. Add questions in `lib/schemas/claim-schemas.ts`
3. Add to `CLAIMS` constant
4. Update pricing logic if needed

## Recent Updates & Improvements (October 2024)

### Property Claim Document Generation

The property claim generator ([property-claim-generator.ts](Law4Us-API/src/services/property-claim-generator.ts)) has been significantly enhanced with the following improvements:

#### 1. Document Structure

Property claims now generate a comprehensive Word document with four main sections:

1. **Main Claim (כתב תביעה)** - 2-3 pages
   - Opening statement with parties and marriage details
   - Requested remedies with detailed reasoning
   - Client signature (250x125px) at end of claim

2. **Form 3 (הרצאת פרטים)** - 2-4 pages
   - Detailed information about both parties
   - Housing status with Hebrew translations
   - Employment and income details
   - Property and debt listings
   - Yes/No answers properly distinguished from "not specified"

3. **Power of Attorney (יפוי כוח)** - 2 pages
   - 15 numbered powers granted to attorney
   - Both client signature (250x125px) and lawyer signature (300x150px)

4. **Affidavit (תצהיר)** - 1 page
   - Lawyer's confirmation statement
   - Lawyer signature with stamp (300x150px)

5. **Attachments Section (נספחים)** - If files uploaded
   - Automatic table of contents with correct page numbers
   - Each attachment labeled (א, ב, ג, etc.) with description

#### 2. Signature Implementation

**Client Signature** (user-provided, created in Step 4):
- Appears in 3 locations: Main claim page, Form 3, Power of Attorney
- Size: 250x125 pixels
- Format: Base64 PNG image embedded in document

**Lawyer Signature** (Ariel Dror with stamp):
- Loaded on-demand from `/Users/dortagger/Law4Us/Signature.png`
- Appears in 2 locations: Power of Attorney, Affidavit
- Size: 300x150 pixels
- Implementation: `loadLawyerSignature()` function in [load-signature.ts](Law4Us-API/src/utils/load-signature.ts)
- Cached after first load for performance
- Tries multiple paths to ensure file is found

#### 3. Hebrew Translation & Formatting

**Housing Type Translation**:
```typescript
translateHousingType(type: string): string {
  'jointOwnership' → 'בעלות משותפת'
  'applicantOwnership' → 'בבעלות המבקש/ת'
  'respondentOwnership' → 'בבעלות הנתבע/ת'
  'rental' → 'שכירות'
  'other' → 'אחר'
}
```

**Yes/No Answer Logic**:
```typescript
yesNo(value: any): string {
  if כן/yes/true → 'כן'
  if לא/no/false → 'לא'
  otherwise → 'לא צוין' (not specified)
}
```

#### 4. Table of Contents Page Calculation

The attachment table of contents now correctly calculates page numbers:
- Accounts for title page + TOC page itself (+2)
- Accurately estimates pages for each attachment type
- Updates page numbers as attachments are added

#### 5. Gender Fields

Added gender selection in Step 1 (basic info):
- Both plaintiff and defendant must select gender (male/female)
- Required field with validation
- Stored in `basicInfo.gender` and `basicInfo.gender2`
- Used throughout document generation for proper pronoun usage

### Form Questions Reorganization

The wizard questions ([questions.ts](lib/constants/questions.ts)) have been completely reorganized to match the original Framer structure and improve UX:

#### Global Questions (All Claims)

1. **Previous Marriages** - For both parties
2. **Housing Status** - Current living situation
3. **Family Violence** - Protection orders and reports
4. **Other Family Cases** - NEW: Repeater for other court proceedings
5. **Welfare & Counseling** - Services contacted and willingness to participate

#### Property Claim Questions

Organized into clear sections:

1. **Children & Relationship**
   - Relationship description (5 lines about the relationship)
   - Children repeater with individual relationship notes for each child

2. **Property Listing** (All use repeaters - no redundant yes/no questions)
   - Property regime (community/separation/unknown)
   - Apartments & real estate
   - Vehicles
   - Savings & investments
   - Social benefits (pensions, etc.)
   - General property
   - Debts

3. **Employment & Income**
   - Applicant employment status (employee/self-employed/unemployed)
   - Conditional income fields based on employment type
   - Respondent employment status
   - Conditional income fields (with "estimate if unknown" guidance)

4. **Legal Status**
   - Court proceedings (with document upload if yes)
   - Living together status
   - Separation date if not living together
   - Requested remedies (textarea)

#### Custody Claim Questions

Simplified to focus on essential information:
- Explanation of why custody should be granted (textarea)
- Children details handled by repeater (inherited from property)

#### Alimony Claim Questions

1. **Children Living Arrangement** - Where children currently reside
2. **Employment & Income** - Same as property claim
3. **Property Overview** - Brief description of assets

#### Divorce Claim Questions

1. **Relationship Description** - 5 lines about the relationship
2. **Who Wants Divorce & Why** - Explanation of divorce reasons

### Children Repeater Enhancement

The children repeater ([CHILDREN_FIELDS](lib/constants/property-repeaters.ts)) now includes:

1. **Relationship Description** (for each child individually)
   - Textarea asking about relationship with THIS specific child
   - 3 rows, not required
   - Appears first in repeater

2. **Child Details**
   - First name (required)
   - Last name (required)
   - ID number
   - Birth date (required)
   - Address
   - Name of other parent

This ensures parents describe their relationship with EACH child separately, not all children together.

### Removed Redundant Questions

The following yes/no questions were removed as they're redundant with repeaters:
- ~~"האם יש דירה משותפת?"~~ → Use apartments repeater
- ~~"האם יש כלי רכב?"~~ → Use vehicles repeater
- ~~"האם יש קרנות פנסיה?"~~ → Use benefits repeater
- ~~"האם יש חובות משותפים?"~~ → Use debts repeater
- ~~"נכסים נוספים (textarea)"~~ → Use property repeater

### Backend Integration ([submission.ts](Law4Us-API/src/routes/submission.ts))

1. Creates Google Drive folder for submission
2. Uploads submission JSON
3. Generates documents for each selected claim
4. Loads lawyer signature if not provided by client
5. Handles attachments with proper labeling
6. Returns folder ID and name for user confirmation

### Key Files Modified

1. [property-claim-generator.ts](Law4Us-API/src/services/property-claim-generator.ts) - Main document generator
2. [load-signature.ts](Law4Us-API/src/utils/load-signature.ts) - Lawyer signature loading
3. [submission.ts](Law4Us-API/src/routes/submission.ts) - Form submission handler
4. [questions.ts](lib/constants/questions.ts) - Wizard questions structure
5. [property-repeaters.ts](lib/constants/property-repeaters.ts) - Repeater field configurations
6. [basic-info.ts](lib/schemas/basic-info.ts) - Gender field validation
7. [wizard-store.ts](lib/stores/wizard-store.ts) - Gender in initial state
8. [app/wizard/page.tsx](app/wizard/page.tsx) - Gender dropdowns in UI

## Future Enhancements

### Phase 2 (Post-Launch)
- Israeli payment provider integration (Tranzila/CardCom)
- AI-powered claim drafting
- Client dashboard for tracking case status
- Admin panel for managing submissions
- Email automation (transactional emails)
- SMS notifications

### Phase 3
- Multi-language support (English, Russian)
- Advanced analytics and conversion tracking
- A/B testing for optimization
- Live chat support
- Video consultation booking
- Document upload and management

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy automatically on push to main

### Environment Variables (Production)
- `NEXT_PUBLIC_MAKE_WEBHOOK_URL`
- Future: Payment credentials, database URL, email API keys

## Maintenance

### Regular Tasks
- Monitor error logs (Vercel Analytics)
- Update dependencies monthly
- Review and update legal templates
- Test form submission flow
- Check Make.com webhook connectivity

### Monitoring
- Form completion rate
- Step drop-off points
- Error frequency
- Page load times
- Mobile vs desktop usage

## Support & Documentation

For questions or issues:
1. Check this documentation
2. Review component comments
3. Check Framer reference files in `Files from framer/`
4. Contact development team

---

**Last Updated**: October 27, 2024
**Version**: 1.1.0
**Maintained by**: Law4Us Development Team
