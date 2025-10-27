"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { LogoCarousel } from "@/components/logo-carousel";

export default function Home() {
  const [selectedClaimTab, setSelectedClaimTab] = React.useState(0);
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  const claimTabs = [
    { title: "תביעת/כתב הגנה מזונות", id: "alimony" },
    { title: "תביעת/כתב הגנה רכושית", id: "property" },
    { title: "תביעת/כתב הגנה משמורת", id: "custody" },
    { title: "תביעת גירושין", id: "divorce" },
    { title: "צוואה", id: "will" },
  ];

  const faqs = [
    {
      q: "תוך כמה זמן מסתיים ההליך?",
      a: "משך הזמן תלוי בסוג התביעה ובמורכבות העניין. בממוצע, תהליך גירושין בהסכמה יכול להימשך בין 3-6 חודשים. אנחנו עושים הכל כדי לזרז את התהליך ולהבטיח שהוא יתבצע בצורה היעילה ביותר."
    },
    {
      q: "למה נכון לבצע אונליין ולא בדרך השגרתית העתיקה?",
      a: "השירות האונליין מאפשר לכם לחסוך זמן, כסף ומאמץ. אין צורך בנסיעות למשרד, אפשר למלא טפסים בנוחות מהבית, ולקבל ליווי מקצועי מלא של עורכי דין מנוסים במחיר הוגן בהרבה. התהליך שקוף, מהיר ויעיל יותר."
    },
    {
      q: "איך אקבל עדכונים לגבי ההליך?",
      a: "תקבלו עדכונים שוטפים במייל ובהודעות SMS בכל שלב משמעותי בתהליך. בנוסף, תוכלו תמיד ליצור קשר עם עורך הדין המלווה שלכם לקבלת הבהרות ומידע נוסף."
    },
    {
      q: "האם יהיו תוספות למחיר הנקבע?",
      a: "המחיר שאנחנו מציגים הוא המחיר הסופי. אין תוספות מפתיעות או עלויות נסתרות. הכל שקוף וברור מראש, כך שתוכלו לתכנן את התקציב שלכם בראש שקט."
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-[#eef2f3] pt-16 pb-20">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          {/* Badge/Tag */}
          <div
            className="inline-flex items-center mb-8"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(12, 23, 25, 0.1)',
              borderRadius: '2px',
              paddingLeft: '12px',
              paddingRight: '12px',
              paddingTop: '8px',
              paddingBottom: '8px'
            }}
          >
            <span
              style={{
                fontSize: '16px',
                lineHeight: '100%',
                letterSpacing: '-0.02em',
                fontWeight: 600,
                color: '#0C1719'
              }}
            >
              הדרך <span style={{ color: '#019FB7' }}>הטובה ביותר</span> לפתרון בהליך הגירושין
            </span>
          </div>

          {/* Main Heading - h1: 80px Bold, -4% letter spacing, 100% line height */}
          <h1
            className="mb-6"
            style={{
              fontSize: '80px',
              fontWeight: 'bold',
              lineHeight: '100%',
              letterSpacing: '-0.04em',
              color: '#0C1719'
            }}
          >
            פתיחת תיק גירושין <span style={{ color: '#019FB7' }}>אונליין</span> מנוהל
            <br />
            על ידי עורכי דין מנוסים ובמחיר הוגן
          </h1>

          {/* Subtitle - 24px Medium, 130% line height, -4% letter spacing */}
          <p
            className="mb-10 max-w-3xl mx-auto"
            style={{
              fontSize: '24px',
              fontWeight: 500,
              lineHeight: '130%',
              letterSpacing: '-0.04em',
              color: '#0C1719'
            }}
          >
            שירות נגיש ואמין מבית עורכי דין מנוסים, בקלות ובשקיפות מלאה. כל
            התהליך מתבצע אונליין, בלי פשרות ובעלות שכל אחד יכול להרשות לעצמו.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/divorce"
              className="inline-flex items-center justify-center transition-colors"
              style={{
                backgroundColor: '#EEF2F3',
                border: '0.5px solid #018DA2',
                borderRadius: '6px',
                color: '#0C1719',
                paddingLeft: '32px',
                paddingRight: '32px',
                paddingTop: '16px',
                paddingBottom: '16px',
                fontSize: '18px',
                fontWeight: 600,
                lineHeight: '120%',
                letterSpacing: '0',
                boxShadow: '0 0 0 4px rgba(1, 159, 183, 0.2)'
              }}
            >
              מהו הליך הגירושין?
            </Link>
            <Link
              href="/wizard"
              className="inline-flex items-center justify-center transition-colors"
              style={{
                backgroundColor: '#019FB7',
                border: '0.5px solid #018DA2',
                borderRadius: '6px',
                color: '#EEF2F3',
                paddingLeft: '32px',
                paddingRight: '32px',
                paddingTop: '16px',
                paddingBottom: '16px',
                fontSize: '18px',
                fontWeight: 600,
                lineHeight: '120%',
                letterSpacing: '0'
              }}
            >
              התחילו בהליך גירושין
            </Link>
          </div>

          {/* Press Logos */}
          <div className="text-center">
            <p
              className="text-[#019FB7] mb-6"
              style={{
                fontSize: '16px',
                fontWeight: 600,
                lineHeight: '100%',
                letterSpacing: '-0.02em'
              }}
            >
              כתבו עלינו
            </p>
            <LogoCarousel />
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="bg-[#EEF2F3]" id="video">
        <div className="max-w-[900px] mx-auto px-6">
          {/* Container for video and decorative border */}
          <div className="relative">
            {/* Decorative border background */}
            <div
              className="absolute top-1/2 left-1/2"
              style={{
                width: '930px',
                aspectRatio: '2.04237',
                border: '1px solid rgba(12, 23, 25, 0.1)',
                borderRadius: '16px',
                transform: 'translate(-50%, -50%)',
                zIndex: 0
              }}
            />

            {/* Video container with shadows and stroke */}
            <div
              className="relative w-full cursor-pointer group"
              style={{
                aspectRatio: '900 / 540',
                borderRadius: '16px',
                border: '1px solid #C7CFD1',
                boxShadow: `
                  0 10px 20px 5px rgba(12, 23, 25, 0.05),
                  0 0 0 6px rgba(213, 219, 220, 0.25),
                  0 0 0 12px rgba(213, 219, 220, 0.25)
                `,
                overflow: 'hidden',
                zIndex: 1,
                position: 'relative'
              }}
            >
              {/* Video thumbnail */}
              <Image
                src="/images/video overlay ariel-min.webp"
                alt="עו״ד אריאל דרור - איך מתחילים הליך גירושין"
                fill
                className="object-cover"
                priority
              />

              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div
                  className="rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: '#019FB7',
                    border: '3px solid rgba(255, 255, 255, 0.3)'
                  }}
                >
                  <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - 3 Steps */}
      <section className="bg-[#EEF2F3] py-20" id="how">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            {/* Eyebrow */}
            <p
              className="mb-6"
              style={{
                color: '#019FB7',
                fontSize: '16px',
                fontWeight: 600,
                lineHeight: '100%',
                letterSpacing: '-0.02em'
              }}
            >
              שלושה שלבים פשוטים לקבלת תביעת גירושין
            </p>
            {/* H2 */}
            <h2
              className="mb-6"
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                lineHeight: '100%',
                letterSpacing: '-0.04em',
                color: '#0C1719'
              }}
            >
              איך פותחים איתנו תביעת גירושין אונליין
            </h2>
            {/* Subheader */}
            <p
              style={{
                fontSize: '20px',
                fontWeight: 500,
                lineHeight: '130%',
                letterSpacing: '-0.04em',
                color: '#515F61'
              }}
            >
              שירות מקצועי, מהיר ונוח – בליווי מלא של אנשי מקצוע, תביעת גירושין נפתחת בשלושה צעדים פשוטים אונליין
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {/* Step 01 */}
            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="text-6xl font-bold text-gray-200 mb-6">01</div>
              <h3 className="text-2xl font-bold mb-4">נרשמים ב5 דקות בהליך פשוט</h3>
              <p className="text-gray-600 leading-relaxed">
                ממלאים טופס קצר עם פרטיכם. אין צורך בידע משפטי או בהכנות מוקדמות – אנחנו נדאג לכל השאר.
              </p>
              <div className="mt-6 bg-gray-50 rounded-xl p-6">
                <div className="space-y-3 text-sm text-gray-500 text-right">
                  <div className="flex justify-between border-b pb-2">
                    <span>בעל</span>
                    <span>אישה</span>
                  </div>
                  <div className="text-right space-y-1">
                    <div>שם מלא</div>
                    <div>שם מלא</div>
                    <div>דגר</div>
                    <div>דגר</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 02 */}
            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="text-6xl font-bold text-gray-200 mb-6">02</div>
              <h3 className="text-2xl font-bold mb-4">נפגשים אונליין עם עורך דין</h3>
              <p className="text-gray-600 leading-relaxed">
                נפגשים בזום עם עורך דין שיאמת אותכם ויסביר את התהליך - הכל בנעימות וללא צורך לצאת מהבית.
              </p>
              <div className="mt-6 bg-gray-50 rounded-xl p-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-3"></div>
                  <p className="text-xs text-gray-500">Ariel Meeting<br/>5:20</p>
                </div>
              </div>
            </div>

            {/* Step 03 */}
            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="text-6xl font-bold text-gray-200 mb-6">03</div>
              <h3 className="text-2xl font-bold mb-4">מקבלים תביעה מוכנה לבית משפט</h3>
              <p className="text-gray-600 leading-relaxed">
                בסיום התהליך תקבלו מסמך משפטי רשמי מוכן להגשה
                לבית המשפט ללא צורך בתערבות נוספת.
              </p>
              <div className="mt-6 bg-gray-50 rounded-xl p-6">
                <div className="text-xs text-gray-400 text-right space-y-2">
                  <div>תאריך: בית משפט - משפט פלוני - משפט תאריך</div>
                  <div className="border-b"></div>
                  <div>שכך:</div>
                  <div>דן:</div>
                  <div>הצפאריים בשי שלם משפט תימליםי צפרייםי משכתל –</div>
                  <div>הצפרייםי תגמר והט האטכלר –</div>
                  <div>מקלמ</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits - 4 Cards */}
      <section className="bg-[#EEF2F3] py-20">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-center mb-12">
            {/* Eyebrow */}
            <p
              className="mb-6"
              style={{
                color: '#019FB7',
                fontSize: '16px',
                fontWeight: 600,
                lineHeight: '100%',
                letterSpacing: '-0.02em'
              }}
            >
              למה לבחור בנו?
            </p>
            {/* H2 */}
            <h2
              className="mb-6"
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                lineHeight: '100%',
                letterSpacing: '-0.04em',
                color: '#0C1719'
              }}
            >
              כל היתרונות של שירות דיגיטלי, עם ליווי משפטי מהשורה הראשונה
            </h2>
            {/* Subheader */}
            <p
              style={{
                fontSize: '20px',
                fontWeight: 500,
                lineHeight: '130%',
                letterSpacing: '-0.04em',
                color: '#515F61'
              }}
            >
              שירות אישי, זמינות מרבית, מחיר הוגן ותהליך שקוף – כל מה שצריך בשביל להתחיל תהליך בראש שקט.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center hover:border-[#019fb7] transition-colors">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
              </div>
              <h3 className="text-xl font-bold mb-3">חיסכון בכסף ובזמן</h3>
              <p className="text-gray-600">
                תהליך יעיל ודיגיטלי שחוסך לך כסף, זמן ובירוקרטיה מיותרת.
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center hover:border-[#019fb7] transition-colors">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
              </div>
              <h3 className="text-xl font-bold mb-3">מחיר הוגן ושקיפות</h3>
              <p className="text-gray-600">
                תשלום רק על מה שבאמת צריך – בלי הפתעות, הכל ברור ושקוף.
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center hover:border-[#019fb7] transition-colors">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
              </div>
              <h3 className="text-xl font-bold mb-3">שירות ומקצועיות</h3>
              <p className="text-gray-600">
                ליווי אישי של עורכי דין מנוסים, שירות ברמה הגבוהה ביותר.
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center hover:border-[#019fb7] transition-colors">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
              </div>
              <h3 className="text-xl font-bold mb-3">זמינות וגמישות</h3>
              <p className="text-gray-600">
                שעות פעילות נרחבות, הרבה מעבר למקובל במשרדים רגילים.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Claim Types Section */}
      <section className="bg-[#EEF2F3] py-20" id="claim-types">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            {/* Eyebrow */}
            <p
              className="mb-6"
              style={{
                color: '#019FB7',
                fontSize: '16px',
                fontWeight: 600,
                lineHeight: '100%',
                letterSpacing: '-0.02em'
              }}
            >
              סוגי תביעות
            </p>
            {/* H2 */}
            <h2
              className="mb-6"
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                lineHeight: '100%',
                letterSpacing: '-0.04em',
                color: '#0C1719'
              }}
            >
              בחרו את סוג התביעה ואנחנו נלווה אתכם עד הסוף
            </h2>
            {/* Subheader */}
            <p
              style={{
                fontSize: '20px',
                fontWeight: 500,
                lineHeight: '130%',
                letterSpacing: '-0.04em',
                color: '#515F61'
              }}
            >
              בין אם אתם זקוקים למזונות, רכוש, משמורת, יישוב סכסוך, או צוואה – אנחנו כאן כדי ללוות אותכם בתהליך מותאם אישית לצרכים שלכם
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Content Area */}
              <div className="flex-1 order-2 lg:order-1">
                <div className="text-right">
                  <h3 className="text-2xl font-bold mb-6">
                    תביעה לקביעת תשלום מזונות לילדים בעת פרידה בין ההורים.
                  </h3>

                  {/* FAQ Items */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">☕</span>
                      </div>
                      <div className="flex-1 text-right">
                        <h4 className="font-bold text-lg mb-2">מי משלם מזונות?</h4>
                        <p className="text-gray-600">
                          בית המשפט קובע מי מההורים אחראי לתשלום המזונות בהתאם לחלוקת האחריות ההורית.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">💰</span>
                      </div>
                      <div className="flex-1 text-right">
                        <h4 className="font-bold text-lg mb-2">כיצד נקבע הסכום?</h4>
                        <p className="text-gray-600">
                          גובה המזונות נקבע לפי שיקולים עיקריים כמו רמת ההשתכרות של כל הורה, זמני השהות עם הילדים, וצרכי הילדים בפועל.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">⚖️</span>
                      </div>
                      <div className="flex-1 text-right">
                        <h4 className="font-bold text-lg mb-2">מהם הפרמטרים המרכזיים?</h4>
                        <p className="text-gray-600">
                          הפרמטרים המרכזיים בהחלטה הם הכנסת ההורים, חלוקת הזמנים עם הילדים, והצרכים הספציפיים של כל ילד.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 text-center">
                    <Link
                      href="/wizard"
                      className="inline-flex items-center justify-center px-8 py-4 bg-[#019fb7] text-white text-lg font-medium rounded-lg hover:bg-[#018da2] transition-colors"
                    >
                      התחילו בהליך גירושין
                    </Link>
                  </div>
                </div>
              </div>

              {/* Vertical Tabs */}
              <div className="w-full lg:w-80 order-1 lg:order-2">
                <div className="flex flex-col gap-2">
                  {claimTabs.map((tab, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedClaimTab(index)}
                      className={`px-6 py-4 text-right font-medium transition-all rounded-lg ${
                        selectedClaimTab === index
                          ? "bg-[#019fb7] text-white shadow-md"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {tab.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-[#EEF2F3] py-20" id="testimonials">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            {/* Eyebrow */}
            <p
              className="mb-6"
              style={{
                color: '#019FB7',
                fontSize: '16px',
                fontWeight: 600,
                lineHeight: '100%',
                letterSpacing: '-0.02em'
              }}
            >
              לקוחות מספרים
            </p>
            {/* H2 */}
            <h2
              className="mb-6"
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                lineHeight: '100%',
                letterSpacing: '-0.04em',
                color: '#0C1719'
              }}
            >
              סיפורי הצלחה ממי שכבר עברו את הדרך
            </h2>
            {/* Subheader */}
            <p
              style={{
                fontSize: '20px',
                fontWeight: 500,
                lineHeight: '130%',
                letterSpacing: '-0.04em',
                color: '#515F61'
              }}
            >
              מכתבים וחוויות של לקוחות אמיתיים שליווינו לאורך כל הדרך – כדי שתוכלו לדעת בדיוק למה לצפות, ולמה אפשר לסמוך עלינו.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-2xl p-6">
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                "אריאל מודה לך על היחס, השירות, ומעל הכל על החכמה הרבה, היכולת האסטרטגית והחשיבה המקורית היצירתית בכל פעולה שעשינו. אני חייב לציין, שהחשיבה שלך, על טובת הילדים, הנה דבר יפה ומוערך על ידי. שילוב היכולת שלך, והעבודה המשותפת, הביאו אותי לתוצאות מרשימות ביותר."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">א</span>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">אבי</p>
                  <p className="text-xs text-gray-500">לקוח</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                "אריאל היקר! הגעתי אליך על מנת שתטפל בתיק הגירושין שלי. לכל אורך הדרך היית לי אוזן קשבת, תמכת, וניהלת את העניינים במקצועיות, בחכמה, באסטרטגיה וביצירתיות רבה!! לא פלא שלאחר מספר חודשים מועטים סיימנו את התיק מחוץ לכותלי בית המשפט, בהסכם מדהים שלא חשבתי לרגע שאגיע אליו. מוקירה ומעריכה."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">ד</span>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">ד"ר אודליה עמית</p>
                  <p className="text-xs text-gray-500">מרכז רפואי איכילוב</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                "אריאל תודה!!! אני עכשיו מבין מה המשמעות לעו"ד ברמה גבוהה לסתם עו"ד מן המניין. המקצוענות, ההקשבה, הראייה האסטרטגית, החשיבה מחוץ לקופסא והביטחון הרב שאתה ואנשיך נותנים, היא ברמה הכי גבוהה. אז שוב תודה על הכל, עשיתם אותי מאושר, ירדה לי אבן גדולה מהלב. במילה אחת: מקצוען!!!!!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">ר</span>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">ר.פ</p>
                  <p className="text-xs text-gray-500">לקוח</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-[#EEF2F3] py-20" id="faq">
        <div className="max-w-[900px] mx-auto px-6">
          <div className="text-center mb-12">
            {/* Eyebrow */}
            <p
              className="mb-6"
              style={{
                color: '#019FB7',
                fontSize: '16px',
                fontWeight: 600,
                lineHeight: '100%',
                letterSpacing: '-0.02em'
              }}
            >
              שאלות ותשובות
            </p>
            {/* H2 */}
            <h2
              className="mb-6"
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                lineHeight: '100%',
                letterSpacing: '-0.04em',
                color: '#0C1719'
              }}
            >
              יש לכם שאלות? יש לנו תשובות
            </h2>
            {/* Subheader */}
            <p
              style={{
                fontSize: '20px',
                fontWeight: 500,
                lineHeight: '130%',
                letterSpacing: '-0.04em',
                color: '#515F61'
              }}
            >
              אספנו כאן את השאלות הנפוצות ביותר על התהליך והכל ברור, פשוט ושקוף, כדי שתוכלו לפעול בראש שקט.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 text-right flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                  <span className="font-medium text-lg">{faq.q}</span>
                </button>
                {openFaq === index && faq.a && (
                  <div className="px-6 pb-5 text-gray-600 text-right leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-[#EEF2F3] py-20">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-center mb-12">
            {/* Eyebrow */}
            <p
              className="mb-6"
              style={{
                color: '#019FB7',
                fontSize: '16px',
                fontWeight: 600,
                lineHeight: '100%',
                letterSpacing: '-0.02em'
              }}
            >
              מי אנחנו
            </p>
            {/* H2 */}
            <h2
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                lineHeight: '100%',
                letterSpacing: '-0.04em',
                color: '#0C1719'
              }}
            >
              מי אנחנו? הסיפור מאחורי ההצלחה
            </h2>
          </div>

          <div className="max-w-4xl mx-auto text-right leading-relaxed space-y-4 text-gray-700">
            <p>
              אנחנו גוף, שבאמצע העשור השלישי, לאחר אלפי תיקים, רוצה להנגיש את היכולת לקבל את השירות המקצועי ברמה הכי גבוהה, במחיר שכל אחד יכול להרשות לעצמו, לרכוש את מיטב עורכי הדין בישראל.
            </p>
            <p>
              שילוב של ניסיון רב שנים, אנושיות, ורמת שירות – הכל במחיר שפוי שמאפשר לכל אדם לדאוג למשפחתו, ולהותיר את רכושו אצלו.
            </p>
            <p>
              משרד עוה"ד אריאל דרור הוקם על ידי עו"ד אריאל דרור בשנת 2001. עורכי הדין במשרד עוסקים בתיקי משפחה המשלבים בתוכם תחומים מגוונים בתוך ענייני המשפחה.
            </p>
            <p>
              המשרד חרט על דגלו את המוטו של מתן שירות אישי ומקצועי ברמה הגבוהה ביותר. עו"ד דרור הינו בעל תואר ראשון במשפטים ותואר שני במשפטים מאוניברסיטת תל אביב. עו"ד דרור שימש כממלא מקום יו"ר ועדת בתי משפט למשפחה שליד הועד המרכזי בלשכת עורכי הדין, כחבר בוועדת נשיאויות בתי משפט שליד הועד המרכזי, כחבר בוועדת בתי דין רבנים שליד ועד המרכזי, וכסגן יו"ר ועדת בתי משפט לענייני משפחה שליד הועד המרכזי.
            </p>
            <p>
              עו"ד דרור הוציא ספר בשם "חלוקת רכוש בהליך גירושין", המציג באופן מקיף ונהיר את כל הסוגיות המרכזיות הרלבנטיות בכל הנוגע לחלוקת רכוש בין בני זוג, ביחס הלכת השיתוף, וביחס למשטר חוק יחסי ממון. הספר נרכש ע"י הפקולטות השונות למשפטים, וכן ע"י משרד המשפטים, ומכר עד כה מאות עותקים. הספר צוטט בבתי המשפט, לרבות בבית המשפט העליון.
            </p>
            <p className="font-medium">
              המשרד דורג ב-duns 100 כאחד המשרדים הידועים במדינת ישראל.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="bg-[#EEF2F3] py-20" id="blog">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            {/* Eyebrow */}
            <p
              className="mb-6"
              style={{
                color: '#019FB7',
                fontSize: '16px',
                fontWeight: 600,
                lineHeight: '100%',
                letterSpacing: '-0.02em'
              }}
            >
              הבלוג שלנו
            </p>
            {/* H2 */}
            <h2
              className="mb-6"
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                lineHeight: '100%',
                letterSpacing: '-0.04em',
                color: '#0C1719'
              }}
            >
              הבלוג שלנו – ידע מקצועי, תובנות, וטיפים מעשיים
            </h2>
            {/* Subheader */}
            <p
              style={{
                fontSize: '20px',
                fontWeight: 500,
                lineHeight: '130%',
                letterSpacing: '-0.04em',
                color: '#515F61'
              }}
            >
              התעדכנו במאמרים, מדריכים וטיפים שיעשו לכם סדר בנושאים משפטיים ודיגיטליים – בשפה פשוטה, בגובה העיניים, עם ערך אמיתי מהשטח.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative aspect-video bg-gradient-to-br from-gray-400 to-gray-500 overflow-hidden">
                {/* Video thumbnail with play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-sm mb-2">עו"ד אריאל דרור</div>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-black/30 rounded-full flex items-center justify-center">
                    <div className="w-0 h-0 border-t-6 border-t-transparent border-l-8 border-l-white border-b-6 border-b-transparent ml-1"></div>
                  </div>
                </div>
              </div>
              <div className="p-6 text-right">
                <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                  <span>0 דקות</span>
                  <span>•</span>
                  <span>29 במאי 2025</span>
                </div>
                <h3 className="font-bold text-xl mb-3">
                  הורים מתגרשים: מה באמת חשוב לדעת על משמורת הילדים? 1
                </h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative aspect-video bg-gradient-to-br from-gray-400 to-gray-500 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-sm mb-2">עו"ד אריאל דרור</div>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-black/30 rounded-full flex items-center justify-center">
                    <div className="w-0 h-0 border-t-6 border-t-transparent border-l-8 border-l-white border-b-6 border-b-transparent ml-1"></div>
                  </div>
                </div>
              </div>
              <div className="p-6 text-right">
                <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                  <span>2 דקות</span>
                  <span>•</span>
                  <span>29 במאי 2025</span>
                </div>
                <h3 className="font-bold text-xl mb-3">
                  הורים מתגרשים: מה באמת חשוב לדעת על משמורת הילדים? 2
                </h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative aspect-video bg-gradient-to-br from-gray-400 to-gray-500 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-sm mb-2">עו"ד אריאל דרור</div>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-black/30 rounded-full flex items-center justify-center">
                    <div className="w-0 h-0 border-t-6 border-t-transparent border-l-8 border-l-white border-b-6 border-b-transparent ml-1"></div>
                  </div>
                </div>
              </div>
              <div className="p-6 text-right">
                <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                  <span>0 דקות</span>
                  <span>•</span>
                  <span>29 במאי 2025</span>
                </div>
                <h3 className="font-bold text-xl mb-3">
                  מה באמת חשוב לדעת על משמורת הילדים?
                </h3>
              </div>
            </div>
          </div>

          {/* Read More Button */}
          <div className="text-center mt-8">
            <Link
              href="/blog"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-gray-300 text-gray-700 text-lg font-medium rounded-lg hover:border-gray-400 transition-colors"
            >
              קראו עוד
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA with Lawyer Photo */}
      <section className="bg-[#EEF2F3] py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="bg-gradient-to-l from-[#019fb7] to-[#4DB8C8] rounded-3xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
              <div className="bg-gray-200 aspect-square lg:aspect-auto lg:h-full">
                {/* Lawyer photo placeholder */}
              </div>
              <div className="p-12 text-right text-white">
                <p className="text-sm mb-4 opacity-90">
                  הדרך הקלה והמהירה ביותר לפתרון בתהליך גירושין
                </p>
                <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                  מוכנים לקחת את
                  <br />
                  הצעד הבא?
                </h2>
                <p className="text-lg mb-8 opacity-90">
                  צעד אחד פשוט יתחיל את התהליך – בליווי עורכי דין מנוסים, בצורה
                  <br />
                  דיגיטלית יעילה וברורה, בלי עיכובים ובלי סיבוכים.
                </p>
                <Link
                  href="/wizard"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#019fb7] text-lg font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  התחילו בהליך גירושין
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
