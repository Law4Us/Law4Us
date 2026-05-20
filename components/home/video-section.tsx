'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { useScrollProgress } from '@/lib/hooks/useScrollProgress';

const homepageVideoUrl = process.env.NEXT_PUBLIC_HOMEPAGE_VIDEO_URL;
const videoPoster = '/images/video overlay ariel-min.webp';

export function VideoSection() {
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoRef, videoProgress] = useScrollProgress({ start: 0.85, end: 0.3 });

  const handlePlay = () => {
    if (!homepageVideoUrl) {
      return;
    }

    setIsVideoLoaded(true);
    window.requestAnimationFrame(() => {
      void videoElementRef.current?.play();
    });
  };

  return (
    <section id="video">
      <div className="max-w-[900px] mx-auto px-6">
        <div className="relative">
          <div
            className="absolute top-1/2 left-1/2 rounded-xl"
            style={{
              width: '100%',
              maxWidth: '1028px',
              aspectRatio: '2.04237',
              border: '1px solid rgba(12, 23, 25, 0.1)',
              transform: 'translate(-50%, -50%) scale(1.11)',
              zIndex: 0,
            }}
          />

          <div
            ref={videoRef}
            className="relative w-full group rounded-xl"
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
            {isVideoLoaded && homepageVideoUrl ? (
              <video
                ref={videoElementRef}
                className="h-full w-full object-cover"
                controls
                playsInline
                preload="metadata"
                poster={videoPoster}
                aria-label="עו״ד אריאל דרור - איך מתחילים הליך גירושין"
              >
                <source src={homepageVideoUrl} type="video/mp4" />
              </video>
            ) : (
              <>
                <Image
                  src={videoPoster}
                  alt="עו״ד אריאל דרור - איך מתחילים הליך גירושין"
                  fill
                  className="object-cover"
                  priority
                />

                <button
                  type="button"
                  className="absolute inset-0 z-20 flex items-center justify-center cursor-pointer disabled:cursor-default"
                  onClick={handlePlay}
                  disabled={!homepageVideoUrl}
                  aria-label="נגן סרטון הסבר"
                >
                  <span
                    className="rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                    style={{
                      width: '80px',
                      height: '80px',
                      backgroundColor: '#019FB7',
                      border: '3px solid rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <span className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-1" />
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
