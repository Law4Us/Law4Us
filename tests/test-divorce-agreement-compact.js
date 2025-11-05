/**
 * Compact Divorce Agreement Test
 * Tests new structured format with smart referencing and Groq transformations
 */

const fs = require('fs');
const path = require('path');

// Read the lawyer signature
const signatureBuffer = fs.readFileSync(path.join(__dirname, '..', 'Signature.png'));
const signatureBase64 = `data:image/png;base64,${signatureBuffer.toString('base64')}`;

console.log(`📷 Loaded signature: ${signatureBuffer.length} bytes`);

// Test 1: Standalone divorce agreement (no other claims)
const standaloneData = {
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
    property: {
      children: [
        {
          name: "יעל כהן",
          idNumber: "678901234",
          birthDate: "2014-11-10",
          address: "רחוב בן יהודה 42, תל אביב",
          residingWith: "applicant",
        },
        {
          name: "עומר כהן",
          idNumber: "789012345",
          birthDate: "2017-05-22",
          address: "רחוב בן יהודה 42, תל אביב",
          residingWith: "applicant",
        },
      ],
      marriageDate: "2012-08-20",
      separationDate: "2024-01-15",
      livingTogether: "no",
    },

    // NEW STRUCTURED FORMAT
    divorceAgreement: {
      // Property division - custom with Groq transformation
      propertyAgreement: "custom",
      propertyCustom: "הדירה ברחוב בן יהודה תימכר והתמורה תתחלק שווה בשווה. הרכב שלי יישאר איתי כי אני צריכה אותו להסיע את הילדים. החיסכון בבנק יתחלק חצי חצי.",

      // Custody - joint custody
      custodyAgreement: "jointCustody",

      // Visitation - custom with Groq transformation
      visitationAgreement: "custom",
      visitationCustom: "הילדים יהיו איתי רוב הזמן אבל יפגשו את דוד בסופי שבוע מתחלפים. יום רביעי אחר הצהריים הם גם יבלו איתו.",

      // Alimony - specific amount
      alimonyAgreement: "specificAmount",
      alimonyAmount: 10000,

      // Additional terms - with Groq transformation
      additionalTerms: "דוד ימשיך לשלם ביטוח חיים לילדים. הוצאות חינוך נחלק חצי חצי. אם יש הוצאות רפואיות גדולות גם נחלק ביניבו.",
    },

    // Global questions
    marriedBefore: "לא",
    marriedBefore2: "לא",
    protectionOrderRequested: "לא",
    pastViolenceReported: "לא",
    contactedWelfare: "לא",
    contactedMarriageCounseling: "כן",
  },

  selectedClaims: ["divorceAgreement"], // Only divorce agreement

  signature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  lawyerSignature: signatureBase64,

  attachments: [
    {
      label: "א",
      description: "תעודת נישואין",
      images: [signatureBuffer],
    },
  ],
};

// Test 2: Divorce agreement WITH other claims (smart referencing)
const withOtherClaimsData = {
  ...standaloneData,

  formData: {
    property: {
      children: [
        {
          name: "יעל כהן",
          idNumber: "678901234",
          birthDate: "2014-11-10",
          address: "רחוב בן יהודה 42, תל אביב",
          residingWith: "applicant",
        },
        {
          name: "עומר כהן",
          idNumber: "789012345",
          birthDate: "2017-05-22",
          address: "רחוב בן יהודה 42, תל אביב",
          residingWith: "applicant",
        },
      ],
      marriageDate: "2012-08-20",
      separationDate: "2024-01-15",
      livingTogether: "no",
    },

    divorceAgreement: {
      // Reference other claims
      propertyAgreement: "referenceClaim",
      custodyAgreement: "referenceClaim",
      alimonyAgreement: "referenceClaim",

      // Only additional terms need custom text
      additionalTerms: "שני הצדדים מוותרים על זכויות ירושה זה מזה. הביטוחים יישארו כמו שהם.",
    },

    marriedBefore: "לא",
    marriedBefore2: "לא",
    protectionOrderRequested: "לא",
    pastViolenceReported: "לא",
    contactedWelfare: "לא",
    contactedMarriageCounseling: "כן",
  },

  selectedClaims: ["property", "custody", "alimony", "divorceAgreement"], // All claims
  signature: standaloneData.signature,
  lawyerSignature: standaloneData.lawyerSignature,
  attachments: standaloneData.attachments,
};

// Test 3: No children scenario
const noChildrenData = {
  basicInfo: {
    ...standaloneData.basicInfo,
    weddingDay: "2020-05-15",
  },

  formData: {
    property: {
      children: [],
      marriageDate: "2020-05-15",
      separationDate: "2024-02-01",
      livingTogether: "no",
    },

    divorceAgreement: {
      propertyAgreement: "eachKeepsOwn",
      custodyAgreement: "noChildren",
      alimonyAgreement: "none",
      additionalTerms: "",
    },

    marriedBefore: "לא",
    marriedBefore2: "לא",
    protectionOrderRequested: "לא",
    pastViolenceReported: "לא",
    contactedWelfare: "לא",
    contactedMarriageCounseling: "לא",
  },

  selectedClaims: ["divorceAgreement"],
  signature: standaloneData.signature,
  lawyerSignature: standaloneData.lawyerSignature,
  attachments: standaloneData.attachments,
};

// Test function
async function testScenario(scenarioName, data) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🧪 Testing: ${scenarioName}`);
  console.log('='.repeat(70));

  console.log('\n📋 Test Data Summary:');
  console.log(`   Applicant: ${data.basicInfo.fullName} (${data.basicInfo.gender})`);
  console.log(`   Respondent: ${data.basicInfo.fullName2} (${data.basicInfo.gender2})`);
  console.log(`   Married: ${data.basicInfo.weddingDay}`);
  console.log(`   Children: ${data.formData.property.children?.length || 0}`);
  console.log(`   Selected Claims: ${data.selectedClaims.join(', ')}`);

  console.log('\n📜 Agreement Structure:');
  const agreement = data.formData.divorceAgreement;
  console.log(`   Property: ${agreement.propertyAgreement}`);
  console.log(`   Custody: ${agreement.custodyAgreement}`);
  console.log(`   Alimony: ${agreement.alimonyAgreement}`);
  if (agreement.additionalTerms) {
    console.log(`   Additional Terms: ${agreement.additionalTerms.substring(0, 50)}...`);
  }

  try {
    const response = await fetch('http://localhost:3000/api/submission/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log(`\n📡 Response status: ${response.status}`);

    const result = await response.json();

    if (result.success && result.folderId) {
      console.log(`\n✅ SUCCESS! ${scenarioName}`);
      console.log(`   📁 Folder: ${result.folderName}`);
      console.log(`   🔗 https://drive.google.com/drive/folders/${result.folderId}`);
    } else {
      console.log('\n❌ FAILED!');
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n🚀 Starting Compact Divorce Agreement Tests\n');
  console.log('This will test:');
  console.log('  1. Standalone agreement with custom text (Groq transformation)');
  console.log('  2. Agreement with smart referencing to other claims');
  console.log('  3. No children scenario\n');

  // Test 1
  await testScenario('Scenario 1: Standalone with Custom Text', standaloneData);

  // Wait a bit between tests
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 2
  await testScenario('Scenario 2: With Smart Referencing', withOtherClaimsData);

  // Wait a bit between tests
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 3
  await testScenario('Scenario 3: No Children', noChildrenData);

  console.log('\n\n🎉 All tests completed!');
}

runAllTests();
