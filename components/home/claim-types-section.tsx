'use client';

import * as React from 'react';
import { MagneticButton } from '@/components/atoms/MagneticButton';
import { TYPOGRAPHY, CTA_STYLES, CARD_STYLES } from '@/lib/constants/styles';
import { animations } from '@/lib/utils/animations';
import { claimTabs } from '@/lib/data/home-data';
import { claimIcons } from './claim-icons';

export function ClaimTypesSection() {
  const [selectedClaimTab, setSelectedClaimTab] = React.useState(0);
  const [fadeKey, setFadeKey] = React.useState(0);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const isInitialMount = React.useRef(true);

  // Trigger fade animation when tab changes
  React.useEffect(() => {
    setFadeKey(prev => prev + 1);
  }, [selectedClaimTab]);

  // Auto-scroll to selected tab on mobile (skip on initial mount)
  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (scrollContainerRef.current) {
      const buttons = scrollContainerRef.current.querySelectorAll('button');
      const selectedButton = buttons[selectedClaimTab];
      if (selectedButton) {
        selectedButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedClaimTab]);

  return (
    <section className="py-12 md:py-16 lg:py-20" id="claim-types">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-12">
          {/* Eyebrow */}
          <p
            className="mb-6"
            style={TYPOGRAPHY.eyebrow}
          >
            סוגי תביעות
          </p>
          {/* H2 */}
          <h2
            className="text-[28px] sm:text-[36px] lg:text-[48px]"
            style={{
              ...TYPOGRAPHY.h2,
              fontSize: undefined
            }}
          >
            בחרו את סוג התביעה ואנחנו נלווה אתכם עד הסוף
          </h2>
          {/* Subheader */}
          <p style={TYPOGRAPHY.subtitle}>
            בין אם אתם זקוקים למזונות, רכוש, משמורת, יישוב סכסוך, או הסכם גירושין – אנחנו כאן כדי ללוות אותכם בתהליך מותאם אישית לצרכים שלכם
          </p>
        </div>

        {/* Horizontal Scrollable Tabs on Mobile, Grid Layout on Desktop */}
        <div className="lg:grid lg:grid-cols-2 gap-8 lg:gap-20">
          {/* Tabs - Horizontal scroll on mobile, vertical on desktop */}
          <div className="flex flex-col">
            {/* Horizontal scroll container for mobile */}
            <div
              ref={scrollContainerRef}
              className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible scrollbar-hide snap-x snap-mandatory lg:snap-none lg:flex-1"
              style={{
                gap: '8px',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {claimTabs.map((tab, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedClaimTab(index)}
                  className="flex-shrink-0 lg:flex-shrink snap-center px-4 lg:px-0 py-4 text-right lg:text-right transition-all relative group whitespace-nowrap lg:whitespace-normal text-[18px] lg:text-[24px]"
                  style={{
                    ...TYPOGRAPHY.h3,
                    fontSize: undefined,
                    backgroundColor: 'transparent',
                    color: selectedClaimTab === index ? '#019fb7' : '#0C1719',
                    borderBottom: '1px solid rgba(12, 23, 25, 0.1)',
                    paddingBottom: '16px',
                    position: 'relative',
                    minWidth: '140px',
                  }}
                >
                  {tab.title}
                  {/* Blue bottom border for selected tab */}
                  {selectedClaimTab === index && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        left: 0,
                        height: '3px',
                        width: '100%',
                        backgroundColor: '#019fb7',
                        animation: 'growFromRight 0.3s ease-out',
                        borderRadius: '2px 2px 0 0',
                      }}
                    />
                  )}
                  {/* Blue hover border */}
                  {selectedClaimTab !== index && (
                    <div
                      className="absolute bottom-0 right-0 left-0 h-[3px] w-0 bg-[#019fb7] group-hover:w-full transition-all duration-300 origin-right rounded-t-sm"
                      style={{
                        transitionProperty: 'width',
                        transitionTimingFunction: 'ease-out'
                      }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Scroll indicators for mobile - enhanced gradient hints */}
            <div className="lg:hidden relative">
              <div
                className="absolute left-0 top-0 w-16 h-full pointer-events-none z-10"
                style={{
                  background: 'linear-gradient(to left, transparent, rgba(238, 242, 243, 1))',
                  transform: 'translateY(-100%)',
                }}
              />
              <div
                className="absolute right-0 top-0 w-16 h-full pointer-events-none z-10"
                style={{
                  background: 'linear-gradient(to right, transparent, rgba(238, 242, 243, 1))',
                  transform: 'translateY(-100%)',
                }}
              />
              {/* Scroll hint text */}
              <p className="text-center text-xs text-gray-500 mt-2 mb-4">
                החליקו לעוד אפשרויות ←
              </p>
            </div>

            {/* Button under tabs - Desktop only */}
            <div className="mt-8 hidden lg:block">
              <MagneticButton
                href="/wizard"
                style={CTA_STYLES.main}
                className={`inline-flex items-center justify-center ${animations.primaryCTAHover}`}
                magneticStrength={0.2}
                magneticDistance={100}
                rippleColor="rgba(255, 255, 255, 0.3)"
              >
                התחילו בהליך גירושין
              </MagneticButton>
            </div>
          </div>

          {/* Content Area - SECOND in DOM = LEFT in RTL */}
          <div className="flex flex-col">
            <div
              key={fadeKey}
              className="text-right"
              style={{
                animation: 'fadeIn 300ms ease-out'
              }}
            >
              <h3
                style={{
                  fontSize: '32px',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  lineHeight: '1.3em',
                  color: '#0C1719',
                  marginBottom: '48px'
                }}
              >
                {claimTabs[selectedClaimTab].description}
              </h3>

              {/* FAQ Items */}
              <div className="space-y-6">
                {claimTabs[selectedClaimTab].questions.map((item, index) => {
                  const currentIcons = claimIcons[claimTabs[selectedClaimTab].id as keyof typeof claimIcons] || claimIcons.alimony;

                  return (
                    <div
                      key={index}
                      className="flex items-start gap-8"
                      style={{
                        animation: `fadeIn 300ms ease-out ${index * 50}ms both`
                      }}
                    >
                      <div style={CARD_STYLES.iconCircle} className={`flex-shrink-0 mt-1 ${animations.iconCircleHover}`}>
                        {currentIcons[index % 3]}
                      </div>
                      <div className="flex-1 text-right">
                        <h4 style={{...TYPOGRAPHY.h3, marginBottom: '8px'}}>
                          {item.q}
                        </h4>
                        <p style={TYPOGRAPHY.bodyLarge}>
                          {item.a}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Button after content - Mobile only */}
            <div className="mt-8 lg:hidden">
              <MagneticButton
                href="/wizard"
                style={CTA_STYLES.main}
                className={`inline-flex items-center justify-center ${animations.primaryCTAHover}`}
                magneticStrength={0.2}
                magneticDistance={100}
                rippleColor="rgba(255, 255, 255, 0.3)"
              >
                התחילו בהליך גירושין
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
