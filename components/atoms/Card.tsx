import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'small' | 'medium' | 'large';
  shadow?: boolean;
  children: React.ReactNode;
}

/**
 * Card component for content containers
 * Uses design system shadow, radius, and spacing tokens
 *
 * @example
 * <Card>
 *   <h3>Card Title</h3>
 *   <p>Card content</p>
 * </Card>
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    { padding = 'medium', shadow = true, className, children, ...props },
    ref
  ) => {
    const baseStyles = 'bg-neutral-100 rounded-card';

    const paddingStyles = {
      none: '',
      small: 'p-4',
      medium: 'p-6',
      large: 'p-8',
    };

    const shadowStyles = shadow ? 'shadow-card' : '';

    return (
      <div
        ref={ref}
        className={cn(baseStyles, paddingStyles[padding], shadowStyles, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
