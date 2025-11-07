'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

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
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Trigger transition on pathname change
  useEffect(() => {
    // Start with invisible
    setIsVisible(false);

    // Fade in after a brief delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname]);

  // Build transition styles based on type
  const getTransitionStyles = () => {
    if (reducedMotion) {
      // No animation for reduced motion users
      return {
        opacity: 1,
        transform: 'none',
        transition: 'none',
      };
    }

    const baseTransition = `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;

    switch (type) {
      case 'fade':
        return {
          opacity: isVisible ? 1 : 0,
          transition: baseTransition,
        };

      case 'slide':
        return {
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: baseTransition,
        };

      case 'fade-slide':
      default:
        return {
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: baseTransition,
        };
    }
  };

  return (
    <div
      style={{
        ...getTransitionStyles(),
        willChange: reducedMotion ? 'auto' : 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}

/**
 * Page Transition Provider
 * Wraps the entire app to provide consistent page transitions
 */
export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  return <PageTransition type="fade-slide" duration={300}>{children}</PageTransition>;
}
