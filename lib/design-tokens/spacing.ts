/**
 * Design Tokens: Spacing
 *
 * Centralized spacing system based on 4px base unit.
 * Includes both base scale and semantic spacing patterns.
 */

export const spacing = {
  // Base Scale (4px unit)
  0: '0',
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  7: '1.75rem', // 28px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  14: '3.5rem', // 56px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  28: '7rem', // 112px
  32: '8rem', // 128px

  // Semantic Spacing Patterns
  semantic: {
    // Section spacing
    section: {
      padding: {
        y: {
          mobile: '3rem', // 48px
          tablet: '4rem', // 64px
          desktop: '5rem', // 80px
        },
        x: {
          mobile: '1.5rem', // 24px
          tablet: '2rem', // 32px
          desktop: '1.5rem', // 24px (constrained by max-width)
        },
      },
      gap: {
        small: '1rem', // 16px - between items in a group
        medium: '1.5rem', // 24px - between sub-sections
        large: '3rem', // 48px - between major sections
        xlarge: '4rem', // 64px - section spacing
      },
      margin: {
        bottom: {
          small: '2rem', // 32px
          medium: '3rem', // 48px
          large: '4rem', // 64px
        },
      },
    },

    // Button spacing
    button: {
      padding: {
        x: {
          small: '1rem', // 16px
          medium: '1.5rem', // 24px
          large: '2rem', // 32px
        },
        y: {
          small: '0.5rem', // 8px
          medium: '0.75rem', // 12px
          large: '1rem', // 16px
        },
      },
      gap: '0.5rem', // 8px - between icon and text
    },

    // Card spacing
    card: {
      padding: {
        small: '1rem', // 16px
        medium: '1.5rem', // 24px
        large: '2rem', // 32px
      },
      gap: {
        small: '0.75rem', // 12px
        medium: '1rem', // 16px
        large: '1.5rem', // 24px
      },
    },

    // Form spacing
    form: {
      field: {
        gap: '0.5rem', // 8px - label to input
      },
      group: {
        gap: '1rem', // 16px - between form fields
      },
    },

    // Icon spacing
    icon: {
      circle: {
        padding: '0.75rem', // 12px
        size: {
          small: '2rem', // 32px
          medium: '3rem', // 48px
          large: '4rem', // 64px
        },
      },
      gap: '0.5rem', // 8px - icon to text
    },

    // Container spacing
    container: {
      maxWidth: '75rem', // 1200px
      padding: {
        mobile: '1.5rem', // 24px
        desktop: '1.5rem', // 24px
      },
    },
  },
} as const;

// Type helpers
export type SpacingToken = typeof spacing;
export type BaseSpacing = keyof Omit<typeof spacing, 'semantic'>;
export type SemanticSpacing = typeof spacing.semantic;
