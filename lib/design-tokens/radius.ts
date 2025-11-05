/**
 * Design Tokens: Border Radius
 *
 * Centralized border radius system for consistent rounded corners.
 */

export const radius = {
  // Base Scale
  none: '0',
  xs: '2px',
  sm: '4px',
  DEFAULT: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  '3xl': '48px',
  full: '9999px',

  // Semantic Radius (component-specific)
  semantic: {
    button: '6px',
    card: '12px',
    badge: '2px',
    input: '6px',
    image: '12px',
    modal: '16px',
    pill: '9999px',
    circle: '50%',
  },
} as const;

// Type helpers
export type RadiusToken = typeof radius;
export type BaseRadius = Exclude<keyof typeof radius, 'semantic'>;
export type SemanticRadius = keyof typeof radius.semantic;
