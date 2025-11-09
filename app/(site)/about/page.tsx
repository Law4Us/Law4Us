import type { Metadata } from "next";
import {
  Award,
  BookOpen,
  Target,
  Heart,
  Shield,
  Lightbulb,
  Gavel,
  Scale,
  Handshake,
  Star,
  CheckCircle,
} from "lucide-react";
import { SlideInView } from "@/components/animations/slide-in-view";
import { LazySectionFade } from "@/components/ui/lazy-section";
import { MagneticButton } from "@/components/atoms/MagneticButton";
import { ProgressiveImage } from "@/components/ui/progressive-image";
import { generatePlaceholderDataURL } from "@/lib/utils/image-placeholders";
import { StatsShowcase } from "@/components/pages/about/stats-showcase";
import { TYPOGRAPHY, CARD_STYLES, CTA_STYLES } from "@/lib/constants/styles";
import { colors } from "@/lib/design-tokens/colors";
import { animations } from "@/lib/utils/animations";

export const metadata: Metadata = {
  title: "אודות - Law4Us",
  description:
    "הסיפור מאחורי ההצלחה. משרד עורכי דין מוביל בתחום דיני המשפחה בישראל.",
};

const stats = [
  {
    icon: "users",
    label: "תיקים מטופלים",
    value: 5000,
    suffix: "+",
    description: "לקוחות שבחרו בנו לליווי משפטי מלא",
  },
  {
    icon: "award",
    label: "שנות ניסיון",
    value: 24,
    suffix: "+",
    description: "פעילות רצופה בדיני משפחה וגישור",
  },
  {
    icon: "trendingUp",
    label: "שביעות רצון",
    value: 98,
    suffix: "%",
    description: "ציון שביעות רצון ממוצע מסקרי לקוחות",
  },
  {
    icon: "bookOpen",
    label: "פרסומים מקצועיים",
    value: 50,
    suffix: "+",
    description: "מאמרים, הרצאות וקורסים מקצועיים",
  },
] as const;

const heroHighlights = [
  "חזון להפוך את תחום דיני המשפחה לנגיש, שקוף והוגן",
  "תהליך דיגיטלי מלא המגובה בליווי אישי של עורכי דין מנוסים",
  "שירותים מקצועיים בעברית מלאה ובמיקוד על חוויית הלקוח",
] as const;

const missionPillars = [
  {
    icon: Target,
    title: "מצוינות משפטית לכל אחד",
    description:
      "השירות שלנו מבוסס על ייעוץ משפטי מעמיק, מסמכים מדויקים וליווי שמאפשר לכל לקוח לקבל החלטות מושכלות.",
  },
  {
    icon: Heart,
    title: "גישה אנושית ומכילה",
    description:
      "מאחורי כל תיק יש משפחה. אנחנו שומרים על היחס האישי, האמפתיה והליווי הרגשי לצד הדיוק המשפטי.",
  },
  {
    icon: Lightbulb,
    title: "חדשנות שמעצימה לקוחות",
    description:
      "פיתחנו תהליך עבודה חכם המשלב טכנולוגיה מתקדמת עם מומחיות משפטית, כך שהלקוחות מקבלים חוויה ברורה ומובנית.",
  },
] as const;

const expertiseHighlights = [
  {
    icon: Shield,
    title: "הגנה על זכויות המשפחה",
    description:
      "התאמת אסטרטגיה משפטית לכל שלב והקפדה על שמירת זכויות הילדים וההורים.",
  },
  {
    icon: Scale,
    title: "הסכמים מאוזנים והוגנים",
    description:
      "ניסוח הסכמים שמאזנים בין הצדדים ומאפשרים פתיחה של פרק חדש בחיים בביטחון מלא.",
  },
  {
    icon: Handshake,
    title: "גישור ויישוב סכסוכים",
    description:
      "ניסיון רב בהובלת תהליכי גישור אפקטיביים שמקטינים מתחים ומצמצמים זמן בבתי המשפט.",
  },
] as const;

