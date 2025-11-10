import { Metadata } from "next";
import { Badge } from "@/components/atoms/Badge";
import { MagneticButton } from "@/components/atoms/MagneticButton";
import { SlideInView } from "@/components/animations/slide-in-view";
import { LazySectionFade } from "@/components/ui/lazy-section";
import { BlogListing } from "@/components/blog/blog-listing";
import { getCategories } from "@/lib/sanity/queries";
import { getPaginatedPosts } from "@/lib/sanity/actions";
import { TYPOGRAPHY, CARD_STYLES, CTA_STYLES } from "@/lib/constants/styles";
import { animations } from "@/lib/utils/animations";

export const metadata: Metadata = {
  title: "בלוג | Law4Us - מאמרים בנושאי משפחה",
  description:
    "מאמרים מקצועיים בנושאי משפט משפחה: גירושין, משמורת, מזונות, רכוש משותף ועוד. מאת עו\"ד אריאל דרור",
  openGraph: {
    title: "בלוג Law4Us - מאמרים בנושאי משפט משפחה",
    description:
      "מאמרים מקצועיים בנושאי משפט משפחה: גירושין, משמורת, מזונות, רכוש משותף ועוד",
    type: "website",
  },
};

// Revalidate every hour (ISR - Incremental Static Regeneration)
export const revalidate = 3600;

export default async function BlogPage() {
  const { posts, hasMore, nextCursor } = await getPaginatedPosts(0, 12);
  const categories = await getCategories();

  const totalPosts = categories.reduce((sum, cat) => sum + cat.count, 0);

  const heroStats = [
    {
      label: "מאמרים זמינים",
      value: totalPosts,
      description: "תובנות עדכניות שמבוססות על תיקים אמיתיים וניסיון שטח.",
    },
    {
      label: "קטגוריות תוכן",
      value: categories.length,
      description: "מזונות, משמורת, רכוש, גישור, תביעות יישוב סכסוך ועוד.",
    },
    {
      label: "נכתב על ידי",
      value: "עו\"ד אריאל דרור",
      description: "עורך דין ומגשר מומחה בדיני משפחה עם 15+ שנות ניסיון.",
    },
  ] as const;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "בלוג Law4Us - מאמרים בנושאי משפט משפחה",
    description:
      "מאמרים מקצועיים בנושאי משפט משפחה: גירושין, משמורת, מזונות, רכוש משותף ועוד",
    url: "https://law4us.co.il/blog",
    publisher: {
      "@type": "Organization",
      name: "Law4Us",
      url: "https://law4us.co.il",
      logo: {
        "@type": "ImageObject",
        url: "https://law4us.co.il/law4uslogo-blac.svg",
      },
    },
    inLanguage: "he",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <LazySectionFade rootMargin="300px" fadeDuration={600}>
        <section className="pt-8 md:pt-20 pb-20">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid gap-12 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
              <SlideInView direction="up">
                <div className="space-y-6 text-right">
                  <p
                    style={{
                      color: '#019FB7',
                      fontSize: '16px',
                      fontWeight: 600,
                      lineHeight: '100%',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    הבלוג שלנו
                  </p>
                  <h1
                    className="text-[36px] sm:text-[52px] lg:text-[72px]"
                    style={{
                      ...TYPOGRAPHY.heroH1,
                      fontSize: undefined,
                      margin: 0,
                    }}
                  >
                    ידע משפטי{" "}
                    <span style={{ color: "#019FB7" }}>בשפה פשוטה</span>
                    <br />
                    שיעשה לכם סדר
                  </h1>
                  <p
                    className="max-w-3xl text-[18px] sm:text-[20px] lg:text-[24px]"
                    style={{
                      ...TYPOGRAPHY.heroSubtitle,
                      fontSize: undefined,
                    }}
                  >
                    מאמרים, מדריכים וסיפורי הצלחה שמסייעים להבין את הזכויות,
                    להיערך לתהליך, ולגבש אסטרטגיה משפטית ורגשית מנצחת.
                  </p>

                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-start">
                    <MagneticButton
                      href="/wizard"
                      style={CTA_STYLES.main}
                      className={`inline-flex items-center justify-center sm:w-auto ${animations.primaryCTAHover}`}
                      magneticStrength={0.18}
                      magneticDistance={110}
                      rippleColor="rgba(255, 255, 255, 0.3)"
                    >
                      התחילו תהליך אונליין
                    </MagneticButton>
                    <MagneticButton
                      href="/about"
                      style={{ ...CTA_STYLES.secondary, boxShadow: "none" }}
                      className={`inline-flex items-center justify-center sm:w-auto ${animations.secondaryCTAHover}`}
                      magneticStrength={0.15}
                      magneticDistance={90}
                      rippleColor="rgba(1, 159, 183, 0.2)"
                    >
                      הכירו את Law4Us
                    </MagneticButton>
                  </div>
                </div>
              </SlideInView>

              <SlideInView direction="left" delay={140}>
                <div className="grid gap-4">
                  {heroStats.map((stat, index) => (
                    <div
                      key={stat.label}
                      style={CARD_STYLES.container}
                      className={animations.cardHover}
                    >
                      <p style={TYPOGRAPHY.eyebrow}>
                        {stat.label}
                      </p>
                      <p style={{ ...TYPOGRAPHY.h3, margin: 0 }}>
                        {typeof stat.value === "number"
                          ? stat.value.toLocaleString("he-IL")
                          : stat.value}
                      </p>
                      <p style={TYPOGRAPHY.bodyLarge}>{stat.description}</p>
                    </div>
                  ))}
                </div>
              </SlideInView>
            </div>
          </div>
        </section>
      </LazySectionFade>

      <LazySectionFade rootMargin="300px" fadeDuration={600}>
        <section className="py-20">
            <div className="max-w-[1200px] mx-auto px-6">
              <SlideInView direction="up">
                <div className="mb-16 text-center">
                  <p
                    className="mb-6"
                    style={{
                      color: '#019FB7',
                      fontSize: '16px',
                      fontWeight: 600,
                      lineHeight: '100%',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    כל הכתבות
                  </p>
                  <h2 style={TYPOGRAPHY.h2}>
                    חפשו לפי נושא או דפדפו בכל המאמרים
                  </h2>
                  <p style={TYPOGRAPHY.subtitle}>
                    השתמשו בסינון לפי קטגוריות כדי להגיע לתוכן שמעניין אתכם,
                    או דפדפו ברשימת המאמרים המעודכנת שלנו.
                  </p>
                </div>
              </SlideInView>

              <BlogListing
                initialPosts={posts}
                initialHasMore={hasMore}
                initialCursor={nextCursor}
                categories={categories}
              />
            </div>
          </section>
        </LazySectionFade>
    </>
  );
}
