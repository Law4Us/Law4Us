# Tailwind Class Migration Guide

Quick reference for updating old neutral color classes to the new design token system.

## Color Class Mapping

### Old → New

| Old Class | New Class | Color Value | Usage |
|-----------|-----------|-------------|--------|
| `neutral-darkest` | `neutral-900` | `#0C1719` | Primary text, dark backgrounds |
| `neutral-dark` | `neutral-700` | `#515F61` | Secondary text, muted elements |
| `neutral` (DEFAULT) | `neutral-300` | `#E3E6E8` | Borders, dividers |
| `neutral-light` | `neutral-200` | `#EEF2F3` | Light backgrounds, sections |
| `neutral-lightest` | `neutral-100` | `#F9FAFB` | Card backgrounds, inputs |

## Common Replacements

### Text Colors
```diff
- text-neutral-darkest
+ text-neutral-900

- text-neutral-dark
+ text-neutral-700
```

### Backgrounds
```diff
- bg-neutral-darkest
+ bg-neutral-900

- bg-neutral-light
+ bg-neutral-200

- bg-neutral-lightest
+ bg-neutral-100
```

### Borders
```diff
- border-neutral
+ border-neutral-300

- border-neutral-dark
+ border-neutral-700

- hover:border-neutral-dark
+ hover:border-neutral-700
```

## Files Already Updated

✅ Fixed files:
- `components/layout/footer.tsx`
- `components/ui/button.tsx`
- `components/ui/label.tsx`
- `components/ui/form-field.tsx`
- `components/ui/file-upload.tsx`
- `components/ui/loading.tsx`
- `components/ui/select.tsx`
- `components/ui/textarea.tsx`
- `components/ui/input.tsx`
- `app/globals.css`

## Files That May Need Updates

The following files still use old class names and should be updated when you work on them:

- `components/blog/blog-listing.tsx`
- `components/error-boundary.tsx`
- `components/ui/skeleton.tsx`
- `components/wizard/*` (various wizard components)

## Search & Replace

You can use these regex patterns in your IDE:

```regex
Find: neutral-darkest
Replace: neutral-900

Find: neutral-dark
Replace: neutral-700

Find: neutral-light
Replace: neutral-200

Find: neutral-lightest
Replace: neutral-100

Find: border-neutral(?!\-)
Replace: border-neutral-300
```

## Why The Change?

The new token system:
- ✅ Provides a consistent 100-900 scale
- ✅ Matches industry standards (like Material Design, Tailwind v3+)
- ✅ More intuitive (higher numbers = darker)
- ✅ Easier to extend with new shades
- ✅ Type-safe with autocomplete

## Quick Reference

### All Neutral Colors Available

```tsx
neutral-black   // #0C1719 (alias for 900)
neutral-900     // #0C1719 (darkest)
neutral-800     // #19282A
neutral-700     // #515F61 (dark)
neutral-600     // #8A9294
neutral-500     // #C7CFD1
neutral-400     // #D5DBDC
neutral-300     // #E3E6E8 (default/borders)
neutral-200     // #EEF2F3 (light)
neutral-100     // #F9FAFB (lightest)
neutral-50      // #FCFCFD
neutral-white   // #FFFFFF (alias)
```

---

**Status:** Core UI components updated
**Date:** November 2025
