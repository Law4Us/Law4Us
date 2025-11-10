import type { Metadata } from "next";
import {
  Calendar,
  DollarSign,
  Users,
  Heart,
  Shield,
  Scale,
  Handshake,
  Home,
  FileText,
  Gavel,
  CheckCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SlideInView } from "@/components/animations/slide-in-view";
import { LazySectionFade } from "@/components/ui/lazy-section";
import { MagneticButton } from "@/components/atoms/MagneticButton";
import { CTASection } from "@/components/home";
import { HomeBlogSection } from "@/components/home-blog-section";
import { ProgressiveImage } from "@/components/ui/progressive-image";
import { generatePlaceholderDataURL } from "@/lib/utils/image-placeholders";
import {
  TYPOGRAPHY,
  CARD_STYLES,
  CTA_STYLES,
  STEP_BOX_STYLES,
} from "@/lib/constants/styles";
import { animations } from "@/lib/utils/animations";

export const metadata: Metadata = {
  title: "מדריך גירושין - Law4Us",
  description:
    "מדריך מקיף להליך הגירושין: מזונות, משמורת, חלוקת רכוש והדרך כולה עד לקבלת פסק הדין.",
};

const heroHighlights = [
  "מסבירים כל שלב בתהליך הגירושין בשפה פשוטה וברורה",
  "מראים כיצד לשמור על זכויותיכם בכל סוג תביעה",
  "מציעים גישה הוליסטית שמשלבת ייצוג משפטי, גישור ותמיכה רגשית",
] as const;

type KnowledgeHighlight = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type KnowledgeSection = {
  eyebrow: string;
  title: string;
  subtitle: string;
  highlights: KnowledgeHighlight[];
  bullets?: KnowledgeHighlight[];
};

const knowledgeSections: KnowledgeSection[] = [
  {
    eyebrow: "מושגי יסוד",
    title: "מזונות / דמי מזונות",
    subtitle:
      "הבנת הזכויות והחובות הכלכליות בין בני הזוג וביחס לילדים לאורך התהליך.",
    highlights: [
      {
        icon: DollarSign,
        title: "מהם מזונות?",
        description:
          "תשלום חודשי שנועד להבטיח את צורכי המחיה הבסיסיים. קיימים שני סוגים עיקריים – מזונות ילדים ומזונות בן/בת זוג.",
      },
      {
        icon: Users,
        title: "מזונות ילדים",
        description:
          "נקבעים בהתאם לצרכים היומיומיים, רמת החיים אליה התרגלו הילדים ויכולתם הכלכלית של ההורים. כוללים הוצאות חינוך, בריאות, פנאי ועוד.",
      },
      {
        icon: Heart,
        title: "מזונות בן/בת זוג",
        description:
          "יכולים להיפסק כאשר אחד מבני הזוג תלוי כלכלית בשני. נבחנים יכולת ההשתכרות, רמת החיים המשותפת והתרומה הכלכלית של שני הצדדים.",
      },
    ],
  },
  {
    eyebrow: "זכויות הילדים",
    title: "משמורת וסידורי ראייה",
    subtitle:
      "התוויית מציאות יומיומית יציבה לילדים תוך שמירה על קשר בריא עם שני ההורים.",
    highlights: [
      {
        icon: Shield,
        title: "משמורת בלעדית",
        description:
          "הילד גר עם הורה אחד רוב הזמן. ההורה השני נהנה מסידורי ראייה מובנים ומעורבות בהחלטות חשובות.",
      },
      {
        icon: Handshake,
        title: "משמורת משותפת",
        description:
          "שני ההורים חולקים את האחריות על קבלת ההחלטות ולכן גם נדרשים לתיאום מתמשך ושיתוף פעולה.",
      },
      {
        icon: Scale,
        title: "משמורת שווה",
        description:
          "חלוקת זמנים שוויונית – לדוגמה שבוע-שבוע – עם תכנון לוגיסטי מוקפד שנועד לשמור על רצף לימודי ונפשי לילדים.",
      },
    ],
    bullets: [
      {
        icon: Calendar,
        title: "סידורי ראייה",
        description:
          "כוללים לוחות זמנים ברורים: חגים, חופשות, סופי שבוע וערבים באמצע השבוע. במידת הצורך ניתן לשלב ניטור או ליווי מקצועי.",
      },
      {
        icon: Heart,
        title: "טובת הילד לפני הכל",
        description:
          "בית המשפט בוחן את טובת הילד: יציבות, קשר עם כל הורה, יכולת ההורים לספק מסגרת בטוחה, והעדפת הילד בגילאים המתאימים.",
      },
    ],
  },
  {
    eyebrow: "ענייני רכוש",
    title: "חלוקת רכוש",
    subtitle:
      "עקרונות החוק והפסיקה שמבטיחים חלוקה הוגנת של נכסים, חובות וזכויות עתידיות.",
    highlights: [
      {
        icon: Home,
        title: "רכוש משותף",
        description:
          "נכסים שנצברו במהלך הנישואין: דירה, חיסכון, פנסיה, רכב ועוד. ברירת המחדל – חלוקה שווה בין הצדדים.",
      },
      {
        icon: FileText,
        title: "רכוש פרטי",
        description:
          "נכסים שהיו בבעלות אחד הצדדים לפני הנישואין או התקבלו כמתנה/ירושה – בדרך כלל נשארים בבעלותו הבלעדית.",
      },
      {
        icon: DollarSign,
        title: "הערכת שווי",
        description:
          "נקבעת סמוך לפסק הדין. אם אחד הצדדים פעל להבריח נכסים, ניתן לדרוש השבה ולהחזיר את השווי המלא לקופה המשותפת.",
      },
      {
        icon: Gavel,
        title: "הסכמי ממון",
        description:
          "מסמכים שמקדימים את החוק ומאפשרים חלוקה מותאמת לזוג. חשוב לוודא שההסכם אושר כדין ונערך בשקיפות מלאה.",
      },
    ],
  },
] as const;

