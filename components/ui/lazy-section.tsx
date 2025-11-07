'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Lazy Section Component
 * Delays rendering of below-fold content until it's near the viewport
 * Improves initial page load performance by reducing initial render work
 */

interface LazySectionProps {
  children: ReactNode;
  /** Distance from viewport to trigger loading (px) */
  rootMargin?: string;
  /** Show placeholder while loading */
  placeholder?: ReactNode;
  /** Minimum height for placeholder (prevents layout shift) */
  minHeight?: string | number;
  /** Custom class name */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
}

export function LazySection({
  children,
  rootMargin = '400px',
  placeholder,
  minHeight,
  className,
  style,
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentSection = sectionRef.current;
    if (!currentSection) return;

    // Create Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasLoaded) {
            setIsVisible(true);
            setHasLoaded(true);
          }
        });
      },
      {
        rootMargin,
        threshold: 0,
      }
    );

    // Start observing
    observer.observe(currentSection);

    // Cleanup
    return () => {
      if (currentSection) {
        observer.unobserve(currentSection);
      }
    };
  }, [rootMargin, hasLoaded]);

  const containerStyle: React.CSSProperties = {
    minHeight: minHeight || 'auto',
    ...style,
  };

  return (
    <div ref={sectionRef} className={className} style={containerStyle}>
      {isVisible || hasLoaded ? children : placeholder || <div style={{ minHeight }} />}
    </div>
  );
}

/**
 * Lazy Section with Fade In
 * Combines lazy loading with smooth fade-in animation
 */

interface LazySectionFadeProps extends LazySectionProps {
  /** Fade duration in ms */
  fadeDuration?: number;
}

export function LazySectionFade({
  children,
  rootMargin = '400px',
  fadeDuration = 600,
  minHeight,
  className,
  style,
}: LazySectionFadeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const currentSection = sectionRef.current;
    if (!currentSection) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasLoaded) {
            setIsVisible(true);
            setHasLoaded(true);
            // Start animation after a small delay to ensure content is mounted
            setTimeout(() => setShouldAnimate(true), 50);
          }
        });
      },
      {
        rootMargin,
        threshold: 0,
      }
    );

    observer.observe(currentSection);

    return () => {
      if (currentSection) {
        observer.unobserve(currentSection);
      }
    };
  }, [rootMargin, hasLoaded]);

  const containerStyle: React.CSSProperties = {
    minHeight: minHeight || 'auto',
    ...style,
  };

  const contentStyle: React.CSSProperties = {
    opacity: reducedMotion ? 1 : shouldAnimate ? 1 : 0,
    transform: reducedMotion
      ? 'none'
      : shouldAnimate
        ? 'translateY(0)'
        : 'translateY(20px)',
    transition: reducedMotion
      ? 'none'
      : `opacity ${fadeDuration}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${fadeDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    willChange: reducedMotion ? 'auto' : 'opacity, transform',
  };

  return (
    <div ref={sectionRef} className={className} style={containerStyle}>
      {isVisible || hasLoaded ? (
        <div style={contentStyle}>{children}</div>
      ) : (
        <div style={{ minHeight }} />
      )}
    </div>
  );
}

/**
 * Hook for lazy loading state
 * Use this for custom lazy loading implementations
 */
export function useLazyLoad(options: {
  rootMargin?: string;
  threshold?: number;
} = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const currentElement = ref.current;
    if (!currentElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasLoaded) {
            setIsVisible(true);
            setHasLoaded(true);
          }
        });
      },
      {
        rootMargin: options.rootMargin || '200px',
        threshold: options.threshold || 0,
      }
    );

    observer.observe(currentElement);

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [options.rootMargin, options.threshold, hasLoaded]);

  return { ref, isVisible, hasLoaded };
}