const milestones = [
  {
    year: "2001",
    title: "הקמת המשרד",
    description:
      "עו\"ד אריאל דרור מקים משרד בוטיק לדיני משפחה בגישה חדישה המשלבת שירות אישי עם שקיפות מלאה.",
  },
  {
    year: "2015",
    title: "התרחבות ארצית",
    description:
      "צוות המומחים מתרחב, המשרד פותח שלוחות נוספות ומעמיק שירותים בתחומי רכוש, אפוטרופסות והסכמי ממון.",
  },
  {
    year: "2019",
    title: "כתיבת הספר",
    description:
      "פרסום הספר 'חלוקת רכוש בהליך גירושין' המצוטט על ידי שופטים ומשמש כלי עבודה מרכזי בבתי המשפט ובתי הספר למשפטים.",
  },
  {
    year: "2025",
    title: "השקת Law4Us",
    description:
      "השקת חוויית הלקוח החדשה: תהליך גירושין מקוון מנוהל, עם טכנולוגיה מתקדמת וחוויית משתמש מוקפדת.",
  },
] as const;

const recognitionHighlights = [
  {
    icon: Award,
    title: "דירוג Duns 100",
    description:
      "דירוג קבוע ברשימת המשרדים המובילים בישראל בדיני משפחה בשנים האחרונות בזכות מקצועיות וחדשנות.",
  },
  {
    icon: BookOpen,
    title: "פרסומים והדרכות",
    description:
      "ספרו של אריאל על חלוקת רכוש נחשב לכלי עבודה מרכזי בבתי המשפט והכשרות מקצועיות.",
  },
  {
    icon: Star,
    title: "הכרה בינלאומית",
    description:
      "שיתופי פעולה עם גופים משפטיים באירופה וארה\"ב לטובת הסכמים בינלאומיים והסדרת תיקים מורכבים.",
  },
] as const;

const founders = [
  {
    name: "עו\"ד אריאל דרור",
    role: "מייסד שותף ומנכ\"ל",
    bio: "עו\"ד מומחה בדיני משפחה ורכוש מאז 2001. מחבר הספר 'חלוקת רכוש בהליך גירושין' המצוטט על ידי שופטים ומשמש בתי משפט ובתי ספר למשפטים. בעל ניסיון עשיר בניהול תיקים מורכבים ברחבי הארץ.",
    image: "/picture of lawyer.png",
  },
  {
    name: "אלי שוורץ",
    role: "מייסד שותף ומנהל",
    bio: "דמות ראשית במטה האינטימי שלנו. בוגר ממר\"מ ואיש DBA עם 20 שנות ניסיון בעולם ה-MF. הקים את קומבלק לפני 13 שנים ועד היום מעורב בעשייה, בפרויקטים ובקשר הישיר מול לקוחות ועובדים.",
    image: "/eli-zoomed.png",
  },
] as const;

