'use client';

import Image from 'next/image';
import { MagneticButton } from '@/components/atoms/MagneticButton';
import { TYPOGRAPHY, CTA_STYLES } from '@/lib/constants/styles';
import { animations } from '@/lib/utils/animations';

export function CTASection() {
  return (
    <section className="py-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <div
          className="rounded-3xl overflow-hidden flex flex-col md:flex-row items-stretch relative"
          style={{
            background: 'linear-gradient(90deg, #5AB9C9 0%, #A8D5DE 100%)',
            backgroundColor: 'rgba(1, 159, 183, 0.4)',
            border: '1px solid #019FB7',
            minHeight: '500px',
          }}
        >
          {/* Content on the right (first in DOM for RTL) - 40% width */}
          <div className="w-full md:w-2/5 px-8 md:px-12 py-12 flex flex-col justify-center items-start z-10">
            {/* White badge */}
            <div
              className="inline-block mb-6 px-4 py-2 rounded-lg"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                width: 'fit-content',
              }}
            >
              <p style={TYPOGRAPHY.eyebrow}>
                הדרך הקלה והמהירה ביותר לפתרון בתהליך גירושין
              </p>
            </div>

            {/* Main heading */}
            <h2 style={{
              fontSize: '48px',
              fontWeight: 'bold',
              lineHeight: '110%',
              letterSpacing: '-0.04em',
              color: '#0C1719',
              marginBottom: '24px',
              textAlign: 'right',
            }}>
              מוכנים לקחת את<br />הצעד הבא?
            </h2>

            {/* Subtext */}
            <p style={{
              fontSize: '20px',
              fontWeight: 500,
              lineHeight: '140%',
              letterSpacing: '-0.02em',
              color: '#0C1719',
              marginBottom: '32px',
              textAlign: 'right',
            }}>
              צעד אחד פשוט יתחיל את התהליך – בליווי עורכי דין מנוסים, בצורה דיגיטלית ישלה ובטיחה, בלי עינויבים ובלי סיבוכים.
            </p>

            {/* CTA Button */}
            <MagneticButton
              href="/wizard"
              className={animations.primaryCTAHover}
              style={{
                ...CTA_STYLES.main,
                display: 'inline-block',
                textDecoration: 'none',
                width: 'fit-content',
              }}
              magneticStrength={0.2}
              magneticDistance={100}
              rippleColor="rgba(255, 255, 255, 0.3)"
            >
              התחילו בתהליך גירושין
            </MagneticButton>
          </div>

          {/* Image on the left (second in DOM for RTL) - 60% width */}
          <div className="w-full md:w-3/5 relative overflow-hidden" style={{ minHeight: '500px', height: '100%' }}>
            {/* Decorative SVG boxes behind lawyer - positioned to appear cut off at top and bottom */}
            <svg
              className="absolute"
              style={{
                left: '-50px',
                top: '-100px',
                width: '366px',
                height: '700px',
                zIndex: 0,
              }}
              viewBox="0 0 366 580"
              fill="none"
              preserveAspectRatio="xMidYMid slice"
            >
              <rect width="566.029" height="152" transform="translate(139.309) rotate(66.4205)" fill="#9FD7E0"/>
            </svg>

            <svg
              className="absolute"
              style={{
                left: '180px',
                top: '-100px',
                width: '366px',
                height: '700px',
                zIndex: 0,
              }}
              viewBox="0 0 366 580"
              fill="none"
              preserveAspectRatio="xMidYMid slice"
            >
              <rect width="566.029" height="152" transform="translate(139.309) rotate(66.4205)" fill="#9FD7E0"/>
            </svg>

            {/* Lawyer image - positioned at bottom with 100% width */}
            <div className="absolute inset-0 flex items-end justify-center" style={{ zIndex: 1 }}>
              <Image
                src="/lawyer.png"
                alt="עורך דין אריאל דרור"
                width={1200}
                height={800}
                className="object-contain object-bottom"
                style={{
                  height: '100%',
                  width: '100%',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
