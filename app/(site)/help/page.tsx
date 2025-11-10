"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { Users, Calculator, Heart, Scale, Brain, Stethoscope, CheckCircle } from "lucide-react";
import { SlideInView } from "@/components/animations/slide-in-view";
import { LazySectionFade } from "@/components/ui/lazy-section";
import { Button, FormField, Input, Textarea } from "@/components/ui";
import { Card } from "@/components/atoms/Card";
import { MagneticButton } from "@/components/atoms/MagneticButton";
import { TYPOGRAPHY, CARD_STYLES, CTA_STYLES } from "@/lib/constants/styles";
import { animations } from "@/lib/utils/animations";
import { colors } from "@/lib/design-tokens/colors";
import { spacing } from "@/lib/design-tokens/spacing";
import { useToast } from "@/lib/context/ToastContext";
import { FAQSection, type FAQItem } from "@/components/home/faq-section";

type HelpFormValues = {
  name: string;
  phone: string;
  email: string;
  message: string;
};

const supportHighlights = [
  "מאגר משאבים מעודכן בנושאי גירושין, מזונות, משמורת ורכוש",
  "טפסים, כלים וחומרי הדרכה שנבנו על ידי הצוות המשפטי שלנו",
  "אפשרות לקבל ליווי אישי מעו\"ד מוסמך לכל שאלה שעולה בדרך",
] as const;

const assistanceCards = [
  {
    icon: Users,
    title: "יועץ משפחתי",
    description:
      "מלווה תהליכי שינוי בתוך המשפחה ומסייע בבניית שפה משותפת והסכמות יציבות.",
  },
  {
    icon: Calculator,
    title: "יועץ פיננסי / רואה חשבון",
    description:
      "מחשב חלוקת נכסים, חובות ותקציב עתידי כדי להבטיח תמונת מצב כלכלית מדויקת.",
  },
  {
    icon: Heart,
    title: "יועץ זוגי",
    description:
      "מסייע לשפר תקשורת, להפחית מתחים ולהגיע להסכמות מתוך הבנה וכבוד הדדי.",
  },
  {
    icon: Scale,
    title: "מגשר",
    description:
      "צד שלישי ניטרלי שמכוון את בני הזוג להסכמות הוגנות בלי להיגרר לעימות משפטי ארוך.",
  },
  {
    icon: Brain,
    title: "פסיכולוג",
    description:
      "תמיכה רגשית מקצועית להורים ולילדים בתקופה של שינוי, מחזקת חוסן וביטחון.",
  },
  {
    icon: Stethoscope,
    title: "פסיכיאטר",
    description:
      "מכיר את המורכבות הנפשית של התהליך ויכול לשלב טיפול תרופתי במידת הצורך.",
  },
] as const;

const helpFaqs: FAQItem[] = [
  {
    question: "כמה זמן לוקח הליך גירושין?",
    answer:
      "בממוצע 3-6 חודשים בהליך מוסכם ועד שנה-שנתיים כשאין הסכמה מלאה. העבודה הדיגיטלית שלנו מקצרת ביורוקרטיה ומאפשרת לרכז את כל החומר בזמן קצר.",
  },
  {
    question: "מה העלות של השירות?",
    answer:
      "השירות שלנו פועל במודל שקוף וקבוע – 3,900₪ לכל סוג תביעה (גירושין, מזונות, משמורת, רכוש). המחיר כולל הכנת מסמכים וייעוץ עם עו\"ד מומחה בדיני משפחה.",
  },
  {
    question: "האם חייבים עורך דין?",
    answer:
      "לא חייבים – אבל זה מומלץ מאוד. עו\"ד מומחה מוודא שהזכויות שלכם נשמרות ומונע טעויות יקרות. החבילה שלנו מאפשרת לקבל ייצוג מלא בעלות שווה לכל כיס.",
  },
  {
    question: "איך מתמודדים עם מחלוקת על הילדים?",
    answer:
      "אנחנו מסייעים בבניית הסדרי משמורת וראייה שמותאמים לטובת הילדים, ובמידת הצורך נעזרים במומחים חיצוניים. כשאין הסכמה, בית המשפט מכריע לפי טובת הילד.",
  },
  {
    question: "איך מתחלק הרכוש?",
    answer:
      "ככלל, רכוש שנצבר לאחר הנישואין מתחלק שווה בשווה. נכסים מלפני הנישואין או מתנות וירושות נשארים פרטיים. במקרים מורכבים אנחנו משתפים מומחי שמאות כדי להבטיח חלוקה הוגנת.",
  },
  {
    question: "אפשר לשנות הסכם קיים?",
    answer:
      "כן. אם חל שינוי מהותי בנסיבות (הכנסה, מצב בריאותי, מעבר דירה, צרכים של הילדים ועוד) ניתן להגיש בקשה לעדכון ההסדר. נלווה אתכם בהכנת הבקשה ובמסמכים התומכים.",
  },
] as const;

