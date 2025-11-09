# Law4Us Design System

This document describes the global design tokens and component library created for the Law4Us application.

## Overview

We've created a comprehensive design system that:
- ✅ Extracts all design values into reusable tokens
- ✅ Provides a consistent, type-safe API
- ✅ Integrates seamlessly with Tailwind CSS
- ✅ Includes atomic and molecule components
- ✅ Supports accessibility best practices
- ✅ Optimizes for performance

## Design Tokens

All design tokens are located in `/lib/design-tokens/` and can be imported from a single source:

```typescript
import { colors, spacing, typography, shadows, radius, animations } from '@/lib/design-tokens';
```

### Colors (`colors.ts`)

Complete color system with:
- **Brand colors**: Primary brand palette with variations
- **Neutral scale**: 50-900 grayscale
- **Semantic colors**: Text, background, and border colors with meaningful names
- **Opacity tokens**: Pre-defined opacity values for overlays and shadows

```typescript
// Examples
colors.brand.primary.DEFAULT // '#019FB7'
colors.neutral[700] // '#515F61'
colors.semantic.text.primary // '#0C1719'
```

### Spacing (`spacing.ts`)

8-point grid system with semantic patterns:
- **Base scale**: 0-32 with consistent increments
- **Semantic spacing**: Section, button, card, form, icon, and container patterns

```typescript
// Examples
spacing[4] // '1rem' (16px)
spacing.semantic.button.padding.x.large // '2rem' (32px)
spacing.semantic.section.gap.large // '3rem' (48px)
```

### Typography (`typography.ts`)

Complete typography system optimized for Hebrew text:
- **Font families**: Primary (Assistant) and system fallbacks
- **Font sizes**: Display, headings, body, and specialized text
- **Font weights**: Regular, medium, semibold, bold
- **Line heights & letter spacing**: Optimized for readability

```typescript
// Examples
typography.fontSize['hero-h1'] // { size: '80px', lineHeight: '100%', ... }
typography.fontWeight.semibold // 600
```

### Shadows (`shadows.ts`)

Shadow system for elevation and depth:
- **Card shadows**: Standard card elevation
- **Button shadows**: Primary, secondary, hover states
- **Icon circles**: Decorative icon containers
- **Elevation system**: 6-level elevation scale
- **Glow effects**: Brand-colored glows

```typescript
// Examples
shadows.card // Multi-layer shadow for cards
shadows.button.secondary // '0 0 0 4px rgba(1, 159, 183, 0.2)'
shadows.elevation.md // Standard elevation shadow
```

### Border Radius (`radius.ts`)

Consistent rounded corners:
- **Base scale**: xs, sm, md, lg, xl, 2xl, 3xl, full
- **Semantic values**: Button, card, badge, input, image, modal

```typescript
// Examples
radius.DEFAULT // '6px'
radius.semantic.card // '12px'
radius.semantic.pill // '9999px'
```

### Animations (`animations.ts`)

Motion system with accessibility support:
- **Durations**: Fast, normal, slow, slower, slowest
- **Easing functions**: Linear, in, out, inOut, smooth, bounce
- **Transitions**: Colors, opacity, transform, hover, focus
- **Keyframes**: Fade, slide, scale, pulse, bounce, scroll
- **Presets**: Ready-to-use animation strings

```typescript
// Examples
animations.duration.normal // '300ms'
animations.easing.smooth // 'cubic-bezier(0.4, 0, 0.2, 1)'
animations.transitions.colors // 'color 300ms ease-in-out, background-color...'
animations.keyframes.fadeIn // { '0%': { opacity: '0' }, '100%': { opacity: '1' } }
```

## Component Library

### Atomic Components (`components/atoms/`)

Basic building blocks that can be composed into larger components.

#### Button
```tsx
import { Button } from '@/components/atoms';

<Button variant="primary" size="medium">לחץ כאן</Button>
<Button variant="secondary" loading>טוען...</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'ghost'
- `size`: 'small' | 'medium' | 'large'
- `fullWidth`: boolean
- `loading`: boolean

#### Badge / Eyebrow
```tsx
import { Badge, Eyebrow } from '@/components/atoms';

