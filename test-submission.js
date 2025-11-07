/**
 * Test script for form submission
 * Simulates a complete wizard submission without manual UI interaction
 */

const testData = {
  basicInfo: {
    fullName: 'שרה לוי',
    idNumber: '123456789',
    email: 'sarah.levy@example.com',
    phone: '0501234567',
    address: 'רחוב הרצל 123, תל אביב',
    birthDate: '1985-05-15',
    gender: 'female', // female or male
    fullName2: 'דוד לוי',
    idNumber2: '987654321',
    email2: 'david.levy@example.com',
    phone2: '0509876543',
    address2: 'רחוב ביאליק 456, חיפה',
    birthDate2: '1983-09-20',
    gender2: 'male',
    relationshipType: 'married',
    weddingDay: '2015-06-15',
  },
  formData: {
    // Children (for property, custody, alimony)
    children: [
      {
        __id: 'child-1',
        firstName: 'נועם',
        lastName: 'לוי',
        idNumber: '567890123',
        birthDate: '2016-03-14',
        address: 'רחוב הרצל 123, תל אביב',
        otherParent: 'דוד לוי',
        relationshipDescription: 'יש לי קשר קרוב מאוד עם נועם. אני מבלה איתו כל יום, עוזרת לו בשיעורי בית ומלווה אותו לפעילויות חוץ בית ספריות.',
      },
      {
        __id: 'child-2',
        firstName: 'תמר',
        lastName: 'לוי',
        idNumber: '678901234',
        birthDate: '2018-08-22',
        address: 'רחוב הרצל 123, תל אביב',
        otherParent: 'דוד לוי',
        relationshipDescription: 'תמר היא ילדה רגישה ואני דואגת לצרכים הרגשיים שלה. היא ישנה איתי כל לילה ואנחנו קרובות מאוד.',
      },
    ],

    // Property claim fields
    relationshipDescription: 'התחלנו את הקשר ב-2014 ונישאנו ב-2015. במהלך השנים רכשנו ביחד דירה, שני רכבים וחסכנו כסף משותף.',
    propertyRegime: 'community', // community, separation, or unknown

    // Apartments
    apartments: [
      {
        description: 'דירת 4 חדרים ברחוב הרצל 123, תל אביב',
        value: '2500000',
        owner: 'משותף',
      },
    ],

    // Vehicles
    vehicles: [
      {
        description: 'מאזדה 3, 2020, מספר רכב 12-345-67',
        value: '80000',
        owner: 'משותף',
      },
      {
        description: 'הונדה CR-V, 2018, מספר רכב 89-012-34',
        value: '120000',
        owner: 'משותף',
      },
    ],

    // Savings
    savings: [
      {
        description: 'חשבון חיסכון בנק הפועלים',
        value: '150000',
        owner: 'משותף',
      },
    ],

    // Benefits (pensions, insurance)
    benefits: [
      {
        description: 'קופת גמל להשקעה - הראל',
        value: '80000',
        owner: 'שרה לוי',
      },
      {
        description: 'פנסיה מקיפה - מגדל',
        value: '120000',
        owner: 'דוד לוי',
      },
    ],

    // Debts
    debts: [
      {
        description: 'משכנתא על הדירה - בנק לאומי',
        value: '1200000',
        owner: 'משותף',
      },
    ],

    // Employment
    applicantEmployment: 'employee', // employee, self-employed, unemployed
    applicantIncome: '15000',
    applicantEmployer: 'חברת היי-טק בע״מ',

    respondentEmployment: 'employee',
    respondentIncome: '18000',
    respondentEmployer: 'חברת ייעוץ בע״מ',

    // Legal status
    courtProceedings: 'no', // yes or no
    livingTogether: 'no', // yes or no
    separationDate: '2024-02-01',

    // Requested remedies
    remedies: 'אני מבקשת לחלק את הרכוש המשותף באופן שווה, למעט הדירה אותה אני מבקשת שתישאר בבעלותי מכיוון שהילדים גרים איתי.',

    // Custody claim fields
    custodyLivingArrangement: 'with_applicant', // together, with_applicant, with_respondent, split
    custodySinceWhen: '2024-02-01',
    currentVisitation: 'הילדים מבקרים את אביהם כל שישי-שבת, מ-17:00 עד 19:00 ביום ראשון.',
    requestedCustody: 'full', // full, joint, visitation
    proposedVisitation: 'אני מציעה שהילדים יבקרו את אביהם כל יום שישי מ-16:00 עד יום ראשון 18:00, וביום אמצע שבוע מ-16:00 עד 20:00.',
    custodySummary: 'הילדים מתגוררים איתי מאז הפרידה. אני דואגת לכל צרכיהם היומיומיים, מלווה אותם לבית הספר ולפעילויות, ומקפידה על שגרה יציבה. הם מרגישים בטוחים ושקטים אצלי.',
    whyNotOtherParent: 'האב עובד שעות ארוכות ולא תמיד זמין. בנוסף, בעבר היו מקרים בהם הוא הגיע באיחור לאסוף את הילדים ולפעמים ביטל ביקורים ברגע האחרון.',

    // Alimony claim fields
    childrenLivingWith: 'applicant', // applicant, respondent, both
    alimonyPropertyDescription: 'כמתואר לעיל, יש לנו דירה, שני רכבים, חסכונות וקופות גמל.',

    // Global questions - Form 3 fields (Section 2: Marital Status)
    marriedBefore: 'לא',
    hadChildrenFromPrevious: 'לא',
    marriedBefore2: 'לא',
    hadChildrenFromPrevious2: 'לא',

    // Global questions - Form 3 fields (Section 4: Housing)
    applicantHomeType: 'jointOwnership', // jointOwnership, applicantOwnership, respondentOwnership, rental, other
    partnerHomeType: 'rental',

    // Global questions - Form 3 fields (Section 5: Domestic Violence)
    protectionOrderRequested: 'לא',
    pastViolenceReported: 'לא',

    // Global questions - Form 3 fields (Section 6: Other Family Cases)
    otherFamilyCases: [], // empty array or objects with {caseNumber, court, caseType, status}

    // Global questions - Form 3 fields (Section 7: Therapeutic Contact)
    contactedWelfare: 'לא',
    contactedMarriageCounseling: 'לא',
    contactedFamilyCounseling: 'לא',
    contactedMediation: 'לא',
    willingToJoinFamilyCounseling: 'כן',
    willingToJoinMediation: 'כן',
  },
  selectedClaims: ['property', 'custody', 'alimony'],
  signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', // 1x1 transparent PNG as placeholder
  paymentData: {
    paid: true,
    date: new Date().toISOString(),
    amount: 1000,
  },
  filledDocuments: {},
  submittedAt: new Date().toISOString(),
};

