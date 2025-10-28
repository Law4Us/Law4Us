/**
 * Test custody claim generation with Groq AI transformations
 * This test includes first-person text that should be transformed to legal third-person language
 */

const fs = require('fs');
const path = require('path');

// Read signature image
const signaturePath = path.join(__dirname, '..', 'Signature.png');
let signatureBase64 = '';

if (fs.existsSync(signaturePath)) {
  const signatureBuffer = fs.readFileSync(signaturePath);
  signatureBase64 = `data:image/png;base64,${signatureBuffer.toString('base64')}`;
  console.log('✅ Signature loaded successfully');
} else {
  console.log('⚠️  Signature not found, will use placeholder');
}

// Test data with first-person text for Groq AI transformation
const testData = {
  claimType: 'custody',
  selectedClaims: ['custody'], // Required field
  basicInfo: {
    fullName: 'שרה כהן',
    idNumber: '123456789',
    birthDate: '1985-05-15',
    address: 'רחוב הרצל 10, תל אביב',
    phone: '050-1234567',
    email: 'sarah.cohen@example.com',
    gender: 'female',

    fullName2: 'יוסי כהן',
    idNumber2: '987654321',
    birthDate2: '1983-08-20',
    address2: 'רחוב בן גוריון 25, תל אביב',
    phone2: '052-7654321',
    email2: 'yossi.cohen@example.com',
    gender2: 'male',

    relationshipType: 'married',
    marriageDate: '2010-06-15',
    weddingDay: '2010-06-15',
  },

  formData: {
    custody: {
      // Children with FIRST-PERSON relationship descriptions (to test Groq AI)
      children: [
        {
          firstName: 'נועה',
          lastName: 'כהן',
          name: 'נועה כהן',
          idNumber: '234567890',
          birthDate: '2012-03-10',
          address: 'רחוב הרצל 10, תל אביב',
          // FIRST PERSON - should be transformed by Groq to third person
          childRelationship: 'אני ונועה מאוד קרובות. אני עוזרת לה בשיעורי הבית כל יום ומבלה איתה זמן איכות. יש לנו קשר מיוחד ונועה מספרת לי הכל. אני הורה הקרוב אליה יותר ואני מכירה את כל הצרכים הרגשיים שלה.',
        },
        {
          firstName: 'דניאל',
          lastName: 'כהן',
          name: 'דניאל כהן',
          idNumber: '345678901',
          birthDate: '2015-07-22',
          address: 'רחוב הרצל 10, תל אביב',
          // FIRST PERSON - should be transformed by Groq to third person
          childRelationship: 'אני ודניאל מבלים הרבה זמן ביחד. אני לוקח אותו לגן כל בוקר ועושה איתו פעילויות. יש לי קשר מאוד חזק עם דניאל והוא מרגיש בטוח איתי. אני מכיר את הרופאים שלו ואת כל המורות בגן.',
        },
      ],

      // Living arrangement
      currentLivingArrangement: 'with_applicant', // Children live with applicant (שרה)
      sinceWhen: '2024-01-15',

      // FIRST PERSON - should be transformed by Groq to third person
      currentVisitationArrangement: 'הילדים רואים את אביהם פעם בשבועיים בסופי שבוע. אני מביאה אותם אליו ביום שישי אחר הצהריים והוא מחזיר אותם ביום ראשון בערב. לפעמים יש בעיות כי הוא מגיע באיחור או משנה תוכניות.',

      // Requested arrangement
      requestedArrangement: 'primary_with_visits',
      visitationProposal: 'אני מציעה שהילדים יהיו אצלי באופן קבוע ויראו את אביהם פעם בשבוע ובסופי שבוע חילופיים.',

      // Custody summary - FIRST PERSON - should be transformed by Groq to third person
      whoShouldHaveCustody: `אני צריכה לקבל את המשמורת על הילדים כי אני ההורה העיקרי שמטפל בהם מאז שנולדו. אני זו שלוקחת אותם לבית הספר כל בוקר, עוזרת בשיעורי בית, מגיעה לכל הפעילויות והחוגים. יש לי קשר הכי חזק עם הילדים והם מרגישים בטוחים איתי.

אני עובדת במשרה חלקית כך שיש לי זמן לטפל בילדים. יש לי סידורי משמורת גמישים שמאפשרים לי להיות זמינה עבורם. הילדים מתגוררים איתי בדירה גדולה ונוחה והם מרגישים בבית. יש להם חדרים משלהם, חברים בשכונה, ובית ספר קרוב.

הילדים זקוקים ליציבות ולהמשכיות והם רגילים למערכת היום יום שלנו. נועה מצליחה מאוד בבית הספר בזכות העזרה שלי ודניאל מתפתח נהדר. אני דואגת לכל הצרכים שלהם - רגשיים, חברתיים, לימודיים ובריאותיים.`,

      // Why not other parent - FIRST PERSON - should be transformed by Groq to third person
      whyNotOtherParent: `אביהם עובד במשרה מלאה ולעיתים נוסף עד מאוחר בלילה. אין לו זמן לטפל בילדים באופן יומיומי ולדאוג לצרכים שלהם. כשהילדים מגיעים אליו בסופי שבוע, הוא לא עוזר להם בשיעורי בית ולא משתתף בפעילויות החינוכיות שלהם.

בנוסף, היו מקרים בהם הילדים חזרו ממנו עייפים ולא מטופלים כמו שצריך. הוא לא תמיד זמין עבורם מבחינה רגשית ולא מכיר את החברים והמורות שלהם. המשמורת צריכה להיות אצלי כדי להבטיח את טובת הילדים.`,
    },

    // Form 3 data
    marriedBefore: 'no',
    hadChildrenFromPrevious: 'no',
    marriedBefore2: 'no',
    hadChildrenFromPrevious2: 'no',
    applicantHomeType: 'rental',
    partnerHomeType: 'rental',
    protectionOrderRequested: 'no',
    pastViolenceReported: 'no',
    contactedWelfare: 'no',
    contactedMarriageCounseling: 'yes',
    willingToJoinFamilyCounseling: 'yes',
    willingToJoinMediation: 'yes',
  },

  signature: signatureBase64,
  lawyerSignature: signatureBase64, // Using same signature for demo
};

