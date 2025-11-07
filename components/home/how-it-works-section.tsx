'use client';

import Image from 'next/image';
import { TYPOGRAPHY, STEP_BOX_STYLES } from '@/lib/constants/styles';
import { SlideInView } from '@/components/animations/slide-in-view';

export function HowItWorksSection() {
  return (
    <section className="py-20" id="how">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-12">
          {/* Eyebrow */}
          <p
            className="mb-6"
            style={TYPOGRAPHY.eyebrow}
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
          <SlideInView delay={0} direction="up">
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
          </SlideInView>

          {/* Step 02 */}
          <SlideInView delay={150} direction="up">
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
          </SlideInView>

          {/* Step 03 */}
          <SlideInView delay={300} direction="up">
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
          </SlideInView>
        </div>
      </div>
    </section>
  );
}