export default function HelpPage() {
  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<HelpFormValues>({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = React.useCallback(
    async (values: HelpFormValues) => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        success("ההודעה נשלחה בהצלחה! נחזור אליכם בקרוב.", 6000);
        reset();
      } catch (err) {
        console.error(err);
        error("אירעה שגיאה בעת שליחת הטופס. נסו שוב בעוד רגע.", 6000);
      }
    },
    [error, reset, success]
  );

  return (
    <div>
      <LazySectionFade>
        <section className="pt-8 md:pt-20 pb-20">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid items-center gap-12 lg:grid-cols-[1.1fr,0.9fr]">
              {/* Left Side - Content */}
              <SlideInView direction="up">
                <div className="space-y-6 text-right">
                  {/* Badge */}
                  <div
                    className="inline-flex items-center badge-shimmer"
                    style={{
                      backgroundColor: colors.neutral.white,
                      paddingLeft: spacing[3],
                      paddingRight: spacing[3],
                      paddingTop: spacing[2],
                      paddingBottom: spacing[2]
                    }}
                  >
                    <span style={TYPOGRAPHY.eyebrow}>
                      תמיכה ועזרה <span style={{ color: colors.brand.primary.DEFAULT }}>מקצועית</span>
                    </span>
                  </div>

                  {/* Hero Heading */}
                  <h1
                    className="text-[36px] sm:text-[52px] lg:text-[70px]"
                    style={{
                      ...TYPOGRAPHY.heroH1,
                      fontSize: undefined,
                      margin: 0,
                    }}
                  >
                    צריכים עזרה?
                    <br />
                    <span style={{ color: colors.brand.primary.DEFAULT }}>Law4Us</span> כאן בשבילכם
                  </h1>

                  {/* Subtitle */}
                  <p
                    className="max-w-2xl text-[18px] sm:text-[20px] lg:text-[24px]"
                    style={{
                      ...TYPOGRAPHY.heroSubtitle,
                      fontSize: undefined,
                    }}
                  >
                    מאגר ידע מקצועי, מומחים משלימים וטופס תמיכה ישיר – כל מה שצריך כדי לנווט את
                    התהליך בביטחון וברוגע.
                  </p>

                  {/* Support Highlights - Simple Style */}
                  <ul className="space-y-2 text-right">
                    {supportHighlights.map((item) => (
                      <li
                        key={item}
                        className={`flex items-start gap-2 text-lg text-neutral-800 ${animations.bulletHover}`}
                      >
                        <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Buttons */}
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
                      href="/about"
                      style={{ ...CTA_STYLES.secondary, boxShadow: "none" }}
                      className={`inline-flex items-center justify-center sm:w-auto ${animations.secondaryCTAHover}`}
                      magneticStrength={0.15}
                      magneticDistance={90}
                      rippleColor="rgba(1, 159, 183, 0.2)"
                    >
                      מי אנחנו
                    </MagneticButton>
                  </div>
                </div>
              </SlideInView>

              {/* Right Side - 6 Expert Cards in 2x3 Grid */}
              <SlideInView direction="left" delay={120}>
                <div>
                  <p style={TYPOGRAPHY.eyebrow} className="mb-6 text-primary text-right">
                    מומחים נוספים
                  </p>
                  <div className="grid gap-4 grid-cols-2">
                    {assistanceCards.map((card, idx) => (
                      <div
                        key={card.title}
                        style={{
                          ...CARD_STYLES.container,
                          backgroundColor: "rgba(255,255,255,0.95)",
                        }}
                        className={`h-full ${animations.cardHover}`}
                      >
                        <div style={{ ...CARD_STYLES.iconCircle, width: '40px', height: '40px' }}>
                          <card.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div style={{ ...CARD_STYLES.textContent, gap: '0.5rem' }}>
                          <h3 style={{ ...TYPOGRAPHY.h3, fontSize: '1rem', marginBottom: 0 }}>{card.title}</h3>
                          <p style={{ ...TYPOGRAPHY.bodyLarge, fontSize: '0.875rem' }}>{card.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </SlideInView>
            </div>
          </div>
        </section>
      </LazySectionFade>

      <LazySectionFade>
        <FAQSection
          eyebrow="שאלות נפוצות"
          title="תשובות ברורות לשאלות המרכזיות"
          subtitle="האמור באתר אינו מחליף ייעוץ משפטי פרטני – אבל הוא מספק נקודת פתיחה ברורה ומסודרת."
          items={helpFaqs}
        />
      </LazySectionFade>

      <LazySectionFade>
        <section id="contact" className="py-20">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center" style={{ marginBottom: spacing.semantic.section.margin.bottom.medium }}>
              <p style={{...TYPOGRAPHY.eyebrow, color: colors.brand.primary.DEFAULT, marginBottom: spacing[6]}}>
                צור קשר
              </p>
              <h2 style={TYPOGRAPHY.h2}>לא מצאתם תשובה?</h2>
              <p style={TYPOGRAPHY.subtitle}>
                מלאו את הפרטים ונחזור אליכם בהקדם עם מענה אישי ומקצועי.
              </p>
            </div>

            <Card padding="large" className="max-w-2xl mx-auto">
              <form
                style={{ display: 'flex', flexDirection: 'column', gap: spacing.semantic.form.group.gap }}
                onSubmit={handleSubmit(onSubmit)}
                noValidate
              >
                <FormField
                  label="שם מלא"
                  htmlFor="support-name"
                  required
                  error={errors.name?.message}
                >
                  <Input
                    id="support-name"
                    placeholder="הקלידו כאן שם מלא"
                    {...register("name", {
                      required: "אנא הזינו שם מלא",
                      minLength: {
                        value: 2,
                        message: "השם חייב להכיל לפחות שני תווים",
                      },
                    })}
                  />
                </FormField>

                <FormField
                  label="טלפון"
                  htmlFor="support-phone"
                  required
                  error={errors.phone?.message}
                >
                  <Input
                    id="support-phone"
                    type="tel"
                    placeholder="050-123-4567"
                    inputMode="tel"
                    {...register("phone", {
                      required: "אנא הזינו מספר טלפון",
                      pattern: {
                        value: /^0\d{1,2}-?\d{7}$/,
                        message: "מספר הטלפון שהוזן אינו תקין",
                      },
                    })}
                  />
                </FormField>

                <FormField
                  label="כתובת מייל"
                  htmlFor="support-email"
                  required
                  error={errors.email?.message}
                >
                  <Input
                    id="support-email"
                    type="email"
                    placeholder="example@mail.com"
                    inputMode="email"
                    {...register("email", {
                      required: "אנא הזינו כתובת מייל",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "כתובת המייל שהוזנה אינה תקינה",
                      },
                    })}
                  />
                </FormField>

                <FormField
                  label="הודעה"
                  htmlFor="support-message"
                  required
                  error={errors.message?.message}
                >
                  <Textarea
                    id="support-message"
                    placeholder="ספרו לנו במה נוכל לעזור..."
                    rows={5}
                    showCount
                    maxLength={600}
                    {...register("message", {
                      required: "כתבו לנו כיצד נוכל לסייע",
                      minLength: {
                        value: 10,
                        message: "נשמח לקבל מעט יותר פרטים כדי לעזור בצורה מיטבית",
                      },
                    })}
                  />
                </FormField>

                <div style={{ marginTop: spacing[2] }}>
                  <label className="flex items-start gap-3 cursor-pointer text-sm text-neutral-dark">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-neutral-light text-primary focus:ring-2 focus:ring-primary/20"
                      required
                    />
                    <span>
                      אני מסכים/ה לקבל תקשורת מהמשרד לצורך מתן שירות ועדכונים רלוונטיים
                    </span>
                  </label>
                </div>

                <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
                  שלחו הודעה לצוות Law4Us
                </Button>
              </form>
            </Card>
          </div>
        </section>
      </LazySectionFade>
    </div>
  );
}
