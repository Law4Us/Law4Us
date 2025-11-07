import type { Config } from "tailwindcss";
import { colors, spacing, typography, shadows, radius, animations } from "./lib/design-tokens";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors from design tokens
        brand: colors.brand,
        primary: colors.brand.primary,

        // Neutral colors
        neutral: colors.neutral,

        // Semantic colors for easier usage
        text: colors.semantic.text,
        bg: colors.semantic.background,
        border: colors.semantic.border,
      },
      fontFamily: {
        sans: [typography.fontFamily.primary],
        system: [typography.fontFamily.system],
      },
      fontSize: {
        // Display sizes
        "display-xl": [
          typography.fontSize["display-xl"].size,
          {
            lineHeight: typography.fontSize["display-xl"].lineHeight,
            letterSpacing: typography.fontSize["display-xl"].letterSpacing,
            fontWeight: typography.fontSize["display-xl"].fontWeight.toString(),
          },
        ],
        "display-lg": [
          typography.fontSize["display-lg"].size,
          {
            lineHeight: typography.fontSize["display-lg"].lineHeight,
            letterSpacing: typography.fontSize["display-lg"].letterSpacing,
            fontWeight: typography.fontSize["display-lg"].fontWeight.toString(),
          },
        ],
        display: [
          typography.fontSize.display.size,
          {
            lineHeight: typography.fontSize.display.lineHeight,
            letterSpacing: typography.fontSize.display.letterSpacing,
            fontWeight: typography.fontSize.display.fontWeight.toString(),
          },
        ],

        // Headings
        h1: [
          typography.fontSize.h1.size,
          {
            lineHeight: typography.fontSize.h1.lineHeight,
            letterSpacing: typography.fontSize.h1.letterSpacing,
            fontWeight: typography.fontSize.h1.fontWeight.toString(),
          },
        ],
        h2: [
          typography.fontSize.h2.size,
          {
            lineHeight: typography.fontSize.h2.lineHeight,
            letterSpacing: typography.fontSize.h2.letterSpacing,
            fontWeight: typography.fontSize.h2.fontWeight.toString(),
          },
        ],
        h3: [
          typography.fontSize.h3.size,
          {
            lineHeight: typography.fontSize.h3.lineHeight,
            letterSpacing: typography.fontSize.h3.letterSpacing,
            fontWeight: typography.fontSize.h3.fontWeight.toString(),
          },
        ],
        h4: [
          typography.fontSize.h4.size,
          {
            lineHeight: typography.fontSize.h4.lineHeight,
            letterSpacing: typography.fontSize.h4.letterSpacing,
            fontWeight: typography.fontSize.h4.fontWeight.toString(),
          },
        ],

        // Body text
        "body-xl": [
          typography.fontSize["body-xl"].size,
          {
            lineHeight: typography.fontSize["body-xl"].lineHeight,
            letterSpacing: typography.fontSize["body-xl"].letterSpacing,
            fontWeight: typography.fontSize["body-xl"].fontWeight.toString(),
          },
        ],
        "body-lg": [
          typography.fontSize["body-lg"].size,
          {
            lineHeight: typography.fontSize["body-lg"].lineHeight,
            letterSpacing: typography.fontSize["body-lg"].letterSpacing,
            fontWeight: typography.fontSize["body-lg"].fontWeight.toString(),
          },
        ],
        body: [
          typography.fontSize.body.size,
          {
            lineHeight: typography.fontSize.body.lineHeight,
            letterSpacing: typography.fontSize.body.letterSpacing,
            fontWeight: typography.fontSize.body.fontWeight.toString(),
          },
        ],
        "body-sm": [
          typography.fontSize["body-sm"].size,
          {
            lineHeight: typography.fontSize["body-sm"].lineHeight,
            letterSpacing: typography.fontSize["body-sm"].letterSpacing,
            fontWeight: typography.fontSize["body-sm"].fontWeight.toString(),
          },
        ],

        // Specialized text
        eyebrow: [
          typography.fontSize.eyebrow.size,
          {
            lineHeight: typography.fontSize.eyebrow.lineHeight,
            letterSpacing: typography.fontSize.eyebrow.letterSpacing,
            fontWeight: typography.fontSize.eyebrow.fontWeight.toString(),
          },
        ],
        button: [
          typography.fontSize.button.size,
          {
            lineHeight: typography.fontSize.button.lineHeight,
            letterSpacing: typography.fontSize.button.letterSpacing,
            fontWeight: typography.fontSize.button.fontWeight.toString(),
          },
        ],
        "button-sm": [
          typography.fontSize["button-sm"].size,
          {
            lineHeight: typography.fontSize["button-sm"].lineHeight,
            letterSpacing: typography.fontSize["button-sm"].letterSpacing,
            fontWeight: typography.fontSize["button-sm"].fontWeight.toString(),
          },
        ],
        caption: [
          typography.fontSize.caption.size,
          {
            lineHeight: typography.fontSize.caption.lineHeight,
            letterSpacing: typography.fontSize.caption.letterSpacing,
            fontWeight: typography.fontSize.caption.fontWeight.toString(),
          },
        ],
        label: [
          typography.fontSize.label.size,
          {
            lineHeight: typography.fontSize.label.lineHeight,
            letterSpacing: typography.fontSize.label.letterSpacing,
            fontWeight: typography.fontSize.label.fontWeight.toString(),
          },
        ],

        // Hero specific
        "hero-h1": [
          typography.fontSize["hero-h1"].size,
          {
            lineHeight: typography.fontSize["hero-h1"].lineHeight,
            letterSpacing: typography.fontSize["hero-h1"].letterSpacing,
            fontWeight: typography.fontSize["hero-h1"].fontWeight.toString(),
          },
        ],
        "hero-subtitle": [
          typography.fontSize["hero-subtitle"].size,
          {
            lineHeight: typography.fontSize["hero-subtitle"].lineHeight,
            letterSpacing: typography.fontSize["hero-subtitle"].letterSpacing,
            fontWeight: typography.fontSize["hero-subtitle"].fontWeight.toString(),
          },
        ],

        // Section specific
        "section-title": [
          typography.fontSize["section-title"].size,
          {
            lineHeight: typography.fontSize["section-title"].lineHeight,
            letterSpacing: typography.fontSize["section-title"].letterSpacing,
            fontWeight: typography.fontSize["section-title"].fontWeight.toString(),
          },
        ],
        "section-subtitle": [
          typography.fontSize["section-subtitle"].size,
          {
            lineHeight: typography.fontSize["section-subtitle"].lineHeight,
            letterSpacing: typography.fontSize["section-subtitle"].letterSpacing,
            fontWeight: typography.fontSize["section-subtitle"].fontWeight.toString(),
          },
        ],
      },
      spacing: {
        // Base spacing scale from design tokens (excluding semantic nested objects)
        0: spacing[0],
        0.5: spacing[0.5],
        1: spacing[1],
        1.5: spacing[1.5],
        2: spacing[2],
        3: spacing[3],
        4: spacing[4],
        5: spacing[5],
        6: spacing[6],
        7: spacing[7],
        8: spacing[8],
        10: spacing[10],
        12: spacing[12],
        14: spacing[14],
        16: spacing[16],
        20: spacing[20],
        24: spacing[24],
        28: spacing[28],
        32: spacing[32],
        // Legacy spacing values for compatibility
        "4.5": "1.125rem",
        "18": "4.5rem",
        "88": "22rem",
      },
      borderRadius: {
        // Base radius values from design tokens
        none: radius.none,
        xs: radius.xs,
        sm: radius.sm,
        DEFAULT: radius.DEFAULT,
        md: radius.md,
        lg: radius.lg,
        xl: radius.xl,
        '2xl': radius['2xl'],
        '3xl': radius['3xl'],
        full: radius.full,
        // Semantic radius values
        button: radius.semantic.button,
        card: radius.semantic.card,
        badge: radius.semantic.badge,
        input: radius.semantic.input,
        image: radius.semantic.image,
      },
      boxShadow: {
        // Card and UI shadows
        card: shadows.card,
        'icon-circle': shadows.iconCircle,
        video: shadows.video,
        // Button shadows
        'btn-primary': shadows.button.primary,
        'btn-secondary': shadows.button.secondary,
        'btn-hover': shadows.button.hover,
        // Input shadows
        input: shadows.input.DEFAULT,
        'input-focus': shadows.input.focus,
        'input-error': shadows.input.error,
        // Elevation system
        none: shadows.elevation.none,
        sm: shadows.elevation.sm,
        md: shadows.elevation.md,
        lg: shadows.elevation.lg,
        xl: shadows.elevation.xl,
        '2xl': shadows.elevation['2xl'],
        inner: shadows.elevation.inner,
      },
      maxWidth: {
        container: spacing.semantic.container.maxWidth,
        "8xl": "1440px",
      },
      animation: {
        "fade-in": animations.presets.fadeIn,
        "slide-up": animations.presets.slideUp,
        "scale-in": animations.presets.scaleIn,
        pulse: animations.presets.pulse,
        bounce: animations.presets.bounce,
        scroll: animations.presets.scroll,
        shimmer: animations.presets.shimmer,
        // Legacy animations
        "slide-in-right": "slideInRight 0.3s ease-out",
        "slide-in-left": "slideInLeft 0.3s ease-out",
      },
      keyframes: animations.keyframes,
      transitionDuration: {
        instant: animations.duration.instant,
        fast: animations.duration.fast,
        normal: animations.duration.normal,
        slow: animations.duration.slow,
        slower: animations.duration.slower,
        slowest: animations.duration.slowest,
      },
    },
  },
  plugins: [],
};

export default config;
