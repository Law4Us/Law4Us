/**
 * Design Tokens: Typography
 *
 * Centralized typography system including font families, sizes, weights,
 * line heights, and letter spacing optimized for Hebrew text.
 */

export const typography = {
  // Font Families
  fontFamily: {
    primary: 'var(--font-assistant), Arial, sans-serif',
    system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  // Font Sizes with Line Heights and Letter Spacing
  fontSize: {
    // Display Text (Hero sections)
    'display-xl': {
      size: '80px',
      lineHeight: '100%',
      letterSpacing: '-0.04em',
      fontWeight: 700,
    },
    'display-lg': {
      size: '48px',
      lineHeight: '100%',
      letterSpacing: '-0.04em',
      fontWeight: 700,
    },
    display: {
      size: '40px',
      lineHeight: '110%',
      letterSpacing: '-0.02em',
      fontWeight: 700,
    },

    // Headings
    h1: {
      size: '32px',
      lineHeight: '110%',
      letterSpacing: '-0.04em',
      fontWeight: 700,
    },
    h2: {
      size: '48px',
      lineHeight: '100%',
      letterSpacing: '-0.04em',
      fontWeight: 700,
    },
    h3: {
      size: '24px',
      lineHeight: '110%',
      letterSpacing: '-0.02em',
      fontWeight: 700,
    },
    h4: {
      size: '20px',
      lineHeight: '120%',
      letterSpacing: '-0.02em',
      fontWeight: 600,
    },

    // Body Text
    'body-xl': {
      size: '20px',
      lineHeight: '150%',
      letterSpacing: '0',
      fontWeight: 500,
    },
    'body-lg': {
      size: '18px',
      lineHeight: '150%',
      letterSpacing: '0',
      fontWeight: 500,
    },
    body: {
      size: '16px',
      lineHeight: '140%',
      letterSpacing: '0',
      fontWeight: 500,
    },
    'body-sm': {
      size: '14px',
      lineHeight: '140%',
      letterSpacing: '0',
      fontWeight: 500,
    },

    // Specialized Text
    eyebrow: {
      size: '16px',
      lineHeight: '100%',
      letterSpacing: '-0.02em',
      fontWeight: 600,
    },
    button: {
      size: '18px',
      lineHeight: '120%',
      letterSpacing: '0',
      fontWeight: 600,
    },
    'button-sm': {
      size: '16px',
      lineHeight: '120%',
      letterSpacing: '0',
      fontWeight: 600,
    },
    caption: {
      size: '14px',
      lineHeight: '120%',
      letterSpacing: '0',
      fontWeight: 500,
    },
    label: {
      size: '14px',
      lineHeight: '120%',
      letterSpacing: '0',
      fontWeight: 600,
    },

    // Hero Specific
    'hero-h1': {
      size: '80px',
      lineHeight: '100%',
      letterSpacing: '-0.04em',
      fontWeight: 700,
    },
    'hero-subtitle': {
      size: '24px',
      lineHeight: '130%',
      letterSpacing: '0',
      fontWeight: 500,
    },

    // Section Specific
    'section-title': {
      size: '48px',
      lineHeight: '100%',
      letterSpacing: '-0.04em',
      fontWeight: 700,
    },
    'section-subtitle': {
      size: '20px',
      lineHeight: '130%',
      letterSpacing: '0',
      fontWeight: 500,
    },
  },

  // Font Weights
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Line Heights (standalone)
  lineHeight: {
    none: '1',
    tight: '1.1',
    snug: '1.2',
    normal: '1.3',
    relaxed: '1.4',
    loose: '1.5',
    extraLoose: '1.6',
  },

  // Letter Spacing (standalone)
  letterSpacing: {
    tighter: '-0.04em',
    tight: '-0.02em',
    normal: '0',
    wide: '0.02em',
    wider: '0.04em',
  },
} as const;

// Type helpers
export type TypographyToken = typeof typography;
export type FontSize = keyof typeof typography.fontSize;
export type FontWeight = keyof typeof typography.fontWeight;
export type LineHeight = keyof typeof typography.lineHeight;
export type LetterSpacing = keyof typeof typography.letterSpacing;

// Utility function to get complete font style
export function getFontStyle(size: FontSize) {
  return typography.fontSize[size];
}
