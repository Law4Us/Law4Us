'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { ImageProps } from 'next/image';

/**
 * Progressive Image Component
 * Implements blur-up effect for smooth image loading
 * Shows low-quality placeholder that transitions to full quality
 */

interface ProgressiveImageProps extends Omit<ImageProps, 'placeholder' | 'blurDataURL'> {
  /** Low quality image placeholder (optional, auto-generated if not provided) */
  placeholderSrc?: string;
  /** Blur amount in pixels (default: 20) */
  blurAmount?: number;
  /** Transition duration in ms (default: 400) */
  transitionDuration?: number;
}

export function ProgressiveImage({
  src,
  alt,
  placeholderSrc,
  blurAmount = 20,
  transitionDuration = 400,
  className,
  style,
  onLoad,
  ...props
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
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

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  // Container style
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    ...style,
  };

  // Image wrapper style with transition
  const imageWrapperStyle: React.CSSProperties = {
    opacity: reducedMotion ? 1 : isLoaded ? 1 : 0,
    transition: reducedMotion
      ? 'none'
      : `opacity ${transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
  };

  // Placeholder style with blur
  const placeholderStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    filter: reducedMotion ? 'none' : `blur(${blurAmount}px)`,
    transform: reducedMotion ? 'scale(1)' : isLoaded ? 'scale(1.05)' : 'scale(1)',
    opacity: reducedMotion ? 0 : isLoaded ? 0 : 1,
    transition: reducedMotion
      ? 'none'
      : `all ${transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    pointerEvents: 'none' as const,
  };

  return (
    <div style={containerStyle} className={className}>
      {/* Placeholder image with blur */}
      {placeholderSrc && !reducedMotion && (
        <div style={placeholderStyle}>
          <Image
            src={placeholderSrc}
            alt={`${alt} placeholder`}
            fill
            sizes={props.sizes}
            quality={10}
            priority={props.priority}
            style={{
              objectFit: props.fill ? (style?.objectFit as any) || 'cover' : undefined,
            }}
          />
        </div>
      )}

      {/* Main image */}
      <div style={imageWrapperStyle}>
        <Image
          src={src}
          alt={alt}
          onLoad={handleLoad}
          className={className}
          {...props}
        />
      </div>

      {/* Loading shimmer overlay (only if not using placeholder) */}
      {!placeholderSrc && !isLoaded && !reducedMotion && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(90deg, #EEF2F3 0%, #E0E6E8 50%, #EEF2F3 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Shimmer animation keyframes */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
}
