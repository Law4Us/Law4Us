"use client";

import { useLayoutEffect } from "react";
import { HomeBlogSection } from "@/components/home-blog-section";
import { LazySectionFade } from "@/components/ui/lazy-section";
import { StructuredData } from "@/components/seo/structured-data";
import {
  HeroSection,
  VideoSection,
  HowItWorksSection,
  BenefitsSection,
  ClaimTypesSection,
  TestimonialsSection,
  CTASection,
  FAQSection,
  AboutSection,
} from "@/components/home";

export default function Home() {
  // Use layoutEffect to prevent scroll flash before paint
  useLayoutEffect(() => {
    // Store original scroll restoration setting
    const originalScrollRestoration = history.scrollRestoration;

    // Disable automatic scroll restoration for this page
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Scroll to top without smooth behavior (instant, no animation conflicts)
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // Cleanup: restore original behavior when component unmounts
    return () => {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = originalScrollRestoration;
      }
    };
  }, []);

  return (
    <>
      {/* SEO Structured Data */}
      <StructuredData />

      {/* Hero Section */}
      <HeroSection />

      {/* Video Section */}
      <VideoSection />

      {/* How It Works - 3 Steps */}
      <HowItWorksSection />

      {/* Benefits - 4 Cards */}
      <BenefitsSection />

      {/* Claim Types Section */}
      <ClaimTypesSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* CTA Section - Ready to Take the Next Step */}
      <CTASection />

      {/* FAQ Section */}
      <LazySectionFade rootMargin="300px" fadeDuration={600}>
        <FAQSection />
      </LazySectionFade>

      {/* About Section */}
      <LazySectionFade rootMargin="300px" fadeDuration={600}>
        <AboutSection />
      </LazySectionFade>

      {/* Blog Section */}
      <LazySectionFade rootMargin="300px" fadeDuration={600}>
        <HomeBlogSection />
      </LazySectionFade>
    </>
  );
}
