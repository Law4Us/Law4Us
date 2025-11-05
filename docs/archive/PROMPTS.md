# Law4Us Implementation Prompts

This document contains all prompts for building the Law4Us divorce services platform in fewer, more comprehensive steps.

---

## PROMPT 1: Foundation - Setup, Design System & UI Components ✅ COMPLETED

**Objective**: Initialize Next.js project with all necessary configurations and dependencies.

**Tasks**:
- [x] Initialize Next.js 14 with TypeScript and App Router
- [x] Configure Tailwind CSS with RTL support (dir="rtl" for Hebrew)
- [x] Install dependencies:
  - react-hook-form, zod (forms & validation)
  - zustand (state management)
  - motion (lightweight animations - 5KB vs 30KB)
  - puppeteer (server-side HTML→PDF generation)
  - lucide-react (icons)
  - react-signature-canvas (document signing)
  - clsx, tailwind-merge (className utilities)
- [x] Set up project structure:
  ```
  /app - Next.js pages
  /components
    /ui - Base components (Button, Input, etc.)
    /wizard - Wizard-specific components
    /layout - Header, Footer, etc.
  /lib
    /schemas - Zod validation schemas
    /utils - Utilities (format, validate, cn)
    /types - TypeScript types
    /stores - Zustand stores
    /constants - Claims, etc.
  /public - Assets
  /styles - Global styles
  ```
- [x] Configure environment variables (.env.local)
- [x] Set up Google Fonts (Assistant 300-800)
- [x] Create tailwind.config with color palette and RTL utilities
- [x] Create comprehensive documentation (claude.md, README.md)

**Deliverable**: ✅ Fully configured Next.js project ready for development

---

## PROMPT 2: Design System & Core UI Components

**Objective**: Create a complete, reusable design system that can be used across the entire law platform.

**Tasks**:
- [ ] Create design tokens file with color palette:
  - Primary: #019fb7 (teal), #018da2 (dark teal), #b8d7dd (light teal)
  - Neutral: #0c1719 (darkest), #515f61 (dark), #e3e6e8 (default), #eef2f3 (light), #f9fafb (lightest)
- [ ] Build reusable UI components with Tailwind:
  - **Button**:
    - Variants: primary, secondary, ghost, outline
    - Sizes: sm, md, lg
    - States: default, hover, focus, disabled, loading
    - RTL support
  - **Input**:
    - Types: text, number, date, tel, email
    - With label, error message, helper text
    - RTL support for phone/number inputs
    - Auto-formatting (phone, ID numbers)
  - **Textarea**:
    - With character count
    - Resize: vertical only
    - Max rows configurable
  - **Select**:
    - Custom styling (replace default browser)
    - Support for grouped options
    - Searchable variant (future)
  - **Radio**:
    - Fieldset with "cut border" legend design
    - Horizontal and vertical layouts
    - Support for sub-questions
  - **Checkbox**:
    - Single and group variants
    - Indeterminate state
  - **Label**:
    - Required indicator
    - Optional indicator
    - Tooltip support
  - **FormField**:
    - Wrapper component combining label, input, error, helper
    - Consistent spacing and layout
- [ ] Add interaction states:
  - Focus: visible ring (outline-primary)
  - Hover: subtle color changes
  - Disabled: reduced opacity, cursor not-allowed
  - Error: red border and text
  - Success: green indicator
- [ ] Ensure accessibility:
  - Minimum 44x44px touch targets
  - Proper ARIA attributes (aria-label, aria-describedby, aria-invalid)
  - Keyboard navigation (Tab, Enter, Escape)
  - Screen reader support
  - Color contrast WCAG AA (4.5:1)
- [ ] Add smooth transitions:
  - Native CSS transitions (not libraries)
  - duration-300 for most interactions
  - ease-in-out curves
- [ ] Create component documentation:
  - Usage examples
  - Props documentation
  - Variants showcase

