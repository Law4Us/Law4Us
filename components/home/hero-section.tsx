'use client';

import Link from 'next/link';
import { LogoCarousel } from '@/components/logo-carousel';
import { MagneticButton } from '@/components/atoms/MagneticButton';
import { TYPOGRAPHY, CTA_STYLES } from '@/lib/constants/styles';
import { animations } from '@/lib/utils/animations';
import { colors } from '@/lib/design-tokens/colors';
import { spacing } from '@/lib/design-tokens/spacing';

export function HeroSection() {
  return (
    <section className="relative pt-24 pb-12 md:pt-32 md:pb-16 lg:pb-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 text-center">
        {/* Badge/Tag with animated shimmer */}
        <div
          className="inline-flex items-center mb-8 badge-shimmer"
          style={{
            backgroundColor: colors.neutral.white,
            paddingLeft: spacing[3],
            paddingRight: spacing[3],
            paddingTop: spacing[2],
            paddingBottom: spacing[2]
          }}
        >
          <span style={TYPOGRAPHY.bannerText}>
            הדרך <span style={{ color: colors.brand.primary.DEFAULT }}>הטובה ביותר</span> לפתרון בהליך הגירושין
          </span>
        </div>

        {/* Main Heading - Responsive: 36px mobile, 52px tablet, 80px desktop */}
        <h1
          className="mb-6 text-[36px] sm:text-[52px] lg:text-[80px]"
          style={{
            ...TYPOGRAPHY.heroH1,
            fontSize: undefined, // Override to use responsive classes
          }}
        >
          פתיחת תיק גירושין <span style={{ color: colors.brand.primary.DEFAULT }}>אונליין</span> מנוהל
          <br className="hidden sm:block" />
          <span className="sm:hidden"> </span>
          על ידי עורכי דין מנוסים ובמחיר הוגן
        </h1>

        {/* Subtitle - Responsive: 18px mobile, 20px tablet, 24px desktop */}
        <p
          className="mb-8 sm:mb-10 max-w-3xl mx-auto text-[18px] sm:text-[20px] lg:text-[24px]"
          style={{
            ...TYPOGRAPHY.heroSubtitle,
            fontSize: undefined, // Override to use responsive classes
          }}
        >
          שירות נגיש ואמין מבית עורכי דין מנוסים, בקלות ובשקיפות מלאה. כל
          התהליך מתבצע אונליין, בלי פשרות ובעלות שכל אחד יכול להרשות לעצמו.
        </p>

        {/* CTA Buttons - Full width on mobile, side-by-side on tablet+ */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-10 sm:mb-12 max-w-2xl mx-auto">
          <Link
            href="/divorce"
            className={`w-full sm:w-auto inline-flex items-center justify-center touch-target ${animations.secondaryCTAHover}`}
            style={CTA_STYLES.secondary}
          >
            מהו הליך הגירושין?
          </Link>
          <MagneticButton
            href="/wizard"
            className={`w-full sm:w-auto inline-flex items-center justify-center touch-target ${animations.primaryCTAHover}`}
            style={CTA_STYLES.main}
            magneticStrength={0.2}
            magneticDistance={100}
            rippleColor="rgba(255, 255, 255, 0.3)"
          >
            התחילו בהליך גירושין
          </MagneticButton>
        </div>

        {/* Press Logos */}
        <div className="text-center">
          <p
            className="mb-6"
            style={{
              ...TYPOGRAPHY.eyebrow,
              color: colors.brand.primary.DEFAULT
            }}
          >
            כתבו עלינו
          </p>
          <LogoCarousel />
        </div>
      </div>
    </section>
  );
}
