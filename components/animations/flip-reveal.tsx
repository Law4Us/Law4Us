'use client';

import React, { useEffect, useState } from 'react';

/**
 * Flip Reveal Animation Component
 * Creates a 3D flip/reveal effect when content changes
 * Respects prefers-reduced-motion for accessibility
 */

interface FlipRevealProps {
  children: React.ReactNode;
  /** Unique key to trigger animation when changed */
  triggerKey: string | number;
  /** Animation type: flip-horizontal, flip-vertical, or reveal-fade */
  type?: 'flip-horizontal' | 'flip-vertical' | 'reveal-fade';
  /** Duration in milliseconds */
  duration?: number;
  /** Delay before animation starts (ms) */
  delay?: number;
}

export function FlipReveal({
  children,
  triggerKey,
  type = 'flip-horizontal',
  duration = 400,
  delay = 0,
}: FlipRevealProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [currentKey, setCurrentKey] = useState(triggerKey);

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

  // Trigger animation on key change
  useEffect(() => {
    if (currentKey !== triggerKey) {
      // Start exit animation
      setIsVisible(false);

      // After exit animation completes, update content and start enter animation
      const timer = setTimeout(
        () => {
          setCurrentKey(triggerKey);
          setIsVisible(true);
        },
        reducedMotion ? 0 : duration / 2
      );

      return () => clearTimeout(timer);
    }
  }, [triggerKey, currentKey, duration, reducedMotion]);

  // Get animation styles based on type
  const getAnimationStyles = () => {
    if (reducedMotion) {
      return {
        opacity: 1,
        transform: 'none',
        transition: 'none',
      };
    }

    const baseTransition = `all ${duration / 2}ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`;

    switch (type) {
      case 'flip-horizontal':
        return {
          opacity: isVisible ? 1 : 0,
          transform: isVisible
            ? 'perspective(1000px) rotateY(0deg)'
            : 'perspective(1000px) rotateY(90deg)',
          transformStyle: 'preserve-3d' as const,
          backfaceVisibility: 'hidden' as const,
          transition: baseTransition,
          willChange: 'transform, opacity',
        };

      case 'flip-vertical':
        return {
          opacity: isVisible ? 1 : 0,
          transform: isVisible
            ? 'perspective(1000px) rotateX(0deg)'
            : 'perspective(1000px) rotateX(-90deg)',
          transformStyle: 'preserve-3d' as const,
          backfaceVisibility: 'hidden' as const,
          transition: baseTransition,
          willChange: 'transform, opacity',
        };

      case 'reveal-fade':
      default:
        return {
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: baseTransition,
          willChange: 'transform, opacity',
        };
    }
  };

  return <div style={getAnimationStyles()}>{children}</div>;
}

/**
 * Staggered Reveal Component
 * Reveals children with a staggered delay for a cascading effect
 */

interface StaggeredRevealProps {
  children: React.ReactNode[];
  /** Delay between each child (ms) */
  staggerDelay?: number;
  /** Base animation duration (ms) */
  duration?: number;
  /** Trigger key to restart animation */
  triggerKey?: string | number;
}

export function StaggeredReveal({
  children,
  staggerDelay = 100,
  duration = 400,
  triggerKey,
}: StaggeredRevealProps) {
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

  // Reset and trigger animation
  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [triggerKey]);

  return (
    <>
      {React.Children.map(children, (child, index) => {
        if (!child) return null;

        const animationStyle = reducedMotion
          ? {
              opacity: 1,
              transform: 'none',
              transition: 'none',
            }
          : {
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(15px)',
              transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) ${
                index * staggerDelay
              }ms`,
              willChange: 'transform, opacity',
            };

        return <div style={animationStyle}>{child}</div>;
      })}
    </>
  );
}
