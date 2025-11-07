"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { MapPin, Phone, Mail, Clock, Copy, Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button, FormField, Input, Textarea } from "@/components/ui";
import { SlideInView } from "@/components/animations/slide-in-view";
import { LazySectionFade } from "@/components/ui/lazy-section";
import { TYPOGRAPHY, CARD_STYLES } from "@/lib/constants/styles";
import { animations } from "@/lib/utils/animations";
import { useToast } from "@/lib/context/ToastContext";
import { colors, spacing } from "@/lib/design-tokens";

type ContactFormValues = {
  name: string;
  phone: string;
  email: string;
  message: string;
};

type ContactMethod = {
  icon: LucideIcon;
  label: string;
  value: string;
  helper?: string;
  href?: string;
  copyValue?: string;
};

const contactMethods: ContactMethod[] = [
  {
    icon: Phone,
    label: "טלפון",
    value: "03-6951408",
    href: "tel:036951408",
    copyValue: "03-6951408",
    helper: "ימים ראשון-חמישי, 09:00-18:00",
  },
  {
    icon: Phone,
    label: "נייד",
    value: "050-7529938",
    href: "tel:0507529938",
    copyValue: "050-7529938",
    helper: "זמין בכל שעה",
  },
  {
    icon: Mail,
    label: "אימייל",
    value: "info@law4us.co.il",
    href: "mailto:info@law4us.co.il",
    copyValue: "info@law4us.co.il",
    helper: "נענה תוך 24 שעות עסקים",
  },
  {
    icon: MapPin,
    label: "כתובת",
    value: "ברקוביץ 4, מגדל המוזיאון, קומה שישית, תל אביב",
    helper: "חניה זמינה בבניין, גישה מלאה לנכים",
  },
  {
    icon: Clock,
    label: "שעות פעילות",
    value: "ראשון-חמישי: 09:00-18:00 | שישי: 09:00-13:00",
    helper: "ניתן לתאם פגישה מקוונת בזמנים נוספים במידת הצורך",
  },
];

