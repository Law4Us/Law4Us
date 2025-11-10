"use client";

import { useEffect } from "react";
import { HomeBlogSection } from "@/components/home-blog-section";
import { LazySectionFade } from "@/components/ui/lazy-section";
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
  // Disable browser scroll restoration and ensure page starts at top
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
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
