'use client';

import { useEffect, useMemo, useState } from 'react';
import { Users, Award, TrendingUp, BookOpen } from 'lucide-react';
import { SlideInView } from '@/components/animations/slide-in-view';
import { CARD_STYLES, TYPOGRAPHY } from '@/lib/constants/styles';
import { animations } from '@/lib/utils/animations';

const iconMap = {
  users: Users,
  award: Award,
  trendingUp: TrendingUp,
  bookOpen: BookOpen,
} as const;

type IconKey = keyof typeof iconMap;

interface AboutStat {
  icon: IconKey;
  label: string;
  value: number;
  suffix?: string;
  description?: string;
  duration?: number;
}

interface StatsShowcaseProps {
  stats: ReadonlyArray<AboutStat>;
}

function useReducedMotionPreference() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return reducedMotion;
}

function useCountUp(target: number, duration: number, reducedMotion: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (reducedMotion) {
      setValue(target);
      return;
    }

    let animationFrame: number;
    const start = performance.now();

    const animate = (time: number) => {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration, reducedMotion]);

  return value;
}

export function StatsShowcase({ stats }: StatsShowcaseProps) {
  const reducedMotion = useReducedMotionPreference();

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => (
        <SlideInView key={stat.label} direction="up" delay={index * 120}>
          <StatCard stat={stat} reducedMotion={reducedMotion} />
        </SlideInView>
      ))}
    </div>
  );
}

interface StatCardProps {
  stat: AboutStat;
  reducedMotion: boolean;
}

function StatCard({ stat, reducedMotion }: StatCardProps) {
  const { icon, value, suffix = '', label, description, duration = 1600 } = stat;
  const currentValue = useCountUp(value, duration, reducedMotion);
  const Icon = iconMap[icon] ?? Users;

  const formattedValue = useMemo(() => {
    return `${currentValue.toLocaleString('he-IL')}${suffix}`;
  }, [currentValue, suffix]);

  return (
    <div
      style={{
        ...CARD_STYLES.container,
        width: '100%',
        padding: '24px',
      }}
      className={`h-full ${animations.cardHover}`}
    >
      <div style={CARD_STYLES.iconCircle} className={`${animations.iconCircleHover} mb-1`}>
        <Icon className="w-6 h-6 text-primary" aria-hidden />
      </div>
      <div className="w-full space-y-4 text-right">
        <div className="space-y-5">
          <div
            className="text-[42px] font-bold leading-none text-primary"
            aria-live="polite"
            aria-label={`${label}: ${formattedValue}`}
          >
            {formattedValue}
          </div>
          <p style={{ ...TYPOGRAPHY.h3, margin: 0 }}>{label}</p>
        </div>
        {description && (
          <p style={{ ...TYPOGRAPHY.bodyLarge, margin: 0 }} className="text-neutral-700">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
