import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  background?: 'primary' | 'secondary' | 'tertiary' | 'white';
  container?: boolean;
  children: React.ReactNode;
}

/**
 * Section wrapper component for consistent section styling
 * Provides consistent padding and container width
 *
 * @example
 * <Section background="secondary" container>
 *   <SectionHeader ... />
 *   <div>Content</div>
 * </Section>
 */
export const Section = React.forwardRef<HTMLElement, SectionProps>(
  (
    { background = 'secondary', container = true, className, children, ...props },
    ref
  ) => {
    const backgroundStyles = {
      primary: 'bg-white',
      secondary: 'bg-neutral-200',
      tertiary: 'bg-neutral-100',
      white: 'bg-white',
    };

    const containerStyles = container ? 'max-w-container mx-auto px-6' : '';

    return (
      <section
        ref={ref}
        className={cn('py-20', backgroundStyles[background], className)}
        {...props}
      >
        <div className={containerStyles}>{children}</div>
      </section>
    );
  }
);

Section.displayName = 'Section';
