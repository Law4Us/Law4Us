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

**Last Updated**: October 2024
**Version**: 1.0.0
**Maintained by**: Law4Us Development Team
