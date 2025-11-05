import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Eyebrow } from '../atoms/Badge';
import { Heading } from '../atoms/Heading';
import { Subtitle } from '../atoms/BodyText';

export interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

/**
 * SectionHeader component - Consistent pattern for section headers
 * Combines Eyebrow, Heading, and Subtitle in the standard layout
 *
 * @example
 * <SectionHeader
 *   eyebrow="התהליך שלנו"
 *   title="איך זה עובד?"
 *   subtitle="תהליך פשוט ומהיר לקבלת פיצוי"
 *   align="center"
 * />
 */
export const SectionHeader = React.memo<SectionHeaderProps>(
  ({ eyebrow, title, subtitle, align = 'center', className }) => {
    const alignStyles = {
      left: 'text-left items-start',
      center: 'text-center items-center',
      right: 'text-right items-end',
    };

    return (
      <div className={cn('flex flex-col gap-3 mb-12', alignStyles[align], className)}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <Heading as="h2" variant="section-title">
          {title}
        </Heading>
        {subtitle && <Subtitle className="max-w-2xl">{subtitle}</Subtitle>}
      </div>
    );
  }
);

SectionHeader.displayName = 'SectionHeader';
