'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

/**
 * Page Load Animation Component
 * Shows a brand logo animation while the page initially loads
 * Fades out smoothly once content is ready
 * Respects prefers-reduced-motion for accessibility
 */

interface PageLoaderProps {
  /** Duration to show the loader (ms) */
  duration?: number;
  /** Logo path */
  logoSrc?: string;
  /** Logo alt text */
  logoAlt?: string;
}

export function PageLoader({
  duration = 1200,
  logoSrc = '/logo.svg',
  logoAlt = 'Law4Us',
}: PageLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
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

  useEffect(() => {
    // Prevent scrolling while loading
    document.body.style.overflow = 'hidden';

    // Wait for minimum duration and document ready
    const timer = setTimeout(() => {
      setIsLoading(false);

      // Start fade out animation
      const fadeTimer = setTimeout(() => {
        setIsVisible(false);

        // Remove from DOM and restore scroll after fade completes
        const removeTimer = setTimeout(() => {
          document.body.style.overflow = '';
        }, reducedMotion ? 0 : 400);

        return () => clearTimeout(removeTimer);
      }, 100);

      return () => clearTimeout(fadeTimer);
    }, duration);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, [duration, reducedMotion]);

  // Don't render if not visible
  if (!isVisible && !isLoading) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#EEF2F3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        opacity: isVisible ? 1 : 0,
        transition: reducedMotion ? 'none' : 'opacity 400ms cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        {/* Logo with scale animation */}
        <div
          style={{
            opacity: isLoading ? 1 : 0,
            transform: reducedMotion
              ? 'scale(1)'
              : isLoading
                ? 'scale(1)'
                : 'scale(0.9)',
            transition: reducedMotion
              ? 'none'
              : 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <Image
            src={logoSrc}
            alt={logoAlt}
            width={180}
            height={60}
            priority
            style={{
              animation: reducedMotion
                ? 'none'
                : 'logoFloat 2s ease-in-out infinite',
            }}
          />
        </div>

        {/* Loading bar */}
        <div
          style={{
            width: '200px',
            height: '3px',
            backgroundColor: 'rgba(1, 159, 183, 0.1)',
            borderRadius: '100px',
            overflow: 'hidden',
            opacity: reducedMotion ? 0 : 1,
          }}
        >
          <div
            style={{
              height: '100%',
              backgroundColor: '#019FB7',
              borderRadius: '100px',
              animation: reducedMotion ? 'none' : 'loadingBar 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
        </div>
      </div>

      {/* Keyframe animations */}
      <style jsx>{`
        @keyframes logoFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes loadingBar {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          @keyframes logoFloat {
            0%, 100% {
              transform: translateY(0px);
            }
          }

          @keyframes loadingBar {
            0%, 100% {
              transform: translateX(0);
            }
          }
        }
      `}</style>
    </div>
  );
}
