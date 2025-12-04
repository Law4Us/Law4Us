require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

/**
 * COMPREHENSIVE FAMILY COURT DIVORCE TEST
 *
 * Client: מיכל אברהם (Female plaintiff)
 * Scenario: Infidelity case with young children -
 *           triggers FAMILY COURT routing
 *
 * This test includes ALL wizard questions filled out realistically
 * to test the complete document generation flow.
 */

const testData = {
  basicInfo: {
    // Plaintiff (Applicant) - The wife filing for divorce
    fullName: 'מיכל אברהם',
    idNumber: '312456789',
    email: 'michal.avraham@gmail.com',
    phone: '054-8765432',
    address: 'רחוב ויצמן 78, דירה 5, רמת גן',
    birthDate: '1990-02-14',
    gender: 'female',

    // Respondent (Defendant) - The husband
    fullName2: 'עמית אברהם',
    idNumber2: '287654123',
    phone2: '052-1234567',
    email2: 'amit.avraham@gmail.com',
    address2: 'רחוב הרב קוק 15, בני ברק', // Moved out
    birthDate2: '1987-07-03',
    gender2: 'male',

    relationshipType: 'married',
    weddingDay: '2016-05-22',
  },

  selectedClaims: ['divorce'],

  formData: {
    // ============ CHILDREN (from GLOBAL_QUESTIONS) ============
    hasSharedChildren: 'yes',
    children: [
      {
        firstName: 'איתי',
        lastName: 'אברהם',
        idNumber: '378912345',
        birthDate: '2018-09-08',
        address: 'רחוב ויצמן 78, דירה 5, רמת גן',
        nameOfParent: 'עמית אברהם',
        childRelationship: 'איתי הוא הבן הבכור, בכיתה א\'. ילד חכם ורגיש שמרגיש את המתח בבית. אוהב לשחק כדורגל ולבנות לגו. קשה לו להיפרד מאבא.',
      },
      {
        firstName: 'מאיה',
        lastName: 'אברהם',
        idNumber: '389456123',
        birthDate: '2021-03-15',
        address: 'רחוב ויצמן 78, דירה 5, רמת גן',
        nameOfParent: 'עמית אברהם',
        childRelationship: 'מאיה היא הבת הקטנה, בת 3. ילדה חייכנית ומתוקה. צמודה לאמא וזקוקה לשגרה יציבה. מתחילה גן חובה בספטמבר.',
      },
    ],

    // ============ PREVIOUS MARRIAGES (GLOBAL) ============
    marriedBefore: 'לא',
    hadChildrenFromPrevious: 'לא',
    marriedBefore2: 'לא',
    hadChildrenFromPrevious2: 'לא',

    // ============ HOUSING (GLOBAL) ============
    applicantHomeType: 'rental',
    partnerHomeType: 'rental', // Both were renting

    // ============ FAMILY VIOLENCE (GLOBAL) ============
    protectionOrderRequested: 'לא',
    pastViolenceReported: 'לא',

    // ============ OTHER FAMILY CASES (GLOBAL) ============
    otherFamilyCases: [],

    // ============ WELFARE AND COUNSELING (GLOBAL) ============
    contactedWelfare: 'כן',
    contactedMarriageCounseling: 'כן',
    willingToJoinFamilyCounseling: 'לא',
    willingToJoinMediation: 'כן',

    // ============ LIVING SITUATION (GLOBAL) ============
    livingSeparately: 'כן',
    separationDate: '2024-08-15',

    // ============ RELATIONSHIP DESCRIPTION (GLOBAL) ============
    relationshipDescription: 'הנישואין היו טובים בתחילה. לאחר לידת הילד השני, הבעל התחיל לעבוד שעות ארוכות והתרחק מהמשפחה. לפני כחצי שנה התגלה שהבעל מנהל רומן עם עמיתה לעבודה. הבגידה שברה את האמון לחלוטין ואין סיכוי לשיקום הקשר.',

    // ============ DIVORCE ROUTING QUESTIONS ============
    // These trigger FAMILY COURT routing (infidelity + young children)
    'divorce.currentSituation': 'wantDivorce',
    'divorce.infidelity': 'כן', // TRIGGERS FAMILY COURT
    'divorce.youngestChildAge': 'under6', // Also supports family court (child is 3)
    'divorce.careerDisparity': 'partnerEarnsMore',
    'divorce.significantProperty': 'לא', // No significant property
    'divorce.halachicGrounds': 'none',
    'divorce.childrenDispute': 'כן',
    'divorce.needSupport': 'כן',
    'divorce.propertyDispute': 'כן',

    // ============ DIVORCE SPECIFIC QUESTIONS ============
    // Note: The routing fields need the 'divorce.' prefix as keys inside this object
    // because the router looks for step4['divorce.infidelity'] etc.
    divorce: {
      // ROUTING FIELDS - these determine which court generator is used
      'divorce.currentSituation': 'wantDivorce',
      'divorce.infidelity': 'כן',  // THIS TRIGGERS FAMILY COURT
      'divorce.youngestChildAge': 'under6',  // Also supports family court
      'divorce.careerDisparity': 'partnerEarnsMore',
      'divorce.significantProperty': 'לא',
      'divorce.halachicGrounds': 'none',
      'divorce.childrenDispute': 'כן',
      'divorce.needSupport': 'כן',
      'divorce.propertyDispute': 'כן',
      // Also include non-prefixed versions for the generator
      currentSituation: 'wantDivorce',
      infidelity: 'כן',
      youngestChildAge: 'under6',
      careerDisparity: 'partnerEarnsMore',
      significantProperty: 'לא',
      halachicGrounds: 'none',
      childrenDispute: 'כן',
      needSupport: 'כן',
      propertyDispute: 'כן',
      urgentRelief: 'כן',
      urgentReliefDetails: 'מבוקשים מזונות זמניים לילדים עד לסיום ההליך, וכן צו למניעת הברחת נכסים',
      parallelCases: 'לא',
      parallelCasesDetails: '',

      // Marriage details
      weddingCity: 'תל אביב',
      religiousMarriage: 'כן',
      religiousCouncil: 'הרבנות תל אביב-יפו',

      // Divorce story
      whoWantsDivorceAndWhy: `הנישואין החלו טוב בשנת 2016. נולדו שני ילדים: איתי (2018) ומאיה (2021).

בפברואר 2024, התובעת גילתה שבעלה מנהל רומן עם עמיתה לעבודה. התגלו הודעות, תמונות ועדויות לפגישות בחדר מלון.

הבעל הודה בבגידה אך סירב להפסיק את הקשר. התובעת הציבה אולטימטום, אך הבעל בחר להמשיך את הרומן.

באוגוסט 2024, הבעל עזב את דירת המגורים ועבר לגור בבני ברק. מאז אין סיכוי לשיקום הנישואין.`,

      divorceReasons: `1. בגידה - הבעל ניהל ומנהל רומן עם אישה אחרת, מה שמהווה הפרה בוטה של חובת הנאמנות הזוגית.

2. נטישת המשפחה - הבעל עזב את הבית והילדים באוגוסט 2024.

3. שבירת אמון בלתי הפיכה - לאחר גילוי הבגידה, אין כל אפשרות לבנות מחדש את האמון בין הצדדים.

4. הזנחת הילדים - מאז עזיבתו, הבעל אינו משלם מזונות באופן סדיר ופוגש את הילדים לעיתים רחוקות.

5. קריסת הקשר הזוגי - הצדדים אינם מנהלים כל קשר זוגי מזה חודשים, ואין סיכוי לשיקום.`,

      // Police complaints
      policeComplaints: 'לא',

      // Mediation history
      hadPreviousMediation: 'לא',
      previousMediationDetails: '',

      marriageCounselingDetails: 'התובעת פנתה לייעוץ זוגי אצל הפסיכולוגית גב\' שרה לוי במרץ 2024. הבעל הגיע לפגישה אחת בלבד וסירב להמשיך. הטיפול הפך לטיפול אישי לתובעת בלבד.',

      // No ketubah requests (going to family court)
      ketubahAmount: '',
      ketubahRequest: '',
    },

    // ============ PROPERTY ============
    property: {
      hasAssets: 'yes',
      separationDate: '2024-08-15',
      applicantEmploymentStatus: 'employee',
      applicantEmployer: 'חברת אלביט מערכות',
      applicantGrossSalary: 16000,
      respondentEmploymentStatus: 'employee',
      respondentEmployer: 'חברת אינטל ישראל',
      respondentGrossSalary: 38000,
      courtProceedings: 'no',
    },

    // Real Estate - only rental, no owned property
    apartments: [],

    // Vehicles
    vehicles: [
      {
        type: 'יונדאי i30 2021',
        licenseNumber: '45-678-91',
        year: '2021',
        owner: 'עמית אברהם',
        value: '95,000 ש"ח',
      },
    ],

    // Savings
    savings: [
      {
        type: 'חשבון עו"ש משותף',
        bank: 'בנק דיסקונט',
        accountNumber: '567890',
        owner: 'שני הצדדים',
        amount: '35,000 ש"ח',
      },
      {
        type: 'חשבון חיסכון לילדים',
        bank: 'בנק הפועלים',
        accountNumber: '234567',
        owner: 'שני הצדדים',
        amount: '28,000 ש"ח',
      },
    ],

    // Benefits (Pension, etc.)
    benefits: [
      {
        type: 'קרן פנסיה',
        institution: 'הפניקס',
        owner: 'עמית אברהם',
        amount: '420,000 ש"ח',
      },
      {
        type: 'קרן פנסיה',
        institution: 'כלל ביטוח',
        owner: 'מיכל אברהם',
        amount: '180,000 ש"ח',
      },
    ],

    // Debts
    debts: [
      {
        type: 'הלוואה לרכישת רכב',
        creditor: 'בנק דיסקונט',
        owner: 'עמית אברהם',
        amount: '45,000 ש"ח',
        paymentDate: '12/2025',
      },
      {
        type: 'משיכת יתר',
        creditor: 'בנק דיסקונט',
        owner: 'שני הצדדים',
        amount: '12,000 ש"ח',
      },
    ],

    // ============ ALIMONY ============
    alimony: {
      wasPreviousAlimony: 'yes',
      lastAlimonyAmount: 3000,
      lastAlimonyDate: '2024-10-01',
      previousAlimonyDetails: 'הבעל שילם מזונות חלקיים ולא סדירים מאז עזיבתו. בחודש האחרון שולמו רק 3,000 ש"ח במקום הסכום המוסכם.',
      hasChildrenNeeds: 'yes',
      childrenNeeds: [
        { category: 'education', description: 'בית ספר לאיתי', monthlyAmount: 1200 },
        { category: 'education', description: 'גן ילדים למאיה', monthlyAmount: 2800 },
        { category: 'activities', description: 'כדורגל לאיתי', monthlyAmount: 280 },
        { category: 'activities', description: 'התעמלות למאיה', monthlyAmount: 200 },
        { category: 'medical', description: 'ביטוח בריאות לילדים', monthlyAmount: 400 },
        { category: 'clothing', description: 'ביגוד והנעלה', monthlyAmount: 600 },
        { category: 'food', description: 'מזון', monthlyAmount: 2500 },
        { category: 'transportation', description: 'הסעות', monthlyAmount: 350 },
      ],
      hasHouseholdNeeds: 'yes',
      householdNeeds: [
        { category: 'rent', description: 'שכר דירה', monthlyAmount: 6500 },
        { category: 'tax', description: 'ארנונה', monthlyAmount: 420 },
        { category: 'electricity', description: 'חשמל', monthlyAmount: 380 },
        { category: 'water', description: 'מים', monthlyAmount: 150 },
        { category: 'gas', description: 'גז', monthlyAmount: 100 },
        { category: 'building', description: 'ועד בית', monthlyAmount: 180 },
        { category: 'internet', description: 'אינטרנט', monthlyAmount: 150 },
      ],
      hasBankAccounts: 'yes',
      bankAccounts: [
        { bankName: 'בנק דיסקונט', accountNumber: '567890', balance: 8000 },
      ],
      husbandIncome: '38,000 ש"ח ברוטו לחודש',
      wifeIncome: '16,000 ש"ח ברוטו לחודש',
      additionalIncome: 'אין הכנסות נוספות',
      childExpenses: '4,500 ש"ח לשני הילדים לחודש',
      requestedChildAlimony: '8,500 ש"ח (כולל מדור יחסי)',
    },

    // ============ CUSTODY ============
    custody: {
      currentLivingArrangement: 'with_applicant', // Kids are with the mother
      sinceWhen: '2024-08-15',
      currentVisitationArrangement: 'האב פוגש את הילדים פעם בשבוע ביום שישי (10:00-18:00). לעיתים מבטל בהתראה קצרה. הילדים שמחים לראות אותו אך מתאכזבים מהביטולים.',
      requestedArrangement: 'primary_with_visits',
      whoShouldHaveCustody: `התובעת מבקשת משמורת ראשית על שני הילדים מהסיבות הבאות:

1. היא ההורה העיקרי המטפל מאז לידתם - האב עבד שעות ארוכות ולא היה זמין.

2. הילדים צעירים מאוד (6 ו-3) וזקוקים ליציבות ושגרה קבועה שהאם מספקת.

3. מאיה (בת 3) עדיין בגיל רך ומאוד צמודה לאמא - פרידה תהיה טראומטית עבורה.

4. האב הוכיח חוסר אחריות - עזב את המשפחה, לא משלם מזונות סדירים, ומבטל פגישות.

5. סביבה יציבה - הילדים ממשיכים במסגרות החינוכיות שלהם ליד בית האם.`,
      whyNotOtherParent: `האב אינו מתאים למשמורת משותפת או ראשית מהסיבות הבאות:

1. עזב את המשפחה לטובת רומן עם אישה אחרת - מעדיף את צרכיו על פני הילדים.

2. אינו משלם מזונות באופן סדיר - מראה חוסר אחריות כלכלית.

3. מבטל פגישות עם הילדים - פוגע באמון שלהם.

4. גר בדירה קטנה בבני ברק שאינה מתאימה לילדים.

5. עובד שעות ארוכות ואין לו זמן פנוי לטפל בילדים.`,
    },
  },

  // Signature
  signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',

  paymentData: { paid: true, date: new Date() },
  filledDocuments: {},
  submittedAt: new Date().toISOString(),
};

