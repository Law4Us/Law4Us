"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { LogoCarousel } from "@/components/logo-carousel";
import { HomeBlogSection } from "@/components/home-blog-section";
import { TYPOGRAPHY, STEP_BOX_STYLES, CARD_STYLES, CTA_STYLES } from "@/lib/constants/styles";

export default function Home() {
  const [selectedClaimTab, setSelectedClaimTab] = React.useState(0);
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  const claimTabs = [
    {
      title: "תביעת/כתב הגנה מזונות",
      id: "alimony",
      description: "תביעה לקביעת תשלום מזונות לילדים בעת פרידה בין ההורים.",
      questions: [
        {
          q: "מי משלם מזונות?",
          a: "בית המשפט קובע מי מההורים אחראי לתשלום המזונות בהתאם לחלוקת האחריות ההורית.",
        },
        {
          q: "כיצד נקבע הסכום?",
          a: "גובה המזונות נקבע לפי שיקולים עיקריים כמו רמת ההשתכרות של כל הורה, זמני השהות עם הילדים, וצרכי הילדים בפועל.",
        },
        {
          q: "מהם הפרמטרים המרכזיים?",
          a: "הפרמטרים המרכזיים בהחלטה הם הכנסת ההורים, חלוקת הזמנים עם הילדים, והצרכים הספציפיים של כל ילד.",
        },
      ]
    },
    {
      title: "תביעת/כתב הגנה רכושית",
      id: "property",
      description: "תביעה רכושית עוסקת בחלוקת הרכוש בין בני זוג עם סיום הקשר.",
      questions: [
        {
          q: "תחולת החוק",
          a: "חוק יחסי ממון חל על זוגות שנישאו אחרי 1.1.1974 ומסדיר את חלוקת הרכוש במקרה של פרידה.",
        },
        {
          q: "מה נחשב לרכוש משותף",
          a: "כל רכוש שצברו בני הזוג במהלך הנישואין ועד ליום הפרידה נחשב בדרך כלל משותף ומתחלק שווה בשווה.",
        },
        {
          q: "תפקיד בית המשפט",
          a: "בית המשפט לענייני משפחה מסייע בחלוקת הנכסים, החובות והזכויות בהתאם להוראות החוק ולנסיבות האישיות של כל מקרה.",
        },
      ]
    },
    {
      title: "תביעת/כתב הגנה משמורת",
      id: "custody",
      description: "תביעה לקביעת מקום מגורי הילדים והסדרי השהות לאחר פרידה.",
      questions: [
        {
          q: "קביעת זהות ההורה המשמורן",
          a: "בית המשפט מחליט אצל איזה הורה יתגוררו הילדים, ומה תהיה החלוקה בין ההורים (משמורת משותפת או הסדר אחר).",
        },
        {
          q: "הסדרי שהות וזמני חלוקה",
          a: "נקבעים הסדרי השהות של הילדים – כמה זמן ישהו אצל כל הורה, כולל סופי שבוע, חגים וחופשות.",
        },
        {
          q: "מענה למצבים מיוחדים",
          a: "התביעה מסדירה גם את ההתנהלות במקרים מיוחדים – למשל כשילד חולה, נסיעות לחו\"ל, או אירועים חריגים.",
        },
      ]
    },
    {
      title: "תביעת גירושין",
      id: "divorce",
      description: "תביעה לסיום הנישואין המוגשת לבית הדין הרבני.",
      questions: [
        {
          q: "עילות ותנאים לגירושין",
          a: "בית הדין בוחן האם קיימת עילת גירושין (כגון בגידה, מרידה, אי קיום יחסי אישות, מעשי כיעור ועוד) וכן את נושא הכתובה.",
        },
        {
          q: "שילוב נושאים נוספים",
          a: "לעיתים ניתן לכרוך בתביעה נושאים נוספים – כמו משמורת ילדים, מזונות ורכוש – כדי שיידונו כולם בבית הדין הרבני.",
        },
        {
          q: "הליך יישוב סכסוך",
          a: "במקרים מסוימים, מתקיים הליך גישור (\"יישוב סכסוך\") בבית הדין לפני קבלת ההחלטות הסופיות.",
        },
      ]
    },
    {
      title: "הסכם גירושין",
      id: "divorce-agreement",
      description: "הסכם המסדיר את כלל ההיבטים של הפרידה בהסכמה בין בני הזוג.",
      questions: [
        {
          q: "מה כולל הסכם גירושין?",
          a: "הסכם גירושין מסדיר את כל הנושאים הרלוונטיים: משמורת ילדים, מזונות, חלוקת רכוש, חובות משותפים והסדרי ראיה.",
        },
        {
          q: "למה כדאי הסכם גירושין?",
          a: "הסכם בהסכמה חוסך זמן, כסף והליכים משפטיים ממושכים, ומאפשר לצדדים שליטה מלאה על התוצאה.",
        },
        {
          q: "איך מאשרים הסכם גירושין?",
          a: "לאחר החתימה, ההסכם מוגש לבית המשפט או לבית הדין לאישור, והופך לפסק דין מחייב.",
        },
      ]
    },
  ];

  const testimonials = {
    right: [
      {
        name: "לימור לבנת",
        title: "שרת התרבות והספורט" as string | undefined,
        avatar: "/לימור לבנת.avif" as string | undefined,
        text: "קראתי בעניין רב את מדריך הגירושין מאיר העיניים שהוכן על ידי משרדך ושלחת אלי. בטוח כי הוא ישמש כעזר רב עבור אלו העומדים בפני התהליך הלא פשוט של פירוק התא המשפחתי ויקל, ולו במקצת, על לחץ אי-הוודאות האופף דרך כלל תקופה זו."
      },
      {
        name: "ר.א",
        title: undefined as string | undefined,
        avatar: undefined as string | undefined,
        text: "אריאל, גם הפעם, תשע שנים אחרי, פניתי אלייך מבולבלת ונסערת. ואתה, גם הפעם, לא איכזבת... תודה לך על התשובות הכנות, על היעוץ ועל ההדרכה. תודה לך על הכל!"
      },
      {
        name: "ש",
        title: undefined as string | undefined,
        avatar: undefined as string | undefined,
        text: "שלום אריאל וצילה! ליויתים אותי באופן צמוד במשך שנה שלמה, במסגרת ניסיונותיי להגיע להבנות מול אשתי ללא צורך בביהמ\"ש. עשיתם את שלכם בצורה מקצועית וראויה, עם עצות טובות זמינות וגמישות – ואני מודה לכם! אשמח להפנות אליכם לקוחות. ושניפגש רק בשמחות! כל טוב"
      }
    ],
    middle: [
      {
        name: "ד\"ר אודליה עמית",
        title: "מרכז רפואי איכילוב" as string | undefined,
        avatar: undefined as string | undefined,
        text: "אריאל היקר! הגעתי אליך על מנת שתטפל בתיק הגירושין שלי. לכל אורך הדרך היית לי אוזן קשבת, תמכת, וניהלת את העניינים במקצועיות, בחכמה, באסטרטגיה וביצירתיות רבה!! לא פלא שלאחר מספר חודשים מועטים סיימנו את התיק מחוץ לכותלי בית המשפט, בהסכם מדהים שלא חשבתי לרגע שאגיע אליו. מוקירה ומעריכה."
      },
      {
        name: "ת.מ",
        title: undefined as string | undefined,
        avatar: undefined as string | undefined,
        text: "לאריאל היקר! לשמחתי הכרתי אותך לפני כשנתיים וחצי יעצת והדרכת אותי. היית אוזן קשבת ואתה עדיין אתה מקצועי ובקיא בעבודתך ומאוד יסודי אני מודה לך על הכל עשינו כברת דרך ארוכה ומוצלחת אני מאחלת לך הצלחה רבה!!!"
      },
      {
        name: "ר.פ",
        title: undefined as string | undefined,
        avatar: undefined as string | undefined,
        text: "אריאל תודה!!! אני עכשיו מבין מה המשמעות לעו\"ד ברמה גבוהה לסתם עו\"ד מן המניין. המקצוענות, ההקשבה, הראייה האסטרטגית, החשיבה מחוץ לקופסא והביטחון הרב שאתה ואנשיך נותנים, היא ברמה הכי גבוהה. אז שוב תודה על הכל, עשיתם אותי מאושר, ירדה לי אבן גדולה מהלב. במילה אחת: מקצוען!!!!!"
      }
    ],
    left: [
      {
        name: "אלי",
        title: undefined as string | undefined,
        avatar: undefined as string | undefined,
        text: "שלום לעורך דין דרור אריאל. פניתי אליך לראשונה בנושא משפטי אישי בעניין רכוש ומשפחה של אימי. זאת לאחר שקראתי באינטרנט עליך על פועליך ועל ההמלצות החמות. משלקחת את העניין לטיפולך ולאחר שהסתיים תוך זמן קצר ולשביעות רצוני ורצון אימי, בשמי ובשם אימי,ברצוני להודות לך על היחס האישי, ההסתכלות ללקוח בגובה העיניים, הטיפול החם והאנושי ובעיקר היעוץ המקצועי וההמלצות המשפטיות הנכונות לדרכי פעולה . תודה לך מקרב לב. כן ירבו כמוך אנשי מקצוע אנושיים וקשובים. בברכה אלי."
      },
      {
        name: "אבי",
        title: undefined as string | undefined,
        avatar: undefined as string | undefined,
        text: "אריאל מודה לך על היחס, השירות, ומעל הכל על החכמה הרבה, היכולת האסטרטגית והחשיבה המקורית היצירתית בכל פעולה שעשינו. אני חייב לציין, שהחשיבה שלך, על טובת הילדים, הנה דבר יפה ומוערך על ידי. שילוב היכולת שלך, והעבודה המשותפת, הביאו אותי לתוצאות מרשימות ביותר."
      }
    ]
  };

  const faqs = [
    {
      q: "תוך כמה זמן מסתיים ההליך?",
      a: "הליך הכנת התביעה הסתיים לכל היותר תוך 10 ימים כאשר במקרים בהם נדרש כתב הגנה במתחם זמנים קצר יותר הצוות יעמוד בלוח הזמנים שנקבע בבית המשפט"
    },
    {
      q: "למה נכון לבצע אונליין ולא בדרך השגרתית העתיקה?",
      a: "את/ה מקבל/ת צוות מנוסה ברשות עו\"ד אריאל דרור.  את/ה מקבל /ת שרות מהיר נגיש ומקצועי.  אנחנו רוצים שהלקוח יהיה מרוצה , לקוח מרוצה יביא עוד לקוחות  אנחנו מאמינים בעסקה שווה וטובה לשני הצדדים. מחיר הוגן המאפשר לכל אחד לקבל מוצר מקצועי ברמה הגבוהה ביותר.  אין התחייבות והתשלום הוא עבור מה שנעשה ולא מה שייעשה כמקובל"
    },
    {
      q: "איך אקבל עדכונים לגבי ההליך?",
      a: "ברגע שתוגש התביעה יישלח אישור למייל  ברגע שייקבע דיון יישלח אישור למייל"
    },
    {
      q: "האם יהיו תוספות למחיר הנקבע?",
      a: "לא  ! כמה שכתוב, במדויק כך אתה משלם, ללא תוספות."
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
            <h2 style={TYPOGRAPHY.h2}>
              איך פותחים איתנו תביעת גירושין אונליין
            </h2>
            {/* Subheader */}
            <p style={TYPOGRAPHY.subtitle}>
              שירות מקצועי, מהיר ונוח – בליווי מלא של אנשי מקצוע, תביעת גירושין נפתחת בשלושה צעדים פשוטים אונליין
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {/* Step 01 */}
            <div style={STEP_BOX_STYLES.container}>
              <div style={STEP_BOX_STYLES.headerSection}>
                <div style={STEP_BOX_STYLES.contentArea}>
                  <div style={STEP_BOX_STYLES.numberBadge}>01</div>
                  <h3 style={TYPOGRAPHY.h3}>נרשמים ב5 דקות בהליך פשוט</h3>
                </div>
                <p style={TYPOGRAPHY.bodyLarge}>
                  ממלאים טופס קצר עם פרטיכם. אין צורך בידע משפטי או בהכנות מוקדמות – אנחנו נדאג לכל השאר.
                </p>
              </div>
              <div style={STEP_BOX_STYLES.imageAreaStep1}>
                <Image
                  src="/first step picture.svg"
                  alt="Step 1"
                  width={368}
                  height={265}
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>
            </div>

            {/* Step 02 */}
            <div style={STEP_BOX_STYLES.container}>
              <div style={STEP_BOX_STYLES.headerSection}>
                <div style={STEP_BOX_STYLES.contentArea}>
                  <div style={STEP_BOX_STYLES.numberBadge}>02</div>
                  <h3 style={TYPOGRAPHY.h3}>נפגשים אונליין עם עורך דין</h3>
                </div>
                <p style={TYPOGRAPHY.bodyLarge}>
                  נפגשים בזום עם עורך דין שיאמת אותכם ויסביר את התהליך - הכל בנעימות וללא צורך לצאת מהבית.
                </p>
              </div>
              <div style={STEP_BOX_STYLES.imageAreaStep2}>
                <Image
                  src="/Second step picture.svg"
                  alt="Step 2"
                  width={368}
                  height={265}
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>
            </div>

            {/* Step 03 */}
            <div style={STEP_BOX_STYLES.container}>
              <div style={STEP_BOX_STYLES.headerSection}>
                <div style={STEP_BOX_STYLES.contentArea}>
                  <div style={STEP_BOX_STYLES.numberBadge}>03</div>
                  <h3 style={TYPOGRAPHY.h3}>מקבלים תביעה מוכנה לבית משפט</h3>
                </div>
                <p style={TYPOGRAPHY.bodyLarge}>
                  בסיום התהליך תקבלו מסמך משפטי רשמי מוכן להגשה
                  לבית המשפט ללא צורך בתערבות נוספת.
                </p>
              </div>
              <div style={STEP_BOX_STYLES.imageAreaStep3}>
                <Image
                  src="/Third step picture.svg"
                  alt="Step 3"
                  width={368}
                  height={265}
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits - 4 Cards */}
      <section className="bg-[#EEF2F3] py-20">
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
              למה לבחור בנו?
            </p>
            {/* H2 */}
            <h2 style={TYPOGRAPHY.h2}>
              כל היתרונות של שירות דיגיטלי, עם ליווי משפטי מהשורה הראשונה
            </h2>
            {/* Subheader */}
            <p style={TYPOGRAPHY.subtitle}>
              שירות אישי, זמינות מרבית, מחיר הוגן ותהליך שקוף – כל מה שצריך בשביל להתחיל תהליך בראש שקט.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div style={CARD_STYLES.container}>
              <div style={CARD_STYLES.iconCircle}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 17L13 19C13.197 19.197 13.4308 19.3532 13.6882 19.4598C13.9456 19.5665 14.2214 19.6213 14.5 19.6213C14.7786 19.6213 15.0544 19.5665 15.3118 19.4598C15.5692 19.3532 15.803 19.197 16 19C16.197 18.803 16.3532 18.5692 16.4598 18.3118C16.5665 18.0544 16.6213 17.7786 16.6213 17.5C16.6213 17.2214 16.5665 16.9456 16.4598 16.6882C16.3532 16.4308 16.197 16.197 16 16" stroke="#515F61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 14L16.5 16.5C16.8978 16.8978 17.4374 17.1213 18 17.1213C18.5626 17.1213 19.1022 16.8978 19.5 16.5C19.8978 16.1022 20.1213 15.5626 20.1213 15C20.1213 14.4374 19.8978 13.8978 19.5 13.5L15.62 9.62002C15.0575 9.05821 14.295 8.74265 13.5 8.74265C12.705 8.74265 11.9425 9.05821 11.38 9.62002L10.5 10.5C10.1022 10.8978 9.56259 11.1213 8.99998 11.1213C8.43737 11.1213 7.89781 10.8978 7.49998 10.5C7.10216 10.1022 6.87866 9.56262 6.87866 9.00002C6.87866 8.43741 7.10216 7.89784 7.49998 7.50002L10.31 4.69002C11.2222 3.78016 12.4119 3.20057 13.6906 3.04299C14.9694 2.88541 16.2641 3.15885 17.37 3.82002L17.84 4.10002C18.2658 4.357 18.772 4.44613 19.26 4.35002L21 4.00002" stroke="#515F61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 3L22 14H20" stroke="#515F61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 3L2 14L8.5 20.5C8.89782 20.8978 9.43739 21.1213 10 21.1213C10.5626 21.1213 11.1022 20.8978 11.5 20.5C11.8978 20.1022 12.1213 19.5626 12.1213 19C12.1213 18.4374 11.8978 17.8978 11.5 17.5" stroke="#515F61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 4H11" stroke="#515F61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={CARD_STYLES.textContent}>
                <h3 style={TYPOGRAPHY.h3}>חיסכון בכסף ובזמן</h3>
                <p style={TYPOGRAPHY.bodyLarge}>
                  תהליך יעיל ודיגיטלי שחוסך לך כסף, זמן ובירוקרטיה מיותרת.
                </p>
              </div>
            </div>

            <div style={CARD_STYLES.container}>
              <div style={CARD_STYLES.iconCircle}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 7.5V6C21 5.46957 20.7893 4.96086 20.4142 4.58579C20.0391 4.21071 19.5304 4 19 4H5C4.46957 4 3.96086 4.21071 3.58579 4.58579C3.21071 4.96086 3 5.46957 3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H8.5" stroke="#515F61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 2V6" stroke="#515F61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 2V6" stroke="#515F61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 10H8" stroke="#515F61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17.5 17.5L16 16.3V14" stroke="#515F61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 16C10 17.5913 10.6321 19.1174 11.7574 20.2426C12.8826 21.3679 14.4087 22 16 22C17.5913 22 19.1174 21.3679 20.2426 20.2426C21.3679 19.1174 22 17.5913 22 16C22 14.4087 21.3679 12.8826 20.2426 11.7574C19.1174 10.6321 17.5913 10 16 10C14.4087 10 12.8826 10.6321 11.7574 11.7574C10.6321 12.8826 10 14.4087 10 16Z" stroke="#515F61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={CARD_STYLES.textContent}>
                <h3 style={TYPOGRAPHY.h3}>מחיר הוגן ושקיפות</h3>
                <p style={TYPOGRAPHY.bodyLarge}>
                  תשלום רק על מה שבאמת צריך – בלי הפתעות, הכל ברור ושקוף.
                </p>
              </div>
            </div>

            <div style={CARD_STYLES.container}>
              <div style={CARD_STYLES.iconCircle}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 8C2 8.78793 2.15519 9.56815 2.45672 10.2961C2.75825 11.0241 3.20021 11.6855 3.75736 12.2426C4.31451 12.7998 4.97595 13.2417 5.7039 13.5433C6.43185 13.8448 7.21207 14 8 14C8.78793 14 9.56815 13.8448 10.2961 13.5433C11.0241 13.2417 11.6855 12.7998 12.2426 12.2426C12.7998 11.6855 13.2417 11.0241 13.5433 10.2961C13.8448 9.56815 14 8.78793 14 8C14 7.21207 13.8448 6.43185 13.5433 5.7039C13.2417 4.97595 12.7998 4.31451 12.2426 3.75736C11.6855 3.20021 11.0241 2.75825 10.2961 2.45672C9.56815 2.15519 8.78793 2 8 2C7.21207 2 6.43185 2.15519 5.7039 2.45672C4.97595 2.75825 4.31451 3.20021 3.75736 3.75736C3.20021 4.31451 2.75825 4.97595 2.45672 5.7039C2.15519 6.43185 2 7.21207 2 8Z" stroke="#515F61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.09 10.3701C19.0353 10.7225 19.8765 11.3076 20.5357 12.0713C21.195 12.835 21.651 13.7526 21.8617 14.7392C22.0724 15.7258 22.0309 16.7496 21.741 17.716C21.4512 18.6823 20.9223 19.5599 20.2034 20.2677C19.4845 20.9755 18.5987 21.4906 17.6279 21.7653C16.6572 22.0401 15.6329 22.0656 14.6496 21.8396C13.6664 21.6135 12.7561 21.1432 12.0028 20.4721C11.2495 19.801 10.6776 18.9508 10.34 18.0001" stroke="#515F61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 6H8V10" stroke="#515F61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16.71 13.8799L17.41 14.5899L14.59 17.4099" stroke="#515F61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={CARD_STYLES.textContent}>
                <h3 style={TYPOGRAPHY.h3}>שירות ומקצועיות</h3>
                <p style={TYPOGRAPHY.bodyLarge}>
                  ליווי אישי של עורכי דין מנוסים, שירות ברמה הגבוהה ביותר.
                </p>
              </div>
            </div>

            <div style={CARD_STYLES.container}>
              <div style={CARD_STYLES.iconCircle}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2V6C14 6.53043 14.2107 7.03914 14.5858 7.41421C14.9609 7.78929 15.4696 8 16 8H20" stroke="#515F61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4.268 21C4.44311 21.3033 4.69479 21.5553 4.99786 21.7308C5.30094 21.9063 5.64478 21.9991 5.995 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V7L15 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V7" stroke="#515F61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 18L7.5 16.5" stroke="#515F61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 14C2 14.7956 2.31607 15.5587 2.87868 16.1213C3.44129 16.6839 4.20435 17 5 17C5.79565 17 6.55871 16.6839 7.12132 16.1213C7.68393 15.5587 8 14.7956 8 14C8 13.2044 7.68393 12.4413 7.12132 11.8787C6.55871 11.3161 5.79565 11 5 11C4.20435 11 3.44129 11.3161 2.87868 11.8787C2.31607 12.4413 2 13.2044 2 14Z" stroke="#515F61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={CARD_STYLES.textContent}>
                <h3 style={TYPOGRAPHY.h3}>זמינות וגמישות</h3>
                <p style={TYPOGRAPHY.bodyLarge}>
                  שעות פעילות נרחבות, הרבה מעבר למקובל במשרדים רגילים.
                </p>
              </div>
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
            <h2 style={TYPOGRAPHY.h2}>
              בחרו את סוג התביעה ואנחנו נלווה אתכם עד הסוף
            </h2>
            {/* Subheader */}
            <p style={TYPOGRAPHY.subtitle}>
              בין אם אתם זקוקים למזונות, רכוש, משמורת, יישוב סכסוך, או הסכם גירושין – אנחנו כאן כדי ללוות אותכם בתהליך מותאם אישית לצרכים שלכם
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            {/* Vertical Tabs - FIRST in DOM = RIGHT in RTL */}
            <div className="flex flex-col">
              <div className="flex flex-col flex-1" style={{ gap: '16px' }}>
                {claimTabs.map((tab, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedClaimTab(index)}
                    className="px-0 py-4 text-right transition-all relative group"
                    style={{
                      ...TYPOGRAPHY.h3,
                      backgroundColor: 'transparent',
                      color: '#0C1719',
                      borderBottom: selectedClaimTab === index ? 'none' : '1px solid rgba(12, 23, 25, 0.1)',
                      paddingBottom: '16px',
                      position: 'relative'
                    }}
                  >
                    {tab.title}
                    {/* Blue bottom border for selected tab */}
                    {selectedClaimTab === index && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          height: '2px',
                          width: '100%',
                          backgroundColor: '#019fb7',
                          animation: 'growFromRight 0.3s ease-out'
                        }}
                      />
                    )}
                    {/* Blue hover border */}
                    {selectedClaimTab !== index && (
                      <div
                        className="absolute bottom-0 right-0 h-[2px] w-0 bg-[#019fb7] group-hover:w-full transition-all duration-300 origin-right"
                        style={{
                          transitionProperty: 'width',
                          transitionTimingFunction: 'ease-out'
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Button under tabs */}
              <div className="mt-8">
                <Link
                  href="/wizard"
                  style={CTA_STYLES.main}
                  className="inline-flex items-center justify-center transition-colors"
                >
                  התחילו בהליך גירושין
                </Link>
              </div>
            </div>

            {/* Content Area - SECOND in DOM = LEFT in RTL */}
            <div>
              <div className="text-right">
                <h3
                  style={{
                    fontSize: '32px',
                    fontWeight: 600,
                    letterSpacing: '-0.02em',
                    lineHeight: '1.3em',
                    color: '#0C1719',
                    marginBottom: '48px'
                  }}
                >
                  {claimTabs[selectedClaimTab].description}
                </h3>

                {/* FAQ Items */}
                <div className="space-y-6">
                  {claimTabs[selectedClaimTab].questions.map((item, index) => {
                    // SVG icons by claim type
                    const iconsByClaimType: Record<string, JSX.Element[]> = {
                      alimony: [
                        <svg key={0} xmlns="http://www.w3.org/2000/svg" width="22.299" height="23.771" fill="none" overflow="visible"><path d="M 18.343 2.615 C 18.414 2.942 18.597 3.311 18.892 3.875 L 18.924 3.935 C 19.177 4.421 19.523 5.081 19.676 5.781 C 19.852 6.591 19.784 7.499 19.176 8.371 C 18.917 8.757 18.47 8.974 18.006 8.937 C 17.543 8.901 17.135 8.617 16.94 8.195 C 16.745 7.772 16.793 7.278 17.066 6.901 C 17.193 6.719 17.216 6.572 17.163 6.327 C 17.092 6.001 16.909 5.632 16.613 5.067 L 16.582 5.007 C 16.329 4.522 15.983 3.862 15.83 3.162 C 15.654 2.352 15.722 1.444 16.33 0.571 C 16.741 0.003 17.531 -0.131 18.107 0.27 C 18.682 0.671 18.83 1.459 18.44 2.041 C 18.313 2.224 18.29 2.37 18.343 2.615 Z M 0 12.761 C 0 12.287 0.385 11.903 0.858 11.903 L 21.442 11.903 C 21.915 11.903 22.299 12.287 22.299 12.76 C 22.299 16.695 19.889 20.07 16.418 21.78 L 16.418 22.914 C 16.418 23.387 16.034 23.771 15.561 23.771 L 6.739 23.771 C 6.266 23.771 5.882 23.387 5.882 22.914 L 5.882 21.779 C 2.412 20.069 0.001 16.695 0.001 12.76 Z M 11.494 0.25 C 12.076 0.656 12.219 1.458 11.814 2.04 C 11.687 2.223 11.663 2.37 11.716 2.614 C 11.787 2.941 11.97 3.31 12.266 3.874 L 12.296 3.934 C 12.551 4.419 12.896 5.08 13.049 5.779 C 13.225 6.589 13.157 7.498 12.549 8.37 C 12.138 8.938 11.348 9.072 10.772 8.671 C 10.197 8.27 10.049 7.483 10.439 6.9 C 10.566 6.718 10.589 6.571 10.536 6.326 C 10.465 6 10.282 5.631 9.986 5.066 L 9.956 5.006 C 9.702 4.521 9.356 3.861 9.204 3.161 C 9.027 2.351 9.096 1.443 9.704 0.571 C 10.11 -0.011 10.911 -0.155 11.494 0.251 Z M 5.111 2.614 C 5.183 2.941 5.365 3.31 5.661 3.874 L 5.692 3.934 C 5.946 4.42 6.292 5.08 6.444 5.78 C 6.62 6.59 6.552 7.498 5.944 8.37 C 5.685 8.756 5.238 8.973 4.774 8.936 C 4.311 8.9 3.903 8.616 3.708 8.194 C 3.513 7.771 3.561 7.277 3.834 6.9 C 3.961 6.718 3.985 6.571 3.931 6.326 C 3.861 6 3.677 5.631 3.381 5.066 L 3.351 5.006 C 3.097 4.521 2.751 3.861 2.599 3.161 C 2.423 2.351 2.491 1.443 3.099 0.57 C 3.358 0.184 3.805 -0.033 4.269 0.004 C 4.732 0.041 5.14 0.325 5.335 0.747 C 5.53 1.169 5.482 1.664 5.209 2.04 C 5.081 2.223 5.058 2.369 5.111 2.614 Z" fill="rgb(12, 23, 25)"></path></svg>,
                        <svg key={1} xmlns="http://www.w3.org/2000/svg" width="23.79" height="24" fill="none" overflow="visible"><path d="M 0.001 9.571 C 0.334 9.775 0.679 9.956 1.036 10.114 C 2.447 10.744 4.247 11.164 6.224 11.304 L 6.219 11.51 L 6.219 15.854 C 2.658 15.545 0 14.15 0 12.49 L 0 9.57 Z M 15.43 3.43 L 15.43 5.95 C 13.31 6.02 11.32 6.43 9.75 7.129 C 8.89 7.511 8.06 8.024 7.415 8.699 C 7.265 8.857 7.125 9.025 6.997 9.202 C 4.962 9.126 3.186 8.727 1.911 8.158 C 1.197 7.839 0.687 7.488 0.369 7.154 C 0.198 6.989 0.072 6.784 0.001 6.557 L 0.001 3.43 C 0 1.534 3.453 0 7.715 0 C 11.975 0 15.429 1.534 15.429 3.429 Z M 7.714 5.025 C 10.688 5.025 13.1 4.332 13.1 3.477 C 13.1 2.619 10.688 1.927 7.712 1.927 C 4.738 1.927 2.326 2.621 2.326 3.477 C 2.326 4.333 4.74 5.025 7.713 5.025 Z M 8.36 20.571 L 8.36 17.652 C 8.693 17.856 9.04 18.038 9.398 18.195 C 11.155 18.981 13.512 19.438 16.075 19.438 C 18.635 19.438 20.995 18.981 22.752 18.195 C 23.11 18.038 23.457 17.857 23.79 17.652 L 23.79 20.572 C 23.79 22.456 20.361 24 16.076 24 C 11.791 24 8.36 22.457 8.36 20.571 Z M 8.73 15.235 C 8.559 15.071 8.432 14.866 8.36 14.64 L 8.36 11.51 C 8.36 9.617 11.815 8.081 16.075 8.081 C 20.335 8.081 23.79 9.617 23.79 11.51 L 23.79 14.64 C 23.719 14.867 23.592 15.072 23.42 15.237 C 23.103 15.571 22.593 15.922 21.88 16.241 C 20.457 16.875 18.409 17.297 16.076 17.297 C 13.743 17.297 11.696 16.875 10.271 16.241 C 9.558 15.922 9.049 15.573 8.731 15.237 Z M 16.075 10.008 C 13.098 10.008 10.688 10.703 10.688 11.558 C 10.688 12.413 13.099 13.108 16.075 13.108 C 19.049 13.108 21.461 12.415 21.461 11.558 C 21.461 10.702 19.049 10.008 16.075 10.008 Z" fill="rgb(12, 23, 25)"></path></svg>,
                        <svg key={2} xmlns="http://www.w3.org/2000/svg" width="23.712" height="23.588" fill="none" overflow="visible"><path d="M 6.472 10.535 C 5.99 10.052 5.719 9.398 5.719 8.716 C 5.719 8.034 5.99 7.38 6.472 6.898 L 12.617 0.754 C 13.099 0.271 13.754 0 14.436 0 C 15.118 0 15.772 0.271 16.254 0.754 L 18.969 3.469 C 19.451 3.951 19.722 4.605 19.722 5.287 C 19.722 5.968 19.451 6.622 18.969 7.105 L 16.815 9.259 L 23.31 15.754 C 23.65 16.075 23.788 16.556 23.671 17.009 C 23.554 17.462 23.2 17.816 22.747 17.933 C 22.295 18.05 21.814 17.911 21.492 17.572 L 14.997 11.078 L 12.824 13.25 C 12.342 13.732 11.688 14.003 11.006 14.003 C 10.324 14.003 9.67 13.732 9.188 13.25 L 6.473 10.535 Z M 2.107 18.017 C 2.107 17.543 2.491 17.16 2.964 17.16 L 12.393 17.16 C 12.866 17.16 13.25 17.543 13.25 18.017 L 13.25 21.017 L 14.107 21.017 C 14.803 21.036 15.357 21.606 15.357 22.302 C 15.357 22.998 14.803 23.568 14.107 23.588 L 1.25 23.588 C 0.554 23.568 0 22.998 0 22.302 C 0 21.606 0.554 21.036 1.25 21.017 L 2.107 21.017 Z" fill="rgb(12, 23, 25)"></path></svg>
                      ],
                      property: [
                        <svg key={0} xmlns="http://www.w3.org/2000/svg" width="23.496" height="20.381" fill="none" overflow="visible"><path d="M 13.034 3.218 L 20.599 3.218 C 21.309 3.218 21.885 3.794 21.885 4.504 C 21.885 5.214 21.309 5.79 20.599 5.79 L 20.05 5.79 L 23.41 14.613 C 23.466 14.759 23.496 14.914 23.496 15.071 C 23.496 18.004 21.119 20.381 18.186 20.381 C 15.253 20.381 12.876 18.004 12.876 15.071 C 12.876 14.914 12.904 14.759 12.96 14.613 L 16.32 5.79 L 7.174 5.79 L 10.534 14.613 C 10.59 14.759 10.619 14.914 10.62 15.071 C 10.62 18.004 8.243 20.381 5.31 20.381 C 2.377 20.381 0 18.004 0 15.071 C 0 14.914 0.028 14.759 0.084 14.613 L 3.444 5.79 L 2.895 5.79 C 2.185 5.79 1.609 5.214 1.609 4.504 C 1.609 3.794 2.185 3.218 2.895 3.218 L 10.462 3.218 L 10.462 1.286 C 10.462 0.576 11.038 0 11.748 0 C 12.458 0 13.034 0.576 13.034 1.286 Z M 7.731 14.476 L 5.309 8.116 L 2.89 14.476 Z M 15.765 14.476 L 20.607 14.476 L 18.185 8.116 Z" fill="rgb(12, 23, 25)"></path></svg>,
                        <svg key={1} xmlns="http://www.w3.org/2000/svg" width="24" height="23.774" fill="none" overflow="visible"><path d="M 12 0 C 11.616 0 11.24 0.107 10.913 0.308 L 0.782 6.942 L 0.78 6.944 C 0.06 7.417 -0.157 8.235 0.12 8.934 C 0.387 9.606 1.061 10.059 1.869 10.059 L 22.13 10.059 C 22.938 10.059 23.612 9.606 23.878 8.934 C 24.156 8.235 23.938 7.418 23.219 6.944 L 23.217 6.942 L 13.087 0.308 C 12.76 0.107 12.384 0 12 0 Z M 0 22.25 C 0 23.279 0.98 23.774 1.714 23.774 L 22.286 23.774 C 23.02 23.774 24 23.279 24 22.25 L 24 20.248 C 24 19.219 23.02 18.724 22.286 18.724 L 22.191 18.724 C 22.194 18.693 22.196 18.662 22.196 18.631 L 22.196 13.126 C 22.196 12.653 21.813 12.269 21.339 12.269 L 18.487 12.269 C 18.013 12.269 17.63 12.653 17.63 13.126 L 17.63 18.631 C 17.63 18.662 17.632 18.693 17.635 18.724 L 14.278 18.724 C 14.281 18.693 14.283 18.662 14.283 18.631 L 14.283 13.126 C 14.283 12.653 13.899 12.269 13.426 12.269 L 10.573 12.269 C 10.1 12.269 9.716 12.653 9.716 13.126 L 9.716 18.631 C 9.716 18.662 9.718 18.693 9.721 18.724 L 6.365 18.724 C 6.368 18.693 6.37 18.662 6.37 18.631 L 6.37 13.126 C 6.37 12.653 5.986 12.269 5.513 12.269 L 2.66 12.269 C 2.187 12.269 1.803 12.653 1.803 13.126 L 1.803 18.631 C 1.803 18.662 1.805 18.693 1.808 18.724 L 1.714 18.724 C 0.98 18.724 0 19.218 0 20.248 Z" fill="rgb(12, 23, 25)"></path></svg>,
                        <svg key={2} xmlns="http://www.w3.org/2000/svg" width="23.712" height="23.588" fill="none" overflow="visible"><path d="M 6.472 10.535 C 5.99 10.052 5.719 9.398 5.719 8.716 C 5.719 8.034 5.99 7.38 6.472 6.898 L 12.617 0.754 C 13.099 0.271 13.754 0 14.436 0 C 15.118 0 15.772 0.271 16.254 0.754 L 18.969 3.469 C 19.451 3.951 19.722 4.605 19.722 5.287 C 19.722 5.968 19.451 6.622 18.969 7.105 L 16.815 9.259 L 23.31 15.754 C 23.65 16.075 23.788 16.556 23.671 17.009 C 23.554 17.462 23.2 17.816 22.747 17.933 C 22.295 18.05 21.814 17.911 21.492 17.572 L 14.997 11.078 L 12.824 13.25 C 12.342 13.732 11.688 14.003 11.006 14.003 C 10.324 14.003 9.67 13.732 9.188 13.25 L 6.473 10.535 Z M 2.107 18.017 C 2.107 17.543 2.491 17.16 2.964 17.16 L 12.393 17.16 C 12.866 17.16 13.25 17.543 13.25 18.017 L 13.25 21.017 L 14.107 21.017 C 14.803 21.036 15.357 21.606 15.357 22.302 C 15.357 22.998 14.803 23.568 14.107 23.588 L 1.25 23.588 C 0.554 23.568 0 22.998 0 22.302 C 0 21.606 0.554 21.036 1.25 21.017 L 2.107 21.017 Z" fill="rgb(12, 23, 25)"></path></svg>
                      ],
                      custody: [
                        <svg key={0} xmlns="http://www.w3.org/2000/svg" width="24" height="21.429" fill="none" overflow="visible"><path d="M 13.714 5.143 C 13.74 6.998 12.765 8.722 11.164 9.657 C 9.562 10.592 7.581 10.592 5.979 9.657 C 4.378 8.722 3.403 6.998 3.429 5.143 C 3.468 2.331 5.759 0.072 8.571 0.072 C 11.384 0.072 13.675 2.331 13.714 5.143 Z M 8.57 11.999 C 10.844 11.999 13.025 12.902 14.633 14.51 C 16.24 16.117 17.144 18.298 17.143 20.572 C 17.143 21.046 16.759 21.429 16.286 21.429 L 0.857 21.429 C 0.384 21.429 0 21.045 0 20.572 C 0 18.299 0.903 16.119 2.51 14.511 C 4.117 12.903 6.298 12 8.571 12 Z M 23.143 21.429 L 19.162 21.429 C 19.242 21.157 19.286 20.869 19.286 20.572 C 19.286 17.072 17.609 13.966 15.014 12.01 C 17.357 11.897 19.643 12.748 21.341 14.366 C 23.039 15.984 24 18.227 24 20.572 C 24 21.046 23.616 21.429 23.143 21.429 Z M 15.429 10.286 C 14.925 10.287 14.424 10.213 13.941 10.068 C 15.131 8.771 15.857 7.042 15.857 5.143 C 15.857 3.244 15.131 1.516 13.941 0.219 C 15.873 -0.363 17.967 0.238 19.296 1.756 C 20.625 3.274 20.943 5.429 20.11 7.266 C 19.277 9.104 17.447 10.285 15.429 10.286 Z" fill="rgb(12, 23, 25)"></path></svg>,
                        <svg key={1} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" overflow="visible"><path d="M 7.714 3.43 L 16.286 3.43 L 16.286 1.714 C 16.286 0.767 17.053 0 18 0 C 18.947 0 19.714 0.767 19.714 1.714 L 19.714 3.429 L 21.429 3.429 C 22.849 3.429 24 4.58 24 6 L 24 21.429 C 24 22.849 22.85 23.999 21.43 24 L 2.571 24 C 1.151 24 0 22.849 0 21.429 L 0 6 C 0.001 4.581 1.151 3.431 2.57 3.43 L 4.286 3.43 L 4.286 1.714 C 4.286 0.767 5.053 0 6 0 C 6.947 0 7.714 0.767 7.714 1.714 Z M 11.223 9.274 L 9.95 11.834 L 9.948 11.838 L 7.115 12.254 L 7.109 12.254 C 6.792 12.305 6.53 12.529 6.43 12.834 C 6.33 13.14 6.409 13.475 6.635 13.704 L 6.644 13.713 L 8.691 15.673 C 8.687 15.688 8.684 15.703 8.681 15.718 L 8.208 18.527 C 8.142 18.856 8.275 19.194 8.548 19.39 C 8.82 19.587 9.182 19.606 9.474 19.44 L 11.97 18.118 C 11.986 18.113 12.002 18.113 12.018 18.118 L 14.513 19.44 C 14.804 19.606 15.165 19.588 15.438 19.393 C 15.71 19.198 15.844 18.862 15.781 18.533 L 15.381 15.729 C 15.376 15.691 15.366 15.655 15.351 15.62 L 17.341 13.73 C 17.583 13.504 17.673 13.159 17.573 12.843 C 17.472 12.527 17.199 12.298 16.871 12.253 L 14.044 11.823 L 14.039 11.823 L 12.763 9.256 L 12.759 9.249 C 12.609 8.959 12.307 8.78 11.981 8.786 C 11.656 8.792 11.363 8.981 11.223 9.274 Z" fill="rgb(12, 23, 25)"></path></svg>,
                        <svg key={2} xmlns="http://www.w3.org/2000/svg" width="23.973" height="21.006" fill="none" overflow="visible"><path d="M 23.461 3.869 C 23.62 4.361 23.576 4.896 23.339 5.355 C 23.101 5.814 22.69 6.159 22.196 6.314 L 16.387 8.199 L 16.02 8.319 L 14.988 11.849 C 14.881 12.253 14.571 12.573 14.17 12.692 L 11.553 13.542 C 11.125 13.717 10.634 13.642 10.278 13.345 C 9.922 13.049 9.759 12.58 9.853 12.127 L 9.853 12.126 L 10.253 10.172 L 4.909 11.9 C 4.432 12.074 3.905 12.05 3.445 11.833 C 2.985 11.616 2.632 11.224 2.462 10.745 L 2.459 10.735 L 0.469 4.563 L 0.465 4.549 C 0.291 3.934 0.636 3.291 1.245 3.098 L 3.592 2.344 L 3.596 2.342 C 4.105 2.183 4.658 2.375 4.96 2.814 L 6.365 5.041 L 14.851 0.815 C 16.37 -0.071 18.201 -0.244 19.858 0.342 C 21.52 0.929 22.839 2.22 23.461 3.869 Z M 22.258 17.577 C 23.205 17.577 23.973 18.344 23.973 19.291 C 23.973 20.238 23.205 21.006 22.258 21.006 L 1.715 21.006 C 0.768 21.006 0 20.238 0 19.291 C 0 18.344 0.768 17.577 1.715 17.577 Z" fill="rgb(12, 23, 25)"></path></svg>
                      ],
                      divorce: [
                        <svg key={0} xmlns="http://www.w3.org/2000/svg" width="24.002" height="18.86" fill="none" overflow="visible"><path d="M 20.32 0.252 L 23.75 3.68 C 23.911 3.841 24.002 4.059 24.002 4.287 C 24.002 4.515 23.911 4.733 23.75 4.894 L 20.321 8.323 C 20.076 8.569 19.707 8.643 19.386 8.51 C 19.065 8.377 18.856 8.063 18.857 7.716 L 18.857 6.001 L 14.571 6.001 C 13.624 6.001 12.857 5.234 12.857 4.287 C 12.857 3.34 13.624 2.573 14.571 2.573 L 18.857 2.573 L 18.857 0.859 C 18.856 0.512 19.065 0.198 19.386 0.065 C 19.707 -0.068 20.076 0.006 20.321 0.252 Z M 0 4.287 C 0 3.34 0.767 2.573 1.714 2.573 L 7.286 2.573 C 7.859 2.573 8.394 2.859 8.712 3.336 L 15.06 12.859 L 18.857 12.859 L 18.857 11.144 C 18.856 10.797 19.065 10.483 19.386 10.35 C 19.707 10.217 20.076 10.291 20.321 10.537 L 23.75 13.966 C 23.911 14.127 24.002 14.345 24.002 14.573 C 24.002 14.801 23.911 15.019 23.75 15.18 L 20.321 18.608 C 20.076 18.854 19.707 18.928 19.386 18.795 C 19.065 18.662 18.856 18.348 18.857 18.001 L 18.857 16.287 L 14.143 16.287 C 13.57 16.287 13.035 16.001 12.717 15.524 L 6.369 6.001 L 1.714 6.001 C 0.767 6.001 0 5.234 0 4.287 Z M 0 14.573 C 0 13.626 0.767 12.859 1.714 12.859 L 6.857 12.859 C 7.804 12.859 8.571 13.626 8.571 14.573 C 8.571 15.52 7.804 16.287 6.857 16.287 L 1.714 16.287 C 0.767 16.287 0 15.52 0 14.573 Z" fill="rgb(12, 23, 25)"></path></svg>,
                        <svg key={1} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" overflow="visible"><g><path d="M 2.441 0.462 C 2.686 0.169 3.047 0 3.43 0 L 12 0 C 12.381 0 12.743 0.169 12.987 0.462 C 13.231 0.755 13.333 1.141 13.265 1.516 L 13.225 1.74 C 14.49 1.923 15.429 3.008 15.429 4.286 L 15.429 5.57 L 12.429 5.57 C 9.589 5.57 7.286 7.873 7.286 10.713 L 7.286 18.856 L 2.57 18.856 C 1.151 18.855 0.001 17.705 0 16.286 L 0 4.286 C 0 2.99 0.958 1.918 2.204 1.74 L 2.164 1.516 C 2.095 1.141 2.196 0.755 2.44 0.462 Z M 4.969 2.572 L 5.167 3.659 C 5.279 4.27 5.811 4.714 6.432 4.714 L 8.997 4.714 C 9.618 4.714 10.151 4.27 10.262 3.659 L 10.459 2.571 L 4.97 2.571 Z" fill="rgb(12, 23, 25)"></path><path d="M 21 7.714 C 22.657 7.714 24 9.057 24 10.714 L 24 21 C 24 22.657 22.657 24 21 24 L 12.429 24 C 10.772 24 9.429 22.657 9.429 21 L 9.429 10.714 C 9.429 9.057 10.772 7.714 12.429 7.714 Z M 14.571 14.786 L 18.857 14.786 C 19.449 14.786 19.929 14.306 19.929 13.714 C 19.929 13.123 19.449 12.643 18.857 12.643 L 14.571 12.643 C 13.98 12.643 13.5 13.123 13.5 13.714 C 13.5 14.306 13.98 14.786 14.571 14.786 Z M 14.571 16.929 C 13.98 16.929 13.5 17.409 13.5 18 C 13.5 18.591 13.98 19.071 14.571 19.071 L 18.857 19.071 C 19.448 19.071 19.928 18.591 19.928 18 C 19.928 17.409 19.448 16.929 18.857 16.929 Z" fill="rgb(12, 23, 25)"></path></g></svg>,
                        <svg key={2} xmlns="http://www.w3.org/2000/svg" width="23.836" height="21.271" fill="none" overflow="visible"><path d="M 7.137 20.692 C 6.242 20.265 5.672 19.362 5.672 18.37 L 5.672 9.04 C 5.673 8.601 5.786 8.169 6.001 7.785 L 9.561 1.425 C 10.18 0.319 11.468 -0.229 12.695 0.09 C 13.921 0.41 14.778 1.518 14.778 2.785 L 14.778 6.827 L 20.408 6.827 C 21.41 6.828 22.361 7.266 23.012 8.027 C 23.664 8.788 23.95 9.796 23.795 10.785 L 22.722 17.648 C 22.395 19.734 20.599 21.271 18.488 21.271 L 9.323 21.271 C 8.685 21.272 8.055 21.13 7.479 20.855 Z M 2.559 8.098 C 3.032 8.098 3.416 8.482 3.416 8.955 L 3.416 19.421 C 3.416 19.649 3.326 19.867 3.165 20.028 C 3.005 20.189 2.786 20.279 2.559 20.279 L 1.708 20.279 C 0.765 20.279 0 19.515 0 18.571 L 0 9.806 C 0 8.863 0.765 8.098 1.708 8.098 Z" fill="rgb(12, 23, 25)"></path></svg>
                      ],
                      "divorce-agreement": [
                        <svg key={0} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" overflow="visible"><path d="M 14 2 L 14 6 C 14 6.53043 14.2107 7.03914 14.5858 7.41421 C 14.9609 7.78929 15.4696 8 16 8 L 20 8 M 18 21 L 6 21 C 5.46957 21 4.96086 20.7893 4.58579 20.4142 C 4.21071 20.0391 4 19.5304 4 19 L 4 5 C 4 4.46957 4.21071 3.96086 4.58579 3.58579 C 4.96086 3.21071 5.46957 3 6 3 L 14 3 L 20 9 L 20 19 C 20 19.5304 19.7893 20.0391 19.4142 20.4142 C 19.0391 20.7893 18.5304 21 18 21 Z M 9 13 L 15 13 M 9 17 L 15 17 M 9 9 L 10 9" stroke="rgb(12, 23, 25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path></svg>,
                        <svg key={1} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" overflow="visible"><path d="M 11 15 L 15.5 9.5 L 21 15 M 18 2 C 18 2.53043 17.7893 3.03914 17.4142 3.41421 C 17.0391 3.78929 16.5304 4 16 4 C 15.4696 4 14.9609 3.78929 14.5858 3.41421 C 14.2107 3.03914 14 2.53043 14 2 M 6 2 C 6 2.53043 5.78929 3.03914 5.41421 3.41421 C 5.03914 3.78929 4.53043 4 4 4 C 3.46957 4 2.96086 3.78929 2.58579 3.41421 C 2.21071 3.03914 2 2.53043 2 2 M 7 11 C 7.39397 11.4142 7.93413 11.6641 8.50885 11.7 C 9.08357 11.736 9.65298 11.5556 10.1 11.193 C 10.5474 11.5554 11.1168 11.7357 11.6915 11.6998 C 12.2662 11.6639 12.8064 11.4142 13.2004 11 C 13.5944 11.4142 14.1338 11.6641 14.7085 11.7 C 15.2832 11.736 15.8527 11.5556 16.3 11.193 C 16.7474 11.5554 17.3168 11.7357 17.8915 11.6998 C 18.4662 11.6639 19.0064 11.4142 19.4004 11 C 19.8 11.5 20.8 12 21.5 12 L 21.5 21 C 21.5 21.5304 21.2893 22.0391 20.9142 22.4142 C 20.5391 22.7893 20.0304 23 19.5 23 L 4.5 23 C 3.96957 23 3.46086 22.7893 3.08579 22.4142 C 2.71071 22.0391 2.5 21.5304 2.5 21 L 2.5 12 C 3.2 12 4.2 11.5 4.6 11 C 4.99397 11.4142 5.53413 11.6641 6.10885 11.7 C 6.68357 11.736 7.25298 11.5556 7.7 11.193 M 18 6 C 18.5304 6 19.0391 5.78929 19.4142 5.41421 C 19.7893 5.03914 20 4.53043 20 4 C 20 3.46957 19.7893 2.96086 19.4142 2.58579 C 19.0391 2.21071 18.5304 2 18 2 M 6 6 C 5.46957 6 4.96086 5.78929 4.58579 5.41421 C 4.21071 5.03914 4 4.53043 4 4 C 4 3.46957 4.21071 2.96086 4.58579 2.58579 C 4.96086 2.21071 5.46957 2 6 2" stroke="rgb(12, 23, 25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path></svg>,
                        <svg key={2} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" overflow="visible"><path d="M 20 6 L 9 17 L 4 12" stroke="rgb(12, 23, 25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path></svg>
                      ]
                    };

                    const currentIcons = iconsByClaimType[claimTabs[selectedClaimTab].id] || iconsByClaimType.alimony;

                    return (
                      <div key={index} className="flex items-start gap-8">
                        <div style={CARD_STYLES.iconCircle} className="flex-shrink-0 mt-1">
                          {currentIcons[index % 3]}
                        </div>
                        <div className="flex-1 text-right">
                          <h4 style={{...TYPOGRAPHY.h3, marginBottom: '8px'}}>
                            {item.q}
                          </h4>
                          <p style={TYPOGRAPHY.bodyLarge}>
                            {item.a}
                          </p>
                        </div>
                      </div>
                    );
                  })}
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
            <h2 style={TYPOGRAPHY.h2}>
              סיפורי הצלחה ממי שכבר עברו את הדרך
            </h2>
            {/* Subheader */}
            <p style={TYPOGRAPHY.subtitle}>
              מכתבים וחוויות של לקוחות אמיתיים שליווינו לאורך כל הדרך – כדי שתוכלו לדעת בדיוק למה לצפות, ולמה אפשר לסמוך עלינו.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Right Column (appears on visual right in RTL) */}
            <div className="flex-1 space-y-6">
              {testimonials.right.map((testimonial, index) => (
                <div key={index} style={CARD_STYLES.container}>
                  <p style={{...TYPOGRAPHY.bodyLarge, lineHeight: '1.6'}}>
                    {testimonial.text}
                  </p>
                  <div className="flex items-center gap-3">
                    {testimonial.avatar && (
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    )}
                    <div className="text-right">
                      <p style={{fontSize: '16px', color: '#0C1719', fontWeight: 600, lineHeight: 1}}>
                        {testimonial.name}
                      </p>
                      {testimonial.title && (
                        <p style={{fontSize: '14px', color: '#515F61', fontWeight: 500, lineHeight: 1, marginTop: '4px'}}>
                          {testimonial.title}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Middle Column */}
            <div className="flex-1 space-y-6">
              {testimonials.middle.map((testimonial, index) => (
                <div key={index} style={CARD_STYLES.container}>
                  <p style={{...TYPOGRAPHY.bodyLarge, lineHeight: '1.6'}}>
                    {testimonial.text}
                  </p>
                  <div className="flex items-center gap-3">
                    {testimonial.avatar && (
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    )}
                    <div className="text-right">
                      <p style={{fontSize: '16px', color: '#0C1719', fontWeight: 600, lineHeight: 1}}>
                        {testimonial.name}
                      </p>
                      {testimonial.title && (
                        <p style={{fontSize: '14px', color: '#515F61', fontWeight: 500, lineHeight: 1, marginTop: '4px'}}>
                          {testimonial.title}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Left Column (appears on visual left in RTL) */}
            <div className="flex-1 space-y-6">
              {testimonials.left.map((testimonial, index) => (
                <div key={index} style={CARD_STYLES.container}>
                  <p style={{...TYPOGRAPHY.bodyLarge, lineHeight: '1.6'}}>
                    {testimonial.text}
                  </p>
                  <div className="flex items-center gap-3">
                    {testimonial.avatar && (
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    )}
                    <div className="text-right">
                      <p style={{fontSize: '16px', color: '#0C1719', fontWeight: 600, lineHeight: 1}}>
                        {testimonial.name}
                      </p>
                      {testimonial.title && (
                        <p style={{fontSize: '14px', color: '#515F61', fontWeight: 500, lineHeight: 1, marginTop: '4px'}}>
                          {testimonial.title}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Ready to Take the Next Step */}
      <section className="bg-[#EEF2F3] py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div
            className="rounded-3xl overflow-hidden flex flex-col md:flex-row items-stretch relative"
            style={{
              background: 'linear-gradient(90deg, #5AB9C9 0%, #A8D5DE 100%)',
              backgroundColor: 'rgba(1, 159, 183, 0.4)',
              border: '1px solid #019FB7',
              minHeight: '500px',
            }}
          >
            {/* Content on the right (first in DOM for RTL) - 40% width */}
            <div className="w-full md:w-2/5 px-8 md:px-12 py-12 flex flex-col justify-center items-start z-10">
              {/* White badge - reverted */}
              <div
                className="inline-block mb-6 px-4 py-2 rounded-lg"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  width: 'fit-content',
                }}
              >
                <p style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#019FB7',
                  lineHeight: '100%',
                  letterSpacing: '-0.02em',
                }}>
                  הדרך הקלה והמהירה ביותר לפתרון בתהליך גירושין
                </p>
              </div>

              {/* Main heading */}
              <h2 style={{
                fontSize: '48px',
                fontWeight: 'bold',
                lineHeight: '110%',
                letterSpacing: '-0.04em',
                color: '#0C1719',
                marginBottom: '24px',
                textAlign: 'right',
              }}>
                מוכנים לקחת את<br />הצעד הבא?
              </h2>

              {/* Subtext */}
              <p style={{
                fontSize: '20px',
                fontWeight: 500,
                lineHeight: '140%',
                letterSpacing: '-0.02em',
                color: '#0C1719',
                marginBottom: '32px',
                textAlign: 'right',
              }}>
                צעד אחד פשוט יתחיל את התהליך – בליווי עורכי דין מנוסים, בצורה דיגיטלית ישלה ובטיחה, בלי עינויבים ובלי סיבוכים.
              </p>

              {/* CTA Button */}
              <Link
                href="/wizard"
                style={{
                  ...CTA_STYLES.main,
                  display: 'inline-block',
                  textDecoration: 'none',
                  width: 'fit-content',
                }}
              >
                התחילו בתהליך גירושין
              </Link>
            </div>

            {/* Image on the left (second in DOM for RTL) - 60% width */}
            <div className="w-full md:w-3/5 relative overflow-hidden" style={{ minHeight: '500px', height: '100%' }}>
              {/* Decorative SVG boxes behind lawyer - positioned to appear cut off at top and bottom */}
              <svg
                className="absolute"
                style={{
                  left: '-50px',
                  top: '-100px',
                  width: '366px',
                  height: '700px',
                  zIndex: 0,
                }}
                viewBox="0 0 366 580"
                fill="none"
                preserveAspectRatio="xMidYMid slice"
              >
                <rect width="566.029" height="152" transform="translate(139.309) rotate(66.4205)" fill="#9FD7E0"/>
              </svg>

              <svg
                className="absolute"
                style={{
                  left: '180px',
                  top: '-100px',
                  width: '366px',
                  height: '700px',
                  zIndex: 0,
                }}
                viewBox="0 0 366 580"
                fill="none"
                preserveAspectRatio="xMidYMid slice"
              >
                <rect width="566.029" height="152" transform="translate(139.309) rotate(66.4205)" fill="#9FD7E0"/>
              </svg>

              {/* Lawyer image - positioned at bottom with 100% width */}
              <div className="absolute inset-0 flex items-end justify-center" style={{ zIndex: 1 }}>
                <Image
                  src="/lawyer.png"
                  alt="עורך דין אריאל דרור"
                  width={1200}
                  height={800}
                  className="object-contain object-bottom"
                  style={{
                    height: '100%',
                    width: '100%',
                  }}
                />
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
            <h2 style={TYPOGRAPHY.h2}>
              יש לכם שאלות? יש לנו תשובות
            </h2>
            {/* Subheader */}
            <p style={TYPOGRAPHY.subtitle}>
              אספנו כאן את השאלות הנפוצות ביותר על התהליך והכל ברור, פשוט ושקוף, כדי שתוכלו לפעול בראש שקט.
            </p>
          </div>

          <div className="space-y-4" dir="rtl">
            {faqs.map((faq, index) => (
              <div
                key={index}
                style={{
                  ...CARD_STYLES.container,
                  gap: 0,
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-start justify-between gap-4 transition-colors"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <h3 style={TYPOGRAPHY.h3}>{faq.q}</h3>
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`flex-shrink-0 transition-transform duration-500 ease-in-out ${
                      openFaq === index ? "rotate-45" : ""
                    }`}
                    style={{ marginTop: '4px' }}
                  >
                    <path d="M11 7V15M7 11H15M21 11C21 16.5228 16.5228 21 11 21C5.47715 21 1 16.5228 1 11C1 5.47715 5.47715 1 11 1C16.5228 1 21 5.47715 21 11Z" stroke="#515F61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <div
                  className="w-full overflow-hidden transition-all duration-500 ease-in-out"
                  style={{
                    display: 'grid',
                    gridTemplateRows: openFaq === index ? '1fr' : '0fr',
                    opacity: openFaq === index ? 1 : 0,
                    marginTop: openFaq === index ? '24px' : '0',
                  }}
                >
                  <div style={{ minHeight: 0 }}>
                    <p style={TYPOGRAPHY.bodyLarge}>{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-[#EEF2F3] py-20">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="flex gap-16 items-start">
            {/* Right side (appears first in RTL) - Sticky Title */}
            <div className="w-[35%] sticky top-24 text-start">
              {/* Eyebrow */}
              <p className="text-eyebrow mb-6" style={{ color: '#019FB7' }}>
                מי אנחנו
              </p>
              {/* H2 */}
              <h2 style={TYPOGRAPHY.h2}>
                מי אנחנו? הסיפור מאחורי ההצלחה
              </h2>
            </div>

            {/* Left side (appears second in RTL) - Content */}
            <div className="flex-1 text-start space-y-6 pt-10">
              <p
                style={{
                  fontSize: '18px',
                  fontWeight: 500,
                  lineHeight: '1.5',
                  color: '#0C1719'
                }}
              >
                אנחנו גוף, שבאמצע העשור השלישי, לאחר אלפי תיקים, רוצה להנגיש את היכולת לקבל את השירות המקצועי ברמה הכי גבוהה, במחיר שכל אחד יכול להרשות לעצמו, לרכוש את מיטב עורכי הדין בישראל.
              </p>
              <p
                style={{
                  fontSize: '18px',
                  fontWeight: 500,
                  lineHeight: '1.5',
                  color: '#0C1719'
                }}
              >
                שילוב של ניסיון רב שנים, אנושיות, ורמת שירות – הכל במחיר שפוי שמאפשר לכל אדם לדאוג למשפחתו, ולהותיר את רכושו אצלו.
              </p>
              <p
                style={{
                  fontSize: '18px',
                  fontWeight: 500,
                  lineHeight: '1.5',
                  color: '#0C1719'
                }}
              >
                משרד עוה"ד אריאל דרור הוקם על ידי עו"ד אריאל דרור בשנת 2001. עורכי הדין במשרד עוסקים בתיקי משפחה המשלבים בתוכם תחומים מגוונים בתוך ענייני המשפחה.
              </p>
              <p
                style={{
                  fontSize: '18px',
                  fontWeight: 500,
                  lineHeight: '1.5',
                  color: '#0C1719'
                }}
              >
                המשרד חרט על דגלו את המוטו של מתן שירות אישי ומקצועי ברמה הגבוהה ביותר. עו"ד דרור הינו בעל תואר ראשון במשפטים ותואר שני במשפטים מאוניברסיטת תל אביב. עו"ד דרור שימש כממלא מקום יו"ר ועדת בתי משפט למשפחה שליד הועד המרכזי בלשכת עורכי הדין, כחבר בוועדת נשיאויות בתי משפט שליד הועד המרכזי, כחבר בוועדת בתי דין רבנים שליד ועד המרכזי, וכסגן יו"ר ועדת בתי משפט לענייני משפחה שליד הועד המרכזי.
              </p>
              <p
                style={{
                  fontSize: '18px',
                  fontWeight: 500,
                  lineHeight: '1.5',
                  color: '#0C1719'
                }}
              >
                עו"ד דרור הוציא ספר בשם "חלוקת רכוש בהליך גירושין", המציג באופן מקיף ונהיר את כל הסוגיות המרכזיות הרלבנטיות בכל הנוגע לחלוקת רכוש בין בני זוג, ביחס הלכת השיתוף, וביחס למשטר חוק יחסי ממון. הספר נרכש ע"י הפקולטות השונות למשפטים, וכן ע"י משרד המשפטים, ומכר עד כה מאות עותקים. הספר צוטט בבתי המשפט, לרבות בבית המשפט העליון.
              </p>
              <p
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  lineHeight: '1.5',
                  color: '#0C1719'
                }}
              >
                המשרד דורג ב-duns 100 כאחד המשרדים הידועים במדינת ישראל.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <HomeBlogSection />
    </>
  );
}
