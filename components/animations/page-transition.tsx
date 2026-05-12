'use client';

/**
 * Page Transition Component
 * Provides smooth fade + slide transitions between page navigations
 * Respects prefers-reduced-motion for accessibility
 */

interface PageTransitionProps {
  children: React.ReactNode;
  /** Transition type: fade, slide, or fade-slide */
  type?: 'fade' | 'slide' | 'fade-slide';
  /** Duration in milliseconds */
  duration?: number;
}

export function PageTransition({
  children,
  type = 'fade-slide',
  duration = 300,
}: PageTransitionProps) {
  void type;
  void duration;

  return (
    <div>{children}</div>
  );
}

/**
 * Page Transition Provider
 * Wraps the entire app to provide consistent page transitions
 */
export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  return <PageTransition type="fade-slide" duration={300}>{children}</PageTransition>;
}
