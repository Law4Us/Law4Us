import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
}

/**
 * Button component with design system variants
 *
 * @example
 * <Button variant="primary">Click me</Button>
 * <Button variant="secondary" size="small">Secondary</Button>
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'medium',
      fullWidth = false,
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold transition-all duration-300 ease-in-out active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed touch-target';

    const variantStyles = {
      primary:
        'bg-primary text-white border border-primary-dark hover:bg-primary-dark shadow-none',
      secondary:
        'bg-neutral-200 text-neutral-900 border border-primary-dark hover:bg-neutral-300 shadow-btn-secondary',
      ghost:
        'bg-transparent text-primary hover:bg-primary/10 border border-transparent',
    };

    const sizeStyles = {
      small: 'px-4 py-2 text-button-sm rounded-button',
      medium: 'px-8 py-4 text-button rounded-button',
      large: 'px-10 py-5 text-button rounded-button',
    };

    const widthStyles = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          widthStyles,
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
