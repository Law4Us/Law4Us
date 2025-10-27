"use client";

import * as React from "react";
import type { Metadata } from "next";
import { Users, Calculator, Heart, Scale, Brain, Stethoscope, ChevronDown } from "lucide-react";
import { Button, FormField, Input, Textarea } from "@/components/ui";

const assistanceCards = [
  {
    icon: Users,
    title: "יועץ משפחתי",
    description: "מומחה בדינמיקה משפחתית ובתהליכי שינוי. עוזר למשפחות להתמודד עם משברים ולבנות תקשורת בריאה.",
  },
  {
    icon: Calculator,
    title: "יועץ פיננסי / רואה חשבון",
    description: "מסייע בחישוב חלוקת נכסים, חובות והערכת שווי רכוש. חיוני לקבלת תמונה כלכלית מדויקת.",
  },
  {
    icon: Heart,
    title: "יועץ זוגי",
    description: "עוזר לזוגות לנווט משברים, לשפר תקשורת ולהגיע להחלטות מושכלות לגבי העתיד.",
  },
  {
    icon: Scale,
    title: "מגשר",
    description: "צד שלישי ניטרלי שעוזר לבני הזוג להגיע להסכמות בסוגיות שנויות במחלוקת באופן מכבד ומכיל.",
  },
  {
    icon: Brain,
    title: "פסיכולוג",
    description: "תמיכה רגשית מקצועית בתקופה מאתגרת. עוזר להתמודד עם רגשות, חרדות וקשיים נפשיים.",
  },
  {
    icon: Stethoscope,
    title: "פסיכיאטר",
    description: "רופא מומחה לבריאות הנפש. יכול לרשום תרופות במידת הצורך ולטפל במצבים מורכבים יותר.",
  },
];

const faqs = [
  {
    question: "כמה זמן לוקח הליך גירושין?",
    answer:
      "משך הזמן משתנה בהתאם לסוג ההליך. גירושין מוסכמים יכולים להסתיים תוך 3-6 חודשים. הליך שלא בהסכמה יכול לארוך שנה עד שנתיים, תלוי במורכבות התיק ובעומס על בית המשפט. במקרים מורכבים במיוחד, התהליך יכול להימשך אפילו יותר.",
  },
  {
    question: "מה עולה הליך גירושין?",
    answer:
      "העלות משתנה בהתאם לסוג ההליך. בשירות שלנו, המחיר הוא 3,900₪ לכל סוג תביעה (גירושין, משמורת, מזונות, רכוש). ההליך המקוון שלנו חוסך זמן כסף, מבלי לוותר על איכות השירות המשפטי. המחיר כולל הכנת כל המסמכים וייעוץ עם עורך דין.",
  },
  {
    question: "האם אני חייב/ת עורך דין?",
    answer:
      "אינכם חייבים עורך דין, אך מומלץ מאוד. עורך דין יכול להבטיח שהזכויות שלכם נשמרות, לנווט את התהליך המשפטי המורכב, ולעזור להימנע משגיאות יקרות. השירות שלנו מציע ייצוג משפטי במחיר נגיש, כך שתוכלו להינות מייעוץ מקצועי מבלי לשלם מחירים מופרזים.",
  },
  {
    question: "מה קורה אם אין הסכמה על הילדים?",
    answer:
      "אם ההורים לא מצליחים להגיע להסכמה בנוגע למשמורת וסידורי ראיה, בית המשפט יכריע. השופט בוחן מה לטובת הילד - הקשר שלו עם כל הורה, יכולות ההורים, העדפות הילד (בגילאים מתאימים), יציבות ועוד. בית המשפט עשוי גם למנות מומחים (יועצים, פסיכולוגים) לסייע בקבלת ההחלטה.",
  },
  {
    question: "איך מחולק הרכוש?",
    answer:
      "כלל האצבע הוא חלוקה שווה של הרכוש שנצבר במהלך הנישואין. נכסים שהיו לכם לפני הנישואין או שהתקבלו בירושה/מתנה נשארים קנייניכם הפרטי. אם יש הסכם ממון, החלוקה תיעשה לפיו. במקרים מורכבים, כדאי להיעזר במומחה שמה לנכסים ובייעוץ משפטי לקבלת חלוקה הוגנת.",
  },
  {
    question: "האם אפשר לשנות הסדר גירושין קיים?",
    answer:
      "כן, ניתן לבקש לשנות הסדר קיים במידה וחל שינוי מהותי בנסיבות. לדוגמה: שינוי בהכנסה, מצב בריאותי, מעבר דירה, שינוי בצורכי הילד ועוד. יש להגיש בקשה לבית המשפט ולהוכיח את השינוי בנסיבות. בית המשפט יבחן אם השינוי מצדיק עדכון של ההסדר.",
  },
];

