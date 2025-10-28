/**
 * Comprehensive Property Claim Test
 * Tests ALL property-related fields with realistic data
 */

const fs = require('fs');
const path = require('path');

// Read the lawyer signature
const signatureBuffer = fs.readFileSync(path.join(__dirname, '..', 'Signature.png'));
const signatureBase64 = `data:image/png;base64,${signatureBuffer.toString('base64')}`;

console.log(`📷 Loaded signature: ${signatureBuffer.length} bytes`);

// Create a realistic payslip image (simple white rectangle with text placeholder)
const createMockPayslipImage = () => {
  // 550x750 white PNG with minimal data
  const base64 = "iVBORw0KGgoAAAANSUhEUgAAAiYAAALuCAIAAABuj461AAAADElEQVR4nGP4//8/AAX+Av7czFnnAAAAAElFTkSuQmCC";
  return Buffer.from(base64, "base64");
};

const comprehensivePropertyData = {
  basicInfo: {
    fullName: "דוד מזרחי",
    idNumber: "234567890",
    address: "רחוב ביאליק 15, דירה 12, חיפה",
    phone: "050-1234567",
    email: "david.mizrahi@example.com",
    birthDate: "1980-03-20",
    gender: "male",
    fullName2: "רחל כהן-מזרחי",
    idNumber2: "345678901",
    address2: "רחוב הרצל 88, דירה 5, חיפה",
    phone2: "052-9876543",
    email2: "rachel.mizrahi@example.com",
    birthDate2: "1982-07-15",
    gender2: "female",
    relationshipType: "married",
    weddingDay: "2005-09-12",
  },

  formData: {
    // Children (3 kids)
    children: [
      {
        __id: "child-1",
        firstName: "יעל",
        lastName: "מזרחי",
        birthDate: "2008-02-14",
        idNumber: "456789012",
        address: "רחוב ביאליק 15, חיפה",
        nameOfParent: "רחל כהן-מזרחי",
      },
      {
        __id: "child-2",
        firstName: "אורי",
        lastName: "מזרחי",
        birthDate: "2011-06-22",
        idNumber: "567890123",
        address: "רחוב ביאליק 15, חיפה",
        nameOfParent: "רחל כהן-מזרחי",
      },
      {
        __id: "child-3",
        firstName: "טל",
        lastName: "מזרחי",
        birthDate: "2015-11-03",
        idNumber: "678901234",
        address: "רחוב ביאליק 15, חיפה",
        nameOfParent: "דוד מזרחי",
      },
    ],

    // Property claim details
    wereMarried: "yes",
    separationDate: "2024-01-15",

    // Detailed property description
    propertyDescription: `במהלך נישואינו צברנו את הנכסים הבאים:

1. דירת מגורים ברח' ביאליק 15, חיפה - דירת 5 חדרים, קומה 3, בבניין של 4 קומות. הדירה נרכשה בשנת 2006 במשכנתא משותפת. שווי מוערך נוכחי: 3,200,000 ש"ח.

2. דירה להשקעה ברח' נורדאו 42, תל אביב - דירת 3 חדרים, קומה 2, משופצת. נרכשה בשנת 2012 כהשקעה משותפת. מושכרת כעת ב-5,800 ש"ח לחודש. שווי מוערך: 2,800,000 ש"ח.

3. רכב מרצדס C200 שנת 2021 - רכוב רשום על שם המבקש, בשימוש משפחתי. שווי מוערך: 180,000 ש"ח.

4. רכב הונדה CRV שנת 2019 - רכוב רשום על שם הנתבעת, בשימוש משפחתי. שווי מוערך: 145,000 ש"ח.

5. חשבון חיסכון משותף בבנק הפועלים - יתרה נוכחית: 420,000 ש"ח.

6. חשבון קופת גמל של המבקש - יתרה: 280,000 ש"ח.

7. חשבון פנסיה של הנתבעת - יתרה: 310,000 ש"ח.

8. תיק השקעות בבנק לאומי - שווי נוכחי: 550,000 ש"ח (במשותף).

9. ריהוט ומוצרי חשמל בדירת המגורים - שווי מוערך: 120,000 ש"ח.

10. חובות משותפים - משכנתא על הדירה הראשית: 850,000 ש"ח, הלוואה בנקית: 75,000 ש"ח.`,

    // Income details
    jobType: "שכיר",
    job1: {
      employer: "חברת הייטק בע\"מ",
      position: "מהנדס תוכנה",
      monthlySalary: "18500",
      startDate: "2010-03-01",
      bonuses: "כן, בונוס שנתי של כ-3 משכורות",
    },
    jobType2: "שכיר",
    job2: {
      employer: "בית חולים רמב\"ם",
      position: "אחות מוסמכת",
      monthlySalary: "16200",
      startDate: "2009-06-15",
      bonuses: "כן, תוספת לילות וסופי שבוע",
    },

    // Form 3 fields - Previous relationships
    marriedBefore: "no",
    hadChildrenFromPrevious: "no",
    marriedBefore2: "no",
    hadChildrenFromPrevious2: "no",

    // Housing situation
    applicantHomeType: "דירה בבעלות משותפת",
    partnerHomeType: "דירה בבעלות משותפת",

    // Protection orders
    protectionOrderRequested: "no",

    // Past violence
    pastViolenceReported: "no",

    // Other family court cases
    otherFamilyCases: [],

    // Welfare and counseling
    contactedWelfare: "no",
    contactedMarriageCounseling: "yes",
    willingToJoinFamilyCounseling: "yes",
    willingToJoinMediation: "yes",

    // APARTMENTS - Tests apartments array formatting (lines 354-366 in generator)
    apartments: [
      {
        description: "דירת מגורים - רח' ביאליק 15, חיפה (5 חדרים)",
        value: "3200000",
        owner: "שניהם",
        purchaseDate: "2006-04-10",
        mortgageBalance: "850000",
      },
      {
        description: "דירת השקעה - רח' נורדאו 42, תל אביב (3 חדרים)",
        value: "2800000",
        owner: "שניהם",
        purchaseDate: "2012-09-05",
        rentalIncome: "5800",
      },
    ],

    // VEHICLES - Tests vehicles array formatting (lines 368-380 in generator)
    vehicles: [
      {
        description: "רכב מרצדס C200 (2021)",
        value: "180000",
        owner: "המבקש",
        purchaseDate: "2021-01-15",
      },
      {
        description: "רכב הונדה CRV (2019)",
        value: "145000",
        owner: "הנתבעת",
        purchaseDate: "2019-06-20",
      },
    ],

    // SAVINGS - Tests savings array formatting (lines 382-394 in generator)
    savings: [
      {
        description: "חשבון חיסכון משותף - בנק הפועלים",
        value: "420000",
        owner: "שניהם",
      },
      {
        description: "תיק השקעות - בנק לאומי",
        value: "550000",
        owner: "שניהם",
      },
    ],

    // BENEFITS - Tests benefits array formatting (lines 396-408 in generator)
    benefits: [
      {
        description: "קופת גמל - המבקש",
        value: "280000",
        owner: "המבקש",
      },
      {
        description: "קרן פנסיה - הנתבעת",
        value: "310000",
        owner: "הנתבעת",
      },
    ],

    // PROPERTIES (general) - Tests general properties array (lines 410-422 in generator)
    properties: [
      {
        description: "ריהוט ומוצרי חשמל",
        value: "120000",
        owner: "שניהם",
      },
    ],

    // Debts
    debts: [
      {
        description: "משכנתא על דירת המגורים",
        amount: "850000",
        creditor: "בנק מזרחי טפחות",
        monthlyPayment: "4200",
      },
      {
        description: "הלוואה בנקית",
        amount: "75000",
        creditor: "בנק הפועלים",
        monthlyPayment: "1800",
      },
    ],

    // Additional income sources
    additionalIncome: [
      {
        source: "הכנסה משכירות",
        monthlyAmount: "5800",
        description: "דמי שכירות מדירת ההשקעה בתל אביב",
      },
      {
        source: "עבודה נוספת",
        monthlyAmount: "3500",
        description: "פרילנס בערבים (המבקש)",
      },
    ],

    // Monthly expenses
    monthlyExpenses: {
      housing: "4200", // משכנתא
      utilities: "800", // חשמל, מים, ארנונה
      food: "4500",
      transportation: "1200",
      insurance: "1800",
      healthcare: "600",
      education: "2800",
      childcare: "3500",
      other: "1500",
    },

    // Alimony needs (comprehensive)
    needs: [
      {
        __id: "need-1",
        type: "food",
        label: "מזון ומשקאות",
        amounts: {
          "child-1": 1800,
          "child-2": 1600,
          "child-3": 1400,
        },
      },
      {
        __id: "need-2",
        type: "clothing",
        label: "ביגוד והנעלה",
        amounts: {
          "child-1": 900,
          "child-2": 850,
          "child-3": 700,
        },
      },
      {
        __id: "need-3",
        type: "education",
        label: "חינוך (שכר לימוד, ספרים, ציוד)",
        amounts: {
          "child-1": 1200,
          "child-2": 1000,
          "child-3": 800,
        },
      },
      {
        __id: "need-4",
        type: "extracurricular",
        label: "חוגים ופעילויות",
        amounts: {
          "child-1": 800,
          "child-2": 750,
          "child-3": 600,
        },
      },
      {
        __id: "need-5",
        type: "healthcare",
        label: "בריאות ותרופות",
        amounts: {
          "child-1": 400,
          "child-2": 350,
          "child-3": 300,
        },
      },
      {
        __id: "need-6",
        type: "entertainment",
        label: "בילויים ונופש",
        amounts: {
          "child-1": 500,
          "child-2": 450,
          "child-3": 400,
        },
      },
    ],

    // Separation details
    separationReason: `המערכת הזוגית התפרקה בשנתיים האחרונות עקב מספר סיבות מצטברות:

1. פערים בגישה לחינוך הילדים - הנתבעת רוצה לשלוח את הילדים לחינוך דתי בעוד המבקש מעדיף חינוך כללי.

2. בעיות תקשורת - כבר לא מצליחים לנהל שיחה בונה ופתוחה. כל נושא הופך למריבה.

3. העדפת קריירה על חשבון המשפחה - שנינו עובדים שעות רבות ואין זמן איכות משפחתי.

4. חוסר תמיכה רגשית - כל אחד מתמודד עם הקשיים לבד, אין תחושה של שותפות.

5. פערים בניהול כלכלי - חילוקי דעות קשים על אופן ניהול התקציב המשפחתי.

במצב הנוכחי, המשך החיים המשותפים פוגע בכולנו, כולל הילדים.`,

    relationshipDescription: `התחלנו את מערכת היחסים בשנת 2003, כשפגשנו זה את זו באוניברסיטה. התחתנו בספטמבר 2005 באירוע משפחתי חמים.

השנים הראשונות היו טובות. עבדנו קשה, קנינו את הדירה הראשונה, הקמנו משפחה. נולדו לנו 3 ילדים נפלאים.

אבל בשנים האחרונות הדברים התחילו להתפרק. לחצים כלכליים, עייפות, חוסר זמן - הכול השתלב ליצור מצב בלתי אפשרי.

כיום אנחנו חיים בבית אחד אבל כל אחד בעולם שלו. כמעט ואין תקשורת. הגענו למסקנה שעדיף להיפרד ולשמור על יחסים תקינים בשביל הילדים.`,

    // Custody preferences
    whoShouldHaveCustody: `אני מבקש משמורת משותפת עם מגורים עיקריים אצל הנתבעת, מהסיבות הבאות:

1. הנתבעת היא הורה עיקרי יותר בחיי היום-יום של הילדים.

2. הילדים קשורים מאוד גם אליה וגם אלי, וחשוב שיהיה להם קשר קבוע עם שנינו.

3. אני מעוניין בזכויות שהייה מורחבות - כל סוף שבוע שני וחצי מחופשת הקיץ.

4. החלטות משמעותיות (חינוך, בריאות, מגורים) יתקבלו במשותף.

5. שנינו הורים אחראיים ודואגים, והילדים זקוקים לשנינו.`,

    childRelationship: `יש לי קשר מצוין עם כל אחד מהילדים:

יעל (16) - הבת הבכורה. מדברים על הכול, אני תומך בה בלימודים ובחיים החברתיים. היא אוהבת לבלות איתי בסופי שבוע.

אורי (13) - אנחנו משחקים כדורסל ביחד, הולכים לטיולים. יש לנו קשר חזק. הוא סומך עלי ומספר לי את הכול.

טל (9) - הקטן. אני לוקח אותו לגן, קורא לו סיפורים לפני השינה (כשאני בבית). הוא מאוד קשור אלי.

אני מעורב בחיי הילדים - הולך לאירועים בבית הספר, עוזר בשיעורי בית, מטפל כשהם חולים. זה חשוב לי להמשיך להיות נוכח בחייהם.`,
  },

  selectedClaims: ["property"],

  // Client signature (small test image)
  signature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",

  // Lawyer signature
  lawyerSignature: signatureBase64,

  // Realistic attachments - 5 attachments with different types
  attachments: [
    {
      label: "א",
      description: "תלושי שכר - 3 חודשים אחרונים (המבקש)",
      images: [
        createMockPayslipImage(),
        createMockPayslipImage(),
        createMockPayslipImage(),
      ],
    },
    {
      label: "ב",
      description: "תלושי שכר - 3 חודשים אחרונים (הנתבעת)",
      images: [
        createMockPayslipImage(),
        createMockPayslipImage(),
        createMockPayslipImage(),
      ],
    },
    {
      label: "ג",
      description: "אישור בעלות על דירה - רח' ביאליק 15",
      images: [
        createMockPayslipImage(),
      ],
    },
    {
      label: "ד",
      description: "הסכם שכירות - דירה בתל אביב",
      images: [
        createMockPayslipImage(),
        createMockPayslipImage(),
      ],
    },
    {
      label: "ה",
      description: "אישורים מבנקים - חשבונות וחסכונות",
      images: [
        createMockPayslipImage(),
        createMockPayslipImage(),
      ],
    },
  ],

  paymentData: {
    paid: true,
    amount: 1500,
    date: new Date().toISOString(),
  },

  filledDocuments: {},
  submittedAt: new Date().toISOString(),
};