export default function ContactPage() {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      message: "",
    },
  });

  const handleCopy = useCallback(
    async (text: string, field: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedField(field);
        success("הפרטים הועתקו בהצלחה.", 4000);
        setTimeout(() => setCopiedField(null), 2000);
      } catch (err) {
        console.error(err);
        error("לא הצלחנו להעתיק את הפרטים. נסו שוב.", 4000);
      }
    },
    [error, success]
  );

  const onSubmit = useCallback(
    async (values: ContactFormValues) => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        success("ההודעה התקבלה! נחזור אליכם בהקדם.", 6000);
        reset();
      } catch (err) {
        console.error(err);
        error("אירעה שגיאה בשליחת הטופס. נסו שוב בעוד רגע.", 6000);
      }
    },
    [error, reset, success]
  );

  return (
    <div>
      <LazySectionFade>
        <section className="section-padding">
          <div className="max-w-[1200px] mx-auto px-6 space-y-12">
            <div className="text-center">
              <p style={TYPOGRAPHY.eyebrow} className="text-primary">
                צור קשר
              </p>
              <h1
                className="text-[36px] sm:text-[48px] lg:text-[64px]"
                style={{
                  ...TYPOGRAPHY.heroH1,
                  fontSize: undefined,
                  margin: 0,
                }}
              >
                נשמח לעזור לכם בכל שאלה
              </h1>
              <p
                className="mx-auto mt-4 max-w-3xl text-[18px] sm:text-[20px] lg:text-[22px]"
                style={{
                  ...TYPOGRAPHY.heroSubtitle,
                  fontSize: undefined,
                }}
              >
                מלאו את הטופס או פנו אלינו ישירות – השירות של Law4Us זמין אונליין, בטלפון ובמייל
                עם ליווי אישי ודיסקרטי לאורך כל הדרך.
              </p>
            </div>

            <div className="grid gap-10 lg:grid-cols-[0.85fr,1.15fr]">
              <div className="space-y-6 text-right">
                {contactMethods.map((method, index) => {
                  const Icon = method.icon;
                  const copyValue = method.copyValue;

                  return (
                    <SlideInView key={method.label} direction="up" delay={index * 90}>
                      <div
                        style={{
                          ...CARD_STYLES.container,
                          backgroundColor: colors.opacity.overlay.white[90],
                          padding: spacing.semantic.card.padding.medium,
                        }}
                        className={`${animations.cardHover}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div style={CARD_STYLES.iconCircle}>
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="space-y-2 text-right">
                              <p style={{ ...TYPOGRAPHY.h3, margin: 0 }}>{method.label}</p>
                              {method.href ? (
                                <a
                                  href={method.href}
                                  style={TYPOGRAPHY.bodyLarge}
                                  className="text-primary underline-offset-4 hover:underline"
                                >
                                  {method.value}
                                </a>
                              ) : (
                                <p style={TYPOGRAPHY.bodyLarge}>{method.value}</p>
                              )}
                              {method.helper && (
                                <p className="text-sm text-text-secondary">{method.helper}</p>
                              )}
                            </div>
                          </div>

                          {copyValue && (
                            <button
                              type="button"
                              onClick={() => handleCopy(copyValue, method.label)}
                              className="rounded-full p-2 transition-colors hover:bg-neutral-100"
                              aria-label={`העתיקו ${method.label}`}
                            >
                              {copiedField === method.label ? (
                                <Check className="h-5 w-5 text-primary" />
                              ) : (
                                <Copy className="h-5 w-5 text-text-secondary" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </SlideInView>
                  );
                })}

                <SlideInView direction="up" delay={contactMethods.length * 90}>
                  <div
                    style={{
                      ...CARD_STYLES.container,
                      backgroundColor: colors.opacity.overlay.white[90],
                      padding: spacing.semantic.card.padding.medium,
                    }}
                    className={`${animations.cardHover}`}
                  >
                    <p style={TYPOGRAPHY.bodyLarge} className="text-text-secondary">
                      זמני מענה: ראשון-חמישי 09:00-18:00, שישי 09:00-13:00. פגישות מקוונות
                      זמינות גם בערב בתיאום מראש.
                    </p>
                  </div>
                </SlideInView>
              </div>

              <SlideInView direction="left" delay={140}>
                <div
                  id="contact-form"
                  style={{
                    ...CARD_STYLES.container,
                    backgroundColor: colors.opacity.overlay.white[90],
                    padding: spacing.semantic.card.padding.large,
                  }}
                  className="rounded-3xl shadow-xl"
                >
                  <div className="text-right">
                    <h2 style={TYPOGRAPHY.h3} className="mb-2">
                      טופס יצירת קשר
                    </h2>
                    <p style={TYPOGRAPHY.bodyLarge} className="text-text-secondary">
                      מלאו את הפרטים ונחזור אליכם בהקדם האפשרי עם מענה מקצועי ומותאם עבורכם.
                    </p>
                  </div>

                  <form
                    className="mt-8 space-y-4"
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                  >
                    <FormField
                      label="שם מלא"
                      htmlFor="contact-name"
                      required
                      error={errors.name?.message}
                    >
                      <Input
                        id="contact-name"
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
                      htmlFor="contact-phone"
                      required
                      error={errors.phone?.message}
                    >
                      <Input
                        id="contact-phone"
                        type="tel"
                        inputMode="tel"
                        placeholder="050-123-4567"
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
                      htmlFor="contact-email"
                      required
                      error={errors.email?.message}
                    >
                      <Input
                        id="contact-email"
                        type="email"
                        inputMode="email"
                        placeholder="example@mail.com"
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
                      htmlFor="contact-message"
                      required
                      error={errors.message?.message}
                    >
                      <Textarea
                        id="contact-message"
                        placeholder="ספרו לנו בקצרה על הסיטואציה שלכם..."
                        rows={5}
                        showCount
                        maxLength={600}
                        {...register("message", {
                          required: "כתבו לנו כיצד נוכל לסייע",
                          minLength: {
                            value: 10,
                            message: "כדי שנוכל לעזור, נשמח לקבל מעט יותר פרטים",
                          },
                        })}
                      />
                    </FormField>

                    <div className="text-sm text-text-primary">
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 rounded-xs border-neutral-300 text-primary shadow-input focus:shadow-input-focus transition-smooth"
                          required
                        />
                        <span>
                          אני מסכים/ה לקבל תקשורת מהמשרד לצורך מתן שירות ועדכונים רלוונטיים
                        </span>
                      </label>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      loading={isSubmitting}
                    >
                      שלחו את ההודעה
                    </Button>
                  </form>
                </div>
              </SlideInView>
            </div>
          </div>
        </section>
      </LazySectionFade>
    </div>
  );
}

