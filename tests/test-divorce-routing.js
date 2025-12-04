/**
 * Test script for divorce claim routing
 * Generates both rabbinical and family court versions and uploads to Google Drive
 */

const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function runTest() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TESTING DIVORCE CLAIM ROUTING - RABBINICAL VS FAMILY COURT');
  console.log('='.repeat(80) + '\n');

  // Dynamic imports for TypeScript modules
  const divorceClaimModule = await import('../lib/api/services/divorce-claim-generator.ts');
  const divorceClaimFamilyModule = await import('../lib/api/services/divorce-claim-family-generator.ts');
  const googleDriveModule = await import('../lib/api/services/google-drive.ts');

  const generateDivorceClaim = divorceClaimModule.generateDivorceClaim;
  const generateDivorceClaimFamily = divorceClaimFamilyModule.generateDivorceClaimFamily;
  const uploadToDrive = googleDriveModule.uploadToDrive;
  const createFolder = googleDriveModule.createFolder;

  // Test data - realistic divorce case
  const testBasicInfo = {
    fullName: 'ישראל ישראלי',
    idNumber: '123456789',
    address: 'רחוב הרצל 10, תל אביב',
    phone: '050-1234567',
    email: 'israel@test.com',
    birthDate: '1985-03-15',
    gender: 'male',
    fullName2: 'שרה ישראלי',
    idNumber2: '987654321',
    address2: 'רחוב ויצמן 20, רמת גן',
    phone2: '050-7654321',
    email2: 'sarah@test.com',
    birthDate2: '1988-07-22',
    gender2: 'female',
    relationshipType: 'married',
    weddingDay: '2010-06-15',
  };

  const testFormData = {
    children: [
      {
        firstName: 'דוד',
        lastName: 'ישראלי',
        idNumber: '111222333',
        birthDate: '2012-01-10',
        address: 'רחוב הרצל 10, תל אביב',
      },
      {
        firstName: 'מיכל',
        lastName: 'ישראלי',
        idNumber: '444555666',
        birthDate: '2015-05-20',
        address: 'רחוב הרצל 10, תל אביב',
      },
    ],
    livingSeparately: 'כן',
    separationDate: '2024-01-01',
    divorce: {
      weddingCity: 'תל אביב',
      whoWantsDivorceAndWhy: 'הצדדים הגיעו למסקנה כי אין עוד אפשרות לחיים משותפים לאחר שנים של ניסיונות שיקום הקשר.',
      divorceReasons: 'חוסר הבנה מתמשך, ניכור רגשי, והעדר תקשורת בין הצדדים.',
      parallelCases: 'לא',
      hadPreviousMediation: 'כן',
      previousMediationDetails: 'הצדדים ניסו גישור משפחתי במרכז הגישור העירוני אך ללא הצלחה.',
    },
    property: {
      separationDate: '2024-01-01',
    },
  };

  const selectedClaims = ['divorce'];

  // Create test folder in Google Drive
  const currentDate = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
  const testFolderName = `בדיקת גירושין ${currentDate} ${currentTime}`;

  console.log(`📁 Creating test folder: ${testFolderName}`);
  const testFolderId = await createFolder(testFolderName);
  console.log(`✅ Test folder created: ${testFolderId}\n`);

  // ========== TEST 1: RABBINICAL COURT ==========
  console.log('='.repeat(60));
  console.log('📜 TEST 1: RABBINICAL COURT (בית דין רבני)');
  console.log('='.repeat(60));

  try {
    const rabbinicalDoc = await generateDivorceClaim({
      basicInfo: testBasicInfo,
      formData: testFormData,
      signature: undefined,
      lawyerSignature: undefined,
      attachments: undefined,
      selectedClaims: selectedClaims,
    });

    console.log(`📄 Document generated: ${rabbinicalDoc.length} bytes`);

    // Upload to Drive
    await uploadToDrive({
      fileName: 'תביעת-גירושין-בית-דין-רבני.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      buffer: rabbinicalDoc,
      folderId: testFolderId,
    });

    console.log('✅ Rabbinical court document uploaded successfully!\n');
  } catch (error) {
    console.error('❌ Error generating rabbinical court document:', error);
  }

  // ========== TEST 2: FAMILY COURT ==========
  console.log('='.repeat(60));
  console.log('⚖️  TEST 2: FAMILY COURT (בית משפט לענייני משפחה)');
  console.log('='.repeat(60));

  try {
    const familyDoc = await generateDivorceClaimFamily({
      basicInfo: testBasicInfo,
      formData: testFormData,
      signature: undefined,
      lawyerSignature: undefined,
      attachments: undefined,
    });

    console.log(`📄 Document generated: ${familyDoc.length} bytes`);

    // Upload to Drive
    await uploadToDrive({
      fileName: 'תביעת-גירושין-בית-משפט-לענייני-משפחה.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      buffer: familyDoc,
      folderId: testFolderId,
    });

    console.log('✅ Family court document uploaded successfully!\n');
  } catch (error) {
    console.error('❌ Error generating family court document:', error);
  }

  // ========== SUMMARY ==========
  console.log('='.repeat(80));
  console.log('🎉 TEST COMPLETE');
  console.log('='.repeat(80));
  console.log(`\n📁 Test folder: ${testFolderName}`);
  console.log(`🔗 Folder ID: ${testFolderId}`);
  console.log(`🌐 View at: https://drive.google.com/drive/folders/${testFolderId}`);
  console.log('\nFiles uploaded:');
  console.log('  1. תביעת-גירושין-בית-דין-רבני.docx');
  console.log('  2. תביעת-גירושין-בית-משפט-לענייני-משפחה.docx');
  console.log('\n');
}

runTest().catch(console.error);