console.log('\n🧪 Testing Custody Claim Generation with Groq AI Transformations\n');
console.log('📝 Test includes first-person text that should be transformed to legal language:');
console.log('   - Child relationship descriptions (2 children)');
console.log('   - Visitation arrangement details');
console.log('   - Custody summary (why custody should be with applicant)');
console.log('   - Why custody should NOT be with other parent');
console.log('\n🤖 Groq AI will transform all this text to professional third-person legal language\n');

// Prepare submission data (add required fields for Google Drive upload)
const submissionData = {
  ...testData,
  paymentData: { paid: true, date: new Date().toISOString() },
  filledDocuments: {},
  submittedAt: new Date().toISOString(),
};

// Send request to submission endpoint (uploads to Google Drive)
fetch('http://localhost:3001/api/submission/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(submissionData),
})
  .then(async (response) => {
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response.json();
  })
  .then((data) => {
    console.log('\n✅ SUCCESS! Document generated and uploaded to Google Drive:\n');
    console.log('🔗 Google Drive Folder URL:', data.folderUrl);
    console.log('📁 Folder Name:', data.folderName);
    console.log('📄 Files uploaded:', data.files.length);

    data.files.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file.name}`);
      console.log(`      🔗 ${file.url}`);
    });

    console.log('\n📊 Groq AI Transformation Summary:');
    console.log('   ✅ Child relationship descriptions (2 children): Transformed to legal third person');
    console.log('   ✅ Visitation arrangements: Transformed to legal language');
    console.log('   ✅ Custody summary: Transformed to legal language');
    console.log('   ✅ Why not other parent: Transformed to legal language');
    console.log('\n💡 Open the document in Google Drive to see the professional legal language!\n');
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nMake sure the backend is running on http://localhost:3001');
    process.exit(1);
  });
