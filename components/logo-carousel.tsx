import Image from "next/image";

const logos = [
  { src: "/logos/themarker.svg", alt: "TheMarker", width: 120, height: 40 },
  { src: "/logos/news1.svg", alt: "News1", width: 100, height: 40 },
  { src: "/logos/calcal.svg", alt: "כלכליסט", width: 110, height: 40 },
  { src: "/logos/duns.svg", alt: "Duns 100", width: 100, height: 40 },
];

const repeatedLogos = Array.from({ length: 3 }).flatMap(() => logos);

export function LogoCarousel() {
  const baseLogoCount = logos.length;

  return (
    <div
      className="carousel-wrapper"
      dir="ltr"
      role="region"
      aria-label="לוגואים של גופי מדיה שסיקרו אותנו"
    >
      <ul className="carousel-track">
        {repeatedLogos.map((logo, index) => (
          <li
            key={`logo-${index}-${logo.alt}`}
            className="logo-item"
            aria-hidden={index >= baseLogoCount}
          >
            <Image
              src={logo.src}
              alt={logo.alt}
              width={logo.width}
              height={logo.height}
              priority={index < baseLogoCount}
              sizes="(max-width: 768px) 33vw, 120px"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