// Send to backend
async function testComprehensiveProperty() {
  console.log('\n🧪 Testing COMPREHENSIVE Property Claim...\n');
  console.log('📋 Test Data Summary:');
  console.log(`   Name: ${comprehensivePropertyData.basicInfo.fullName}`);
  console.log(`   Partner: ${comprehensivePropertyData.basicInfo.fullName2}`);
  console.log(`   Children: ${comprehensivePropertyData.formData.children.length}`);
  console.log(`   Apartments: ${comprehensivePropertyData.formData.apartments.length}`);
  console.log(`   Vehicles: ${comprehensivePropertyData.formData.vehicles.length}`);
  console.log(`   Savings: ${comprehensivePropertyData.formData.savings.length}`);
  console.log(`   Benefits: ${comprehensivePropertyData.formData.benefits.length}`);
  console.log(`   Properties (general): ${comprehensivePropertyData.formData.properties.length}`);
  console.log(`   Debts: ${comprehensivePropertyData.formData.debts.length}`);

  // Calculate total value
  const totalValue =
    comprehensivePropertyData.formData.apartments.reduce((sum, p) => sum + parseInt(p.value), 0) +
    comprehensivePropertyData.formData.vehicles.reduce((sum, p) => sum + parseInt(p.value), 0) +
    comprehensivePropertyData.formData.savings.reduce((sum, p) => sum + parseInt(p.value), 0) +
    comprehensivePropertyData.formData.benefits.reduce((sum, p) => sum + parseInt(p.value), 0) +
    comprehensivePropertyData.formData.properties.reduce((sum, p) => sum + parseInt(p.value), 0);
  const totalDebts = comprehensivePropertyData.formData.debts.reduce((sum, d) => sum + parseInt(d.amount), 0);

  console.log(`   Total Assets: ${totalValue.toLocaleString()} ש"ח`);
  console.log(`   Total Debts: ${totalDebts.toLocaleString()} ש"ח`);
  console.log(`   Net Worth: ${(totalValue - totalDebts).toLocaleString()} ש"ח`);
  console.log(`   Attachments: ${comprehensivePropertyData.attachments.length} documents`);
  console.log('');

  try {
    // Use the submission endpoint which uploads to Google Drive!
    const response = await fetch('http://localhost:3001/api/submission/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(comprehensivePropertyData),
    });

    console.log(`📡 Response status: ${response.status}\n`);

    const result = await response.json();
    console.log('✅ Response from backend:');
    console.log(JSON.stringify(result, null, 2));

    if (result.success && result.folderId) {
      console.log(`\n🎉 SUCCESS! Check your Google Drive folder:`);
      console.log(`   📁 Folder: ${result.folderName}`);
      console.log(`   🔗 https://drive.google.com/drive/folders/${result.folderId}`);
    }
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
  }
}

testComprehensiveProperty();
