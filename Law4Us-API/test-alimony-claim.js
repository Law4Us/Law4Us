/**
 * Comprehensive Alimony Claim Test
 * Tests alimony claim generation with Form 4 PDF integration
 */

const fs = require('fs');
const path = require('path');

// Read the lawyer signature
const signatureBuffer = fs.readFileSync(path.join(__dirname, '..', 'Signature.png'));
const signatureBase64 = `data:image/png;base64,${signatureBuffer.toString('base64')}`;

console.log(`📷 Loaded signature: ${signatureBuffer.length} bytes`);

const comprehensiveAlimonyData = {
  basicInfo: {
    fullName: "שרה לוי",
    idNumber: "345678901",
    address: "רחוב ירושלים 24, דירה 8, רעננה",
    phone: "054-3456789",
    email: "sarah.levy@example.com",
    birthDate: "1985-05-10",
    gender: "female",
    citizenship: "ישראלית",
    religion: "יהודיה",

    fullName2: "יוסי לוי",
    idNumber2: "456789012",
    address2: "רחוב הרצל 56, דירה 12, כפר סבא",
    phone2: "052-7654321",
    email2: "yossi.levy@example.com",
    birthDate2: "1983-11-25",
    gender2: "male",
    citizenship2: "ישראלי",
    religion2: "יהודי",

    relationshipType: "separated",
    weddingDay: "2010-06-15",
  },

  formData: {
    // PROPERTY SECTION (reused by alimony)
    property: {
      // Children - only minors (under 18)
      children: [
        {
          name: "נועם לוי",
          idNumber: "567890123",
          birthDate: "2012-03-14",
          residingWith: "applicant", // Lives with mother (Sarah)
        },
        {
          name: "תמר לוי",
          idNumber: "678901234",
          birthDate: "2015-08-22",
          residingWith: "applicant", // Lives with mother (Sarah)
        },
        {
          name: "איתי לוי",
          idNumber: "789012345",
          birthDate: "2018-01-05",
          residingWith: "applicant", // Lives with mother (Sarah)
        },
      ],

      // Separation and marriage dates
      marriageDate: "2010-06-15",
      separationDate: "2024-02-01",
      currentStatus: "separated",

      // APPLICANT EMPLOYMENT (mother - Sarah)
      applicantEmploymentStatus: "employed",
      applicantEmployer: "חברת הייטק גלובל בע\"מ",
      applicantPosition: "מנהלת פרויקטים",
      applicantGrossSalary: 12500,
      applicantNetSalary: 9800,
      applicantPaySlips: "מצורף", // Would be actual files in real scenario
      applicantAdditionalIncome: "עבודה פרילנס מזדמנת - כ-1,500 ש\"ח לחודש",

      // RESPONDENT EMPLOYMENT (father - Yossi)
      respondentEmploymentStatus: "employed",
      respondentEmployer: "בנק דיסקונט",
      respondentPosition: "מנהל סניף",
      respondentEstimatedIncome: 22000, // Higher income than applicant
      respondentAdditionalIncome: "בונוסים שנתיים של כ-50,000 ש\"ח",

      // PROPERTY DETAILS
      applicantRealEstate: "אין נכסים",
      applicantMovableProperty: "רכב טויוטה יאריס 2016, שווי משוער 45,000 ש\"ח",
      applicantInvestments: "תיק השקעות בשווי 35,000 ש\"ח",

      respondentRealEstate: "דירה בבעלות בכפר סבא, שווי משוער 2,100,000 ש\"ח",
      respondentMovableProperty: "רכב הונדה אקורד 2020, שווי משוער 125,000 ש\"ח",
      respondentInvestments: "תיק השקעות בשווי 180,000 ש\"ח, קופת גמל 220,000 ש\"ח",

      // DEBTS
      applicantDebts: "הלוואת רכב - יתרה 15,000 ש\"ח, תשלום חודשי 800 ש\"ח",
      respondentDebts: "משכנתא על הדירה - יתרה 720,000 ש\"ח, תשלום חודשי 3,800 ש\"ח",

      // HOUSING
      applicantHousingType: "renter",
      applicantHousingExpense: 4500, // דמי שכירות

      respondentHousingType: "owner",
      respondentHousingExpense: 3800, // משכנתא
    },

    // ALIMONY-SPECIFIC SECTION
    alimony: {
      // Relationship description (will be transformed by AI)
      relationshipDescription: `התחתנו בשנת 2010 לאחר שנתיים של היכרות. השנים הראשונות היו טובות - עבדנו שנינו, הקמנו בית משותף, נולדו לנו 3 ילדים.

אבל מאז לידת האיתי בשנת 2018, הדברים התחילו להידרדר. הנתבע התמקד יותר ויותר בקריירה שלו, נעדר מהבית שעות רבות. השארתי אותי לבד עם 3 ילדים קטנים.

התקשורת בינינו נעשתה בלתי אפשרית. כל שיחה הפכה למריבה. הרגשתי שאני מתמודדת לבד עם הכול - הילדים, הבית, העבודה.

הוא גם התחיל להסתיר הכנסות ולא לשתף אותי בניהול הכספי. דרש שאני אשלם על הכול מהמשכורת שלי, למרות שהוא מרוויח כמעט פי 2.

בפברואר 2024 החלטנו להיפרד. הילדים גרים איתי בדירה שכורה ברעננה, קרוב לגן ולבתי הספר. הוא גר בדירה שקנה על שמו בלבד בכפר סבא.

כרגע אני משלמת על כל הוצאות הילדים מהמשכורת שלי, והוא כמעט לא עוזר כספית. זה לא מספיק ולא צודק.`,

      // Previous alimony payments
      wasPreviousAlimony: "no",
      lastAlimonyAmount: null,
      lastAlimonyDate: null,

      // Children's needs - comprehensive expense table
      childrenNeeds: [
        {
          category: "מזון",
          description: "קניות שבועיות, ארוחות, חטיפים לבית הספר",
          monthlyAmount: 3500,
        },
        {
          category: "לבוש והנעלה",
          description: "בגדים, נעליים, חורף וקיץ (ממוצע חודשי)",
          monthlyAmount: 1200,
        },
        {
          category: "חינוך (שכר לימוד, ספרים)",
          description: "שכ\"ל, ספרים, מחברות, תיקים, ציוד",
          monthlyAmount: 2800,
        },
        {
          category: "רפואה (ביטוח, תרופות)",
          description: "ביטוח משלים, תרופות, טיפולים, משקפיים",
          monthlyAmount: 800,
        },
        {
          category: "פעילויות חוץ (חוגים)",
          description: "חוג כדורסל (נועם), חוג ריקוד (תמר), שחיה (איתי)",
          monthlyAmount: 1500,
        },
        {
          category: "הסעות ותחבורה",
          description: "הסעות לבית הספר וחוגים, נסיעות",
          monthlyAmount: 900,
        },
        {
          category: "אחר",
          description: "ימי הולדת, מתנות, בילויים, צעצועים",
          monthlyAmount: 800,
        },
      ],

      // Household needs - comprehensive expense table
      householdNeeds: [
        {
          category: "דיור (שכר דירה/משכנתא)",
          description: "דמי שכירות - דירת 4 חדרים ברעננה",
          monthlyAmount: 4500,
        },
        {
          category: "חשמל",
          description: "חשבון חשמל חודשי ממוצע",
          monthlyAmount: 450,
        },
        {
          category: "מים",
          description: "חשבון מים דו-חודשי (ממוצע חודשי)",
          monthlyAmount: 180,
        },
        {
          category: "ארנונה",
          description: "ארנונה חודשית",
          monthlyAmount: 520,
        },
        {
          category: "גז",
          description: "בלוני גז וחשבון גז חודשי",
          monthlyAmount: 120,
        },
        {
          category: "אינטרנט, טלפון, טלוויזיה",
          description: "חבילת תקשורת משפחתית",
          monthlyAmount: 280,
        },
        {
          category: "ביטוח דירה",
          description: "ביטוח תכולה ומבנה (ממוצע חודשי)",
          monthlyAmount: 150,
        },
        {
          category: "תחזוקה ותיקונים",
          description: "ניקיון, תיקונים, אחזקה שוטפת",
          monthlyAmount: 400,
        },
        {
          category: "מוצרי ניקיון וטואלטיקה",
          description: "אבקות כביסה, סבונים, שמפו, וכו'",
          monthlyAmount: 350,
        },
        {
          category: "אחר",
          description: "הוצאות בלתי צפויות, דברים שונים",
          monthlyAmount: 300,
        },
      ],

      // Bank accounts
      bankAccounts: [
        {
          bankName: "בנק הפועלים",
          accountNumber: "12-345-678901",
          balance: 8500,
        },
        {
          bankName: "בנק דיסקונט",
          accountNumber: "23-456-789012",
          balance: 3200,
        },
      ],

      // Vehicle
      hasVehicle: "yes",
      vehicleDetails: "טויוטה יאריס 2016, מספר רישוי 12-345-67, שווי משוער 45,000 ש\"ח. הרכב נחוץ להסעות יומיומיות של הילדים לבית הספר, לגן ולחוגים.",

      // Requested alimony amount
      requestedAmount: 12000, // Total amount requested per month for all children
    },
  },

  selectedClaims: ["alimony"],

  // Client signature
  signature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",

  // Lawyer signature
  lawyerSignature: signatureBase64,

  paymentData: {
    paid: true,
    amount: 1500,
    date: new Date().toISOString(),
  },

  filledDocuments: {},
  submittedAt: new Date().toISOString(),
};

