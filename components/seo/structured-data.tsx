import Script from "next/script";
import { faqs, testimonials } from "@/lib/data/home-data";

export function StructuredData() {
  // Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    "@id": "https://law-4-us.co.il/#organization",
    name: "Law4Us - עורכי דין אונליין",
    alternateName: "Law4Us",
    url: "https://law-4-us.co.il",
    logo: "https://law-4-us.co.il/law4uslogo-blac.svg",
    image: "https://law-4-us.co.il/og-image.png",
    description:
      "פלטפורמה דיגיטלית להכנת תביעות משפחה: תביעת גירושין, רכושית, משמורת ילדים, מזונות והסכם גירושין. שירות מהיר, שקוף ומקצועי במחיר הוגן.",
    foundingDate: "2025",
    founder: {
      "@type": "Person",
      name: "עו\"ד אריאל דרור",
      jobTitle: "עורך דין, מומחה לדיני משפחה",
    },
    telephone: "+972-3-6951408",
    email: "info@law-4-us.co.il",
    address: {
      "@type": "PostalAddress",
      streetAddress: "ברקוביץ 4, מגדל המוזיאון, קומה שישית",
      addressLocality: "תל אביב",
      addressCountry: "IL",
    },
    areaServed: {
      "@type": "Country",
      name: "ישראל",
    },
    priceRange: "$$",
    knowsLanguage: ["he"],
  };

  // LocalBusiness Schema
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "Attorney",
    "@id": "https://law-4-us.co.il/#localbusiness",
    name: "Law4Us - עורכי דין לדיני משפחה",
    url: "https://law-4-us.co.il",
    logo: "https://law-4-us.co.il/law4uslogo-blac.svg",
    image: "https://law-4-us.co.il/og-image.png",
    telephone: "+972-3-6951408",
    email: "info@law-4-us.co.il",
    address: {
      "@type": "PostalAddress",
      streetAddress: "ברקוביץ 4, מגדל המוזיאון, קומה שישית",
      addressLocality: "תל אביב",
      addressCountry: "IL",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "32.0853",
      longitude: "34.7818",
    },
    priceRange: "$$",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5.0",
      reviewCount: "8",
      bestRating: "5",
      worstRating: "1",
    },
  };

  // FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  // Service Schemas - 5 legal services
  const servicesSchema = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      serviceType: "תביעת מזונות וכתב הגנה",
      provider: {
        "@id": "https://law-4-us.co.il/#organization",
      },
      description: "תביעה לקביעת תשלום מזונות לילדים בעת פרידה בין ההורים.",
      areaServed: {
        "@type": "Country",
        name: "ישראל",
      },
      availableChannel: {
        "@type": "ServiceChannel",
        serviceUrl: "https://law-4-us.co.il/wizard",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      serviceType: "תביעת רכושית וכתב הגנה",
      provider: {
        "@id": "https://law-4-us.co.il/#organization",
      },
      description: "תביעה רכושית עוסקת בחלוקת הרכוש בין בני זוג עם סיום הקשר.",
      areaServed: {
        "@type": "Country",
        name: "ישראל",
      },
      availableChannel: {
        "@type": "ServiceChannel",
        serviceUrl: "https://law-4-us.co.il/wizard",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      serviceType: "תביעת משמורת ילדים וכתב הגנה",
      provider: {
        "@id": "https://law-4-us.co.il/#organization",
      },
      description: "תביעה לקביעת מקום מגורי הילדים והסדרי השהות לאחר פרידה.",
      areaServed: {
        "@type": "Country",
        name: "ישראל",
      },
      availableChannel: {
        "@type": "ServiceChannel",
        serviceUrl: "https://law-4-us.co.il/wizard",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      serviceType: "תביעת גירושין",
      provider: {
        "@id": "https://law-4-us.co.il/#organization",
      },
      description: "תביעה לסיום הנישואין המוגשת לבית הדין הרבני.",
      areaServed: {
        "@type": "Country",
        name: "ישראל",
      },
      availableChannel: {
        "@type": "ServiceChannel",
        serviceUrl: "https://law-4-us.co.il/wizard",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      serviceType: "הסכם גירושין",
      provider: {
        "@id": "https://law-4-us.co.il/#organization",
      },
      description:
        "הסכם המסדיר את כלל ההיבטים של הפרידה בהסכמה בין בני הזוג.",
      areaServed: {
        "@type": "Country",
        name: "ישראל",
      },
      availableChannel: {
        "@type": "ServiceChannel",
        serviceUrl: "https://law-4-us.co.il/wizard",
      },
    },
  ];

  // Reviews Schema
  const allTestimonials = [
    ...testimonials.right,
    ...testimonials.middle,
    ...testimonials.left,
  ];

  const reviewsSchema = allTestimonials
    .filter((t) => t.text && t.name)
    .map((testimonial, index) => ({
      "@context": "https://schema.org",
      "@type": "Review",
      "@id": `https://law-4-us.co.il/#review-${index}`,
      itemReviewed: {
        "@id": "https://law-4-us.co.il/#organization",
      },
      author: {
        "@type": "Person",
        name: testimonial.name,
        ...(testimonial.title && { jobTitle: testimonial.title }),
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: "5",
        bestRating: "5",
        worstRating: "1",
      },
      reviewBody: testimonial.text,
      inLanguage: "he",
    }));

  return (
    <>
      {/* Organization Schema */}
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />

      {/* LocalBusiness/Attorney Schema */}
      <Script
        id="local-business-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />

      {/* FAQ Schema */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />

      {/* Service Schemas */}
      {servicesSchema.map((service, index) => (
        <Script
          key={`service-schema-${index}`}
          id={`service-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(service),
          }}
        />
      ))}

      {/* Reviews Schemas */}
      {reviewsSchema.map((review, index) => (
        <Script
          key={`review-schema-${index}`}
          id={`review-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(review),
          }}
        />
      ))}
    </>
  );
}
