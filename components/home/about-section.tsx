'use client';

import { TYPOGRAPHY } from '@/lib/constants/styles';

export function AboutSection() {
  return (
    <section className="py-12 md:py-16 lg:py-20">
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-16 items-start">
          {/* Right side (appears first in RTL) - Sticky Title on desktop only */}
          <div className="w-full lg:w-[35%] lg:sticky lg:top-24 text-start">
            {/* Eyebrow */}
            <p className="text-eyebrow mb-6" style={{ color: '#019FB7' }}>
              מי אנחנו
            </p>
            {/* H2 */}
            <h2
              className="text-[28px] sm:text-[36px] lg:text-[48px]"
              style={{
                ...TYPOGRAPHY.h2,
                fontSize: undefined
              }}
            >
              מי אנחנו? הסיפור מאחורי ההצלחה
            </h2>
          </div>

          {/* Left side (appears second in RTL) - Content */}
          <div className="flex-1 text-start space-y-6 lg:pt-10">
            <p style={TYPOGRAPHY.bodyMedium}>
              אנחנו גוף, שבאמצע העשור השלישי, לאחר אלפי תיקים, רוצה להנגיש את היכולת לקבל את השירות המקצועי ברמה הכי גבוהה, במחיר שכל אחד יכול להרשות לעצמו, לרכוש את מיטב עורכי הדין בישראל.
            </p>
            <p style={TYPOGRAPHY.bodyMedium}>
              שילוב של ניסיון רב שנים, אנושיות, ורמת שירות – הכל במחיר שפוי שמאפשר לכל אדם לדאוג למשפחתו, ולהותיר את רכושו אצלו.
            </p>
            <p style={TYPOGRAPHY.bodyMedium}>
              משרד עוה"ד אריאל דרור הוקם על ידי עו"ד אריאל דרור בשנת 2001. עורכי הדין במשרד עוסקים בתיקי משפחה המשלבים בתוכם תחומים מגוונים בתוך ענייני המשפחה.
            </p>
            <p style={TYPOGRAPHY.bodyMedium}>
              המשרד חרט על דגלו את המוטו של מתן שירות אישי ומקצועי ברמה הגבוהה ביותר. עו"ד דרור הינו בעל תואר ראשון במשפטים ותואר שני במשפטים מאוניברסיטת תל אביב. עו"ד דרור שימש כממלא מקום יו"ר ועדת בתי משפט למשפחה שליד הועד המרכזי בלשכת עורכי הדין, כחבר בוועדת נשיאויות בתי משפט שליד הועד המרכזי, כחבר בוועדת בתי דין רבנים שליד ועד המרכזי, וכסגן יו"ר ועדת בתי משפט לענייני משפחה שליד הועד המרכזי.
            </p>
            <p style={TYPOGRAPHY.bodyMedium}>
              עו"ד דרור הוציא ספר בשם "חלוקת רכוש בהליך גירושין", המציג באופן מקיף ונהיר את כל הסוגיות המרכזיות הרלבנטיות בכל הנוגע לחלוקת רכוש בין בני זוג, ביחס הלכת השיתוף, וביחס למשטר חוק יחסי ממון. הספר נרכש ע"י הפקולטות השונות למשפטים, וכן ע"י משרד המשפטים, ומכר עד כה מאות עותקים. הספר צוטט בבתי המשפט, לרבות בבית המשפט העליון.
            </p>
            <p style={TYPOGRAPHY.bodyMediumBold}>
              המשרד דורג ב-duns 100 כאחד המשרדים הידועים במדינת ישראל.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