**Component Structure Example**:
```tsx
// components/ui/button.tsx
interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

**Deliverable**: Complete design system with production-ready, accessible, platform-reusable UI components

---

## PROMPT 3: Static Pages - Home & About

**Objective**: Build the marketing pages that match the Framer design pixel-perfectly.

**Tasks**:
- [ ] Create layout components:
  - **Header**:
    - Logo (placeholder)
    - Navigation: תהליך | סוגי תביעות | מדריך | עזרה | אודות | צור קשר
    - Sticky on scroll
    - Hamburger menu on mobile
    - CTA button: "התחילו בהליך גירושין"
  - **Footer**:
    - 3 columns: Company | Info | Social
    - Links: מי אנחנו | מה אומרים עלינו | בלוג | איך זה עובד | סוגי תביעות | שאלות נפוצות
    - Address: יגאל אלון 26 תל אביב
    - Social icons (placeholders)
    - CTA button
- [ ] Build Home page (`/app/page.tsx`):
  - **Hero Section**:
    - Headline: "פתיחת תיק גירושין אונליין מנוהל על ידי עורכי דין מנוסים ובמחיר הוגן"
    - Subtext about affordable, transparent service
    - Two buttons:
      - Primary: "התחילו בהליך גירושין" (→ /wizard)
      - Secondary: "מדריך גירושין" (→ /divorce)
    - Background: light neutral with subtle gradient
  - **How It Works Section**:
    - 3-column responsive grid
    - Step 1: "מלאו טופס ב-5 דקות" (badge: 1, icon, description)
    - Step 2: "פגישת זום עם עורך דין" (badge: 2, icon, description)
    - Step 3: "קבלו תביעה מוכנה להגשה" (badge: 3, icon, description)
    - Smooth fade-in animations on scroll
  - **Claim Types Section**:
    - Sidebar list (vertical nav):
      - מזונות ילדים
      - רכוש
      - משמורת
      - גירושין
      - צוואה
    - Main content area (dynamic):
      - Shows selected claim type details
      - Template preview (placeholder)
      - Description text
    - Component switches content on click
    - Active state highlight on sidebar
- [ ] Build About page (`/app/about/page.tsx`):
  - **Hero**: "מי אנחנו? הסיפור מאחורי ההצלחה"
  - **Mission Section**:
    - Affordable, top-quality legal service
    - Thousands of cases handled
  - **Founder Section**:
    - Ariel Dror credentials
    - Education background
    - Leadership roles
    - Book: property division
    - Duns 100 ranking
  - **Stats Section** (optional enhancement):
    - Number of cases
    - Success rate
    - Years of experience
  - Professional photo placeholder
- [ ] Add smooth page transitions (Motion One)
- [ ] Optimize images (next/image)
- [ ] Add meta tags for SEO

**Design Notes**:
- Light grey backgrounds (#eef2f3, #f9fafb)
- Teal accents (#019fb7)
- Generous whitespace (64-80px between sections)
- Clean, minimalist aesthetic
- Professional but approachable

**Deliverable**: Fully functional Home and About pages matching Framer design

---

## PROMPT 4: Static Pages - Divorce Guide, Help & Contact

**Objective**: Complete all remaining marketing/informational pages.

**Tasks**:
- [ ] Build Divorce Guide page (`/app/divorce/page.tsx`):
  - **Hero**: "מדריך: מהו הליך הגירושין"
  - **Content Sections**:
    1. מזונות/דמי מזונות (Alimony/Spousal Support)
       - What is it
       - Who is entitled
       - How amounts are decided
    2. משמורת וסידורי ראיה (Custody and Visitation)
       - Types of custody
       - Visitation rights
       - Best interest of child
    3. חלוקת רכוש (Property Division)
       - Community property
       - Separate property
       - Financial orders
    4. הליך הגירושין (Divorce Process)
       - Steps overview
       - Timeline
       - Required documents
  - **Typography**:
    - Use Tailwind typography classes
    - Clear hierarchy (h2, h3, p)
    - Readable line length (max-w-3xl)
    - Proper spacing between sections
  - **Blog Component** (bottom of page):
    - Article cards grid (3 columns on desktop, 1 on mobile)
    - Each card:
      - Thumbnail image (placeholder)
      - Date (format: "15 באוקטובר 2024")
      - Reading time ("5 דקות קריאה")
      - Title
      - Excerpt (2 lines max, ellipsis)
      - "קרא עוד" link
    - Hover effects
- [ ] Build Help page (`/app/help/page.tsx`):
  - **Hero**: "צריכים עזרה? אנחנו כאן"
  - **Assistance Cards** (responsive grid):
    1. יועץ משפחתי (Family Counselor)
    2. יועץ פיננסי/רואה חשבון (Financial Adviser/Accountant)
    3. יועץ זוגי (Couples Therapist)
    4. מגשר (Mediator)
    5. פסיכולוג (Psychologist)
    6. פסיכיאטר (Psychiatrist)
    - Each card: Icon placeholder, title, description
    - 2-3 columns on desktop, 1 on mobile
  - **FAQ Section**:
    - Collapsible accordion items
    - Smooth expand/collapse animation
    - Plus/minus icon indicator
    - Common questions about the process
  - **Contact Form**:
    - Fields: Name, Phone, Email, Message
    - Uses form components from Prompt 2
    - Validation with Zod
    - Submit handler (placeholder API call)
    - Consent checkbox: "אני מסכים/ה לקבלת תקשורת"
    - Success message after submit
- [ ] Build Contact page (`/app/contact/page.tsx`):
  - **Hero**: "צור קשר"
  - **Contact Form**:
    - Same as Help page form
    - Name, Phone, Email, Message
    - Centered layout (max-w-xl)
  - **Contact Info** (optional):
    - Address
    - Phone
    - Email
    - Office hours
  - **Map** (placeholder or real):
    - Google Maps embed or placeholder
- [ ] Footer (used on all pages):
  - Already created in Prompt 3
  - Ensure consistency across pages

**Enhancement Ideas**:
- Add smooth scroll to section anchors
- Add "Back to top" button on long pages
- Add breadcrumbs navigation
- Add share buttons on blog articles

**Deliverable**: Complete marketing site with all static pages functional

---

## PROMPT 5: Form System Foundation

**Objective**: Build the robust form infrastructure that will power the wizard.

**Tasks**:
- [ ] Create Zod validation schemas:
  - **Basic Info Schema** (`lib/schemas/basic-info.ts`):
    ```typescript
    z.object({
      fullName: z.string().min(2, "שם חייב להכיל לפחות 2 תווים"),
      idNumber: z.string().refine(validateIsraeliId, "מספר זהות לא תקין"),
      address: z.string().min(5, "כתובת חייבת להכיל לפחות 5 תווים"),
      phone: z.string().refine(validateIsraeliPhone, "מספר טלפון לא תקין"),
      email: z.string().email("כתובת מייל לא תקינה"),
      birthDate: z.string().refine(isDateInPast, "תאריך לידה חייב להיות בעבר"),
      // ... same for fullName2, etc.
      relationshipType: z.enum(["married", "commonLaw", "separated", "notMarried"]),
      weddingDay: z.string().optional(),
    })
    .refine((data) => {
      // If married/commonLaw, weddingDay required
      if (data.relationshipType !== "notMarried" && !data.weddingDay) {
        return false;
      }
      return true;
    }, "תאריך נישואין נדרש")
    ```
  - **Global Questions Schema** (`lib/schemas/global-questions.ts`):
    - Previous marriages
    - Housing situation
    - Family violence
    - Other family cases
    - Welfare/counseling
  - **Claim-Specific Schemas** (`lib/schemas/claim-schemas.ts`):
    - Divorce Agreement schema
    - Divorce Claim schema
    - Property Claim schema
    - Custody Claim schema
    - Alimony Claim schema
- [ ] Create TypeScript types:
  - Interfaces for all form data structures
  - Question type definitions
  - Validation error types
- [ ] Build Zustand store (`lib/stores/wizard-store.ts`):
  ```typescript
  interface WizardStore {
    // State
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
    nextStep: () => void;
    prevStep: () => void;
    updateBasicInfo: (info: Partial<BasicInfo>) => void;
    updateFormData: (data: Partial<FormData>) => void;
    setSignature: (signature: string) => void;
    setPaymentData: (data: PaymentData) => void;
    saveToLocalStorage: () => void;
    loadFromLocalStorage: () => void;
    clearLocalStorage: () => void;
    reset: () => void;
  }
  ```
- [ ] Implement localStorage persistence:
  - Debounced auto-save (2 seconds after last change)
  - Load from localStorage on mount
  - Clear localStorage on successful submission
  - Versioning for schema changes
- [ ] Create form field components with React Hook Form:
  - **ControlledInput** (text, number, date, email, tel):
    - Integrates with useController
    - Shows validation errors
    - Auto-formats on blur (phone, ID)
  - **ControlledTextarea**:
    - Character count indicator
    - Max length enforcement
  - **ControlledSelect**:
    - Custom styled dropdown
    - Disabled state
  - **ControlledRadioGroup**:
    - Fieldset with legend
    - Error display
  - **ControlledCheckbox**:
    - Single and group variants
- [ ] Create form utilities:
  - Auto-save hook (`useAutoSave`)
  - Form progress calculator (% complete)
  - Field dependency tracker
  - Dynamic name replacer (replaces "המבקש/ת" with actual names)
- [ ] Build validation feedback system:
  - Field-level errors (shown immediately)
  - Form-level errors (shown on submit)
  - Success indicators (green checkmark)
  - Loading states during async validation

**Testing Checklist**:
- [x] Validation messages in Hebrew
- [x] Auto-save works without blocking UI
- [x] localStorage persists across browser refresh
- [x] Phone numbers auto-format correctly
- [x] ID validation works with checksums
- [x] Conditional validation (weddingDay required if married)
- [x] RTL inputs work correctly

**Deliverable**: Complete form system ready for wizard implementation

---

## PROMPT 6: Wizard - Layout & Step 1 (Claim Picker)

**Objective**: Create the wizard shell and implement the first step.

**Tasks**:
- [ ] Create wizard layout (`/app/wizard/layout.tsx`):
  - **WizardHeader Component**:
    - Step progress indicator (numbered circles 1-5)
    - Current step highlighted (primary color)
    - Completed steps clickable (can go back)
    - Future steps disabled (grey, not clickable)
    - Progress bar showing % complete
    - Desktop: horizontal layout
    - Mobile: simplified stepper
  - **Exit Confirmation**:
    - "Are you sure?" dialog when clicking back/away
    - Options: "Save and Exit" | "Exit without Saving" | "Cancel"
    - Only show if form has data
  - **Auto-save Indicator**:
    - Small text: "שמירה אוטומטית..." during save
    - Checkmark when saved
    - Bottom of page or in header
- [ ] Implement Step 1: Claim Picker (`/app/wizard/page.tsx`):
  - **Layout**:
    - Three-column form layout on desktop:
      - Left: Plaintiff info (תובע/בעל/אישה)
      - Middle: Defendant info (נתבע/בעל/אישה)
      - Right: Relationship status + Claim picker
    - Responsive:
      - Tablet (1199px): Hide right column, show below
      - Mobile (809px): Stack all columns vertically
  - **Plaintiff Fields** (Left Column):
    - שם פרטי ומשפחה (Full Name)
    - תעודת זהות (ID Number) - auto-format
    - כתובת (Address)
    - טלפון (Phone) - auto-format to 050-123-4567
    - כתובת מייל (Email)
    - תאריך לידה (Birth Date)
    - All fields with React Hook Form + Zod validation
  - **Defendant Fields** (Middle Column):
    - Same fields as plaintiff (fullName2, idNumber2, etc.)
  - **Relationship Status** (Right Column Top):
    - Dropdown: סטטוס זוגי
      - נשואים (Married)
      - ידועים בציבור (Common Law)
      - גרושים/פרודים (Separated)
      - לא נשואים (Not Married)
    - Conditional: תאריך נישואין (Wedding Date)
      - Only shown if NOT "לא נשואים"
      - Required if shown
      - Date picker
  - **Claim Picker** (Right Column Bottom):
    - Multi-select pill buttons
    - Options:
      1. הסכם גירושין (3,900₪)
      2. תביעת גירושין/כתב הגנה גירושין (3,900₪)
      3. תביעת/כתב הגנה רכושית (3,900₪)
      4. תביעת/כתב הגנה משמורת (3,900₪)
      5. תביעת/כתב הגנה מזונות (3,900₪)
    - Visual design:
      - Unselected: light grey background, no border
      - Selected: white background, 2px teal border
      - Hover: slight scale (1.02)
      - Transition: 200ms ease
  - **Next Button**:
    - Disabled until all fields valid + at least 1 claim selected
    - Text: "המשך לשלב הבא"
    - Large, primary button
    - Shows loading spinner during validation
  - **Validation**:
    - Real-time validation as user types
    - Error messages below each field
    - Field turns red border on error
    - Scroll to first error on submit attempt
  - **Auto-save**:
    - Debounced 2 seconds after last change
    - Save indicator shows "שומר..." then "נשמר ✓"
- [ ] Add animations:
  - Slide in from right when entering wizard
  - Smooth error message appearances
  - Button loading state animation
  - Responsive layout transitions

**UX Enhancements**:
- Tab order follows logical flow
- Enter key submits from last field
- Phone/ID fields auto-format on blur
- Clear error messages in Hebrew
- Touch-friendly on mobile
- Prevent accidental navigation away

**Deliverable**: Wizard with working Step 1 - users can enter info and proceed

---

## PROMPT 7: Wizard - Step 2 (Dynamic Form Renderer)

**Objective**: Build the sophisticated dynamic form that adapts to selected claims.

**Tasks**:
- [ ] Implement DynamicForm component (`/app/wizard/step-2/page.tsx`):
  - Loads questions based on selectedClaims from store
  - Renders global questions (shown for all)
  - Renders claim-specific questions
  - Handles dynamic name replacement
  - Auto-saves form data
- [ ] Build question renderer system:
  - **renderQuestion(question)**: Main dispatcher
  - Handles all question types:
    1. **text/number/date/email/tel** → Input component
    2. **textarea** → Textarea component
    3. **select** → Select component
    4. **radio** → Radio group with fieldset
    5. **file** → File upload
    6. **fileList** → Multiple file upload
    7. **heading** → Section heading
    8. **shared** → Shared field sets (children, etc.)
    9. **repeater** → Covered in Prompt 8
    10. **needsTable** → Covered in Prompt 8
- [ ] Implement conditional field rendering:
  - **Radio with sub-questions**:
    ```typescript
    {
      type: "radio",
      name: "protectionOrderRequested",
      label: "הוגשה בעבר בקשה לצו הגנה?",
      options: [
        {
          label: "כן",
          value: "כן",
          fields: [ // Show these if "כן" selected
            { type: "date", name: "protectionOrderDate", label: "מתי" },
            { type: "text", name: "protectionOrderCaseNumber", label: "מספר התיק" },
          ]
        },
        { label: "לא", value: "לא" }
      ]
    }
    ```
  - Sub-questions appear smoothly when parent selected
  - Sub-questions hidden when parent deselected
  - Sub-question data cleared when hidden
- [ ] Implement dynamic name replacement:
  - Replace placeholders with actual names:
    - "המבקש/ת" → {basicInfo.fullName}
    - "הנתבע/ת" → {basicInfo.fullName2}
    - "בן/בת הזוג" → {basicInfo.fullName2}
  - Works in:
    - Question labels
    - Option labels (for select/radio)
    - Help text
  - Example:
    ```
    "האם המבקש/ת היה/תה נשוי/אה בעבר?"
    becomes
    "האם יוסי כהן היה נשוי בעבר?"
    ```
- [ ] Implement dynamic select options:
  - **useDynamicNames** (for ownership questions):
    ```typescript
    {
      type: "select",
      name: "propertyOwner",
      label: "בעלות הנכס",
      useDynamicNames: true, // Auto-generate options from names
    }
    // Generates options:
    // - יוסי כהן
    // - שרה לוי
    // - שניהם (יוסי כהן ו-שרה לוי)
    ```
  - **useDynamicParties** (for protection order):
    ```typescript
    {
      type: "select",
      name: "protectionOrderAgainst",
      label: "כנגד מי",
      useDynamicParties: true, // Just applicant and respondent, no "both"
    }
    // Generates options:
    // - יוסי כהן
    // - שרה לוי
    ```
- [ ] Build global questions sections:
  - **Section 1: נישואין קודמים / ילדים**
    - Was applicant married before? (radio: yes/no)
    - Does applicant have children from previous? (radio: yes/no)
    - Was respondent married before? (radio: yes/no)
    - Does respondent have children from previous? (radio: yes/no)
  - **Section 2: מצב דיור**
    - Applicant's housing type (radio: joint ownership, applicant ownership, respondent ownership, rental, other)
    - Respondent's housing type (same options)
  - **Section 3: אלימות במשפחה**
    - Protection order requested? (radio with conditional fields)
    - Past violence reported? (radio with textarea)
  - **Section 4: תיקים אחרים**
    - Other family case files (repeater - see Prompt 8)
  - **Section 5: רווחה וייעוץ**
    - Contacted welfare? (radio: yes/no)
    - Contacted marriage counseling? (radio: yes/no)
    - Willing to join family counseling? (radio: yes/no)
    - Willing to join mediation? (radio: yes/no)
- [ ] Render claim-specific questions:
  - Questions depend on selectedClaims:
    - If "divorceAgreement" → divorceAgreementQuestions
    - If "divorce" → divorceClaimQuestions
    - If "property" → propertyClaimQuestions
    - If "custody" → custodyClaimQuestions
    - If "alimony" → alimonyClaimQuestions
  - Each claim section has heading with claim label
  - Questions rendered below heading
- [ ] Add contextual help:
  - Tooltip icon next to complex legal questions
  - Hover/click shows explanation in plain language
  - Example: "מהי משמורת משותפת?" → tooltip explains
- [ ] Add navigation:
  - "חזור" button (goes to Step 1)
  - "הבא" button (proceeds to Step 3)
  - Both buttons always visible (sticky footer on mobile)
- [ ] Add form progress indicator:
  - Calculate % of required fields completed
  - Show in header or as progress bar
  - Update in real-time as user fills
- [ ] Add smooth animations:
  - Conditional fields slide in/out
  - Error messages fade in
  - Section headings fade in on scroll
  - Loading states on buttons

**UX Enhancements**:
- Scroll to top when entering step
- Auto-focus first field
- Save scroll position on navigation
- Show field count: "שדה 5 מתוך 20"
- Highlight required fields clearly
- Group related questions visually

**Deliverable**: Fully functional dynamic form with all question types (except repeaters/tables)

---

## PROMPT 8: Wizard - Advanced Form Features

**Objective**: Implement repeaters, needs table, and file uploads.

**Tasks**:
- [ ] Build Repeater component (`components/wizard/repeater.tsx`):
  - **Generic Repeater**:
    - For: Other family cases, Properties, Debts, etc.
    - Horizontal layout of fields in each row
    - "+ הוסף שורה" button at bottom
    - "- מחק" button on each row (disabled if only 1 row)
    - Smooth add/remove animations
    - Stable row IDs (prevent focus loss on add/remove)
    - Minimum 1 row always present
    ```typescript
    <Repeater
      name="otherFamilyCases"
      fields={[
        { name: "caseNumber", label: "מספר התיק", type: "text" },
        { name: "judge", label: "בפני מי נדון", type: "text" },
        { name: "caseNature", label: "מהות התיק", type: "text" },
        { name: "caseEndDate", label: "מתי הסתיים", type: "date" },
      ]}
    />
    ```
  - **Children Repeater** (Special Layout):
    - Two-column layout:
      - Left column: Textarea (פרטים נוספים) - full height
      - Right column: 2x2 grid of small fields
        - שם פרטי (First Name)
        - שם משפחה (Last Name)
        - תאריך לידה (Birth Date)
        - תעודת זהות (ID Number)
    - Remove button positioned at bottom center
    - Responsive: Single column on mobile (809px)
    - Example from files:
    ```typescript
    {
      type: "repeater",
      name: "children",
      label: "ילדים",
      fields: [
        { name: "details", type: "textarea", label: "פרטים נוספים" },
        { name: "firstName", type: "text", label: "שם פרטי" },
        { name: "lastName", type: "text", label: "שם משפחה" },
        { name: "birthDate", type: "date", label: "תאריך לידה" },
        { name: "idNumber", type: "text", label: "ת.ז" },
      ]
    }
    ```
- [ ] Build NeedsTable component (`components/wizard/needs-table.tsx`):
  - Used for child support calculations (מזונות ילדים)
  - Dynamic table structure:
    - Column headers: צורך | [Child 1 Name] | [Child 2 Name] | ... | Actions
    - Rows: Each type of need (food, clothing, education, etc.)
    - Footer: Sum totals for each child
  - Features:
    - Add row button: "+ הוסף צורך"
    - Remove row button on each row (icon: -)
    - Columns sync with children count automatically
      - If 2 children → 2 amount columns
      - If 3 children → 3 amount columns
      - Add child in repeater → column auto-adds
    - Auto-calculate totals (sum of all needs per child)
    - Number inputs with currency formatting
  - Default needs:
    - מזון וכלכלה (Food and household)
    - ביגוד והנעלה (Clothing and footwear)
    - User can add more
  - Responsive:
    - Horizontal scroll on mobile
    - Sticky first column (need name)
  - Example structure:
    ```
    | צורך              | דוד כהן | שרה כהן | Actions |
    |-------------------|---------|---------|---------|
    | מזון וכלכלה       | 800     | 600     | -       |
    | ביגוד והנעלה      | 400     | 300     | -       |
    | חינוך             | 500     | 500     | -       |
    |-------------------|---------|---------|---------|
    | סה"כ              | 1700    | 1400    |         |
    ```
- [ ] Implement file upload features:
  - **Single File Upload**:
    - Click to upload or drag & drop
    - Show file name when uploaded
    - Remove file button
    - File type validation (accept prop)
    - File size validation (max 10MB)
    - Preview for images (thumbnail)
  - **Multiple File Upload** (fileList):
    - Can select multiple files at once
    - Shows list of uploaded files
    - Remove button for each file
    - Total size indicator
    - Progress bar during upload (future)
  - **Validation**:
    - File type restrictions
    - Size limits
    - Show error messages
  - **Styling**:
    - Dashed border for drop zone
    - Highlight on drag over
    - Loading state during upload
    - Success checkmark when uploaded
- [ ] Implement shared field sets:
  - **Children (Simple)**:
    - Used in divorce agreement
    - Simpler than full children repeater
    - Just: First name, Last name, Birth date
  - **Children (Full)**:
    - Used in custody, alimony claims
    - All fields including ID, details
  - Ensure no duplicate rendering:
    - If multiple claims need "children", render only once
    - Use `renderedShared` tracker
- [ ] Add row management features:
  - Smooth animations on add/remove
  - Disable remove on last row
  - Confirmation before removing row with data
  - Keyboard shortcuts (Enter to add row)
  - Auto-focus first field in new row
- [ ] Handle data persistence:
  - Repeater data structure:
    ```typescript
    {
      children: [
        { __id: "uuid1", firstName: "דוד", lastName: "כהן", ... },
        { __id: "uuid2", firstName: "שרה", lastName: "כהן", ... },
      ]
    }
    ```
  - Needs table data structure:
    ```typescript
    {
      childNeeds: [
        { name: "מזון וכלכלה", amounts: ["800", "600"] },
        { name: "ביגוד והנעלה", amounts: ["400", "300"] },
      ]
    }
    ```
  - Auto-save to store and localStorage
  - Maintain stable IDs to prevent focus loss

**UX Enhancements**:
- Clear "add" and "remove" actions
- Disabled state for remove when only 1 row
- Smooth transitions
- Touch-friendly on mobile
- Accessible labels for screen readers
- Error messages for invalid files

**Deliverable**: Fully functional advanced form features - repeaters, needs table, file uploads

---

## PROMPT 9: Wizard - Documents, Payment & Submission

**Objective**: Implement document signing, payment, and final submission.

**Tasks**:
- [ ] Implement Step 3: Sign Documents (`/app/wizard/step-3/page.tsx`):
  - **Document Templates**:
    - Load from `Files from framer/Legal Templates/`
    - Power of Attorney (ייפוי כוח)
    - Form 3 (טופס 3 - הרצאת פרטים)
  - **Document Preview**:
    - Two-column card layout (side by side on desktop)
    - Each card shows:
      - Document title
      - Filled template with user data
      - Signature placeholder
    - Responsive: Stack vertically on mobile
  - **Template Filling**:
    - Replace placeholders: {{fullName}}, {{idNumber}}, {{claimType}}, {{date}}, etc.
    - Format date in Hebrew
    - Replace {{childrenBlock}} with formatted children info
    - Handle signature: {{signature}} → becomes image or "[חתימה]"
  - **Signature Pad**:
    - Canvas-based signature (react-signature-canvas)
    - Clear background (transparent or white)
    - Black pen color
    - Size: 400x150px
    - Buttons:
      - "נקה חתימה" (Clear) - erases canvas
      - "חתום" (Sign) - captures signature
    - Validation: Must sign before proceeding
    - Error message if empty: "יש לחתום לפני המשך"
  - **Real-time Preview**:
    - After signing, signature appears on documents immediately
    - Update both preview cards
    - Signature shown as image (base64 PNG)
  - **Navigation**:
    - "חזור" to Step 2
    - "המשך" to Step 4 (only enabled after signing)
- [ ] Implement Step 4: Payment (`/app/wizard/step-4/page.tsx`):
  - **Summary Display**:
    - Title: "סיכום ותשלום"
    - Centered card layout (max-w-xl)
    - Show:
      - Applicant name
      - Selected claims (list with labels)
      - Price breakdown:
        - "הסכם גירושין: 3,900₪"
        - "תביעת גירושין: 3,900₪"
        - "סה\"ך: 7,800₪"
      - Large, bold total
  - **Payment Button**:
    - Large primary button
    - Text: "שלם {total}₪" (e.g., "שלם 7,800₪")
    - For now: Placeholder (just marks as paid and continues)
    - Loading state while processing
  - **Placeholder Payment**:
    ```typescript
    const handlePayment = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API
      setPaymentData({ paid: true, date: new Date() });
      nextStep();
    };
    ```
  - **Future**: Israeli payment provider integration:
    - Tranzila, CardCom, or Meshulam
    - Credit card form
    - 3D Secure support
    - Payment confirmation
  - **Navigation**:
    - "חזרה" link (small, underlined) back to Step 3
    - Auto-proceed after payment success
- [ ] Implement Step 5: Final Review & Submit (`/app/wizard/step-5/page.tsx`):
  - **Final Document Preview**:
    - Show completed documents
    - Download links for each document
    - Print button
  - **Review Summary** (optional):
    - All entered information
    - Edit links to go back to specific steps
  - **Submit Button**:
    - Large, prominent: "שלח את התביעה"
    - Loading state: "שולח..."
    - Disabled during submission
  - **Submission Flow**:
    1. Collect all data from store
    2. Format for API:
       ```typescript
       {
         basicInfo: { ... },
         formData: { ... },
         selectedClaims: ["divorce", "property"],
         selectedClaimsLabels: ["תביעת גירושין", "תביעת רכושית"],
         signature: "data:image/png;base64,...",
         signatureBase64: "iVBORw0KG...", // Without prefix
         paymentData: { paid: true, date: "2024-10-24" },
         childrenBlock: "ילדים:\n1. דוד כהן...\n2. שרה כהן...",
         filledDocuments: { powerOfAttorney: "...", form3: "..." },
       }
       ```
    3. Send to Make.com webhook:
       ```typescript
       const response = await fetch(process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(data),
       });
       ```
    4. Handle response:
       - Success: Show success screen
       - Error: Show error message, allow retry
  - **Success Screen**:
    - Celebration animation (confetti or checkmark)
    - Heading: "התביעה נשלחה בהצלחה!"
    - Message:
      - "קיבלנו את התביעה שלך"
      - "עורך דין ייצור איתך קשר תוך 24 שעות"
      - "קיבלת מייל אישור ל-{email}"
    - Next steps:
      - Download documents
      - Check email for confirmation
      - Wait for attorney contact
    - Button: "חזרה לדף הבית"
  - **Error Handling**:
    - Network error: "בעיית חיבור, נסה שוב"
    - Server error: "שגיאת שרת, צור קשר"
    - Retry button
    - Contact information
- [ ] Build API route (`/app/api/submit/route.ts`):
  - Receives form data
  - Validates data (server-side)
  - Forwards to Make.com webhook
  - Returns success/error response
  - Error logging
- [ ] Implement data cleanup:
  - On successful submission:
    - Clear localStorage
    - Reset wizard store
    - Clear signature
  - Option to download data as JSON (for user records)
- [ ] Add final touches:
  - Loading states throughout
  - Error boundaries
  - Retry mechanisms
  - Offline detection
  - Session timeout warning

**Security Notes**:
- Don't store payment details in localStorage
- Sanitize all inputs before sending to API
- Use HTTPS only
- Server-side validation
- Rate limiting on submit endpoint

**Deliverable**: Complete wizard flow from start to successful submission

---

## PROMPT 10: Polish, Optimization & Production Ready

**Objective**: Add animations, optimize performance, ensure accessibility, and prepare for production.

**Tasks**:
- [ ] Add animations (Motion One):
  - **Page Transitions**:
    - Fade in on mount
    - Slide transitions between wizard steps
    - Smooth exit animations
  - **Component Animations**:
    - Buttons: Scale on press (0.98)
    - Cards: Lift on hover (shadow + translate)
    - Modals: Fade in backdrop, scale in content
    - Dropdowns: Slide down/up
  - **Form Interactions**:
    - Error messages: Shake animation
    - Success: Bounce checkmark
    - Loading: Spinner or skeleton
  - **Wizard Step Transitions**:
    - Step 1→2: Slide left
    - Step 2→3: Slide left
    - Back button: Slide right
    - Smooth, 300ms duration
  - **Success Celebration**:
    - Confetti on submission success
    - Or: Animated checkmark with scale/rotate
    - Celebration sound (optional, with mute)
- [ ] Implement loading states:
  - **Skeleton Loaders**:
    - For forms while loading questions
    - For claim picker while loading claims
    - Animated shimmer effect
    - Match layout of actual content
  - **Button Loading**:
    - Spinner icon
    - Disabled during loading
    - Loading text: "שולח..." / "טוען..."
  - **Page Loading**:
    - Loading bar at top (like YouTube)
    - Or: Full-page spinner for initial load
  - **Lazy Loading**:
    - Wizard steps loaded on-demand
    - Heavy components (signature pad) lazy-loaded
    - Images lazy-loaded with placeholder
- [ ] Error handling & boundaries:
  - **Error Boundary Component**:
    - Catches React errors
    - Shows friendly error message
    - "משהו השתבש" with illustration
    - Retry button
    - Contact support link
  - **API Error Handling**:
    - Network errors: Auto-retry 3 times
    - 4xx errors: Show user message
    - 5xx errors: Show "try again later"
    - Timeout handling
  - **Form Validation Errors**:
    - Summary at top of form
    - List of all errors
    - Click to scroll to field
  - **Offline Detection**:
    - Banner: "אין חיבור לאינטרנט"
    - Disable submit button
    - Queue submissions for when back online
- [ ] Accessibility audit:
  - **Keyboard Navigation**:
    - Tab through all interactive elements
    - Enter to submit forms
    - Escape to close modals
    - Arrow keys in select/radio
    - Focus visible indicators
  - **Screen Reader**:
    - Test with VoiceOver (Mac) or NVDA (Windows)
    - Proper heading hierarchy (h1→h2→h3)
    - ARIA labels on all inputs
    - ARIA live regions for dynamic content
    - ARIA-describedby for errors/help
  - **Color Contrast**:
    - Check all text vs background (WCAG AA)
    - Minimum 4.5:1 for body text
    - Minimum 3:1 for large text
    - Check with contrast checker tool
  - **Focus Management**:
    - Focus trap in modals
    - Auto-focus first field on step load
    - Return focus after modal close
    - Skip to main content link
  - **Touch Targets**:
    - Verify all 44x44px minimum
    - Extra padding on mobile
    - No overlapping targets
- [ ] Performance optimization:
  - **Code Splitting**:
    - Dynamic imports for wizard steps:
      ```typescript
      const Step2 = dynamic(() => import('./step-2'));
      ```
    - Split large components
    - Split by route
  - **Image Optimization**:
    - Use next/image everywhere
    - Provide width/height
    - Use placeholder blur
    - Lazy load below fold
  - **Bundle Analysis**:
    - Run `npm run build`
    - Check bundle sizes
    - Identify large dependencies
    - Remove unused imports
  - **Font Optimization**:
    - Already done with next/font
    - Subset to Hebrew characters only
    - Preload critical fonts
  - **Debouncing & Throttling**:
    - Auto-save debounced (2s)
    - Scroll handlers throttled
    - Search inputs debounced
  - **Memoization**:
    - useMemo for expensive calculations
    - React.memo for heavy components
    - useCallback for stable functions
  - **Lazy Loading**:
    - Wizard steps loaded on-demand
    - Below-fold images lazy
    - Heavy libraries (Puppeteer) server-side only
- [ ] SEO optimization:
  - **Meta Tags** (all pages):
    - Title (unique per page)
    - Description (compelling, 150-160 chars)
    - Keywords (relevant)
    - Open Graph (og:title, og:description, og:image)
    - Twitter Card
    - Canonical URL
  - **Structured Data** (JSON-LD):
    - Organization schema
    - Service schema
    - FAQ schema
    - BreadcrumbList schema
  - **Sitemap**:
    - Generate sitemap.xml
    - Include all public pages
    - Update on new content
  - **Robots.txt**:
    - Allow search engines
    - Disallow /wizard (private)
  - **Performance**:
    - Lighthouse score 90+ (Desktop)
    - Core Web Vitals green
    - Fast page load (<2s)
- [ ] Mobile testing:
  - **Responsive Testing**:
    - Test on: iPhone SE, iPhone 14, iPad, Android
    - Portrait and landscape
    - Check all breakpoints
  - **Touch Interactions**:
    - Buttons easy to tap
    - Forms easy to fill
    - No zoom required
    - Proper keyboard handling
  - **Mobile-Specific**:
    - Virtual keyboard doesn't hide inputs
    - Date/number pickers work
    - File upload from camera works
    - Signature pad works with finger
- [ ] Browser testing:
  - Chrome (latest)
  - Safari (Mac & iOS)
  - Firefox (latest)
  - Edge (latest)
  - Test RTL layout in all
- [ ] Final polish:
  - **Micro-interactions**:
    - Button hover states
    - Link underlines on hover
    - Form field focus rings
    - Smooth transitions everywhere
  - **Copy Review**:
    - Proofread all Hebrew text
    - Check for typos
    - Ensure friendly, professional tone
    - Legal terminology accurate
  - **Visual Consistency**:
    - Spacing consistent everywhere
    - Colors from design system only
    - Typography hierarchy clear
    - Alignment perfect
  - **Empty States**:
    - No claims selected: Helpful message
    - No children added: Explanation
    - No search results: Suggest alternatives
  - **Loading States**:
    - Never show blank screen
    - Always indicate progress
    - Skeleton loaders match layout

**Testing Checklist**:
- [ ] All forms submit successfully
- [ ] Validation works correctly
- [ ] Auto-save persists data
- [ ] Signature captures correctly
- [ ] Documents fill with data
- [ ] Payment placeholder works
- [ ] Submission to Make.com works
- [ ] Success screen shows
- [ ] Error handling works
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Mobile responsive
- [ ] All browsers work
- [ ] RTL layout correct
- [ ] Performance good (Lighthouse 90+)

**Deliverable**: Production-ready website ready for launch

---

## Post-Launch Tasks (Future)

### Phase 2: Payment Integration
- Integrate Israeli payment provider (Tranzila/CardCom/Meshulam)
- Add credit card form
- Implement 3D Secure
- Add payment confirmation emails
- Add invoice generation

### Phase 3: AI Features
- AI-powered claim drafting
- Natural language form filling
- Document analysis and suggestions
- Chatbot for common questions

### Phase 4: Client Dashboard
- User authentication (login/signup)
- Case tracking dashboard
- Document management
- Communication with attorney
- Appointment booking

### Phase 5: Admin Panel
- Submission management
- Client communication
- Document generation tools
- Analytics and reporting
- Team management

### Phase 6: Advanced Features
- Multi-language support (English, Russian, Arabic)
- Video consultation integration (Zoom API)
- Advanced analytics (funnel tracking)
- A/B testing framework
- Live chat support
- Email automation (transactional emails)
- SMS notifications
- Calendar integration
- E-signature via SMS
- Payment plans / installments

---

## Notes

- Each prompt builds on the previous one
- Test thoroughly after each prompt before proceeding
- Commit code frequently with descriptive messages
- Update documentation as you build
- Keep design consistent with Framer reference
- Prioritize accessibility and performance
- Think "platform" not just "divorce module"

---

**Last Updated**: October 2024