// Calculate total children expenses
const totalChildrenExpenses = testData.formData.alimony.childrenNeeds.reduce(
  (sum, item) => sum + item.monthlyAmount, 0
);
const totalHouseholdExpenses = testData.formData.alimony.householdNeeds.reduce(
  (sum, item) => sum + item.monthlyAmount, 0
);

console.log('');
console.log('='.repeat(70));
console.log('        COMPREHENSIVE FAMILY COURT DIVORCE TEST');
console.log('        בית משפט לענייני משפחה - תביעת גירושין מקיפה');
console.log('='.repeat(70));
console.log('');
console.log(' Client Details:');
console.log('   Plaintiff:    ' + testData.basicInfo.fullName + ' (Wife)');
console.log('   Respondent:   ' + testData.basicInfo.fullName2 + ' (Husband)');
console.log('   Marriage:     ' + testData.basicInfo.weddingDay + ' (' + (2024 - 2016) + ' years)');
console.log('   Children:     ' + testData.formData.children.length + ' (' + testData.formData.children.map(c => c.firstName).join(', ') + ')');
console.log('');
console.log(' Routing Factors (FAMILY COURT):');
console.log('   Infidelity:         YES (husband affair)');
console.log('   Youngest Child:     3 years (UNDER 6)');
console.log('   Career Disparity:   Yes (38K vs 16K - partner earns more)');
console.log('   Significant Prop:   No (renters)');
console.log('   Halachic Grounds:   None');
console.log('');
console.log(' Financial Summary:');
console.log('   Total Real Estate:  0 NIS (renters)');
console.log('   Total Savings:      ~63,000 NIS');
console.log('   Total Pensions:     ~600,000 NIS');
console.log('   Total Debt:         ~57,000 NIS');
console.log('   Monthly Children:   ' + totalChildrenExpenses.toLocaleString() + ' NIS');
console.log('   Monthly Household:  ' + totalHouseholdExpenses.toLocaleString() + ' NIS');
console.log('');
console.log('='.repeat(70));
console.log('');
console.log(' Sending to API...');
console.log('');

axios
  .post('http://localhost:3000/api/submission', testData)
  .then((response) => {
    console.log(' SUCCESS!');
    console.log('');
    console.log(' Google Drive:');
    console.log('   Folder: ' + response.data.folderName);
    console.log('   Link:   https://drive.google.com/drive/folders/' + response.data.folderId);
    console.log('');
    console.log(' Expected Documents:');
    console.log('   - submission-data-*.json');
    console.log('   - טופס 4.pdf');
    console.log('   - תביעת גירושין - בית משפט לענייני משפחה.docx');
    console.log('   - מסמך גיבוי שאלות ותשובות.docx');
    console.log('');
    console.log('='.repeat(70));
  })
  .catch((error) => {
    console.error(' FAILED!');
    console.error('');
    if (error.response) {
      console.error('   Status: ' + error.response.status);
      console.error('   Error:  ' + JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('   No response from server - is it running on localhost:3000?');
    } else {
      console.error('   Error: ' + error.message);
    }
    console.error('');
    process.exit(1);
  });
