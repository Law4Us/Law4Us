'use client';

import { useEffect, useState, RefObject, useRef } from 'react';

interface ScrollProgressOptions {
  start?: number; // Start progress calculation when element is this % from bottom of viewport (0-1)
  end?: number;   // End progress calculation when element is this % from bottom of viewport (0-1)
}

/**
 * useScrollProgress Hook
 * Tracks scroll progress of an element through the viewport
 * Returns a value from 0 to 1 representing how far the element has scrolled
 *
 * @param options - Configuration for when to start/end progress tracking
 * @returns [ref, progress] - Attach ref to the element, progress is 0-1
 *
 * @example
 * const [ref, progress] = useScrollProgress({ start: 0.8, end: 0.2 });
 * const scale = 0.95 + (progress * 0.05); // Scale from 0.95 to 1
 * <div ref={ref} style={{ transform: `scale(${scale})`, opacity: progress }}>
 */
export function useScrollProgress<T extends HTMLElement = HTMLDivElement>(
  options: ScrollProgressOptions = {}
): [RefObject<T>, number] {
  const { start = 0.8, end = 0.2 } = options;
  const elementRef = useRef<T>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setProgress(1);
      return;
    }

    const handleScroll = () => {
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Calculate position of element's center relative to viewport
      const elementCenter = rect.top + rect.height / 2;

      // Define start and end points in viewport
      const startPoint = viewportHeight * start;
      const endPoint = viewportHeight * end;

      // Calculate progress (0 when at start, 1 when at end)
      let scrollProgress = 0;

      if (elementCenter <= startPoint && elementCenter >= endPoint) {
        const totalDistance = startPoint - endPoint;
        const currentDistance = startPoint - elementCenter;
        scrollProgress = currentDistance / totalDistance;
      } else if (elementCenter < endPoint) {
        scrollProgress = 1;
      }

      setProgress(Math.max(0, Math.min(1, scrollProgress)));
    };

    // Initial check
    handleScroll();

    // Add scroll listener with passive flag for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [start, end]);

  return [elementRef, progress];
}
