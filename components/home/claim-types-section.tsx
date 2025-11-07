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

  // Trigger fade animation when tab changes
  React.useEffect(() => {
    setFadeKey(prev => prev + 1);
  }, [selectedClaimTab]);

  return (
    <section className="py-20" id="claim-types">
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
          <h2 style={TYPOGRAPHY.h2}>
            בחרו את סוג התביעה ואנחנו נלווה אתכם עד הסוף
          </h2>
          {/* Subheader */}
          <p style={TYPOGRAPHY.subtitle}>
            בין אם אתם זקוקים למזונות, רכוש, משמורת, יישוב סכסוך, או הסכם גירושין – אנחנו כאן כדי ללוות אותכם בתהליך מותאם אישית לצרכים שלכם
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Vertical Tabs - FIRST in DOM = RIGHT in RTL */}
          <div className="flex flex-col">
            <div className="flex flex-col flex-1" style={{ gap: '16px' }}>
              {claimTabs.map((tab, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedClaimTab(index)}
                  className="px-0 py-4 text-right transition-all relative group"
                  style={{
                    ...TYPOGRAPHY.h3,
                    backgroundColor: 'transparent',
                    color: '#0C1719',
                    borderBottom: selectedClaimTab === index ? 'none' : '1px solid rgba(12, 23, 25, 0.1)',
                    paddingBottom: '16px',
                    position: 'relative'
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
                        height: '2px',
                        width: '100%',
                        backgroundColor: '#019fb7',
                        animation: 'growFromRight 0.3s ease-out'
                      }}
                    />
                  )}
                  {/* Blue hover border */}
                  {selectedClaimTab !== index && (
                    <div
                      className="absolute bottom-0 right-0 h-[2px] w-0 bg-[#019fb7] group-hover:w-full transition-all duration-300 origin-right"
                      style={{
                        transitionProperty: 'width',
                        transitionTimingFunction: 'ease-out'
                      }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Button under tabs */}
            <div className="mt-8">
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
          <div>
            <div
              key={fadeKey}
              className="text-right animate-fade-in"
              style={{
                animation: 'fadeIn 400ms ease-in-out'
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
                        animation: `fadeIn 400ms ease-in-out ${index * 80}ms both`
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
          </div>
        </div>
      </div>
    </section>
  );
}