const processSteps = [
  {
    number: "01",
    title: "הגשת תביעה",
    description:
      "מנסחים ומגישים כתב תביעה מפורט לבית המשפט לענייני משפחה. התביעה כוללת את סוגיות המשמורת, מזונות, רכוש ודרישות נוספות.",
  },
  {
    number: "02",
    title: "תגובה של הצד השני",
    description:
      "הצד השני משיב בתוך כ-30 יום. במקרים רבים מוגשת תביעה שכנגד וההליך מתרחב לנושאים נוספים שדורשים הכרעה.",
  },
  {
    number: "03",
    title: "גישור ויישוב סכסוך",
    description:
      "בית המשפט מפנה את הצדדים לפגישות מידע וגישור. כאן מתאפשר להגיע להסכמות מהירות יותר שמצמצמות עלויות ומתח נפשי.",
  },
  {
    number: "04",
    title: "דיונים והבאת ראיות",
    description:
      "במידה והגישור לא מצליח, ממשיכים לדיונים רשמיים. כל צד מציג ראיות, עדויות ומסמכים מקצועיים תומכים.",
  },
  {
    number: "05",
    title: "פסק דין",
    description:
      "השופט קובע הכרעות בכל הסוגיות השנויות במחלוקת ומנמק את ההחלטות. הפסק כולל הוראות יישומיות ומועדי ביצוע.",
  },
  {
    number: "06",
    title: "צו גירושין",
    description:
      "לאחר 45 יום מפסק הדין ניתן לפנות לרשם ולהשלים את הגירושין באופן רשמי. מרגע זה בני הזוג נחשבים גרושים מבחינה משפטית.",
  },
] as const;

const preparationTips = [
  "איסוף מסמכים כלכליים מראש: דוחות בנק, חשבונות, הסכמים פיננסיים ונכסים משותפים.",
  "תיעוד תקשורת בין בני הזוג באופן מסודר ומכבד כדי להוכיח שיתוף פעולה או חוסר שיתוף פעולה.",
  "הגדרת גבולות תקשורת ברורים ושיתוף הילדים רק במידע המתאים לגילם.",
  "הצבת יעדים ארוכי טווח – היכן גרים, כיצד מתחלקים המשאבים ואיך נראית שגרת ההורות המשותפת.",
] as const;

