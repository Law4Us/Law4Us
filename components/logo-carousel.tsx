"use client";

import Image from "next/image";

const logos = [
  { src: "/logos/themarker.svg", alt: "TheMarker", width: 120, height: 40 },
  { src: "/logos/news1.svg", alt: "News1", width: 100, height: 40 },
  { src: "/logos/calcal.svg", alt: "כלכליסט", width: 110, height: 40 },
  { src: "/logos/duns.svg", alt: "Duns 100", width: 100, height: 40 },
];

export function LogoCarousel() {
  return (
    <div className="carousel-wrapper" dir="ltr">
      <ul className="carousel-track">
        {/* Triple the logos for seamless infinite scroll */}
        {[...logos, ...logos, ...logos].map((logo, index) => (
          <li key={`logo-${index}`} className="logo-item">
            <Image
              src={logo.src}
              alt={logo.alt}
              width={logo.width}
              height={logo.height}
            />
          </li>
        ))}
      </ul>

      <style jsx>{`
        .carousel-wrapper {
          display: flex;
          width: 100%;
          max-width: 900px;
          height: 60px;
          margin: 0 auto;
          place-items: center;
          overflow: hidden;
          mask-image: linear-gradient(
            to right,
            rgba(0, 0, 0, 0) 0%,
            rgb(0, 0, 0) 12.5%,
            rgb(0, 0, 0) 87.5%,
            rgba(0, 0, 0, 0) 100%
          );
          -webkit-mask-image: linear-gradient(
            to right,
            rgba(0, 0, 0, 0) 0%,
            rgb(0, 0, 0) 12.5%,
            rgb(0, 0, 0) 87.5%,
            rgba(0, 0, 0, 0) 100%
          );
        }

        .carousel-track {
          display: flex;
          gap: 64px;
          align-items: center;
          list-style: none;
          margin: 0;
          padding: 0;
          width: max-content;
          animation: scroll 30s linear infinite;
          will-change: transform;
        }

        .carousel-track:hover {
          animation-play-state: paused;
        }

        .logo-item {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.4;
          filter: grayscale(100%);
          transition: opacity 0.3s ease, filter 0.3s ease;
        }

        .logo-item:hover {
          opacity: 0.6;
          filter: grayscale(0%);
        }

        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% / 3));
          }
        }
      `}</style>
    </div>
  );
}