// Calculate totals for summary
const childrenNeedsTotal = comprehensiveAlimonyData.formData.alimony.childrenNeeds.reduce(
  (sum, need) => sum + need.monthlyAmount,
  0
);

const householdNeedsTotal = comprehensiveAlimonyData.formData.alimony.householdNeeds.reduce(
  (sum, need) => sum + need.monthlyAmount,
  0
);

// Send to backend
async function testComprehensiveAlimony() {
  console.log('\n🧪 Testing COMPREHENSIVE Alimony Claim with Form 4 PDF...\n');
  console.log('📋 Test Data Summary:');
  console.log(`   Applicant: ${comprehensiveAlimonyData.basicInfo.fullName}`);
  console.log(`   Respondent: ${comprehensiveAlimonyData.basicInfo.fullName2}`);
  console.log(`   Children (minors): ${comprehensiveAlimonyData.formData.property.children.length}`);
  console.log(`   Married: ${comprehensiveAlimonyData.formData.property.marriageDate}`);
  console.log(`   Separated: ${comprehensiveAlimonyData.formData.property.separationDate}`);
  console.log('');
  console.log('💰 Financial Details:');
  console.log(`   Applicant income: ${comprehensiveAlimonyData.formData.property.applicantGrossSalary?.toLocaleString()} ש"ח/חודש`);
  console.log(`   Respondent income: ${comprehensiveAlimonyData.formData.property.respondentEstimatedIncome?.toLocaleString()} ש"ח/חודש`);
  console.log(`   Income ratio: 1:${(comprehensiveAlimonyData.formData.property.respondentEstimatedIncome / comprehensiveAlimonyData.formData.property.applicantGrossSalary).toFixed(2)}`);
  console.log('');
  console.log('📊 Expense Breakdown:');
  console.log(`   Children's needs: ${childrenNeedsTotal.toLocaleString()} ש"ח/חודש (${comprehensiveAlimonyData.formData.alimony.childrenNeeds.length} items)`);
  console.log(`   Household needs: ${householdNeedsTotal.toLocaleString()} ש"ח/חודש (${comprehensiveAlimonyData.formData.alimony.householdNeeds.length} items)`);
  console.log(`   Total monthly needs: ${(childrenNeedsTotal + householdNeedsTotal).toLocaleString()} ש"ח`);
  console.log(`   Requested alimony: ${comprehensiveAlimonyData.formData.alimony.requestedAmount.toLocaleString()} ש"ח/חודש`);
  console.log('');
  console.log('🏦 Assets:');
  console.log(`   Bank accounts: ${comprehensiveAlimonyData.formData.alimony.bankAccounts.length}`);
  console.log(`   Vehicle: ${comprehensiveAlimonyData.formData.alimony.hasVehicle === 'yes' ? 'Yes' : 'No'}`);
  console.log('');

  try {
    // Use the submission endpoint which uploads to Google Drive!
    const response = await fetch('http://localhost:3001/api/submission/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(comprehensiveAlimonyData),
    });

    console.log(`📡 Response status: ${response.status}\n`);

    const result = await response.json();
    console.log('✅ Response from backend:');
    console.log(JSON.stringify(result, null, 2));

    if (result.success && result.folderId) {
      console.log(`\n🎉 SUCCESS! Alimony claim with Form 4 generated!`);
      console.log(`   📁 Folder: ${result.folderName}`);
      console.log(`   🔗 https://drive.google.com/drive/folders/${result.folderId}`);
      console.log('');
      console.log('📄 The document should contain:');
      console.log('   1. כתב תביעה (Claim document)');
      console.log('   2. הרצאת פרטים - Form 4 (6 pages as images)');
      console.log('   3. ייפוי כוח (Power of Attorney)');
      console.log('   4. תצהיר (Declaration)');
      console.log('   5. תוכן עניינים (Table of Contents)');
    }
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
  }
}

testComprehensiveAlimony();