export default function DivorcePage() {
  return (
    <div>
      <section className="relative pt-8 md:pt-12 pb-12">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
            <SlideInView direction="up">
              <div className="space-y-6 text-right">
                <p style={TYPOGRAPHY.eyebrow} className="text-primary">
                  מדריך מקיף
                </p>
                <h1
                  className="text-[36px] sm:text-[52px] lg:text-[76px]"
                  style={{
                    ...TYPOGRAPHY.heroH1,
                    fontSize: undefined,
                    margin: 0,
                  }}
                >
                  מדריך להליך הגירושין
                  <br />
                  <span style={{ color: "#019FB7" }}>כל מה שצריך לדעת</span>
                </h1>
                <p
                  className="max-w-3xl text-[18px] sm:text-[20px] lg:text-[24px]"
                  style={{
                    ...TYPOGRAPHY.heroSubtitle,
                    fontSize: undefined,
                  }}
                >
                  Law4Us ריכזה עבורכם את כל הנקודות החשובות – מזכויות כלכליות ועד
                  ניהול המשמורת. כך תוכלו לקבל החלטות מתוך ידע, בהירות וביטחון.
                </p>
                <ul className="space-y-3">
                  {heroHighlights.map((item) => (
                    <li
                      key={item}
                      className={`flex items-start justify-start gap-3 text-lg text-neutral-800 ${animations.bulletHover}`}
                    >
                      <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-start">
                  <MagneticButton
                    href="/wizard"
                    style={CTA_STYLES.main}
                    className={`inline-flex items-center justify-center sm:w-auto ${animations.primaryCTAHover}`}
                    magneticStrength={0.2}
                    magneticDistance={110}
                    rippleColor="rgba(255, 255, 255, 0.3)"
                  >
                    התחילו בהליך אונליין
                  </MagneticButton>
                  <MagneticButton
                    href="/about"
                    style={{ ...CTA_STYLES.secondary, boxShadow: "none" }}
                    className={`inline-flex items-center justify-center sm:w-auto ${animations.secondaryCTAHover}`}
                    magneticStrength={0.15}
                    magneticDistance={90}
                    rippleColor="rgba(1, 159, 183, 0.2)"
                  >
                    מי אנחנו?
                  </MagneticButton>
                </div>
              </div>
            </SlideInView>

            <SlideInView direction="left" delay={140} disableContainment={true}>
              <div className="relative">
                <div className="rounded-[32px] border border-neutral-200 bg-white/85 p-2 shadow-xl backdrop-blur">
                  <ProgressiveImage
                    src="/divorce-hero.jpg"
                    alt="ספר חוק תקנות רכוש בנישואין עם מסמכים משפטיים"
                    width={720}
                    height={960}
                    placeholderSrc={generatePlaceholderDataURL(16, 16, "#E8E4DC")}
                    className="h-full w-full rounded-[28px] object-cover"
                    priority
                  />
                </div>
              </div>
            </SlideInView>
          </div>
        </div>
      </section>

      {knowledgeSections.map((section, index) => {
        return (
          <LazySectionFade key={section.title}>
            <section className="py-12">
              <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                  <p style={TYPOGRAPHY.eyebrow} className="mb-6 text-primary">
                    {section.eyebrow}
                  </p>
                  <h2 style={TYPOGRAPHY.h2}>{section.title}</h2>
                  <p style={TYPOGRAPHY.subtitle}>{section.subtitle}</p>
                </div>

                <div className={`mt-16 grid gap-6 md:grid-cols-2 ${section.highlights.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
                  {section.highlights.map((item, idx) => (
                    <SlideInView
                      key={item.title}
                      direction="up"
                      delay={idx * 120}
                    >
                      <div
                        style={{
                          ...CARD_STYLES.container,
                          backgroundColor: "rgba(255,255,255,0.95)",
                          padding: "24px",
                        }}
                        className={`h-full ${animations.cardHover}`}
                      >
                        <div
                          style={CARD_STYLES.iconCircle}
                          className={animations.iconCircleHover}
                        >
                          <item.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div style={CARD_STYLES.textContent}>
                          <h3 style={TYPOGRAPHY.h3}>{item.title}</h3>
                          <p style={TYPOGRAPHY.bodyLarge}>{item.description}</p>
                        </div>
                      </div>
                    </SlideInView>
                  ))}
                </div>

                {section.bullets && (
                  <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    {section.bullets.map((bullet, bulletIdx) => (
                      <SlideInView
                        key={bullet.title}
                        direction="up"
                        delay={bulletIdx * 120}
                      >
                        <div
                          style={{
                            ...CARD_STYLES.container,
                            backgroundColor: "rgba(255,255,255,0.95)",
                            padding: "24px",
                          }}
                          className={`flex flex-row items-start gap-6 ${animations.cardHover}`}
                        >
                          <div
                            style={CARD_STYLES.iconCircle}
                            className={`${animations.iconCircleHover} flex-shrink-0`}
                          >
                            <bullet.icon className="h-6 w-6 text-primary" />
                          </div>
                          <div className="space-y-2 text-right">
                            <h3 style={TYPOGRAPHY.h3}>{bullet.title}</h3>
                            <p style={TYPOGRAPHY.bodyLarge}>{bullet.description}</p>
                          </div>
                        </div>
                      </SlideInView>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </LazySectionFade>
        );
      })}

      <LazySectionFade>
        <section className="py-12">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p style={TYPOGRAPHY.eyebrow} className="mb-6 text-primary">
                שלב אחר שלב
              </p>
              <h2 style={TYPOGRAPHY.h2}>הליך הגירושין – 6 שלבים מנוהלים</h2>
              <p style={TYPOGRAPHY.subtitle}>
                משרטטים עבורכם מסלול ברור – משלב הכנת התביעה ועד השלמת הצו
                הסופי.
              </p>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {processSteps.map((step, index) => (
                <SlideInView key={step.title} direction="up" delay={index * 120}>
                  <div
                    style={{
                      ...CARD_STYLES.container,
                      backgroundColor: "rgba(255,255,255,0.95)",
                      padding: "24px",
                    }}
                    className={`h-full ${animations.cardHover}`}
                  >
                    <div style={STEP_BOX_STYLES.numberBadge}>{step.number}</div>
                    <div className="mt-4 space-y-2">
                      <h3 style={TYPOGRAPHY.h3}>{step.title}</h3>
                      <p style={TYPOGRAPHY.bodyLarge}>{step.description}</p>
                    </div>
                  </div>
                </SlideInView>
              ))}
            </div>
          </div>
        </section>
      </LazySectionFade>

      <LazySectionFade>
        <section className="py-12">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p style={TYPOGRAPHY.eyebrow} className="mb-6 text-primary">
                הכנה ותכנון
              </p>
              <h2 style={TYPOGRAPHY.h2}>צעדים פרקטיים לקראת ההליך</h2>
              <p style={TYPOGRAPHY.subtitle}>
                כמה פעולות מוקדמות שמפחיתות אי-ודאות ומעניקות שליטה מלאה כבר
                מהיום הראשון.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {preparationTips.map((tip, index) => (
                <SlideInView key={tip} direction="up" delay={index * 120}>
                  <div
                    style={{
                      ...CARD_STYLES.container,
                      backgroundColor: "rgba(255,255,255,0.95)",
                      padding: "24px",
                    }}
                    className={`flex flex-row items-start gap-6 ${animations.cardHover}`}
                  >
                    <div
                      style={CARD_STYLES.iconCircle}
                      className={`${animations.iconCircleHover} flex-shrink-0`}
                    >
                      <CheckCircle className="h-6 w-6 text-primary" />
                    </div>
                    <p style={TYPOGRAPHY.bodyLarge}>{tip}</p>
                  </div>
                </SlideInView>
              ))}
            </div>
          </div>
        </section>
      </LazySectionFade>

      <LazySectionFade>
        <HomeBlogSection />
      </LazySectionFade>

      <LazySectionFade>
        <CTASection />
      </LazySectionFade>
    </div>
  );
}
