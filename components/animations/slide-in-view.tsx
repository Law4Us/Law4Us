'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';

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
}: SlideInViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once visible, stop observing
          observer.unobserve(element);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px', // Trigger slightly before element is fully in view
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold]);

  const getTransformOrigin = () => {
    switch (direction) {
      case 'up':
        return 'translateY(30px)';
      case 'down':
        return 'translateY(-30px)';
      case 'left':
        return 'translateX(30px)';
      case 'right':
        return 'translateX(-30px)';
      default:
        return 'translateY(30px)';
    }
  };

  return (
    <div
      ref={ref}
      className={cn('transition-transform ease-out', className)}
      style={{
        transform: isVisible ? 'translate(0, 0)' : getTransformOrigin(),
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        contain: 'layout',
        willChange: isVisible ? 'auto' : 'transform',
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
