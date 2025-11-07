/**
 * Centralized Animation Utilities
 *
 * High-quality, reusable animation classes and patterns
 * Built on top of the design token system for consistency
 * Includes accessibility support (respects prefers-reduced-motion)
 */

/**
 * Navigation Link Hover - Underline slide-in from right (RTL-friendly)
 * Includes color transition with proper spacing
 */
export const navLinkHover = `
  relative
  pb-1
  transition-colors duration-300 ease-in-out
  hover:text-primary
  after:absolute after:bottom-0 after:right-0 after:h-[2px]
  after:w-0 after:bg-primary
  hover:after:w-full
  after:transition-all after:duration-300 after:ease-in-out
  after:origin-right
  motion-reduce:after:transition-none
`.trim().replace(/\s+/g, ' ');

/**
 * Primary CTA Button Hover - Lift + subtle shadow glow + scale
 * Best-in-class button animation with smooth spring-like easing
 * Subtle cyan glow for professional feel
 */
export const primaryCTAHover = `
  transition-all duration-300 ease-in-out
  hover:-translate-y-1
  hover:shadow-[0_8px_20px_rgba(1,159,183,0.25)]
  active:scale-[0.98]
  active:translate-y-0
  motion-reduce:hover:translate-y-0
  motion-reduce:hover:shadow-[0_0_0_3px_rgba(1,159,183,0.3)]
`.trim().replace(/\s+/g, ' ');

/**
 * Secondary CTA Button Hover - Professional subtle lift + border emphasis
 * Sophisticated animation for secondary actions
 */
export const secondaryCTAHover = `
  transition-all duration-300 ease-in-out
  hover:-translate-y-0.5
  hover:shadow-md
  hover:border-primary
  active:scale-[0.98]
  active:translate-y-0
  motion-reduce:hover:translate-y-0
`.trim().replace(/\s+/g, ' ');

/**
 * Footer Link Hover - Icon shift + color fade
 * Smooth animation with directional arrow movement (RTL-friendly)
 */
export const footerLinkHover = `
  group
  transition-all duration-300 ease-in-out
  hover:text-white
  motion-reduce:transition-colors
`.trim().replace(/\s+/g, ' ');

/**
 * Footer Link Arrow Animation (use with footerLinkHover)
 * Separate class for the arrow icon
 */
export const footerLinkArrow = `
  inline-block
  transition-transform duration-300 ease-in-out
  group-hover:-translate-x-1
  motion-reduce:group-hover:translate-x-0
`.trim().replace(/\s+/g, ' ');

/**
 * Social Icon Hover - Professional opacity fade
 * Refined, elegant animation for social media links
 */
export const socialIconHover = `
  transition-all duration-300 ease-in-out
  hover:bg-white/25
  hover:brightness-110
  active:scale-[0.98]
  motion-reduce:hover:brightness-100
`.trim().replace(/\s+/g, ' ');

/**
 * Card Hover - Lift + shadow with subtle glow
 * Elegant card elevation effect with brand-colored glow
 */
export const cardHover = `
  transition-all duration-300 ease-in-out
  hover:-translate-y-2
  hover:shadow-[0_10px_30px_rgba(12,23,25,0.1),0_0_0_1px_rgba(1,159,183,0.1)]
  motion-reduce:hover:translate-y-0
  motion-reduce:hover:shadow-lg
`.trim().replace(/\s+/g, ' ');

/**
 * Icon Circle Hover - Subtle pulse with glow
 * Gentle animation for icon containers with brand glow
 */
export const iconCircleHover = `
  transition-all duration-300 ease-in-out
  hover:scale-110
  hover:shadow-[0_8px_20px_rgba(1,159,183,0.3)]
  motion-reduce:hover:scale-100
`.trim().replace(/\s+/g, ' ');

/**
 * Badge Hover - Gentle highlight
 * Subtle animation for badge components
 */
export const badgeHover = `
  transition-all duration-300 ease-in-out
  hover:brightness-110
  hover:scale-105
  motion-reduce:hover:scale-100
  motion-reduce:hover:brightness-100
`.trim().replace(/\s+/g, ' ');

/**
 * Input Focus - Ring animation with spring easing
 * Smooth focus state for form inputs
 */
export const inputFocus = `
  transition-all duration-200 ease-in-out
  focus:ring-2 focus:ring-primary focus:ring-offset-2
  focus:scale-[1.01]
  motion-reduce:focus:scale-100
`.trim().replace(/\s+/g, ' ');

/**
 * Button Variant Hover States
 * Specific hover animations for different button variants
 */
export const buttonVariants = {
  primary: `
    transition-all duration-300 ease-in-out
    hover:-translate-y-0.5
    hover:shadow-[0_8px_25px_rgba(1,159,183,0.45)]
    active:scale-[0.98]
    active:translate-y-0
    motion-reduce:hover:translate-y-0
  `.trim().replace(/\s+/g, ' '),

  secondary: `
    transition-all duration-300 ease-in-out
    hover:-translate-y-0.5
    hover:shadow-md
    hover:border-primary
    active:scale-[0.98]
    active:translate-y-0
    motion-reduce:hover:translate-y-0
  `.trim().replace(/\s+/g, ' '),

  ghost: `
    transition-all duration-300 ease-in-out
    hover:bg-primary/10
    hover:scale-[1.02]
    active:scale-[0.98]
    motion-reduce:hover:scale-100
  `.trim().replace(/\s+/g, ' '),

  outline: `
    transition-all duration-300 ease-in-out
    hover:bg-primary/5
    hover:border-primary
    hover:scale-[1.01]
    active:scale-[0.98]
    motion-reduce:hover:scale-100
  `.trim().replace(/\s+/g, ' '),
} as const;

/**
 * Micro-animation for loading states
 */
export const loadingPulse = `
  animate-pulse
  motion-reduce:animate-none
`.trim().replace(/\s+/g, ' ');

/**
 * Smooth entrance animation
 */
export const smoothEntrance = `
  animate-fade-in
  motion-reduce:animate-none
  motion-reduce:opacity-100
`.trim().replace(/\s+/g, ' ');

/**
 * Bullet/List Item Hover - Subtle professional highlight
 * Refined animation for list items and bullet points
 */
export const bulletHover = `
  transition-all duration-200 ease-in-out
  hover:translate-x-1
  hover:text-primary
  motion-reduce:hover:translate-x-0
`.trim().replace(/\s+/g, ' ');

/**
 * Helper function to combine animation classes with custom classes
 * Uses proper class merging to handle conflicts
 */
export function withAnimation(baseClasses: string, animationClasses: string): string {
  return `${baseClasses} ${animationClasses}`.trim();
}

/**
 * Preset combinations for common use cases
 */
export const presets = {
  navLink: navLinkHover,
  primaryButton: primaryCTAHover,
  secondaryButton: secondaryCTAHover,
  footerLink: footerLinkHover,
  socialIcon: socialIconHover,
  card: cardHover,
  iconCircle: iconCircleHover,
  badge: badgeHover,
  input: inputFocus,
} as const;

/**
 * Export all utilities as a single object for convenience
 */
export const animations = {
  navLinkHover,
  primaryCTAHover,
  secondaryCTAHover,
  footerLinkHover,
  footerLinkArrow,
  socialIconHover,
  cardHover,
  iconCircleHover,
  badgeHover,
  inputFocus,
  bulletHover,
  buttonVariants,
  loadingPulse,
  smoothEntrance,
  withAnimation,
  presets,
} as const;

export default animations;
