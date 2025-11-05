import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'eyebrow' | 'pill' | 'dot';
  children: React.ReactNode;
}

/**
 * Badge component for labels, tags, and eyebrow text
 *
 * @example
 * <Badge variant="eyebrow">התהליך שלנו</Badge>
 * <Badge variant="pill">חדש</Badge>
 */
export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ variant = 'eyebrow', className, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center';

    const variantStyles = {
      eyebrow: 'text-primary text-eyebrow',
      pill: 'bg-white/90 text-neutral-900 text-caption px-3 py-1.5 rounded-badge border border-neutral-300',
      dot: 'bg-primary text-white text-caption px-2 py-1 rounded-full',
    };

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

// Export Eyebrow as an alias for Badge with eyebrow variant
export const Eyebrow: React.FC<Omit<BadgeProps, 'variant'>> = (props) => (
  <Badge variant="eyebrow" {...props} />
);
