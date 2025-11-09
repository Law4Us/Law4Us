'use client';

import * as React from 'react';
import { TYPOGRAPHY, CARD_STYLES } from '@/lib/constants/styles';
import { faqs as defaultFaqs } from '@/lib/data/home-data';

export type FAQItem = {
  question: string;
  answer: string;
};

type FAQSectionProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: FAQItem[];
};

export function FAQSection({
  eyebrow = 'שאלות ותשובות',
  title = 'יש לכם שאלות? יש לנו תשובות',
  subtitle = 'אספנו כאן את השאלות הנפוצות ביותר על התהליך והכל ברור, פשוט ושקוף, כדי שתוכלו לפעול בראש שקט.',
  items,
}: FAQSectionProps) {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);
  const data: FAQItem[] =
    items ??
    defaultFaqs.map((faq) => ({
      question: faq.q,
      answer: faq.a,
    }));

  return (
    <section className="py-12 md:py-16 lg:py-20" id="faq">
      <div className="max-w-[900px] mx-auto px-6">
        <div className="text-center mb-12">
          {/* Eyebrow */}
          <p
            className="mb-6"
            style={TYPOGRAPHY.eyebrow}
          >
            {eyebrow}
          </p>
          {/* H2 */}
          <h2
            className="text-[28px] sm:text-[36px] lg:text-[48px]"
            style={{
              ...TYPOGRAPHY.h2,
              fontSize: undefined
            }}
          >
            {title}
          </h2>
          {/* Subheader */}
          <p style={TYPOGRAPHY.subtitle}>
            {subtitle}
          </p>
        </div>

        <div className="space-y-4" dir="rtl">
          {data.map((faq, index) => (
            <div
              key={index}
              className="group"
              style={{
                ...CARD_STYLES.container,
                gap: 0,
                transition: 'all 0.3s ease-in-out',
                borderRight: '3px solid transparent',
                cursor: 'pointer',
              }}
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.borderRightColor = '#019FB7';
                e.currentTarget.style.transform = 'scale(1.005)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F9FAFB';
                e.currentTarget.style.borderRightColor = 'transparent';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <div
                className="w-full flex items-start justify-between gap-4 transition-colors"
                style={{ background: 'transparent', border: 'none' }}
              >
                <h3 style={TYPOGRAPHY.h3}>{faq.question}</h3>
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`flex-shrink-0 transition-transform duration-500 ease-in-out ${
                    openFaq === index ? "rotate-45" : ""
                  }`}
                  style={{ marginTop: '4px' }}
                >
                  <path d="M11 7V15M7 11H15M21 11C21 16.5228 16.5228 21 11 21C5.47715 21 1 16.5228 1 11C1 5.47715 5.47715 1 11 1C16.5228 1 21 5.47715 21 11Z" stroke="#515F61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div
                className="w-full overflow-hidden transition-all duration-500 ease-in-out"
                style={{
                  display: 'grid',
                  gridTemplateRows: openFaq === index ? '1fr' : '0fr',
                  opacity: openFaq === index ? 1 : 0,
                  marginTop: openFaq === index ? '24px' : '0',
                }}
              >
                <div style={{ minHeight: 0 }}>
                  <p style={TYPOGRAPHY.bodyLarge}>{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
