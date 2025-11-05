/**
 * Design Tokens: Colors
 *
 * Centralized color system for the Law4Us application.
 * Based on analysis of homepage design patterns.
 */

export const colors = {
  // Brand Colors
  brand: {
    primary: {
      DEFAULT: '#019FB7',
      dark: '#018DA2',
      light: '#B8D7DD',
      lighter: '#5AB9C9',
      lightest: '#A8D5DE',
      accent: '#9FD7E0',
    },
  },

  // Neutral Scale
  neutral: {
    black: '#0C1719',
    900: '#0C1719',
    800: '#19282A',
    700: '#515F61',
    600: '#8A9294',
    500: '#C7CFD1',
    400: '#D5DBDC',
    300: '#E3E6E8',
    200: '#EEF2F3',
    100: '#F9FAFB',
    50: '#FCFCFD',
    white: '#FFFFFF',
  },

  // Semantic Colors
  semantic: {
    text: {
      primary: '#0C1719',
      secondary: '#515F61',
      tertiary: '#C7CFD1',
      inverse: '#FFFFFF',
      brand: '#019FB7',
    },
    background: {
      primary: '#FFFFFF',
      secondary: '#EEF2F3',
      tertiary: '#F9FAFB',
      brand: '#019FB7',
      gradient: {
        start: '#5AB9C9',
        end: '#A8D5DE',
      },
    },
    border: {
      light: 'rgba(12, 23, 25, 0.1)',
      DEFAULT: '#C7CFD1',
      dark: '#018DA2',
      brand: '#019FB7',
    },
  },

  // Opacity Tokens (for overlays and shadows)
  opacity: {
    overlay: {
      white: {
        90: 'rgba(255, 255, 255, 0.9)',
        50: 'rgba(255, 255, 255, 0.5)',
        30: 'rgba(255, 255, 255, 0.3)',
        10: 'rgba(255, 255, 255, 0.1)',
      },
      black: {
        70: 'rgba(12, 23, 25, 0.7)',
        50: 'rgba(12, 23, 25, 0.5)',
        20: 'rgba(12, 23, 25, 0.2)',
        10: 'rgba(12, 23, 25, 0.1)',
        5: 'rgba(12, 23, 25, 0.05)',
      },
      brand: {
        40: 'rgba(1, 159, 183, 0.4)',
        20: 'rgba(1, 159, 183, 0.2)',
        10: 'rgba(1, 159, 183, 0.1)',
      },
    },
    shadow: {
      dark: 'rgba(19, 22, 22, 0.7)',
      medium: 'rgba(34, 50, 53, 0.078)',
      light: 'rgba(34, 50, 53, 0.05)',
      border: 'rgba(213, 219, 220, 0.25)',
    },
  },
} as const;

// Type helpers for type-safe color access
export type ColorToken = typeof colors;
export type BrandColor = keyof typeof colors.brand.primary;
export type NeutralColor = keyof typeof colors.neutral;
export type SemanticTextColor = keyof typeof colors.semantic.text;
export type SemanticBackgroundColor = keyof typeof colors.semantic.background;
