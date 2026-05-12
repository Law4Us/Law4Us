'use client';

interface SlideInViewProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Delay before animation starts (in milliseconds)
   */
  delay?: number;
  /**
   * Animation direction
   */
  direction?: 'up' | 'down' | 'left' | 'right';
  /**
   * How much of the element should be visible before triggering (0-1)
   */
  threshold?: number;
  /**
   * Animation duration in milliseconds
   */
  duration?: number;
  /**
   * Disable CSS containment to allow overflow content (shadows, badges, etc.)
   */
  disableContainment?: boolean;
  /**
   * IntersectionObserver rootMargin (default: '0px 0px -50px 0px')
   */
  rootMargin?: string;
}

/**
 * SlideInView - Subtle, professional scroll-triggered animation
 *
 * Animates elements into view as user scrolls with refined motion
 * Perfect for cards, sections, and content blocks
 *
 * @example
 * <SlideInView direction="up" delay={100}>
 *   <Card>...</Card>
 * </SlideInView>
 */
export function SlideInView({
  children,
  className,
  delay = 0,
  direction = 'up',
  threshold = 0.1,
  duration = 600,
  disableContainment = true,
  rootMargin = '0px 0px -50px 0px',
}: SlideInViewProps) {
  void delay;
  void direction;
  void threshold;
  void duration;
  void rootMargin;

  return (
    <div
      className={className}
      style={{
        ...(disableContainment ? {} : { contain: 'layout style paint' }),
      }}
    >
      {children}
    </div>
  );
}

/**
 * StaggeredSlideInView - Multiple items with staggered animation
 *
 * Animates a list of items with a cascading effect
 *
 * @example
 * <StaggeredSlideInView staggerDelay={100}>
 *   <Card>Item 1</Card>
 *   <Card>Item 2</Card>
 *   <Card>Item 3</Card>
 * </StaggeredSlideInView>
 */
interface StaggeredSlideInViewProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  threshold?: number;
  duration?: number;
}

export function StaggeredSlideInView({
  children,
  className,
  staggerDelay = 100,
  direction = 'up',
  threshold = 0.1,
  duration = 600,
}: StaggeredSlideInViewProps) {
  const childrenArray = Array.isArray(children) ? children : [children];

  return (
    <div className={className}>
      {childrenArray.map((child, index) => (
        <SlideInView
          key={index}
          delay={index * staggerDelay}
          direction={direction}
          threshold={threshold}
          duration={duration}
        >
          {child}
        </SlideInView>
      ))}
    </div>
  );
}
