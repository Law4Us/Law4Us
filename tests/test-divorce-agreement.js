/**
 * Comprehensive Divorce Agreement Test
 * Tests divorce agreement document generation with complete data
 */

const fs = require('fs');
const path = require('path');

// Read the lawyer signature
const signatureBuffer = fs.readFileSync(path.join(__dirname, '..', 'Signature.png'));
const signatureBase64 = `data:image/png;base64,${signatureBuffer.toString('base64')}`;

console.log(`📷 Loaded signature: ${signatureBuffer.length} bytes`);

const comprehensiveDivorceAgreementData = {
  basicInfo: {
    fullName: "רונית כהן",
    idNumber: "234567890",
    address: "רחוב בן יהודה 42, דירה 10, תל אביב",
    phone: "054-2345678",
    email: "ronit.cohen@example.com",
    birthDate: "1988-07-15",
    gender: "female",
    citizenship: "ישראלית",
    religion: "יהודיה",

    fullName2: "דוד כהן",
    idNumber2: "345678901",
    address2: "רחוב אלנבי 78, דירה 5, תל אביב",
    phone2: "052-8765432",
    email2: "david.cohen@example.com",
    birthDate2: "1986-03-20",
    gender2: "male",
    citizenship2: "ישראלי",
    religion2: "יהודי",

    relationshipType: "separated",
    weddingDay: "2012-08-20",
  },

  formData: {
    // PROPERTY SECTION (used by divorce agreement)
    property: {
      // Children from the marriage
      children: [
        {
          name: "יעל כהן",
          idNumber: "678901234",
          birthDate: "2014-11-10",
          address: "רחוב בן יהודה 42, תל אביב",
          residingWith: "applicant", // Lives with Ronit
        },
        {
          name: "עומר כהן",
          idNumber: "789012345",
          birthDate: "2017-05-22",
          address: "רחוב בן יהודה 42, תל אביב",
          residingWith: "applicant", // Lives with Ronit
        },
      ],

      // Marriage and separation
      marriageDate: "2012-08-20",
      separationDate: "2024-01-15",
      livingTogether: "no",

      // Employment details
      applicantEmploymentStatus: "employee",
      applicantGrossSalary: 15000,

      respondentEmploymentStatus: "self-employed",
      respondentGrossIncome: 25000,

      // Court proceedings
      courtProceedings: "no",
    },

    // DIVORCE AGREEMENT specific data
    divorceAgreement: {
      agreedOnDivorce: "כן",
      agreedOnTerms: "כן",
      agreementDetails: `בני הזוג הגיעו להסכמות הבאות:

1. חלוקת רכוש: כל צד שומר על הרכוש שברשותו. הדירה המשותפת ברח' בן יהודה תימכר והתמורה תחולק שווה בשווה. רכב המשפחה יישאר ברשות רונית לצורך הסעת הילדים.

2. משמורת: משמורת משותפת על שני הילדים, כאשר מקום מגוריהם העיקרי יהיה עם רונית. הילדים יבלו עם דוד בסופי שבוע מתחלפים ויום באמצע השבוע.

3. מזונות: דוד ישלם מזונות בסך 5,000 ש"ח לכל ילד (סה"כ 10,000 ש"ח לחודש), כל ה-1 לחודש, עד לגיל 18 או עד סיום שירות צבאי/לימודים אקדמאיים, המאוחר מביניהם.

4. הוצאות נוספות: הוצאות חינוך, רפואה וחוגים יחולקו שווה בשווה בין ההורים.

5. ביטוחים: שני ההורים ימשיכו לשלם פרמיות ביטוח חיים/בריאות/השתכרות עבור הילדים.

6. ירושה: כל צד מוותר על כל זכויות ירושה זה מזה, למעט הזכויות הנובעות מביטוחי חיים לטובת הילדים.`,
      uploadedAgreement: null, // No pre-existing agreement uploaded
    },

    // Custody details (if custody claim also selected)
    custody: {
      whoShouldHaveCustody: "המשמורת צריכה להיות משותפת עם מקום מגורים עיקרי אצלי כי אני אמא מעורבת שמתפנה לילדים. אני עובדת שעות קבועות ויכולה להיות זמינה לילדים אחרי הגן והבי\"ס. יש לי רשת תמיכה משפחתית קרובה. הילדים רגילים לשגרה הקבועה שלנו ולסביבה המוכרת.",
      currentLivingArrangement: "with_applicant",
      sinceWhen: "2024-01-15",
      currentVisitationArrangement: "הילדים נפגשים עם האב בסופי שבוע מתחלפים, מיום שישי אחה\"צ עד יום ראשון ערב. בנוסף, הם נפגשים איתו ביום רביעי אחר הצהריים למשך כ-3 שעות.",
      requestedArrangement: "joint_custody",
      visitationProposal: "סופי שבוע מתחלפים (שישי 16:00 - ראשון 19:00), יום רביעי אחה\"צ (16:00-20:00), וחלוקת חגים: סוכות ופסח בשנים זוגיות אצל האב, חנוכה וראש השנה בשנים אי-זוגיות. חופשת קיץ תחולק שווה בשווה.",
      whyNotOtherParent: "אני לא חושבת שהמשמורת צריכה להיות אצל האב לבד כי הוא עובד שעות ארוכות ולא זמין ברוב הימים. אין לו רשת תמיכה משפחתית קרובה. הילדים זקוקים ליציבות ולשגרה קבועה שאני יכולה לספק.",
    },

    // GLOBAL QUESTIONS (required for Form 3)
    marriedBefore: "לא",
    hadChildrenFromPrevious: "לא",
    marriedBefore2: "לא",
    hadChildrenFromPrevious2: "לא",

    applicantHomeType: "rental",
    partnerHomeType: "rental",

    protectionOrderRequested: "לא",
    pastViolenceReported: "לא",

    otherFamilyCases: [], // No other court cases

    contactedWelfare: "לא",
    contactedMarriageCounseling: "כן",
    willingToJoinFamilyCounseling: "לא",
    willingToJoinMediation: "לא",
  },

  selectedClaims: ["divorceAgreement"],

  // Client signature (applicant)
  signature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",

  // Lawyer signature
  lawyerSignature: signatureBase64,

  // Attachments (optional)
  attachments: [
    {
      label: "א",
      description: "תעודת נישואין",
      images: [signatureBuffer], // 1 page (using signature as dummy image)
    },
    {
      label: "ב",
      description: "תלושי שכר",
      images: [signatureBuffer, signatureBuffer], // 2 pages
    },
  ],

  paymentData: {
    paid: true,
    amount: 1000,
    date: new Date().toISOString(),
  },

  filledDocuments: {},
  submittedAt: new Date().toISOString(),
};

