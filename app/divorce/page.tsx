import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "מדריך גירושין - Law4Us",
  description: "מדריך מקיף להליך הגירושין: מזונות, משמורת, חלוקת רכוש ותהליך הגירושין המלא.",
};

// Mock blog data
const blogPosts = [
  {
    id: 1,
    title: "כיצד לחלק רכוש בצורה הוגנת?",
    excerpt: "מדריך מקיף להבנת חוקי חלוקת הרכוש בישראל ואיך להגיע להסדר שמתאים לשני הצדדים...",
    date: "15 באוקטובר 2024",
    readTime: "5 דקות קריאה",
    image: "/placeholder-blog.jpg",
  },
  {
    id: 2,
    title: "זכויות הורים במשמורת משותפת",
    excerpt: "הבנת המשמעות של משמורת משותפת, מה הזכויות והחובות של כל הורה...",
    date: "10 באוקטובר 2024",
    readTime: "4 דקות קריאה",
    image: "/placeholder-blog.jpg",
  },
  {
    id: 3,
    title: "חישוב מזונות - מה חשוב לדעת",
    excerpt: "כל מה שצריך לדעת על חישוב מזונות ילדים ובן/בת זוג, הקריטריונים והשיקולים...",
    date: "5 באוקטובר 2024",
    readTime: "6 דקות קריאה",
    image: "/placeholder-blog.jpg",
  },
];

