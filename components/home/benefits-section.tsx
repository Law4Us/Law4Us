'use client';

import { TYPOGRAPHY, CARD_STYLES } from '@/lib/constants/styles';
import { SlideInView } from '@/components/animations/slide-in-view';

export function BenefitsSection() {
  return (
    <section className="py-12 md:py-16 lg:py-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-12">
          {/* Eyebrow */}
          <p
            className="mb-6"
            style={TYPOGRAPHY.eyebrow}
          >
            למה לבחור בנו?
          </p>
          {/* H2 */}
          <h2
            className="text-[28px] sm:text-[36px] lg:text-[48px]"
            style={{
              ...TYPOGRAPHY.h2,
              fontSize: undefined
            }}
          >
            כל היתרונות של שירות דיגיטלי, עם ליווי משפטי מהשורה הראשונה
          </h2>
          {/* Subheader */}
          <p style={TYPOGRAPHY.subtitle}>
            שירות אישי, זמינות מרבית, מחיר הוגן ותהליך שקוף – כל מה שצריך בשביל להתחיל תהליך בראש שקט.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <SlideInView delay={0} direction="up" duration={600} threshold={0.2} rootMargin='0px'>
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
          </SlideInView>

          <SlideInView delay={100} direction="up" duration={600} threshold={0.2} rootMargin='0px'>
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
          </SlideInView>

          <SlideInView delay={200} direction="up" duration={600} threshold={0.2} rootMargin='0px'>
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
          </SlideInView>

          <SlideInView delay={300} direction="up" duration={600} threshold={0.2} rootMargin='0px'>
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
          </SlideInView>
        </div>
      </div>
    </section>
  );
}
