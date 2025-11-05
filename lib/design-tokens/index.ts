/**
 * Design Tokens - Central Export
 *
 * Single source of truth for all design tokens in the Law4Us application.
 * Import from this file to access any design token throughout the app.
 *
 * @example
 * import { colors, spacing, typography } from '@/lib/design-tokens'
 *
 * const buttonStyle = {
 *   backgroundColor: colors.brand.primary.DEFAULT,
 *   padding: `${spacing[4]} ${spacing[8]}`,
 *   ...typography.fontSize.button,
 * }
 */

export * from './colors';
export * from './spacing';
export * from './typography';
export * from './shadows';
export * from './radius';
export * from './animations';

// Re-export for convenience
export { colors } from './colors';
export { spacing } from './spacing';
export { typography, getFontStyle } from './typography';
export { shadows } from './shadows';
export { radius } from './radius';
export { animations, createTransition, prefersReducedMotion } from './animations';

// Component-level token compositions
// These combine multiple token types for common patterns
export const componentTokens = {
  // Button variants
  button: {
    primary: {
      backgroundColor: '#019FB7',
      borderColor: '#018DA2',
      borderWidth: '0.5px',
      borderRadius: '6px',
      color: '#FFFFFF',
      paddingX: '2rem',
      paddingY: '1rem',
      fontSize: '18px',
      fontWeight: 600,
      lineHeight: '120%',
      letterSpacing: '0',
      transition: 'background-color 300ms ease-in-out, transform 150ms ease-in-out',
      shadow: 'none',
      hover: {
        backgroundColor: '#018DA2',
        transform: 'translateY(-1px)',
      },
      active: {
        transform: 'scale(0.98)',
      },
    },
    secondary: {
      backgroundColor: '#EEF2F3',
      borderColor: '#018DA2',
      borderWidth: '0.5px',
      borderRadius: '6px',
      color: '#0C1719',
      paddingX: '2rem',
      paddingY: '1rem',
      fontSize: '18px',
      fontWeight: 600,
      lineHeight: '120%',
      letterSpacing: '0',
      transition: 'all 300ms ease-in-out',
      shadow: '0 0 0 4px rgba(1, 159, 183, 0.2)',
      hover: {
        backgroundColor: '#E3E6E8',
      },
      active: {
        transform: 'scale(0.98)',
      },
    },
  },

  // Card variants
  card: {
    default: {
      backgroundColor: '#F9FAFB',
      borderRadius: '12px',
      padding: '1.5rem',
      shadow: 'inset 0 1px 5px -5px rgba(19, 22, 22, 0.7), 0 0 0 1px rgba(34, 50, 53, 0.078), 0 4px 8px 0 rgba(34, 50, 53, 0.05)',
    },
  },

  // Eyebrow (section labels)
  eyebrow: {
    color: '#019FB7',
    fontSize: '16px',
    fontWeight: 600,
    lineHeight: '100%',
    letterSpacing: '-0.02em',
    textTransform: 'none' as const,
  },

  // Icon circle
  iconCircle: {
    width: '48px',
    height: '48px',
    backgroundColor: '#F9FAFB',
    borderRadius: '100px',
    boxShadow: 'rgba(12, 23, 25, 0.2) 0px 1px 2px 1px, rgba(1, 159, 183, 0.1) 0px 0px 0px 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section header pattern
  sectionHeader: {
    eyebrow: {
      color: '#019FB7',
      fontSize: '16px',
      fontWeight: 600,
      lineHeight: '100%',
      letterSpacing: '-0.02em',
      marginBottom: '0.75rem',
    },
    heading: {
      color: '#0C1719',
      fontSize: '48px',
      fontWeight: 700,
      lineHeight: '100%',
      letterSpacing: '-0.04em',
      marginBottom: '1rem',
    },
    subtitle: {
      color: '#515F61',
      fontSize: '20px',
      fontWeight: 500,
      lineHeight: '130%',
      letterSpacing: '0',
    },
  },
} as const;
