'use client';

import { useRef, useEffect, RefObject } from 'react';

interface MagneticHoverOptions {
  strength?: number; // How much the element moves toward cursor (0-1)
  distance?: number; // Max distance in pixels for magnetic effect
}

/**
 * Magnetic Hover Hook
 * Creates a smooth magnetic effect where the element follows the cursor
 *
 * @param options - Configuration for magnetic strength and distance
 * @returns ref - Attach this ref to the element
 *
 * @example
 * const buttonRef = useMagneticHover({ strength: 0.3, distance: 100 });
 * <button ref={buttonRef}>Magnetic Button</button>
 */
export function useMagneticHover<T extends HTMLElement = HTMLElement>(
  options: MagneticHoverOptions = {}
): RefObject<T> {
  const { strength = 0.3, distance = 100 } = options;
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const distanceFromCenter = Math.sqrt(deltaX ** 2 + deltaY ** 2);

      // Only apply effect if cursor is within distance threshold
      if (distanceFromCenter < distance) {
        const factor = (1 - distanceFromCenter / distance) * strength;
        const translateX = deltaX * factor;
        const translateY = deltaY * factor;

        element.style.transform = `translate(${translateX}px, ${translateY}px)`;
      }
    };

    const handleMouseLeave = () => {
      element.style.transform = 'translate(0, 0)';
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength, distance]);

  return elementRef;
}
