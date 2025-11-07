/**
 * Component-level style compositions for the Law4Us application
 * Built on top of design tokens for consistency
 *
 * This file provides pre-composed styles for common component patterns.
 * All values reference the base design tokens for true single source of truth.
 */

import { CSSProperties } from 'react';
import { colors } from '@/lib/design-tokens/colors';
import { typography } from '@/lib/design-tokens/typography';
import { radius } from '@/lib/design-tokens/radius';

// ============================================================================
// TYPOGRAPHY COMPOSITIONS
// ============================================================================

export const TYPOGRAPHY = {
  // Hero Text
  heroH1: {
    fontSize: typography.fontSize['hero-h1'].size,
    fontWeight: typography.fontSize['hero-h1'].fontWeight as CSSProperties['fontWeight'],
    lineHeight: typography.fontSize['hero-h1'].lineHeight,
    letterSpacing: typography.fontSize['hero-h1'].letterSpacing,
    color: colors.semantic.text.primary,
  },
  heroSubtitle: {
    fontSize: typography.fontSize['hero-subtitle'].size,
    fontWeight: typography.fontSize['hero-subtitle'].fontWeight,
    lineHeight: typography.fontSize['hero-subtitle'].lineHeight,
    letterSpacing: typography.fontSize['hero-subtitle'].letterSpacing,
    color: colors.semantic.text.primary,
  },

  // Section Headers
  eyebrow: {
    fontSize: typography.fontSize.eyebrow.size,
    fontWeight: typography.fontSize.eyebrow.fontWeight,
    lineHeight: typography.fontSize.eyebrow.lineHeight,
    letterSpacing: typography.fontSize.eyebrow.letterSpacing,
    color: colors.semantic.text.brand,
  },
  h2: {
    fontSize: typography.fontSize['section-title'].size,
    fontWeight: typography.fontSize['section-title'].fontWeight as CSSProperties['fontWeight'],
    lineHeight: typography.fontSize['section-title'].lineHeight,
    letterSpacing: typography.fontSize['section-title'].letterSpacing,
    color: colors.semantic.text.primary,
    maxWidth: '500px',
    margin: '0 auto 24px',
  },
  h3: {
    fontSize: typography.fontSize.h3.size,
    fontWeight: typography.fontWeight.medium,
    letterSpacing: typography.fontSize.h3.letterSpacing,
    lineHeight: '1.1em',
    color: colors.semantic.text.primary,
    textAlign: 'right' as const,
    margin: 0,
    width: '100%',
  },
  h3Large: {
    fontSize: '32px',
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.tight,
    lineHeight: '1.3em',
    color: colors.semantic.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSize['section-subtitle'].size,
    fontWeight: typography.fontSize['section-subtitle'].fontWeight,
    lineHeight: typography.fontSize['section-subtitle'].lineHeight,
    letterSpacing: typography.fontSize['section-subtitle'].letterSpacing,
    color: colors.semantic.text.secondary,
    maxWidth: '450px',
    margin: '0 auto',
  },
  subtitleAlt: {
    fontSize: '20px',
    fontWeight: typography.fontWeight.medium,
    lineHeight: '140%',
    letterSpacing: typography.letterSpacing.tight,
    color: colors.semantic.text.primary,
  },

  // Body Text
  bodyLarge: {
    fontSize: typography.fontSize['body-lg'].size,
    fontWeight: typography.fontSize['body-lg'].fontWeight,
    lineHeight: '1.5em',
    color: colors.semantic.text.secondary,
    textAlign: 'right' as const,
    margin: '0',
    width: '100%',
  },
  bodyMedium: {
    fontSize: typography.fontSize['body-lg'].size,
    fontWeight: typography.fontSize['body-lg'].fontWeight,
    lineHeight: '1.5',
    color: colors.semantic.text.primary,
  },
  bodyMediumBold: {
    fontSize: typography.fontSize['body-lg'].size,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: '1.5',
    color: colors.semantic.text.primary,
  },

  // Specialized Text
  bannerText: {
    fontSize: typography.fontSize.body.size,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.fontSize.body.lineHeight,
    letterSpacing: typography.letterSpacing.tight,
    color: colors.semantic.text.primary,
  },
  navLink: {
    fontSize: typography.fontSize.body.size,
    fontWeight: typography.fontWeight.bold as CSSProperties['fontWeight'],
    lineHeight: typography.fontSize.body.lineHeight,
    letterSpacing: typography.letterSpacing.tight,
    color: colors.semantic.text.primary,
  },
  testimonialName: {
    fontSize: typography.fontSize.body.size,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: 1,
    color: colors.semantic.text.primary,
  },
  testimonialTitle: {
    fontSize: typography.fontSize['body-sm'].size,
    fontWeight: typography.fontWeight.medium,
    lineHeight: 1,
    color: colors.semantic.text.secondary,
  },
} as const;

// ============================================================================
// CTA BUTTON STYLES
// ============================================================================