export default function AboutPage() {
  return (
    <div>
      <section className="py-12">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr,0.9fr]">
            <SlideInView direction="up">
              <div className="space-y-4 text-right">
                <p style={TYPOGRAPHY.eyebrow} className="text-primary">
                  אודות המשרד
                </p>

                <h1
                  className="text-[36px] sm:text-[52px] lg:text-[80px]"
                  style={{
                    ...TYPOGRAPHY.heroH1,
                    fontSize: undefined,
                    margin: 0,
                  }}
                >
                  מי אנחנו?
                  <br />
                  <span style={{ color: colors.brand.primary.DEFAULT }}>
                    הסיפור שמאחורי Law4Us
                  </span>
                </h1>

                <p
                  className="max-w-2xl text-[18px] sm:text-[20px] lg:text-[24px]"
                  style={{
                    ...TYPOGRAPHY.heroSubtitle,
                    fontSize: undefined,
                  }}
                >
                  משרד Law4Us מוביל את תחום דיני המשפחה בישראל, עם ליווי משפטי
                  מקיף, תהליך דיגיטלי חכם ונבחרת מומחים שמציבה את המשפחה
                  במרכז. הניסיון, המקצועיות והגישה האנושית שלנו מאפשרים לכל
                  לקוח לעבור תהליך מורכב בביטחון וברוגע.
                </p>

                <ul className="space-y-2 text-right">
                  {heroHighlights.map((item) => (
                    <li
                      key={item}
                      className={`flex items-start gap-2 text-lg text-neutral-800 ${animations.bulletHover}`}
                    >
                      <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-start">
                  <MagneticButton
                    href="/wizard"
                    style={CTA_STYLES.main}
                    className={`inline-flex items-center justify-center sm:w-auto ${animations.primaryCTAHover}`}
                    magneticStrength={0.18}
                    magneticDistance={110}
                    rippleColor="rgba(255, 255, 255, 0.3)"
                  >
                    התחילו אונליין עכשיו
                  </MagneticButton>
                  <MagneticButton
                    href="/help"
                    style={{ ...CTA_STYLES.secondary, boxShadow: "none" }}
                    className={`inline-flex items-center justify-center sm:w-auto ${animations.secondaryCTAHover}`}
                    magneticStrength={0.15}
                    magneticDistance={90}
                    rippleColor="rgba(1, 159, 183, 0.2)"
                  >
                    גלו את מרכז העזרה
                  </MagneticButton>
                </div>
              </div>
            </SlideInView>

            <SlideInView direction="left" delay={120}>
              <div className="relative">
                <div className="rounded-[32px] border border-neutral-200 bg-white/80 p-2 shadow-xl backdrop-blur">
                  <ProgressiveImage
                    src="/law.jpg"
                    alt='משרד עורכי דין Law4Us'
                    width={760}
                    height={920}
                    placeholderSrc={generatePlaceholderDataURL(12, 12, "#D6E7EB")}
                    className="h-full w-full rounded-[28px] object-cover"
                    priority
                  />
                </div>

                <div className="absolute -bottom-6 right-6 w-full max-w-[260px]">
                  <div
                    style={{
                      ...CARD_STYLES.container,
                      backgroundColor: "rgba(255,255,255,0.95)",
                      alignItems: "stretch",
                      padding: "20px",
                    }}
                    className="shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div style={CARD_STYLES.iconCircle}>
                        <Gavel className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-primary">
                          מומחיות משפטית
                        </p>
                        <p className="text-xs text-neutral-600">
                          דיני משפחה, גישור והסכמים מורכבים
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-neutral-200 pt-4 text-sm text-neutral-700">
                      <span>חבר לשכת עורכי הדין</span>
                      <span>משנת 2001</span>
                    </div>
                  </div>
                </div>
              </div>
            </SlideInView>
          </div>
        </div>
      </section>

      <LazySectionFade>
        <section className="py-12">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center">
              <p style={TYPOGRAPHY.eyebrow} className="mb-6 text-primary">
                נתוני הצלחה
              </p>
              <h2 style={TYPOGRAPHY.h2}>
                עשור וחצי של תוצאות מוכחות בדיני משפחה
              </h2>
              <p style={TYPOGRAPHY.subtitle}>
                שילוב של ניסיון שטח, שיטות עבודה מתקדמות וצוות משפטי מנוסה שיודע
                להוביל תיקים מורכבים.
              </p>
            </div>

            <div className="mt-12">
              <StatsShowcase stats={stats} />
            </div>
          </div>
        </section>
      </LazySectionFade>

      <LazySectionFade>
        <section className="py-12">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center">
              <p style={TYPOGRAPHY.eyebrow} className="mb-6 text-primary">
                המשימה שלנו
              </p>
              <h2 style={TYPOGRAPHY.h2}>
                שירות משפטי שמספק בהירות, יציבות וביטחון
              </h2>
              <p style={TYPOGRAPHY.subtitle}>
                שלושת העקרונות שמנחים אותנו בכל תיק – מהפניה הראשונה ועד שמירת
                הקשר אחרי סיום ההליך.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {missionPillars.map((pillar, index) => (
                <SlideInView key={pillar.title} direction="up" delay={index * 120}>
                  <div
                    style={{
                      ...CARD_STYLES.container,
                      backgroundColor: "rgba(255,255,255,0.92)",
                    }}
                    className={`h-full ${animations.cardHover}`}
                  >
                    <div style={CARD_STYLES.iconCircle}>
                      <pillar.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div style={CARD_STYLES.textContent}>
                      <h3 style={TYPOGRAPHY.h3}>{pillar.title}</h3>
                      <p style={TYPOGRAPHY.bodyLarge}>{pillar.description}</p>
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
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center">
              <p style={TYPOGRAPHY.eyebrow} className="mb-6 text-primary">
                הכירו את המייסדים
              </p>
              <h2 style={TYPOGRAPHY.h2}>
                האנשים שמובילים את Law4Us קדימה
              </h2>
              <p style={TYPOGRAPHY.subtitle}>
                שילוב של מומחיות משפטית עמוקה עם חשיבה תפעולית וטכנולוגית
                מאפשר לנו לבנות חוויית שירות מדויקת, אנושית ומודרנית.
              </p>
            </div>

            {/* Bento Grid: Timeline column with stacked founders and benefits */}
            <div className="mt-12 grid gap-4 md:grid-cols-[minmax(0,0.9fr),minmax(0,1.6fr)]" dir="ltr">
              {/* Timeline - dedicated column that stretches alongside both rows */}
              <SlideInView direction="up">
                <div
                  style={{
                    ...CARD_STYLES.container,
                    backgroundColor: "rgba(255,255,255,0.95)",
                    padding: "24px",
                    gap: "20px",
                    alignItems: "stretch",
                  }}
                  className="relative flex h-full flex-col overflow-hidden"
                  dir="rtl"
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-primary/10" />
                  <div className="relative space-y-1 text-right">
                    <h3
                      style={{
                        ...TYPOGRAPHY.h3,
                        margin: 0,
                        fontSize: "22px",
                      }}
                    >
                      אבני דרך מרכזיות
                    </h3>
                    <p className="text-base text-neutral-600">
                      מסע הצמיחה של Law4Us לאורך השנים
                    </p>
                  </div>
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 right-[26px] w-[3px] rounded-full bg-gradient-to-b from-primary/70 via-primary/30 to-primary/0" />
                    <div className="flex flex-col justify-between h-full">
                      {milestones.map((milestone) => (
                        <div
                          key={milestone.year}
                          className="relative pr-16 text-right flex-1 flex items-center"
                        >
                          <div className="w-full">
                            <span className="absolute right-0 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-primary bg-white text-sm font-bold text-primary shadow-md shadow-primary/20">
                              {milestone.year}
                            </span>
                            <h4
                              style={{
                                ...TYPOGRAPHY.h3,
                                margin: 0,
                                fontSize: "18px",
                                marginBottom: "4px",
                              }}
                            >
                              {milestone.title}
                            </h4>
                            <p
                              style={{
                                ...TYPOGRAPHY.bodyLarge,
                                fontSize: "14px",
                                lineHeight: "1.6",
                              }}
                            >
                              {milestone.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </SlideInView>

              {/* Right column: stacked founders row + benefits row */}
              <div className="flex flex-col gap-4 md:grid md:grid-rows-[minmax(360px,auto),minmax(260px,auto)]" dir="rtl">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Founder 1 (Ariel) */}
                  <SlideInView direction="up" delay={80}>
                    <div
                      style={{
                        ...CARD_STYLES.container,
                        backgroundColor: "rgba(255,255,255,0.95)",
                        padding: "24px",
                        gap: "16px",
                        alignItems: "stretch",
                      }}
                      className={`relative h-full overflow-hidden text-right ${animations.cardHover}`}
                    >
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-white/70 to-white/30" />
                      <div className="relative flex flex-col gap-4">
                        <div className="flex flex-col-reverse gap-4">
                          <div
                            style={{
                              ...CARD_STYLES.textContent,
                              alignItems: "flex-start",
                              gap: "10px",
                            }}
                            className="w-full text-right"
                          >
                            <h3
                              style={{
                                ...TYPOGRAPHY.h3,
                                margin: 0,
                                fontSize: "24px",
                              }}
                            >
                              {founders[0].name}
                            </h3>
                            <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-1 text-xs font-semibold text-primary">
                              <Award className="h-4 w-4" />
                              <span>{founders[0].role}</span>
                            </div>
                            <p
                              style={{
                                ...TYPOGRAPHY.bodyLarge,
                                fontSize: "15px",
                                lineHeight: "1.7",
                              }}
                              className="text-neutral-700"
                            >
                              {founders[0].bio}
                            </p>
                          </div>
                          <ProgressiveImage
                            src={founders[0].image}
                            alt={founders[0].name}
                            width={120}
                            height={120}
                            placeholderSrc={generatePlaceholderDataURL(
                              12,
                              12,
                              "#D6E7EB",
                            )}
                            className="h-[120px] w-[120px] self-start flex-shrink-0 rounded-3xl object-cover shadow-lg shadow-primary/20 ring-4 ring-white"
                          />
                        </div>
                      </div>
                    </div>
                  </SlideInView>

                  {/* Founder 2 (Ariel) */}
                  <SlideInView direction="up" delay={120}>
                    <div
                      style={{
                        ...CARD_STYLES.container,
                        backgroundColor: "rgba(255,255,255,0.95)",
                        padding: "24px",
                        gap: "16px",
                        alignItems: "stretch",
                      }}
                      className={`relative h-full overflow-hidden text-right ${animations.cardHover}`}
                    >
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-white/70 to-white/30" />
                      <div className="relative flex flex-col gap-4">
                        <div className="flex flex-col-reverse gap-4">
                          <div
                            style={{
                              ...CARD_STYLES.textContent,
                              alignItems: "flex-start",
                              gap: "10px",
                            }}
                            className="w-full text-right"
                          >
                            <h3
                              style={{
                                ...TYPOGRAPHY.h3,
                                margin: 0,
                                fontSize: "24px",
                              }}
                            >
                              {founders[1].name}
                            </h3>
                            <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-1 text-xs font-semibold text-primary">
                              <Award className="h-4 w-4" />
                              <span>{founders[1].role}</span>
                            </div>
                            <p
                              style={{
                                ...TYPOGRAPHY.bodyLarge,
                                fontSize: "15px",
                                lineHeight: "1.7",
                              }}
                              className="text-neutral-700"
                            >
                              {founders[1].bio}
                            </p>
                          </div>
                          <ProgressiveImage
                            src={founders[1].image}
                            alt={founders[1].name}
                            width={120}
                            height={120}
                            placeholderSrc={generatePlaceholderDataURL(
                              12,
                              12,
                              "#D6E7EB",
                            )}
                            className="h-[120px] w-[120px] self-start flex-shrink-0 rounded-3xl object-cover object-center shadow-lg shadow-primary/20 ring-4 ring-white"
                          />
                        </div>
                      </div>
                    </div>
                  </SlideInView>
                </div>

                {/* Benefits row */}
                <div className="grid gap-4 md:grid-cols-3">
                  {expertiseHighlights.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <SlideInView
                        key={item.title}
                        direction="up"
                        delay={160 + index * 60}
                      >
                        <div
                          style={{
                            ...CARD_STYLES.container,
                            backgroundColor: "rgba(255,255,255,0.95)",
                            padding: "28px",
                            gap: "18px",
                            alignItems: "stretch",
                            textAlign: "right",
                          }}
                          className={`h-full ${animations.cardHover}`}
                        >
                          <div
                            style={CARD_STYLES.iconCircle}
                            className={animations.iconCircleHover}
                          >
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <div
                            style={{
                              ...CARD_STYLES.textContent,
                              alignItems: "flex-end",
                              gap: "12px",
                            }}
                          >
                            <h4
                              style={{
                                ...TYPOGRAPHY.h3,
                                fontSize: "20px",
                                margin: 0,
                              }}
                            >
                              {item.title}
                            </h4>
                            <p
                              style={{
                                ...TYPOGRAPHY.bodyLarge,
                                fontSize: "15px",
                                lineHeight: "1.6",
                              }}
                              className="text-neutral-600"
                            >
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </SlideInView>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      </LazySectionFade>

      <LazySectionFade>
        <section className="py-12">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center">
              <p style={TYPOGRAPHY.eyebrow} className="mb-6 text-primary">
                הכרה מקצועית
              </p>
              <h2 style={TYPOGRAPHY.h2}>מצוינות שמקבלת הכרה</h2>
              <p style={TYPOGRAPHY.subtitle}>
                ההישגים שלנו נמדדים בתוצאות עבור הלקוחות – ואנחנו גאים בהכרה
                המקצועית שמלווה אותן.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {recognitionHighlights.map((item, index) => (
                <SlideInView key={item.title} direction="up" delay={index * 120}>
                  <div
                    style={{
                      ...CARD_STYLES.container,
                      backgroundColor: "rgba(255,255,255,0.95)",
                    }}
                    className={`h-full ${animations.cardHover}`}
                  >
                    <div style={CARD_STYLES.iconCircle} className={animations.iconCircleHover}>
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
          </div>
        </section>
      </LazySectionFade>

      <LazySectionFade>
        <section className="py-12">
          <div className="max-w-[1200px] mx-auto px-6">
            <div
              className="flex flex-col gap-6 rounded-3xl border border-primary/15 bg-white/85 p-8 shadow-lg md:flex-row md:items-center md:justify-between"
              style={{ backdropFilter: "blur(10px)" }}
            >
              <div className="space-y-3 text-right md:max-w-[60%]">
                <p style={TYPOGRAPHY.eyebrow} className="text-primary">
                  מוכנים לצעד הבא?
                </p>
                <h2
                  style={{
                    ...TYPOGRAPHY.h2,
                    margin: 0,
                    maxWidth: "100%",
                  }}
                >
                  בואו נבנה יחד אסטרטגיה מנצחת למשפחה שלכם
                </h2>
                <p style={{ ...TYPOGRAPHY.subtitle, margin: 0 }}>
                  התחילו את התהליך הדיגיטלי עכשיו וקבלו ליווי משפטי מלא, שקוף
                  ונגיש – בלי לצאת מהבית.
                </p>
              </div>

              <div className="flex flex-col gap-2 md:flex-row">
                <MagneticButton
                  href="/wizard"
                  style={CTA_STYLES.main}
                  className={`inline-flex items-center justify-center ${animations.primaryCTAHover}`}
                  magneticStrength={0.2}
                  magneticDistance={110}
                  rippleColor="rgba(255, 255, 255, 0.3)"
                >
                  התחילו אונליין עכשיו
                </MagneticButton>
                <MagneticButton
                  href="/help"
                  style={{ ...CTA_STYLES.secondary, boxShadow: "none" }}
                  className={`inline-flex items-center justify-center ${animations.secondaryCTAHover}`}
                  magneticStrength={0.15}
                  magneticDistance={90}
                  rippleColor="rgba(1, 159, 183, 0.2)"
                >
                  קבלו תשובות במרכז העזרה
                </MagneticButton>
              </div>
            </div>
          </div>
        </section>
      </LazySectionFade>
    </div>
  );
}
