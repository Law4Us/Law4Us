import type { Metadata } from "next";
import { Award, BookOpen, Users, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "אודות - Law4Us",
  description: "הסיפור מאחורי ההצלחה. משרד עורכי דין מוביל בתחום דיני המשפחה בישראל.",
};

const stats = [
  { icon: Users, label: "תיקים מטופלים", value: "5,000+" },
  { icon: Award, label: "שנות ניסיון", value: "15+" },
  { icon: TrendingUp, label: "שביעות רצון", value: "98%" },
  { icon: BookOpen, label: "פרסומים מקצועיים", value: "25+" },
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-white">
        <div className="container-custom section-padding">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-display font-bold mb-6">
              מי אנחנו?
              <br />
              <span className="text-primary">הסיפור מאחורי ההצלחה</span>
            </h1>
            <p className="text-body-large text-neutral-dark">
              משרד עו"ד אריאל דרור מתמחה בדיני משפחה וטיפל בהצלחה באלפי תיקים ברחבי הארץ.
              המשרד הוקם מתוך חזון ליצור שירות משפטי נגיש, שקוף והוגן לכולם.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-neutral-lightest">
        <div className="container-custom py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-display font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-body text-neutral-dark">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section>
        <div className="container-custom section-padding">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-h1 font-bold mb-8 text-center">המשימה שלנו</h2>
            <div className="space-y-6 text-body-large text-neutral-dark">
              <p>
                <strong className="text-neutral-darkest">שירות משפטי איכותי במחיר הוגן.</strong> אנחנו מאמינים שכל אחד ראוי
                לייצוג משפטי מצוין, ללא קשר למצבו הכלכלי. המודל הדיגיטלי שלנו מאפשר לנו להציע שירותים
                במחירים נגישים מבלי לוותר על איכות.
              </p>
              <p>
                <strong className="text-neutral-darkest">שקיפות מלאה.</strong> אתם מקבלים מחיר קבוע מראש, ללא הפתעות.
                אנחנו מסבירים כל שלב בתהליך ודואגים שאתם מבינים בדיוק מה קורה בתיק שלכם.
              </p>
              <p>
                <strong className="text-neutral-darkest">טכנולוגיה בשירות המשפט.</strong> השילוב בין מומחיות משפטית
                לטכנולוגיה מתקדמת מאפשר לנו לספק שירות מהיר, יעיל ומדויק, תוך שמירה על מגע אנושי חם
                ואכפתי.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="bg-neutral-lightest">
        <div className="container-custom section-padding">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-h1 font-bold mb-12 text-center">עו"ד אריאל דרור - המייסד</h2>
            <div className="bg-white rounded-lg p-8 lg:p-12">
              <div className="space-y-6 text-body text-neutral-dark">
                <p>
                  <strong className="text-h3 text-neutral-darkest block mb-2">השכלה וניסיון</strong>
                  עו"ד אריאל דרור בעל תואר ראשון במשפטים (LL.B) ממכללת שערי משפט, ותואר שני
                  במנהל עסקים (MBA) מאוניברסיטת בר-אילן. הוא עובר על 15 שנות ניסיון בתחום דיני המשפחה.
                </p>
                <p>
                  <strong className="text-h3 text-neutral-darkest block mb-2">מומחיות ייחודית</strong>
                  התמחותו העיקרית של אריאל היא בחלוקת רכוש בין בני זוג, נושא שעליו הוא פרסם ספר מקצועי
                  שמשמש כמקור מידע למשפטנים רבים בארץ. הוא ייצג בהצלחה אלפי לקוחות בהליכי גירושין,
                  משמורת, מזונות וחלוקת רכוש.
                </p>
                <p>
                  <strong className="text-h3 text-neutral-darkest block mb-2">הובלה מקצועית</strong>
                  אריאל שימש כיו"ר ועד לשכת עורכי הדין במחוז תל אביב ומשמש כמרצה בכנסים משפטיים רבים.
                  המשרד שלו דורג במקום הראשון בדירוג Duns 100 בקטגוריית שירותים משפטיים.
                </p>
                <p>
                  <strong className="text-h3 text-neutral-darkest block mb-2">גישה אנושית</strong>
                  "הלקוח במרכז" - זה לא סתם סיסמה, אלא אמונה עמוקה שמנחה את כל פעילותנו. אנחנו מבינים
                  שמאחורי כל תיק יש בני אדם במצב רגשי מורכב, ואנחנו כאן כדי לספק לא רק ייצוג משפטי
                  אלא גם תמיכה והבנה.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recognition */}
      <section>
        <div className="container-custom section-padding">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-h1 font-bold mb-8">הכרה מקצועית</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-neutral-lightest rounded-lg p-8">
                <h3 className="text-h2 font-semibold mb-4">דירוג Duns 100</h3>
                <p className="text-body text-neutral-dark">
                  המשרד דורג במקום הראשון בקטגוריית שירותים משפטיים, המצטבר של שלוש שנים רצופות.
                </p>
              </div>
              <div className="bg-neutral-lightest rounded-lg p-8">
                <h3 className="text-h2 font-semibold mb-4">פרסומים מקצועיים</h3>
                <p className="text-body text-neutral-dark">
                  ספרו של אריאל על חלוקת רכוש משמש כמקור מידע מוביל עבור עורכי דין ושופטים ברחבי הארץ.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
