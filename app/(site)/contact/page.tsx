"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { MapPin, Phone, Mail, Clock, Copy, Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button, FormField, Input, Textarea } from "@/components/ui";
import { SlideInView } from "@/components/animations/slide-in-view";
import { LazySectionFade } from "@/components/ui/lazy-section";
import { useToast } from "@/lib/context/ToastContext";
import { colors, spacing, typography, radius, shadows } from "@/lib/design-tokens";
import { CARD_STYLES, TYPOGRAPHY } from "@/lib/constants/styles";

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
    value: "info@law-4-us.co.il",
    href: "mailto:info@law-4-us.co.il",
    copyValue: "info@law-4-us.co.il",
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
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          success(data.message || "ההודעה התקבלה! נחזור אליכם בהקדם.", 6000);
          reset();
        } else {
          error(data.message || "אירעה שגיאה בשליחת הטופס. נסו שוב בעוד רגע.", 6000);
        }
      } catch (err) {
        console.error('Contact form error:', err);
        error("אירעה שגיאה בשליחת הטופס. נסו שוב בעוד רגע.", 6000);
      }
    },
    [error, reset, success]
  );

  return (
    <div>
      <LazySectionFade>
        <section
          className="pt-8 md:pt-0"
          style={{
            paddingTop: spacing.semantic.section.padding.y.desktop,
            paddingBottom: spacing.semantic.section.padding.y.desktop,
          }}
        >
          <div
            style={{
              maxWidth: spacing.semantic.container.maxWidth,
              margin: '0 auto',
              padding: `0 ${spacing[6]}`,
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: spacing[12] }}>
              <p style={{
                ...TYPOGRAPHY.eyebrow,
                marginBottom: spacing[3],
              }}>
                צור קשר
              </p>
              <h1 style={{
                fontSize: 'clamp(36px, 5vw, 64px)',
                fontWeight: typography.fontWeight.bold,
                lineHeight: typography.lineHeight.tight,
                letterSpacing: typography.letterSpacing.tighter,
                color: colors.semantic.text.primary,
                margin: 0,
                marginBottom: spacing[4],
              }}>
                נשמח לעזור לכם בכל שאלה
              </h1>
              <p style={{
                fontSize: 'clamp(18px, 2vw, 22px)',
                fontWeight: typography.fontWeight.medium,
                lineHeight: typography.lineHeight.relaxed,
                color: colors.semantic.text.secondary,
                maxWidth: '48rem',
                margin: '0 auto',
              }}>
                מלאו את הטופס או פנו אלינו ישירות – השירות של Law4Us זמין אונליין, בטלפון ובמייל
                עם ליווי אישי ודיסקרטי לאורך כל הדרך.
              </p>
            </div>

            {/* Content Grid */}
            <div
              style={{
                display: 'grid',
                gap: spacing[10],
              }}
              className="grid-cols-1 lg:grid-cols-[0.85fr,1.15fr]"
            >
              {/* Contact Methods */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[6] }}>
                {contactMethods.map((method, index) => {
                  const Icon = method.icon;
                  const copyValue = method.copyValue;

                  return (
                    <SlideInView key={method.label} direction="up" delay={index * 90}>
                      <div
                        style={{
                          ...CARD_STYLES.container,
                          flexDirection: 'row',
                          alignItems: 'start',
                          justifyContent: 'space-between',
                          gap: spacing[4],
                          padding: spacing.semantic.card.padding.medium,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'start', gap: spacing[4], flex: 1 }}>
                          <div style={{
                            ...CARD_STYLES.iconCircle,
                            flexShrink: 0,
                          }}>
                            <Icon style={{ width: '20px', height: '20px', color: colors.brand.primary.DEFAULT }} />
                          </div>
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: spacing[2],
                              textAlign: 'right',
                              flex: 1,
                            }}>
                              <p style={{
                                fontSize: typography.fontSize.h4.size,
                                fontWeight: typography.fontWeight.semibold,
                                color: colors.semantic.text.primary,
                                margin: 0,
                              }}>
                                {method.label}
                              </p>
                              {method.href ? (
                                <a
                                  href={method.href}
                                  style={{
                                    fontSize: typography.fontSize['body-lg'].size,
                                    fontWeight: typography.fontWeight.medium,
                                    color: colors.brand.primary.DEFAULT,
                                    textDecoration: 'none',
                                  }}
                                  className="hover:underline"
                                >
                                  {method.value}
                                </a>
                              ) : (
                                <p style={{
                                  fontSize: typography.fontSize['body-lg'].size,
                                  fontWeight: typography.fontWeight.medium,
                                  color: colors.semantic.text.primary,
                                  margin: 0,
                                }}>
                                  {method.value}
                                </p>
                              )}
                              {method.helper && (
                                <p style={{
                                  fontSize: typography.fontSize['body-sm'].size,
                                  color: colors.semantic.text.secondary,
                                  margin: 0,
                                }}>
                                  {method.helper}
                                </p>
                              )}
                            </div>

                          {copyValue && (
                            <button
                              type="button"
                              onClick={() => handleCopy(copyValue, method.label)}
                              style={{
                                borderRadius: radius.full,
                                padding: spacing[2],
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                transition: 'background-color 200ms ease',
                                flexShrink: 0,
                              }}
                              className="hover:bg-neutral-100"
                              aria-label={`העתיקו ${method.label}`}
                            >
                              {copiedField === method.label ? (
                                <Check style={{ width: '20px', height: '20px', color: colors.brand.primary.DEFAULT }} />
                              ) : (
                                <Copy style={{ width: '20px', height: '20px', color: colors.semantic.text.secondary }} />
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
                      backgroundColor: colors.opacity.overlay.brand[10],
                      padding: spacing.semantic.card.padding.medium,
                    }}
                  >
                    <p style={{
                      fontSize: typography.fontSize['body-lg'].size,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.semantic.text.primary,
                      margin: 0,
                      textAlign: 'right',
                    }}>
                      זמני מענה: ראשון-חמישי 09:00-18:00, שישי 09:00-13:00. פגישות מקוונות
                      זמינות גם בערב בתיאום מראש.
                    </p>
                  </div>
                </SlideInView>
              </div>

              {/* Contact Form */}
              <SlideInView direction="left" delay={140}>
                <div
                  id="contact-form"
                  style={{
                    backgroundColor: colors.neutral.white,
                    borderRadius: radius.xl,
                    padding: spacing.semantic.card.padding.large,
                    boxShadow: shadows.elevation.xl,
                    border: `1px solid ${colors.opacity.overlay.black[5]}`,
                  }}
                >
                  <div style={{ textAlign: 'right', marginBottom: spacing[8] }}>
                    <h2 style={{
                      fontSize: typography.fontSize.h2.size,
                      fontWeight: typography.fontWeight.bold,
                      color: colors.semantic.text.primary,
                      margin: 0,
                      marginBottom: spacing[2],
                    }}>
                      טופס יצירת קשר
                    </h2>
                    <p style={{
                      fontSize: typography.fontSize['body-lg'].size,
                      color: colors.semantic.text.secondary,
                      margin: 0,
                    }}>
                      מלאו את הפרטים ונחזור אליכם בהקדם האפשרי עם מענה מקצועי ומותאם עבורכם.
                    </p>
                  </div>

                  <form
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: spacing.semantic.form.group.gap,
                    }}
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

                    <div style={{
                      fontSize: typography.fontSize['body-sm'].size,
                      color: colors.semantic.text.primary,
                    }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'start',
                        gap: spacing[3],
                        cursor: 'pointer',
                      }}>
                        <input
                          type="checkbox"
                          style={{
                            marginTop: spacing[1],
                            width: '16px',
                            height: '16px',
                            borderRadius: radius.xs,
                            border: `1px solid ${colors.neutral[300]}`,
                            accentColor: colors.brand.primary.DEFAULT,
                          }}
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