export default function HelpPage() {
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(null);

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-white">
        <div className="container-custom section-padding">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-display font-bold mb-6">
              צריכים עזרה?
              <br />
              <span className="text-primary">אנחנו כאן</span>
            </h1>
            <p className="text-body-large text-neutral-dark">
              מקורות תמיכה נוספים, שאלות נפוצות, ואפשרות ליצור קשר ישיר עם הצוות שלנו
            </p>
          </div>
        </div>
      </section>

      {/* Assistance Cards */}
      <section className="bg-neutral-lightest">
        <div className="container-custom section-padding">
          <div className="text-center mb-12">
            <h2 className="text-h1 font-bold mb-4">מקורות תמיכה נוספים</h2>
            <p className="text-body-large text-neutral-dark">
              מומלץ להיעזר במומחים נוספים במקביל להליך המשפטי
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {assistanceCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-lg p-6 shadow-card hover:shadow-lg transition-smooth"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-h3 font-semibold mb-3">{card.title}</h3>
                  <p className="text-body text-neutral-dark">{card.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-white">
        <div className="container-custom section-padding">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-h1 font-bold mb-4">שאלות נפוצות</h2>
              <p className="text-body-large text-neutral-dark">
                תשובות לשאלות הנפוצות ביותר שאנחנו מקבלים
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="border border-neutral rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                    className="w-full px-6 py-4 text-right flex items-center justify-between hover:bg-neutral-lightest transition-smooth"
                  >
                    <span className="text-h3 font-semibold">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        openFaqIndex === idx ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openFaqIndex === idx && (
                    <div className="px-6 py-4 bg-neutral-lightest">
                      <p className="text-body text-neutral-dark">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="bg-neutral-lightest">
        <div className="container-custom section-padding">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-h1 font-bold mb-4">לא מצאתם תשובה?</h2>
              <p className="text-body-large text-neutral-dark">
                שלחו לנו הודעה ונחזור אליכם בהקדם
              </p>
            </div>

            <div className="bg-white rounded-lg p-8">
              <form className="space-y-6">
                <FormField label="שם מלא" htmlFor="name" required>
                  <Input id="name" placeholder="הקלידו כאן שם מלא" />
                </FormField>

                <FormField label="טלפון" htmlFor="phone" required>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="050-123-4567"
                  />
                </FormField>

                <FormField label="כתובת מייל" htmlFor="email" required>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@mail.com"
                  />
                </FormField>

                <FormField label="הודעה" htmlFor="message" required>
                  <Textarea
                    id="message"
                    placeholder="כתבו כאן את ההודעה שלכם..."
                    rows={5}
                  />
                </FormField>

                <div className="text-caption text-neutral-dark">
                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      className="mt-1"
                      required
                    />
                    <span>
                      אני מסכים/ה לקבל תקשורת מהמשרד לצורך מתן שירות ועדכונים רלוונטיים
                    </span>
                  </label>
                </div>

                <Button type="submit" size="lg" className="w-full">
                  שלח הודעה
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
