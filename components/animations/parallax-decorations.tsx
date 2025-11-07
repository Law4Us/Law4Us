'use client';

import { useEffect, useState } from 'react';

/**
 * Parallax Decorative Elements for Hero Section
 * Legal-themed floating icons with scroll-based parallax effect
 * Elements move at 0.5x scroll speed for depth perception
 */

interface ParallaxDecorationsProps {
  /** Enable/disable parallax effect (respects prefers-reduced-motion) */
  enabled?: boolean;
}

export function ParallaxDecorations({ enabled = true }: ParallaxDecorationsProps) {
  const [scrollY, setScrollY] = useState(0);
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

  // Track scroll position for parallax effect
  useEffect(() => {
    if (!enabled || reducedMotion) return;

    const handleScroll = () => {
      // Only track scroll within hero section (first 800px)
      setScrollY(Math.min(window.scrollY, 800));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enabled, reducedMotion]);

  // Calculate parallax offset (0.5x scroll speed)
  const parallaxOffset = reducedMotion ? 0 : scrollY * 0.5;

  // Don't render decorations if disabled
  if (!enabled) return null;

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Scales of Justice - Top Left */}
      <div
        className="absolute"
        style={{
          top: '10%',
          left: '5%',
          transform: `translateY(${parallaxOffset * 0.8}px)`,
          opacity: 0.08,
          transition: reducedMotion ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L6 8H9V16H15V8H18L12 2Z"
            fill="currentColor"
            className="text-primary"
          />
          <path
            d="M3 20H21V22H3V20Z"
            fill="currentColor"
            className="text-primary"
          />
          <circle cx="7" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" className="text-primary" fill="none"/>
          <circle cx="17" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" className="text-primary" fill="none"/>
        </svg>
      </div>

      {/* Document Icon - Top Right */}
      <div
        className="absolute"
        style={{
          top: '15%',
          right: '8%',
          transform: `translateY(${parallaxOffset * 0.6}px)`,
          opacity: 0.06,
          transition: reducedMotion ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        <svg
          width="100"
          height="100"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-primary"
            fill="none"
          />
          <path d="M14 2V8H20" stroke="currentColor" strokeWidth="1.5" className="text-primary" fill="none"/>
          <path d="M8 13H16" stroke="currentColor" strokeWidth="1.5" className="text-primary"/>
          <path d="M8 17H16" stroke="currentColor" strokeWidth="1.5" className="text-primary"/>
          <path d="M8 9H10" stroke="currentColor" strokeWidth="1.5" className="text-primary"/>
        </svg>
      </div>

      {/* Gavel Icon - Bottom Left */}
      <div
        className="absolute"
        style={{
          bottom: '20%',
          left: '10%',
          transform: `translateY(${parallaxOffset * 0.4}px)`,
          opacity: 0.07,
          transition: reducedMotion ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        <svg
          width="110"
          height="110"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="14"
            y="4"
            width="8"
            height="3"
            rx="1"
            transform="rotate(45 14 4)"
            fill="currentColor"
            className="text-primary"
          />
          <rect
            x="8"
            y="10"
            width="8"
            height="3"
            rx="1"
            transform="rotate(45 8 10)"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-primary"
            fill="none"
          />
          <path
            d="M3 21L8 16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-primary"
          />
          <rect
            x="1"
            y="19"
            width="6"
            height="2"
            rx="1"
            fill="currentColor"
            className="text-primary"
          />
        </svg>
      </div>

      {/* Certificate/Seal Icon - Bottom Right */}
      <div
        className="absolute"
        style={{
          bottom: '15%',
          right: '12%',
          transform: `translateY(${parallaxOffset * 0.7}px)`,
          opacity: 0.05,
          transition: reducedMotion ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        <svg
          width="90"
          height="90"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-primary"
            fill="none"
          />
          <circle
            cx="12"
            cy="12"
            r="6"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-primary"
            fill="none"
          />
          <path
            d="M12 6L13.5 10.5H18L14.5 13.5L16 18L12 15L8 18L9.5 13.5L6 10.5H10.5L12 6Z"
            fill="currentColor"
            className="text-primary"
            opacity="0.3"
          />
        </svg>
      </div>

      {/* Paragraph Symbol - Middle Left */}
      <div
        className="absolute"
        style={{
          top: '50%',
          left: '3%',
          transform: `translateY(calc(-50% + ${parallaxOffset * 0.9}px))`,
          opacity: 0.04,
          transition: reducedMotion ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13 4C10.2386 4 8 6.23858 8 9C8 11.7614 10.2386 14 13 14H14V20M14 4H19M14 4V20M17 4V20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-primary"
          />
        </svg>
      </div>

      {/* Balance/Checkmark - Middle Right */}
      <div
        className="absolute"
        style={{
          top: '45%',
          right: '5%',
          transform: `translateY(calc(-50% + ${parallaxOffset * 0.5}px))`,
          opacity: 0.06,
          transition: reducedMotion ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        <svg
          width="95"
          height="95"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 6L9 17L4 12"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          />
        </svg>
      </div>
    </div>
  );
}
