import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface BodyTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'body-xl' | 'body-lg' | 'body' | 'body-sm' | 'caption';
  color?: 'primary' | 'secondary' | 'tertiary' | 'brand';
  as?: 'p' | 'span' | 'div';
  children: React.ReactNode;
}

/**
 * BodyText component for consistent body text styling
 *
 * @example
 * <BodyText variant="body-lg">טקסט גדול</BodyText>
 * <BodyText color="secondary">טקסט משני</BodyText>
 */
export const BodyText = React.forwardRef<HTMLParagraphElement, BodyTextProps>(
  (
    {
      variant = 'body',
      color = 'primary',
      as: Component = 'p',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      'body-xl': 'text-body-xl',
      'body-lg': 'text-body-lg',
      body: 'text-body',
      'body-sm': 'text-body-sm',
      caption: 'text-caption',
    };

    const colorStyles = {
      primary: 'text-neutral-900',
      secondary: 'text-neutral-700',
      tertiary: 'text-neutral-500',
      brand: 'text-primary',
    };

    return (
      <Component
        ref={ref}
        className={cn(variantStyles[variant], colorStyles[color], className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

BodyText.displayName = 'BodyText';

// Subtitle alias for section subtitles
export const Subtitle: React.FC<Omit<BodyTextProps, 'variant'>> = (props) => (
  <BodyText variant="body-xl" color="secondary" {...props} />
);