export const CTA_STYLES = {
  main: {
    backgroundColor: colors.brand.primary.DEFAULT,
    border: `0.5px solid ${colors.brand.primary.dark}`,
    borderRadius: radius.semantic.button,
    color: colors.neutral.white,
    paddingLeft: '32px',
    paddingRight: '32px',
    paddingTop: '16px',
    paddingBottom: '16px',
    fontSize: typography.fontSize.button.size,
    fontWeight: typography.fontSize.button.fontWeight,
    lineHeight: typography.fontSize.button.lineHeight,
    letterSpacing: typography.fontSize.button.letterSpacing,
  },
  secondary: {
    backgroundColor: colors.neutral[200],
    border: `0.5px solid ${colors.brand.primary.dark}`,
    borderRadius: radius.semantic.button,
    color: colors.semantic.text.primary,
    paddingLeft: '32px',
    paddingRight: '32px',
    paddingTop: '16px',
    paddingBottom: '16px',
    fontSize: typography.fontSize.button.size,
    fontWeight: typography.fontSize.button.fontWeight,
    lineHeight: typography.fontSize.button.lineHeight,
    letterSpacing: typography.fontSize.button.letterSpacing,
    boxShadow: `0 0 0 4px ${colors.opacity.overlay.brand[20]}`,
  },
  nav: {
    backgroundColor: colors.brand.primary.DEFAULT,
    border: `0.5px solid ${colors.brand.primary.dark}`,
    borderRadius: radius.sm,
    color: colors.neutral.white,
    paddingLeft: '16px',
    paddingRight: '16px',
    paddingTop: '12px',
    paddingBottom: '12px',
    fontSize: typography.fontSize['button-sm'].size,
    fontWeight: typography.fontSize['button-sm'].fontWeight,
    lineHeight: typography.fontSize['button-sm'].lineHeight,
    letterSpacing: typography.fontSize['button-sm'].letterSpacing,
  },
} as const satisfies Record<string, CSSProperties>;

// ============================================================================
// BANNER/BADGE STYLES
// ============================================================================

export const BANNER_STYLES = {
  box: {
    backgroundColor: colors.neutral.white,
    border: `1px solid ${colors.opacity.overlay.black[10]}`,
    borderRadius: radius.xs,
    paddingLeft: '12px',
    paddingRight: '12px',
    paddingTop: '8px',
    paddingBottom: '8px',
  },
} as const;

// ============================================================================
// STEP BOX STYLES
// ============================================================================

export const STEP_BOX_STYLES = {
  container: {
    paddingTop: '24px',
    backgroundColor: colors.neutral[100],
    borderRadius: radius.lg,
    gap: '24px',
    boxShadow: `inset 0 1px 5px -5px ${colors.opacity.shadow.dark}, 0 0 0 1px ${colors.opacity.shadow.medium}, 0 4px 8px ${colors.opacity.shadow.light}`,
    display: 'flex',
    flexDirection: 'column' as const,
  },
  numberBadge: {
    backgroundColor: colors.neutral[300],
    borderRadius: radius.full,
    width: '38px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    color: colors.semantic.text.primary,
    fontSize: typography.fontSize['body-sm'].size,
  },
  contentArea: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
  },
  headerSection: {
    paddingLeft: '24px',
    paddingRight: '24px',
    gap: '8px',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  imageAreaStep1: {
    borderRadius: `0 0 ${radius.lg} ${radius.lg}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingTop: '0',
    paddingBottom: '0',
    paddingRight: '48px',
    paddingLeft: '0',
  },
  imageAreaStep2: {
    borderRadius: `0 0 ${radius.lg} ${radius.lg}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingTop: '0',
    paddingBottom: '0',
    paddingRight: '24px',
    paddingLeft: '24px',
  },
  imageAreaStep3: {
    borderRadius: `0 0 ${radius.lg} ${radius.lg}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingTop: '0',
    paddingBottom: '0',
    paddingRight: '24px',
    paddingLeft: '24px',
  },
  textArea: {
    marginTop: '24px',
    backgroundColor: colors.neutral[200],
    borderRadius: radius.lg,
    padding: '16px',
    paddingLeft: '24px',
    paddingRight: '24px',
  },
} as const;

// ============================================================================
// CARD STYLES
// ============================================================================

export const CARD_STYLES = {
  container: {
    backgroundColor: colors.neutral[100],
    borderRadius: radius.semantic.card,
    boxShadow: `inset 0 1px 5px -5px ${colors.opacity.shadow.dark}, 0 0 0 1px ${colors.opacity.shadow.medium}, 0 4px 8px ${colors.opacity.shadow.light}`,
    padding: '24px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'start',
    gap: '24px',
  },
  iconCircle: {
    width: '48px',
    height: '48px',
    backgroundColor: colors.neutral[100],
    borderRadius: radius.full,
    boxShadow: `${colors.opacity.overlay.black[20]} 0px 1px 2px 1px, ${colors.opacity.overlay.brand[10]} 0px 0px 0px 8px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'start',
    gap: '8px',
  },
} as const;

// Backward compatibility alias (deprecated - use CARD_STYLES instead)
export const BENEFIT_CARD_STYLES = CARD_STYLES;

// ============================================================================
// COLOR PALETTE (Re-export for convenience)
// ============================================================================

export const COLORS = {
  primary: {
    main: colors.brand.primary.DEFAULT,
    dark: colors.brand.primary.dark,
    light: colors.brand.primary.light,
  },
  neutral: {
    black: colors.neutral.black,
    darkGray: colors.neutral[700],
    mediumGray: colors.neutral[300],
    lightGray: colors.neutral[200],
    lightestGray: colors.neutral[100],
  },
} as const;
