'use client';

import Image from 'next/image';
import { useScrollProgress } from '@/lib/hooks/useScrollProgress';

export function VideoSection() {
  // Scroll-linked animation for video section
  const [videoRef, videoProgress] = useScrollProgress({ start: 0.85, end: 0.3 });

  return (
    <section id="video">
      <div className="max-w-[900px] mx-auto px-6">
        {/* Container for video and decorative border */}
        <div className="relative">
          {/* Decorative border background */}
          <div
            className="absolute top-1/2 left-1/2 rounded-xl"
            style={{
              width: '100%',
              maxWidth: '1028px',
              aspectRatio: '2.04237',
              border: '1px solid rgba(12, 23, 25, 0.1)',
              transform: `translate(-50%, -50%) scale(${0.95 + (videoProgress * 0.05)})`,
              zIndex: 0,
              transition: 'transform 0.1s ease-out',
            }}
          />

          {/* Video container with shadows and stroke - scroll-linked reveal */}
          <div
            ref={videoRef}
            className="relative w-full cursor-pointer group rounded-xl"
            style={{
              aspectRatio: '900 / 540',
              border: '1px solid #C7CFD1',
              boxShadow: `
                0 10px 20px 5px rgba(12, 23, 25, 0.05),
                0 0 0 6px rgba(213, 219, 220, 0.25),
                0 0 0 12px rgba(213, 219, 220, 0.25)
              `,
              overflow: 'hidden',
              zIndex: 1,
              position: 'relative',
              transform: `scale(${0.95 + (videoProgress * 0.05)})`,
              opacity: Math.min(1, 0.6 + (videoProgress * 0.8)),
              transition: 'transform 0.1s ease-out, opacity 0.1s ease-out',
            }}
          >
            {/* Video thumbnail */}
            <Image
              src="/images/video overlay ariel-min.webp"
              alt="עו״ד אריאל דרור - איך מתחילים הליך גירושין"
              fill
              className="object-cover"
              priority
            />

            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div
                className="rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#019FB7',
                  border: '3px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-1"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
