'use client';

import React, { useState, useEffect, useRef, TouchEvent } from 'react';

/**
 * Swipeable Testimonials Component
 * Mobile-first testimonial carousel with swipe gestures
 * Displays stacked columns on desktop, swipeable carousel on mobile
 */

interface Testimonial {
  name: string;
  title?: string;
  avatar?: string;
  text: string;
}

interface SwipeableTestimonialsProps {
  testimonials: Testimonial[][];
  className?: string;
}

export function SwipeableTestimonials({
  testimonials,
  className = '',
}: SwipeableTestimonialsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Flatten testimonials array for mobile carousel
  const flattenedTestimonials = testimonials.flat();
  const totalSlides = flattenedTestimonials.length;

  // Minimum swipe distance (in px) to trigger a slide change
  const minSwipeDistance = 50;

  const handleTouchStart = (e: TouchEvent) => {
    setTouchEnd(0); // Reset
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsSwiping(false);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && activeIndex < totalSlides - 1) {
      setActiveIndex(activeIndex + 1);
    }

    if (isRightSwipe && activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }

    setIsSwiping(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && activeIndex > 0) {
        setActiveIndex(activeIndex - 1);
      } else if (e.key === 'ArrowRight' && activeIndex < totalSlides - 1) {
        setActiveIndex(activeIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, totalSlides]);

  return (
    <div className={`relative ${className}`}>
      {/* Desktop: 3-column layout */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-8">
        {testimonials.map((column, columnIndex) => (
          <div key={columnIndex} className="flex flex-col gap-6">
            {column.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </div>
        ))}
      </div>

      {/* Mobile/Tablet: Swipeable carousel */}
      <div className="lg:hidden">
        <div
          ref={containerRef}
          className="overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(-${activeIndex * 100}%)`,
              cursor: isSwiping ? 'grabbing' : 'grab',
            }}
          >
            {flattenedTestimonials.map((testimonial, index) => (
              <div key={index} className="w-full flex-shrink-0 px-2">
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </div>
        </div>

        {/* Pagination dots */}
        <div className="flex justify-center gap-2 mt-6">
          {flattenedTestimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? 'bg-primary w-8'
                  : 'bg-neutral-300 hover:bg-neutral-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation arrows (optional, for tablet) */}
        <div className="hidden md:flex lg:hidden justify-between mt-6">
          <button
            onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
            disabled={activeIndex === 0}
            className={`p-2 rounded-full transition-all ${
              activeIndex === 0
                ? 'opacity-30 cursor-not-allowed'
                : 'hover:bg-neutral-200'
            }`}
            aria-label="Previous testimonial"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            onClick={() =>
              setActiveIndex(Math.min(totalSlides - 1, activeIndex + 1))
            }
            disabled={activeIndex === totalSlides - 1}
            className={`p-2 rounded-full transition-all ${
              activeIndex === totalSlides - 1
                ? 'opacity-30 cursor-not-allowed'
                : 'hover:bg-neutral-200'
            }`}
            aria-label="Next testimonial"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Individual Testimonial Card Component
 */
function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const { TYPOGRAPHY, CARD_STYLES } = require('@/lib/constants/styles');

  return (
    <div style={CARD_STYLES.container} className="h-full">
      <p
        style={{ ...TYPOGRAPHY.bodyLarge, lineHeight: '1.6' }}
        className="text-right flex-1"
      >
        "{testimonial.text}"
      </p>
      <div className="flex items-center gap-3 mt-4 w-full">
        {testimonial.avatar ? (
          <img
            src={testimonial.avatar}
            alt={testimonial.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold text-lg">
              {testimonial.name.charAt(0)}
            </span>
          </div>
        )}
        <div className="flex-1 text-right">
          <p style={{ fontSize: '16px', color: '#0C1719', fontWeight: 600, lineHeight: 1 }}>
            {testimonial.name}
          </p>
          {testimonial.title && (
            <p
              style={{
                fontSize: '14px',
                color: '#515F61',
                fontWeight: 500,
                lineHeight: 1,
                marginTop: '4px',
              }}
            >
              {testimonial.title}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