<Eyebrow>התהליך שלנו</Eyebrow>
<Badge variant="pill">חדש</Badge>
```

**Props:**
- `variant`: 'eyebrow' | 'pill' | 'dot'

#### IconCircle
```tsx
import { IconCircle } from '@/components/atoms';

<IconCircle size="medium">
  <svg>...</svg>
</IconCircle>
```

**Props:**
- `size`: 'small' | 'medium' | 'large'

#### Card
```tsx
import { Card } from '@/components/atoms';

<Card padding="medium" shadow>
  <h3>כותרת</h3>
  <p>תוכן הכרטיס</p>
</Card>
```

**Props:**
- `padding`: 'none' | 'small' | 'medium' | 'large'
- `shadow`: boolean

#### Heading
```tsx
import { Heading } from '@/components/atoms';

<Heading as="h1" variant="hero-h1">כותרת ראשית</Heading>
<Heading as="h2" variant="section-title">כותרת מקטע</Heading>
```

**Props:**
- `as`: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
- `variant`: 'display-xl' | 'display-lg' | 'h1' | 'h2' | 'h3' | 'h4' | 'hero-h1' | 'section-title'

#### BodyText / Subtitle
```tsx
import { BodyText, Subtitle } from '@/components/atoms';

<BodyText variant="body-lg" color="primary">טקסט גדול</BodyText>
<Subtitle>כתובית למקטע</Subtitle>
```

**Props:**
- `variant`: 'body-xl' | 'body-lg' | 'body' | 'body-sm' | 'caption'
- `color`: 'primary' | 'secondary' | 'tertiary' | 'brand'
- `as`: 'p' | 'span' | 'div'

#### Section
```tsx
import { Section } from '@/components/atoms';

<Section background="secondary" container>
  {/* תוכן המקטע */}
</Section>
```

**Props:**
- `background`: 'primary' | 'secondary' | 'tertiary' | 'white'
- `container`: boolean (adds max-width and padding)

### Molecule Components (`components/molecules/`)

Combinations of atomic components that form common UI patterns.

#### SectionHeader
```tsx
import { SectionHeader } from '@/components/molecules';

<SectionHeader
  eyebrow="התהליך שלנו"
  title="איך זה עובד?"
  subtitle="תהליך פשוט ומהיר לקבלת פיצוי"
  align="center"
/>
```

**Props:**
- `eyebrow`: string (optional)
- `title`: string (required)
- `subtitle`: string (optional)
- `align`: 'left' | 'center' | 'right'

## Tailwind Configuration

The Tailwind config (`tailwind.config.ts`) has been updated to consume all design tokens:

```typescript
// You can now use tokens directly in className
<div className="bg-primary text-neutral-100 p-4 rounded-card shadow-card">
  <p className="text-body-lg">מלל לדוגמה</p>
</div>

// Available Tailwind utilities from tokens:
// - Colors: text-primary, bg-neutral-200, border-primary-dark
// - Spacing: p-4, m-8, gap-6
// - Typography: text-hero-h1, text-body-lg, text-eyebrow
// - Radius: rounded-card, rounded-button, rounded-badge
// - Shadows: shadow-card, shadow-btn-secondary, shadow-icon-circle
// - Animations: animate-fade-in, animate-slide-up, animate-pulse
```

## Global Styles

Updated `globals.css` with:

### Reduced Motion Support
Respects user's motion preferences for accessibility:
```css
@media (prefers-reduced-motion: reduce) {
  /* All animations become instant */
}
```

### Performance Utilities
```css
.contain-layout /* CSS containment for layout */
.contain-paint /* CSS containment for paint */
.contain-strict /* Full containment for better performance */
.will-change-transform /* Hint for transform animations */
.will-change-opacity /* Hint for opacity animations */
```

## Usage Examples

### Building a New Section

```tsx
import { Section } from '@/components/atoms';
import { SectionHeader } from '@/components/molecules';
import { Button, Card, IconCircle } from '@/components/atoms';

