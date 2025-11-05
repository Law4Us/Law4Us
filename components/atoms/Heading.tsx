import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  variant?: 'display-xl' | 'display-lg' | 'display' | 'h1' | 'h2' | 'h3' | 'h4' | 'hero-h1' | 'section-title';
  children: React.ReactNode;
}

/**
 * Heading component with semantic HTML and design system typography
 *
 * @example
 * <Heading as="h1" variant="hero-h1">כותרת ראשית</Heading>
 * <Heading as="h2" variant="section-title">כותרת מקטע</Heading>
 */
export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ as: Component = 'h2', variant, className, children, ...props }, ref) => {
    // Default variant based on the HTML element if not specified
    const defaultVariant = variant || (Component === 'h1' ? 'h1' : Component === 'h3' ? 'h3' : 'h2');

    const variantStyles = {
      'display-xl': 'text-display-xl text-neutral-900',
      'display-lg': 'text-display-lg text-neutral-900',
      display: 'text-display text-neutral-900',
      h1: 'text-h1 text-neutral-900',
      h2: 'text-h2 text-neutral-900',
      h3: 'text-h3 text-neutral-900',
      h4: 'text-h4 text-neutral-900',
      'hero-h1': 'text-hero-h1 text-neutral-900',
      'section-title': 'text-section-title text-neutral-900',
    };

    return (
      <Component
        ref={ref}
        className={cn(variantStyles[defaultVariant], className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Heading.displayName = 'Heading';