async function testSubmission() {
  console.log('🚀 Starting test submission...\n');
  console.log('📋 Test data:');
  console.log(`   Applicant: ${testData.basicInfo.fullName}`);
  console.log(`   Respondent: ${testData.basicInfo.fullName2}`);
  console.log(`   Claims: ${testData.selectedClaims.join(', ')}`);
  console.log(`   Children: ${testData.formData.children.length}`);
  console.log('');

  try {
    const response = await fetch('http://localhost:3002/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Submission successful!');
      console.log('');
      console.log('📁 Google Drive folder created:');
      console.log(`   Folder ID: ${result.folderId}`);
      console.log(`   Folder Name: ${result.folderName}`);
      console.log('');
      console.log('🎉 Documents should now be in your Google Drive!');
      console.log('');
      console.log('📊 Expected documents:');
      testData.selectedClaims.forEach(claim => {
        const hebrewNames = {
          property: 'תביעת-רכושית.docx',
          custody: 'תביעת-משמורת.docx',
          alimony: 'תביעת-מזונות.docx',
          divorce: 'תביעת-גירושין.docx',
        };
        console.log(`   ✓ ${hebrewNames[claim]}`);
      });
    } else {
      console.error('❌ Submission failed!');
      console.error(`   Status: ${response.status}`);
      console.error(`   Error: ${result.error || result.message}`);

      if (result.error) {
        console.error('');
        console.error('Full error:', result);
      }
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
    console.error('');
    console.error('Make sure:');
    console.error('   1. Dev server is running (npm run dev)');
    console.error('   2. All environment variables are set in .env.local');
    console.error('   3. Google Drive credentials are correct');
  }
}

// Run the test
testSubmission();
