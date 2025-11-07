'use client';

import { useRef, useEffect, useCallback, RefObject } from 'react';

interface RippleEffectOptions {
  color?: string;
  duration?: number; // Duration in milliseconds
}

/**
 * Ripple Effect Hook
 * Creates a Material Design-style ripple effect on click
 *
 * @param options - Configuration for ripple color and duration
 * @returns ref - Attach this ref to the clickable element
 *
 * @example
 * const buttonRef = useRippleEffect({ color: 'rgba(255,255,255,0.5)', duration: 600 });
 * <button ref={buttonRef}>Ripple Button</button>
 */
export function useRippleEffect<T extends HTMLElement = HTMLElement>(
  options: RippleEffectOptions = {}
): RefObject<T> {
  const { color = 'rgba(255, 255, 255, 0.5)', duration = 600 } = options;
  const elementRef = useRef<T>(null);

  const createRipple = useCallback(
    (event: MouseEvent) => {
      const element = elementRef.current;
      if (!element) return;

      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      const rect = element.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      const ripple = document.createElement('span');
      ripple.style.position = 'absolute';
      ripple.style.borderRadius = '50%';
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.style.background = color;
      ripple.style.pointerEvents = 'none';
      ripple.style.transform = 'scale(0)';
      ripple.style.opacity = '1';
      ripple.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
      ripple.style.zIndex = '0';

      // Ensure parent has position relative
      const position = window.getComputedStyle(element).position;
      if (position === 'static') {
        element.style.position = 'relative';
      }

      // Ensure parent has overflow hidden
      element.style.overflow = 'hidden';

      element.appendChild(ripple);

      // Trigger animation
      requestAnimationFrame(() => {
        ripple.style.transform = 'scale(2)';
        ripple.style.opacity = '0';
      });

      // Remove ripple after animation completes
      setTimeout(() => {
        ripple.remove();
      }, duration);
    },
    [color, duration]
  );

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('click', createRipple as EventListener);

    return () => {
      element.removeEventListener('click', createRipple as EventListener);
    };
  }, [createRipple]);

  return elementRef;
}
