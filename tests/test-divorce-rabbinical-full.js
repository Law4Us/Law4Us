require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

/**
 * COMPREHENSIVE RABBINICAL COURT DIVORCE TEST
 *
 * Client: יעקב לוי (Male plaintiff)
 * Scenario: Long marriage with significant property, career disparity,
 *           and halachic grounds - triggers RABBINICAL COURT routing
 *
 * This test includes ALL wizard questions filled out realistically
 * to test the complete document generation flow.
 */

const testData = {
  basicInfo: {
    // Plaintiff (Applicant) - The husband filing for divorce
    fullName: 'יעקב לוי',
    idNumber: '305789412',
    email: 'yaakov.levi@gmail.com',
    phone: '052-3456789',
    address: 'רחוב אלנבי 45, דירה 12, תל אביב',
    birthDate: '1978-04-22',
    gender: 'male',

    // Respondent (Defendant) - The wife
    fullName2: 'רחל לוי',
    idNumber2: '208654123',
    phone2: '050-9876543',
    email2: 'rachel.levi@gmail.com',
    address2: 'רחוב אלנבי 45, דירה 12, תל אביב', // Still living together
    birthDate2: '1982-09-15',
    gender2: 'female',

    relationshipType: 'married',
    weddingDay: '2005-08-28',
  },

  selectedClaims: ['divorce'],

  formData: {
    // ============ CHILDREN (from GLOBAL_QUESTIONS) ============
    hasSharedChildren: 'yes',
    children: [
      {
        firstName: 'אורי',
        lastName: 'לוי',
        idNumber: '342567891',
        birthDate: '2008-03-12',
        address: 'רחוב אלנבי 45, דירה 12, תל אביב',
        nameOfParent: 'רחל לוי',
        childRelationship: 'אורי הוא הילד הבכור, תלמיד מצטיין בכיתה י"א. קשר חזק עם שני ההורים אך מתגורר בעיקר עם האם. משתתף בקבוצת כדורסל ומנגן בגיטרה.',
      },
      {
        firstName: 'נועה',
        lastName: 'לוי',
        idNumber: '356891234',
        birthDate: '2011-11-05',
        address: 'רחוב אלנבי 45, דירה 12, תל אביב',
        nameOfParent: 'רחל לוי',
        childRelationship: 'נועה היא הבת האמצעית, תלמידת כיתה ח\'. ילדה רגישה מאוד שסובלת מהמתח בבית. לומדת ריקוד ומציירת.',
      },
      {
        firstName: 'דניאל',
        lastName: 'לוי',
        idNumber: '389654712',
        birthDate: '2016-06-20',
        address: 'רחוב אלנבי 45, דירה 12, תל אביב',
        nameOfParent: 'רחל לוי',
        childRelationship: 'דניאל הוא הקטן, בכיתה ב\'. ילד עליז וחברותי. צמוד לשני ההורים ומתקשה עם הפרידה.',
      },
    ],

    // ============ PREVIOUS MARRIAGES (GLOBAL) ============
    marriedBefore: 'לא',
    hadChildrenFromPrevious: 'לא',
    marriedBefore2: 'לא',
    hadChildrenFromPrevious2: 'לא',

    // ============ HOUSING (GLOBAL) ============
    applicantHomeType: 'jointOwnership',
    partnerHomeType: 'jointOwnership',

    // ============ FAMILY VIOLENCE (GLOBAL) ============
    protectionOrderRequested: 'לא',
    pastViolenceReported: 'לא',

    // ============ OTHER FAMILY CASES (GLOBAL) ============
    otherFamilyCases: [],

    // ============ WELFARE AND COUNSELING (GLOBAL) ============
    contactedWelfare: 'לא',
    contactedMarriageCounseling: 'כן',
    willingToJoinFamilyCounseling: 'לא',
    willingToJoinMediation: 'כן',

    // ============ LIVING SITUATION (GLOBAL) ============
    livingSeparately: 'כן',
    separationDate: '2024-06-01',

    // ============ RELATIONSHIP DESCRIPTION (GLOBAL) ============
    relationshipDescription: 'מערכת היחסים הייתה טובה בשנים הראשונות של הנישואין. עם הזמן, הצדדים התרחקו רגשית. הבעל התמקד בקריירה והאישה הרגישה מוזנחת. ניסיונות רבים לייעוץ זוגי לא הצליחו לגשר על הפערים.',

    // ============ DIVORCE ROUTING QUESTIONS ============
    // These trigger RABBINICAL COURT routing
    'divorce.currentSituation': 'wantDivorce',
    'divorce.infidelity': 'לא',
    'divorce.youngestChildAge': '6andAbove', // 8 years old, not under 6
    'divorce.careerDisparity': 'iEarnMore', // Significant disparity - triggers rabbinical
    'divorce.significantProperty': 'כן', // Significant property - triggers rabbinical
    'divorce.halachicGrounds': 'refusalRelations', // Halachic grounds - triggers rabbinical
    'divorce.childrenDispute': 'כן',
    'divorce.needSupport': 'כן',
    'divorce.propertyDispute': 'כן',

    // ============ DIVORCE SPECIFIC QUESTIONS ============
    // Note: The routing fields need the 'divorce.' prefix as keys inside this object
    // because the router looks for step4['divorce.infidelity'] etc.
    divorce: {
      // ROUTING FIELDS - these determine which court generator is used
      'divorce.currentSituation': 'wantDivorce',
      'divorce.infidelity': 'לא',
      'divorce.youngestChildAge': '6andAbove',
      'divorce.careerDisparity': 'iEarnMore',  // Triggers rabbinical
      'divorce.significantProperty': 'כן',      // Triggers rabbinical
      'divorce.halachicGrounds': 'refusalRelations',  // Triggers rabbinical
      'divorce.childrenDispute': 'כן',
      'divorce.needSupport': 'כן',
      'divorce.propertyDispute': 'כן',
      // Also include non-prefixed versions for the generator
      currentSituation: 'wantDivorce',
      infidelity: 'לא',
      youngestChildAge: '6andAbove',
      careerDisparity: 'iEarnMore',
      significantProperty: 'כן',
      halachicGrounds: 'refusalRelations',
      childrenDispute: 'כן',
      needSupport: 'כן',
      propertyDispute: 'כן',
      urgentRelief: 'כן',
      urgentReliefDetails: 'מבוקש עיקול זמני על חשבונות הבנק המשותפים כדי למנוע העברת כספים חד-צדדית',
      parallelCases: 'לא',
      parallelCasesDetails: '',

      // Marriage details
      weddingCity: 'ירושלים',
      religiousMarriage: 'כן',
      religiousCouncil: 'הרבנות הראשית ירושלים',

      // Divorce story
      whoWantsDivorceAndWhy: `הנישואין נמשכו כ-19 שנים. בשנים האחרונות, הצדדים חיו כ"שותפים לדירה" ללא קשר זוגי אמיתי.

האישה סירבה ליחסי אישות במשך כשנתיים. הבעל ניסה פעמים רבות לשקם את הקשר, כולל פנייה לייעוץ זוגי, אך ללא הצלחה.

מאז יוני 2024 הצדדים גרים בנפרד - הבעל עבר לגור אצל אחיו. הניסיונות לפיוס נכשלו והגירושין הם הפתרון היחיד.`,

      divorceReasons: `1. סירוב ליחסי אישות - האישה מסרבת לקיים יחסי אישות מזה כשנתיים, מה שמהווה עילה הלכתית לגירושין.

2. ניכור רגשי - הצדדים חיים בנפרד מזה חצי שנה ואין כל סיכוי לשיקום הקשר.

3. הפרת שלום הבית - עימותים קשים בנוכחות הילדים שפגעו באווירה המשפחתית.

4. חוסר תקשורת - הצדדים אינם מדברים זה עם זה אלא בנושאים הנוגעים לילדים בלבד.

5. כישלון ייעוץ זוגי - למרות מספר ניסיונות ייעוץ, הקשר לא השתפר.`,

      // Police complaints
      policeComplaints: 'לא',

      // Mediation history
      hadPreviousMediation: 'כן',
      previousMediationDetails: 'הצדדים פנו למרכז הגישור העירוני בתל אביב בינואר 2024. התקיימו 4 פגישות גישור בפני המגשרת עו"ד דינה שלום. הגישור נכשל כי האישה לא הייתה מוכנה לפשרה בנושא הרכוש.',

      marriageCounselingDetails: 'טיפול זוגי התקיים ב-2022-2023 אצל הפסיכולוג ד"ר אברהם כהן, במשך כ-8 חודשים. הטיפול הופסק כי האישה לא רצתה להמשיך.',

      // Ketubah (religious marriage document)
      ketubahAmount: '180,000 ש"ח (מאה ושמונים אלף שקל)',
      ketubahRequest: 'מאחר שהאישה היא זו שגרמה לקרע בנישואין על ידי סירוב ליחסי אישות, מבוקש כי בית הדין יקבע שהאישה הפסידה את כתובתה לפי ההלכה.',
    },

    // ============ PROPERTY (for bundled claims) ============
    property: {
      hasAssets: 'yes',
      separationDate: '2024-06-01',
      applicantEmploymentStatus: 'selfEmployed',
      applicantOccupation: 'עורך דין שותף במשרד עורכי דין',
      applicantEstablishedDate: '2010-03-01',
      applicantRegisteredOwner: 'יעקב לוי',
      applicantGrossIncome: 85000,
      respondentEmploymentStatus: 'employee',
      respondentEmployer: 'עיריית תל אביב - מחלקת חינוך',
      respondentGrossSalary: 14000,
      courtProceedings: 'no',
    },

    // Real Estate
    apartments: [
      {
        address: 'רחוב אלנבי 45, דירה 12, תל אביב',
        owner: 'שני הצדדים',
        gush: '6921',
        helka: '123',
        value: '4,500,000 ש"ח',
        purchaseDate: '2008',
        divisionRequest: 'למכור את הדירה ולחלק את התמורה בין הצדדים, או לאפשר לאישה לגור בה עד שהילד הקטן יגיע לגיל 18',
      },
      {
        address: 'רחוב הזית 8, הרצליה פיתוח',
        owner: 'יעקב לוי',
        gush: '6534',
        helka: '45',
        value: '6,200,000 ש"ח',
        purchaseDate: '2015',
        divisionRequest: 'הנכס נרכש מכספי משרד עורכי הדין, אך יש לאזנו כחלק מהרכוש המשותף',
      },
      {
        address: 'דירת נופש - אילת',
        owner: 'שני הצדדים',
        gush: '40012',
        helka: '89',
        value: '1,800,000 ש"ח',
        purchaseDate: '2018',
        divisionRequest: 'למכור ולחלק את התמורה בשווה',
      },
    ],

    // Vehicles
    vehicles: [
      {
        type: 'BMW X5 2022',
        licenseNumber: '89-456-23',
        year: '2022',
        owner: 'יעקב לוי',
        value: '420,000 ש"ח',
      },
      {
        type: 'מאזדה CX-5 2020',
        licenseNumber: '56-234-78',
        year: '2020',
        owner: 'רחל לוי',
        value: '180,000 ש"ח',
      },
    ],

    // Savings
    savings: [
      {
        type: 'חשבון עו"ש משותף',
        bank: 'בנק הפועלים',
        accountNumber: '123456',
        owner: 'שני הצדדים',
        amount: '250,000 ש"ח',
      },
      {
        type: 'תיק השקעות',
        bank: 'IBI',
        accountNumber: '987654',
        owner: 'יעקב לוי',
        amount: '1,200,000 ש"ח',
      },
      {
        type: 'חשבון חיסכון',
        bank: 'בנק לאומי',
        accountNumber: '456789',
        owner: 'רחל לוי',
        amount: '85,000 ש"ח',
      },
    ],

    // Benefits (Pension, etc.)
    benefits: [
      {
        type: 'קרן פנסיה',
        institution: 'מגדל',
        owner: 'יעקב לוי',
        amount: '2,100,000 ש"ח',
      },
      {
        type: 'קופת גמל',
        institution: 'הראל',
        owner: 'יעקב לוי',
        amount: '450,000 ש"ח',
      },
      {
        type: 'קרן פנסיה',
        institution: 'מנורה',
        owner: 'רחל לוי',
        amount: '380,000 ש"ח',
      },
    ],

    // Debts
    debts: [
      {
        type: 'משכנתא - דירת תל אביב',
        creditor: 'בנק מזרחי',
        owner: 'שני הצדדים',
        amount: '1,200,000 ש"ח',
        isMortgage: true,
      },
      {
        type: 'הלוואה לרכישת רכב',
        creditor: 'בנק הפועלים',
        owner: 'יעקב לוי',
        amount: '120,000 ש"ח',
        paymentDate: '06/2026',
      },
    ],

    // ============ ALIMONY (for bundled claims) ============
    alimony: {
      wasPreviousAlimony: 'no',
      hasChildrenNeeds: 'yes',
      childrenNeeds: [
        { category: 'education', description: 'שכר לימוד בתיכון לאורי', monthlyAmount: 2500 },
        { category: 'education', description: 'שכר לימוד לנועה', monthlyAmount: 1800 },
        { category: 'education', description: 'גן ילדים לדניאל', monthlyAmount: 2200 },
        { category: 'activities', description: 'כדורסל לאורי', monthlyAmount: 450 },
        { category: 'activities', description: 'ריקוד לנועה', monthlyAmount: 380 },
        { category: 'medical', description: 'ביטוח בריאות לילדים', monthlyAmount: 600 },
        { category: 'clothing', description: 'ביגוד והנעלה', monthlyAmount: 800 },
        { category: 'food', description: 'מזון', monthlyAmount: 3500 },
      ],
      hasHouseholdNeeds: 'yes',
      householdNeeds: [
        { category: 'rent', description: 'משכנתא חודשית', monthlyAmount: 8500 },
        { category: 'tax', description: 'ארנונה', monthlyAmount: 650 },
        { category: 'electricity', description: 'חשמל', monthlyAmount: 450 },
        { category: 'water', description: 'מים', monthlyAmount: 180 },
        { category: 'gas', description: 'גז', monthlyAmount: 120 },
        { category: 'building', description: 'ועד בית', monthlyAmount: 350 },
        { category: 'internet', description: 'אינטרנט וטלוויזיה', monthlyAmount: 280 },
      ],
      hasBankAccounts: 'yes',
      bankAccounts: [
        { bankName: 'בנק הפועלים', accountNumber: '123456', balance: 45000 },
        { bankName: 'בנק לאומי', accountNumber: '789012', balance: 12000 },
      ],
      husbandIncome: '85,000 ש"ח ברוטו לחודש',
      wifeIncome: '14,000 ש"ח ברוטו לחודש',
      additionalIncome: 'הכנסות משכירות דירה בהרצליה - 8,500 ש"ח לחודש',
      childExpenses: '4,000 ש"ח לילד לחודש',
      requestedChildAlimony: '12,000 ש"ח (4,000 ש"ח לכל ילד)',
    },

    // ============ CUSTODY (for bundled claims) ============
    custody: {
      currentLivingArrangement: 'with_respondent', // Kids are with the mother
      sinceWhen: '2024-06-01',
      currentVisitationArrangement: 'האב רואה את הילדים כל יום רביעי אחרי הצהריים (16:00-20:00) וסופי שבוע לסירוגין (שישי 14:00 עד ראשון 18:00)',
      requestedArrangement: 'joint_custody',
      whoShouldHaveCustody: 'מבוקשת משמורת משותפת. האב היה מעורב מאוד בגידול הילדים לאורך כל השנים, והילדים זקוקים לקשר עמוק עם שני ההורים. האב מסוגל לספק סביבה יציבה ואוהבת.',
      whyNotOtherParent: 'האם היא הורה טובה, אך העובדה שהאב עבד שעות ארוכות לא מפחיתה מהקשר שלו עם הילדים. כעת, לאחר השינויים בעבודתו, הוא יכול להקדיש יותר זמן לילדים.',
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
console.log('        COMPREHENSIVE RABBINICAL COURT DIVORCE TEST');
console.log('        בית הדין הרבני - תביעת גירושין מקיפה');
console.log('='.repeat(70));
console.log('');
console.log(' Client Details:');
console.log('   Plaintiff:    ' + testData.basicInfo.fullName + ' (Husband)');
console.log('   Respondent:   ' + testData.basicInfo.fullName2 + ' (Wife)');
console.log('   Marriage:     ' + testData.basicInfo.weddingDay + ' (' + (2024 - 2005) + ' years)');
console.log('   Children:     ' + testData.formData.children.length + ' (' + testData.formData.children.map(c => c.firstName).join(', ') + ')');
console.log('');
console.log(' Routing Factors (RABBINICAL):');
console.log('   Infidelity:         No');
console.log('   Youngest Child:     8 years (above 6)');
console.log('   Career Disparity:   Yes (85K vs 14K)');
console.log('   Significant Prop:   Yes (~12.5M in real estate)');
console.log('   Halachic Grounds:   Yes (refusal of relations)');
console.log('');
console.log(' Financial Summary:');
console.log('   Total Real Estate:  ~12,500,000 NIS');
console.log('   Total Savings:      ~1,535,000 NIS');
console.log('   Total Pensions:     ~2,930,000 NIS');
console.log('   Total Debt:         ~1,320,000 NIS');
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
    console.log('   - תביעת גירושין - בית דין רבני.docx');
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