export function FeaturesSection() {
  return (
    <Section background="secondary">
      <SectionHeader
        eyebrow="היתרונות שלנו"
        title="למה לבחור בנו?"
        subtitle="הסיבות שאלפי לקוחות בוחרים בנו"
        align="center"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <Card>
          <IconCircle>
            <svg>...</svg>
          </IconCircle>
          <h3 className="text-h3 mt-4">תהליך מהיר</h3>
          <p className="text-body-lg text-neutral-700 mt-2">
            קבלת פיצוי תוך 24 שעות
          </p>
        </Card>
        {/* More cards... */}
      </div>

      <div className="flex justify-center mt-12">
        <Button variant="primary" size="large">
          התחל עכשיו
        </Button>
      </div>
    </Section>
  );
}
```

### Using Design Tokens in Custom Components

```tsx
import { colors, spacing, typography } from '@/lib/design-tokens';

export function CustomComponent() {
  return (
    <div
      style={{
        backgroundColor: colors.brand.primary.DEFAULT,
        padding: `${spacing[4]} ${spacing[8]}`,
        fontSize: typography.fontSize.button.size,
        fontWeight: typography.fontSize.button.fontWeight,
        lineHeight: typography.fontSize.button.lineHeight,
        letterSpacing: typography.fontSize.button.letterSpacing,
      }}
    >
      Custom styled element
    </div>
  );
}
```

### Creating Variants with Tokens

```tsx
import { cn } from '@/lib/utils/cn';
import { componentTokens } from '@/lib/design-tokens';

const buttonStyles = {
  primary: 'bg-primary text-white border-primary-dark hover:bg-primary-dark',
  secondary: 'bg-neutral-200 text-neutral-900 border-primary-dark hover:bg-neutral-300',
};

export function MyButton({ variant = 'primary', children }) {
  return (
    <button className={cn('px-8 py-4 text-button rounded-button transition-all', buttonStyles[variant])}>
      {children}
    </button>
  );
}
```

## Benefits of This System

### 1. Consistency
- All colors, spacing, typography use the same values
- No more magic numbers or one-off styles
- Visual consistency across the entire application

### 2. Maintainability
- Change a color once, updates everywhere
- Easy to understand component structure
- Self-documenting code with TypeScript types

### 3. Performance
- Reduced CSS bundle size (reusable classes)
- CSS containment utilities for better rendering
- Optimized animations with will-change hints

### 4. Accessibility
- Automatic reduced-motion support
- Consistent touch targets (44px minimum)
- Proper focus-visible styles
- Semantic HTML structure

### 5. Developer Experience
- Autocomplete for all token values
- Type-safe props on all components
- Easy to extend and customize
- Clear documentation

### 6. Scalability
- Easy to add new components
- Tokens ready for use on other pages
- Component composition patterns
- Consistent API across the app

## Next Steps

To fully optimize the homepage, you can:

1. **Extract Homepage Data**: Move testimonials, FAQs, and other content to separate data files
2. **Create Section Components**: Build dedicated components for each homepage section
3. **Refactor Homepage**: Replace inline styles with the new components
4. **Optimize Images**: Convert to WebP, add proper loading strategies
5. **Add Performance Optimizations**: Implement React.memo, lazy loading
6. **Enhance Accessibility**: Add ARIA labels, keyboard navigation

## File Structure

```
Law4Us/
├── lib/
│   ├── design-tokens/
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   ├── typography.ts
│   │   ├── shadows.ts
│   │   ├── radius.ts
│   │   ├── animations.ts
│   │   └── index.ts
│   └── utils/
│       └── cn.ts
├── components/
│   ├── atoms/
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── IconCircle.tsx
│   │   ├── Card.tsx
│   │   ├── Heading.tsx
│   │   ├── BodyText.tsx
│   │   ├── Section.tsx
│   │   └── index.ts
│   └── molecules/
│       ├── SectionHeader.tsx
│       └── index.ts
├── app/
│   ├── globals.css
│   └── page.tsx
├── tailwind.config.ts
└── DESIGN_SYSTEM.md (this file)
```

## Support

For questions or issues with the design system, refer to:
- This documentation file
- Component source files (well-commented)
- Design token files (TypeScript types included)
- Tailwind config for available utility classes

---

**Version:** 1.0.0
**Last Updated:** November 2025
**Status:** ✅ Ready for use
