import React from 'react';
import { cn } from '@/lib/utils/cn';
import { animations } from '@/lib/utils/animations';

export interface IconCircleProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

/**
 * IconCircle component for displaying icons in circular containers
 * Uses design system shadow and sizing tokens
 *
 * @example
 * <IconCircle>
 *   <svg>...</svg>
 * </IconCircle>
 */
export const IconCircle = React.forwardRef<HTMLDivElement, IconCircleProps>(
  ({ size = 'medium', className, children, ...props }, ref) => {
    const baseStyles = cn(
      'flex items-center justify-center bg-neutral-100 rounded-full shadow-icon-circle',
      animations.iconCircleHover
    );

    const sizeStyles = {
      small: 'w-8 h-8',
      medium: 'w-12 h-12',
      large: 'w-16 h-16',
    };

    return (
      <div
        ref={ref}
        className={cn(baseStyles, sizeStyles[size], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

IconCircle.displayName = 'IconCircle';
