'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { useMagneticHover } from '@/lib/hooks/useMagneticHover';
import { useRippleEffect } from '@/lib/hooks/useRippleEffect';

interface MagneticButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  magneticStrength?: number;
  magneticDistance?: number;
  rippleColor?: string;
  rippleDuration?: number;
}

/**
 * MagneticButton Component
 * A Link component enhanced with magnetic hover and ripple click effects
 *
 * @example
 * <MagneticButton
 *   href="/wizard"
 *   className={animations.primaryCTAHover}
 *   style={CTA_STYLES.main}
 * >
 *   Get Started
 * </MagneticButton>
 */
export function MagneticButton({
  href,
  children,
  className = '',
  style = {},
  magneticStrength = 0.2,
  magneticDistance = 100,
  rippleColor = 'rgba(255, 255, 255, 0.4)',
  rippleDuration = 600,
}: MagneticButtonProps) {
  const combinedRef = useRef<HTMLAnchorElement>(null);

  // We can't use both hooks directly on the same ref, so we'll implement them manually
  useEffect(() => {
    const element = combinedRef.current;
    if (!element) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Magnetic hover effect
    const handleMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion) return;

      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const distanceFromCenter = Math.sqrt(deltaX ** 2 + deltaY ** 2);

      if (distanceFromCenter < magneticDistance) {
        const factor = (1 - distanceFromCenter / magneticDistance) * magneticStrength;
        const translateX = deltaX * factor;
        const translateY = deltaY * factor;

        element.style.transform = `translate(${translateX}px, ${translateY}px)`;
      }
    };

    const handleMouseLeave = () => {
      if (!prefersReducedMotion) {
        element.style.transform = 'translate(0, 0)';
      }
    };

    // Ripple effect
    const createRipple = (event: MouseEvent) => {
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
      ripple.style.background = rippleColor;
      ripple.style.pointerEvents = 'none';
      ripple.style.transform = 'scale(0)';
      ripple.style.opacity = '1';
      ripple.style.transition = `transform ${rippleDuration}ms ease-out, opacity ${rippleDuration}ms ease-out`;
      ripple.style.zIndex = '0';

      // Ensure parent has position relative
      const position = window.getComputedStyle(element).position;
      if (position === 'static') {
        element.style.position = 'relative';
      }

      // Ensure parent has overflow hidden
      element.style.overflow = 'hidden';

      element.appendChild(ripple);

      requestAnimationFrame(() => {
        ripple.style.transform = 'scale(2)';
        ripple.style.opacity = '0';
      });

      setTimeout(() => {
        ripple.remove();
      }, rippleDuration);
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('click', createRipple);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('click', createRipple);
    };
  }, [magneticStrength, magneticDistance, rippleColor, rippleDuration]);

  return (
    <Link
      ref={combinedRef}
      href={href}
      className={className}
      style={{
        ...style,
        transition: 'transform 0.15s ease-out',
      }}
    >
      {children}
    </Link>
  );
}
