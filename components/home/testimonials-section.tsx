'use client';

import Image from 'next/image';
import { TYPOGRAPHY, CARD_STYLES } from '@/lib/constants/styles';
import { SlideInView } from '@/components/animations/slide-in-view';
import { testimonials } from '@/lib/data/home-data';

export function TestimonialsSection() {
  return (
    <section className="py-12 md:py-16 lg:py-20" id="testimonials">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-12">
          {/* Eyebrow */}
          <p
            className="mb-6"
            style={TYPOGRAPHY.eyebrow}
          >
            לקוחות מספרים
          </p>
          {/* H2 */}
          <h2
            className="text-[28px] sm:text-[36px] lg:text-[48px]"
            style={{
              ...TYPOGRAPHY.h2,
              fontSize: undefined
            }}
          >
            סיפורי הצלחה ממי שכבר עברו את הדרך
          </h2>
          {/* Subheader */}
          <p style={TYPOGRAPHY.subtitle}>
            מכתבים וחוויות של לקוחות אמיתיים שליווינו לאורך כל הדרך – כדי שתוכלו לדעת בדיוק למה לצפות, ולמה אפשר לסמוך עלינו.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Right Column (appears on visual right in RTL) */}
          <div className="flex-1 space-y-6">
            {testimonials.right.map((testimonial, index) => (
              <SlideInView key={index} delay={index * 150} direction="up" duration={600}>
                <div style={CARD_STYLES.container}>
                  <p style={{...TYPOGRAPHY.bodyLarge, lineHeight: '1.6'}}>
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-3">
                    {testimonial.avatar && (
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    )}
                    <div className="text-right">
                      <p style={TYPOGRAPHY.testimonialName}>
                        {testimonial.name}
                      </p>
                      {testimonial.title && (
                        <p style={{...TYPOGRAPHY.testimonialTitle, marginTop: '4px'}}>
                          {testimonial.title}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </SlideInView>
            ))}
          </div>

          {/* Middle Column */}
          <div className="flex-1 space-y-6">
            {testimonials.middle.map((testimonial, index) => (
              <SlideInView key={index} delay={100 + index * 150} direction="up" duration={600}>
                <div style={CARD_STYLES.container}>
                  <p style={{...TYPOGRAPHY.bodyLarge, lineHeight: '1.6'}}>
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-3">
                    {testimonial.avatar && (
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    )}
                    <div className="text-right">
                      <p style={TYPOGRAPHY.testimonialName}>
                        {testimonial.name}
                      </p>
                      {testimonial.title && (
                        <p style={{...TYPOGRAPHY.testimonialTitle, marginTop: '4px'}}>
                          {testimonial.title}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </SlideInView>
            ))}
          </div>

          {/* Left Column (appears on visual left in RTL) */}
          <div className="flex-1 space-y-6">
            {testimonials.left.map((testimonial, index) => (
              <SlideInView key={index} delay={200 + index * 150} direction="up" duration={600}>
                <div style={CARD_STYLES.container}>
                  <p style={{...TYPOGRAPHY.bodyLarge, lineHeight: '1.6'}}>
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-3">
                    {testimonial.avatar && (
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    )}
                    <div className="text-right">
                      <p style={TYPOGRAPHY.testimonialName}>
                        {testimonial.name}
                      </p>
                      {testimonial.title && (
                        <p style={{...TYPOGRAPHY.testimonialTitle, marginTop: '4px'}}>
                          {testimonial.title}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </SlideInView>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