export default function DivorcePage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-white">
        <div className="container-custom section-padding">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-display font-bold mb-6">
              מדריך:
              <br />
              <span className="text-primary">מהו הליך הגירושין</span>
            </h1>
            <p className="text-body-large text-neutral-dark">
              מידע מקיף ומעודכן על כל שלבי הליך הגירושין - ממילוי הטפסים ועד לקבלת צו הגירושין
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container-custom section-padding">
        <div className="max-w-4xl mx-auto space-y-16">
          {/* Section 1: Alimony */}
          <section>
            <h2 className="text-h1 font-bold mb-6">מזונות / דמי מזונות</h2>
            <div className="prose prose-lg max-w-none space-y-4 text-body text-neutral-dark">
              <p>
                <strong className="text-neutral-darkest">מהם מזונות?</strong> מזונות הם תשלום כספי שמטרתו להבטיח את צורכי המחיה
                הבסיסיים. ישנם שני סוגים עיקריים: מזונות ילדים ומזונות בן/בת זוג.
              </p>
              <p>
                <strong className="text-neutral-darkest">מזונות ילדים</strong> נקבעים בהתאם לצורכי הילד, יכולת התשלום של ההורים
                ורמת החיים שהילד היה רגיל אליה. התשלום כולל מזון, ביגוד, חינוך, בריאות ובידור.
              </p>
              <p>
                <strong className="text-neutral-darkest">מזונות בן/בת זוג</strong> נקבעים לתקופה מוגבלת (בדרך כלל שנה לכל שנת
                נישואין) ומטרתם לאפשר לבן/בת הזוג החלש/ה כלכלית להסתדר עד שיוכל/תוכל לפרנס את עצמו/ה.
              </p>
              <p>
                <strong className="text-neutral-darkest">שינוי סכומי מזונות:</strong> ניתן לבקש שינוי בסכומי המזונות במידה וחל
                שינוי מהותי בנסיבות, כגון שינוי בהכנסה, מצב בריאותי או צרכי הילדים.
              </p>
            </div>
          </section>

          {/* Section 2: Custody */}
          <section>
            <h2 className="text-h1 font-bold mb-6">משמורת וסידורי ראיה</h2>
            <div className="prose prose-lg max-w-none space-y-4 text-body text-neutral-dark">
              <p>
                <strong className="text-neutral-darkest">משמורת</strong> היא הזכות והאחריות לדאוג לצרכי הילד ביום-יום: מקום מגורים,
                חינוך, בריאות וכדומה. ישנם שלושה סוגים עיקריים של משמורת:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>
                  <strong>משמורת בלעדית</strong> - הילד גר עם הורה אחד רוב הזמן, וההורה השני מקבל זכויות ראיה
                </li>
                <li>
                  <strong>משמורת משותפת</strong> - שני ההורים מקבלים החלטות ביחד, אך הילד גר עם הורה אחד
                </li>
                <li>
                  <strong>משמורת שווה</strong> - הילד מבלה זמן שווה אצל שני ההורים (למשל שבוע-שבוע)
                </li>
              </ul>
              <p>
                <strong className="text-neutral-darkest">סידורי ראיה</strong> מתייחסים לזמן שהילד מבלה עם ההורה שאין לו משמורת.
                בדרך כלל כוללים סופי שבוע לסירוגין, חגים וחופשות בחלוקה שווה, וערבי אמצע שבוע.
              </p>
              <p>
                <strong className="text-neutral-darkest">טובת הילד</strong> היא השיקול המרכזי והעליון בכל החלטה של בית המשפט
                בנוגע למשמורת. השופט בוחן גורמים כמו גיל הילד, העדפתו, איכות הקשר עם כל הורה, יכולות
                ההורים ועוד.
              </p>
            </div>
          </section>

          {/* Section 3: Property */}
          <section>
            <h2 className="text-h1 font-bold mb-6">חלוקת רכוש</h2>
            <div className="prose prose-lg max-w-none space-y-4 text-body text-neutral-dark">
              <p>
                <strong className="text-neutral-darkest">רכוש משותף</strong> - כל מה שנצבר במהלך הנישואין נחשב לרכוש משותף ומתחלק
                שווה בשווה בין בני הזוג, אלא אם הוסכם אחרת בהסכם ממון.
              </p>
              <p>
                <strong className="text-neutral-darkest">רכוש פרטי</strong> - נכסים שהיו לבן/בת הזוג לפני הנישואין, או שהתקבלו
                במתנה או בירושה במהלכם, נשארים קניינו הפרטי ואינם חלק מהחלוקה.
              </p>
              <p>
                <strong className="text-neutral-darkest">שווי הנכסים:</strong> נקבע לפי שווי השוק ביום פסק הדין. במידה והנכס
                הועבר לצד שלישי או הוחבא, בית המשפט רשאי להעריך את שוויו ולחייב בהשבה.
              </p>
              <p>
                <strong className="text-neutral-darkest">חובות משותפים</strong> - גם החובות שנצברו במהלך הנישואין מתחלקים, לא רק
                הנכסים. חישוב סופי של חלוקת הרכוש לוקח בחשבון את כל הנכסים בניכוי כל החובות.
              </p>
              <p>
                <strong className="text-neutral-darkest">הסכם ממון</strong> יכול לשנות את חוקי חלוקת הרכוש. אם יש הסכם ממון תקף,
                החלוקה תיעשה לפיו ולא לפי החוק.
              </p>
            </div>
          </section>

          {/* Section 4: Process */}
          <section>
            <h2 className="text-h1 font-bold mb-6">הליך הגירושין</h2>
            <div className="prose prose-lg max-w-none space-y-4 text-body text-neutral-dark">
              <p>
                <strong className="text-neutral-darkest">שלב 1: הגשת תביעה</strong> - התהליך מתחיל בהגשת תביעת גירושין לבית המשפט
                לענייני משפחה (או לבית הדין הרבני עבור זוגות נשואים כדת משה וישראל). התביעה כוללת פירוט
                הסיבות לגירושין והבקשות לגבי משמורת, מזונות וחלוקת רכוש.
              </p>
              <p>
                <strong className="text-neutral-darkest">שלב 2: המתנה לתשובה</strong> - הצד השני מקבל את התביעה ויש לו 30 יום
                להגיש כתב הגנה או כתב הגנה ותביעה שכנגד.
              </p>
              <p>
                <strong className="text-neutral-darkest">שלב 3: גישור</strong> - בית המשפט מחייב את הצדדים לנסות גישור לפני
                שמתחילים בהליכים משפטיים. הגישור מתמקד בניסיון להגיע להסכמות בנוגע לכל הנושאים השנויים
                במחלוקת.
              </p>
              <p>
                <strong className="text-neutral-darkest">שלב 4: דיונים</strong> - אם הגישור לא הצליח, מתקיימים דיונים בבית המשפט.
                כל צד מביא ראיות, עדויות ומסמכים לתמיכה בטענותיו.
              </p>
              <p>
                <strong className="text-neutral-darkest">שלב 5: פסק דין</strong> - השופט מכריע בכל הנושאים השנויים במחלוקת ונותן
                פסק דין. הפסק דין כולל החלטות לגבי הגירושין, משמורת, מזונות וחלוקת רכוש.
              </p>
              <p>
                <strong className="text-neutral-darkest">שלב 6: צו גירושין</strong> - לאחר 45 יום מפסק הדין (תקופת המתנה חובה),
                ניתן לבקש צו גירושין סופי. מסמך זה הוא שמסיים רשמית את הנישואין.
              </p>
              <p>
                <strong className="text-neutral-darkest">משך זמן:</strong> הליך גירושין מוסכם יכול להסתיים תוך מספר חודשים.
                הליך שלא בהסכמה יכול לארוך שנה-שנתיים או יותר, תלוי במורכבות התיק ובעומס על בית המשפט.
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Blog Section */}
      <section id="blog" className="bg-neutral-lightest">
        <div className="container-custom section-padding">
          <div className="text-center mb-12">
            <h2 className="text-display font-bold mb-4">מהבלוג</h2>
            <p className="text-body-large text-neutral-dark">
              מאמרים וטיפים מועילים בנושאי גירושין ומשפחה
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-lg overflow-hidden shadow-card hover:shadow-lg transition-smooth"
              >
                <div className="h-48 bg-neutral-light flex items-center justify-center text-neutral-dark">
                  {/* Placeholder for image */}
                  <span className="text-body-small">תמונה להמחשה</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 text-caption text-neutral-dark mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {post.readTime}
                    </span>
                  </div>
                  <h3 className="text-h3 font-semibold mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-body text-neutral-dark mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/divorce/${post.id}`}>קרא עוד</Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white">
        <div className="container-custom section-padding">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-h1 font-bold mb-6">מוכנים להתחיל?</h2>
            <p className="text-body-large text-neutral-dark mb-8">
              קבלו ליווי מקצועי ומלא לאורך כל התהליך
            </p>
            <Button size="lg" asChild>
              <Link href="/wizard">התחילו בהליך גירושין</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
