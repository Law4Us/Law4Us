"use client";

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
      <LazySectionFade rootMargin="100px" fadeDuration={400} minHeight="600px">
        <ClaimTypesSection />
      </LazySectionFade>

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