// Send to backend
async function testDivorceAgreement() {
  console.log('\n🧪 Testing Divorce Agreement Document Generation...\n');
  console.log('📋 Test Data Summary:');
  console.log(`   Applicant (Wife): ${comprehensiveDivorceAgreementData.basicInfo.fullName}`);
  console.log(`   Respondent (Husband): ${comprehensiveDivorceAgreementData.basicInfo.fullName2}`);
  console.log(`   Married: ${comprehensiveDivorceAgreementData.formData.property.marriageDate}`);
  console.log(`   Separated: ${comprehensiveDivorceAgreementData.formData.property.separationDate}`);
  console.log(`   Children: ${comprehensiveDivorceAgreementData.formData.property.children.length}`);
  console.log('');
  console.log('📜 Agreement Terms:');
  console.log(`   Agreed on divorce: ${comprehensiveDivorceAgreementData.formData.divorceAgreement.agreedOnDivorce}`);
  console.log(`   Agreed on all terms: ${comprehensiveDivorceAgreementData.formData.divorceAgreement.agreedOnTerms}`);
  console.log(`   Details length: ${comprehensiveDivorceAgreementData.formData.divorceAgreement.agreementDetails.length} characters`);
  console.log('');
  console.log('👶 Children Details:');
  comprehensiveDivorceAgreementData.formData.property.children.forEach((child, index) => {
    console.log(`   ${index + 1}. ${child.name} (ת.ז ${child.idNumber}), born ${child.birthDate}`);
  });
  console.log('');
  console.log('📎 Attachments:');
  if (comprehensiveDivorceAgreementData.attachments && comprehensiveDivorceAgreementData.attachments.length > 0) {
    comprehensiveDivorceAgreementData.attachments.forEach((att, index) => {
      const totalPages = att.images.length;
      console.log(`   נספח ${att.label} - ${att.description}: ${totalPages} page${totalPages > 1 ? 's' : ''}`);
    });
  } else {
    console.log('   No attachments');
  }
  console.log('');

  try {
    // Use the submission endpoint which uploads to Google Drive!
    const response = await fetch('http://localhost:3000/api/submission/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(comprehensiveDivorceAgreementData),
    });

    console.log(`📡 Response status: ${response.status}\n`);

    const result = await response.json();
    console.log('✅ Response from backend:');
    console.log(JSON.stringify(result, null, 2));

    if (result.success && result.folderId) {
      console.log(`\n🎉 SUCCESS! Divorce Agreement generated!`);
      console.log(`   📁 Folder: ${result.folderName}`);
      console.log(`   🔗 https://drive.google.com/drive/folders/${result.folderId}`);
      console.log('');
      console.log('📄 The document should contain:');
      console.log('   1. הסכם גירושין (Divorce Agreement) - Main agreement with all terms');
      console.log('   2. טופס 3 - הרצאת פרטים (Form 3 - Statement of Details)');
      console.log('   3. ייפוי כוח (Power of Attorney) - Client signature on LEFT');
      console.log('   4. תצהיר (Affidavit) - Lawyer signature on LEFT');
      if (comprehensiveDivorceAgreementData.attachments && comprehensiveDivorceAgreementData.attachments.length > 0) {
        console.log('   5. תוכן עניינים (Table of Contents) for attachments');
        console.log('   6. נספחים (Attachments):');
        comprehensiveDivorceAgreementData.attachments.forEach((att) => {
          console.log(`      - נספח ${att.label} - ${att.description} (${att.images.length} page${att.images.length > 1 ? 's' : ''})`);
        });
      }
    }
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
  }
}

testDivorceAgreement();
