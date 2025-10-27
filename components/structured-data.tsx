/**
 * Structured data (JSON-LD) for SEO
 * Helps search engines understand the content and context
 */

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    name: "Law4Us",
    alternateName: "Law4Us - שירותים משפטיים",
    url: "https://law4us.co.il",
    logo: "https://law4us.co.il/logo.png",
    description:
      "משרד עורכי דין המתמחה בגירושין ודיני משפחה. שירות מקצועי, שקוף ונגיש לכולם.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "רחוב הרצל 1",
      addressLocality: "תל אביב",
      addressCountry: "IL",
    },
    telephone: "+972-54-588-2736",
    email: "info@law4us.co.il",
    priceRange: "₪₪",
    areaServed: {
      "@type": "Country",
      name: "Israel",
    },
    founder: {
      "@type": "Person",
      name: "אריאל דרור",
      jobTitle: "עורך דין",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ServiceSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "גירושין ודיני משפחה",
    provider: {
      "@type": "LegalService",
      name: "Law4Us",
    },
    areaServed: {
      "@type": "Country",
      name: "Israel",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "שירותי גירושין",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "תביעת גירושין",
            description: "הגשת תביעת גירושין לבית המשפט לענייני משפחה",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "הסכם גירושין",
            description: "ניסוח והגשת הסכם גירושין מוסכם",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "משמורת ילדים",
            description: "ייצוג בהליכי משמורת וסידורי ראייה",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "מזונות",
            description: "תביעות למזונות ילדים ומזונות אישה/בעל",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "חלוקת רכוש",
            description: "חלוקת רכוש משותף בין בני זוג",
          },
        },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FAQSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "כמה זמן לוקח הליך גירושין?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "משך הליך הגירושין תלוי בסוג התביעה ובמידת ההסכמה בין הצדדים. גירושין בהסכמה יכולים להסתיים תוך 3-6 חודשים, בעוד שהליכים סכסוכיים עלולים להימשך שנה ומעלה.",
        },
      },
      {
        "@type": "Question",
        name: "מה עולה תביעת גירושין?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "עלות תביעת גירושין תלויה במורכבות העניין. השירות שלנו מתומחר ב-3,900 ₪ לכל סוג תביעה (גירושין, משמורת, מזונות, חלוקת רכוש, וכו').",
        },
      },
      {
        "@type": "Question",
        name: "האם חובה להתייצב בבית המשפט?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "כן, בדרך כלל נדרשת התייצבות אחת לפחות בבית המשפט. במקרים של גירושין בהסכמה, לעיתים ניתן להסתפק בהתייצבות אחת קצרה.",
        },
      },
      {
        "@type": "Question",
        name: "מה ההבדל בין גירושין בהסכמה לגירושין סכסוכיים?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "גירושין בהסכמה הם כאשר שני הצדדים מסכימים על כל התנאים (גירושין, משמורת, מזונות, רכוש). גירושין סכסוכיים הם כאשר אין הסכמה, והצדדים זקוקים להכרעת בית המשפט.",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbSchema({ items }: { items: Array<{ name: string; url: string }> }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
