/**
 * Design Tokens: Shadows
 *
 * Centralized shadow system for elevation and depth.
 * All shadow values extracted from the homepage design.
 */

export const shadows = {
  // Card Shadow (most common)
  card: 'inset 0 1px 5px -5px rgba(19, 22, 22, 0.7), 0 0 0 1px rgba(34, 50, 53, 0.078), 0 4px 8px 0 rgba(34, 50, 53, 0.05)',

  // Icon Circle Shadow
  iconCircle: 'rgba(12, 23, 25, 0.2) 0px 1px 2px 1px, rgba(1, 159, 183, 0.1) 0px 0px 0px 8px',

  // Button Shadows
  button: {
    primary: 'none',
    secondary: '0 0 0 4px rgba(1, 159, 183, 0.2)',
    hover: '0 2px 8px rgba(12, 23, 25, 0.15)',
  },

  // Video Container Shadow
  video: '0 10px 20px 5px rgba(12, 23, 25, 0.05), 0 0 0 6px rgba(213, 219, 220, 0.25), 0 0 0 12px rgba(213, 219, 220, 0.25)',

  // Input Shadows
  input: {
    DEFAULT: '0 0 0 1px #E3E6E8',
    focus: '0 0 0 2px #019FB7',
    error: '0 0 0 2px #EF4444',
  },

  // Elevation System (for various UI elements)
  elevation: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(12, 23, 25, 0.05)',
    md: '0 4px 6px -1px rgba(12, 23, 25, 0.1), 0 2px 4px -1px rgba(12, 23, 25, 0.06)',
    lg: '0 10px 15px -3px rgba(12, 23, 25, 0.1), 0 4px 6px -2px rgba(12, 23, 25, 0.05)',
    xl: '0 20px 25px -5px rgba(12, 23, 25, 0.1), 0 10px 10px -5px rgba(12, 23, 25, 0.04)',
    '2xl': '0 25px 50px -12px rgba(12, 23, 25, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(12, 23, 25, 0.06)',
  },

  // Inset Shadow (for pressed states, inputs)
  inset: {
    sm: 'inset 0 1px 2px 0 rgba(12, 23, 25, 0.05)',
    md: 'inset 0 2px 4px 0 rgba(12, 23, 25, 0.06)',
    lg: 'inset 0 1px 5px -5px rgba(19, 22, 22, 0.7)',
  },

  // Glow Effects (for brand elements)
  glow: {
    brand: {
      sm: '0 0 0 2px rgba(1, 159, 183, 0.1)',
      md: '0 0 0 4px rgba(1, 159, 183, 0.2)',
      lg: '0 0 0 8px rgba(1, 159, 183, 0.1)',
    },
  },
} as const;

// Type helpers
export type ShadowToken = typeof shadows;
export type CardShadow = typeof shadows.card;
export type ButtonShadow = keyof typeof shadows.button;
export type ElevationLevel = keyof typeof shadows.elevation;
