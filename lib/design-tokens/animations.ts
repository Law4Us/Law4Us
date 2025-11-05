/**
 * Design Tokens: Animations
 *
 * Centralized animation system including durations, easing functions,
 * transitions, and keyframe animations.
 */

export const animations = {
  // Duration Scale
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
    slowest: '1000ms',
  },

  // Easing Functions
  easing: {
    default: 'ease-in-out',
    linear: 'linear',
    in: 'ease-in',
    out: 'ease-out',
    inOut: 'ease-in-out',
    // Custom cubic bezier curves
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Transition Presets
  transitions: {
    // Most common transitions
    colors: 'color 300ms ease-in-out, background-color 300ms ease-in-out, border-color 300ms ease-in-out',
    opacity: 'opacity 300ms ease-in-out',
    transform: 'transform 300ms ease-in-out',
    all: 'all 300ms ease-in-out',

    // Specific use cases
    button: 'background-color 300ms ease-in-out, transform 150ms ease-in-out, box-shadow 300ms ease-in-out',
    hover: 'transform 300ms ease-in-out, box-shadow 300ms ease-in-out',
    focus: 'box-shadow 300ms ease-in-out, border-color 300ms ease-in-out',
    smooth: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Keyframe Animations
  keyframes: {
    // Fade animations
    fadeIn: {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' },
    },
    fadeOut: {
      '0%': { opacity: '1' },
      '100%': { opacity: '0' },
    },

    // Slide animations
    slideInRight: {
      '0%': { transform: 'translateX(100%)', opacity: '0' },
      '100%': { transform: 'translateX(0)', opacity: '1' },
    },
    slideInLeft: {
      '0%': { transform: 'translateX(-100%)', opacity: '0' },
      '100%': { transform: 'translateX(0)', opacity: '1' },
    },
    slideUp: {
      '0%': { transform: 'translateY(20px)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' },
    },
    slideDown: {
      '0%': { transform: 'translateY(-20px)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' },
    },

    // Scale animations
    scaleIn: {
      '0%': { transform: 'scale(0.95)', opacity: '0' },
      '100%': { transform: 'scale(1)', opacity: '1' },
    },
    scaleOut: {
      '0%': { transform: 'scale(1)', opacity: '1' },
      '100%': { transform: 'scale(0.95)', opacity: '0' },
    },

    // Specific UI animations
    growFromRight: {
      '0%': { width: '0' },
      '100%': { width: '100%' },
    },
    pulse: {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.5' },
    },
    bounce: {
      '0%, 100%': {
        transform: 'translateY(-25%)',
        animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
      },
      '50%': {
        transform: 'translateY(0)',
        animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
      },
    },

    // Logo carousel scroll (infinite)
    scroll: {
      '0%': { transform: 'translateX(0)' },
      '100%': { transform: 'translateX(-50%)' },
    },

    // Shimmer loading effect
    shimmer: {
      '0%': { backgroundPosition: '-1000px 0' },
      '100%': { backgroundPosition: '1000px 0' },
    },
  },

  // Animation Presets (complete animation strings)
  presets: {
    fadeIn: 'fadeIn 300ms ease-in-out',
    slideUp: 'slideUp 300ms ease-out',
    scaleIn: 'scaleIn 300ms ease-out',
    pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    bounce: 'bounce 1s infinite',
    scroll: 'scroll 30s linear infinite',
    shimmer: 'shimmer 2s infinite',
  },

  // Hover Effects
  hover: {
    scale: {
      DEFAULT: 'scale(1.05)',
      sm: 'scale(1.02)',
      lg: 'scale(1.1)',
    },
    translateY: {
      DEFAULT: 'translateY(-2px)',
      sm: 'translateY(-1px)',
      lg: 'translateY(-4px)',
    },
  },

  // Active/Pressed Effects
  active: {
    scale: 'scale(0.98)',
  },
} as const;

// Type helpers
export type AnimationToken = typeof animations;
export type Duration = keyof typeof animations.duration;
export type Easing = keyof typeof animations.easing;
export type KeyframeAnimation = keyof typeof animations.keyframes;

// Utility function to create custom transition
export function createTransition(
  property: string | string[],
  duration: Duration = 'normal',
  easing: Easing = 'default'
): string {
  const props = Array.isArray(property) ? property : [property];
  const dur = animations.duration[duration];
  const ease = animations.easing[easing];
  return props.map((prop) => `${prop} ${dur} ${ease}`).join(', ');
}

// Reduced motion support utility
export const prefersReducedMotion = {
  reset: {
    'animation-duration': '0.01ms !important',
    'animation-iteration-count': '1 !important',
    'transition-duration': '0.01ms !important',
    'scroll-behavior': 'auto !important',
  },
};
