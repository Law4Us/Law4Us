/**
 * Test script for divorce claim routing
 * Generates both rabbinical and family court versions and uploads to Google Drive
 */

import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

import { generateDivorceClaim } from '../lib/api/services/divorce-claim-generator';
import { generateDivorceClaimFamily } from '../lib/api/services/divorce-claim-family-generator';
import { uploadToDrive, createFolder } from '../lib/api/services/google-drive';

async function runTest() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TESTING DIVORCE CLAIM ROUTING - RABBINICAL VS FAMILY COURT');
  console.log('='.repeat(80) + '\n');

  // Test data - realistic divorce case
  const testBasicInfo = {
    fullName: 'ישראל ישראלי',
    idNumber: '123456789',
    address: 'רחוב הרצל 10, תל אביב',
    phone: '050-1234567',
    email: 'israel@test.com',
    birthDate: '1985-03-15',
    gender: 'male' as const,
    fullName2: 'שרה ישראלי',
    idNumber2: '987654321',
    address2: 'רחוב ויצמן 20, רמת גן',
    phone2: '050-7654321',
    email2: 'sarah@test.com',
    birthDate2: '1988-07-22',
    gender2: 'female' as const,
    relationshipType: 'married' as const,
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
      religiousMarriage: 'כן',
      ketubahAmount: '180,000 ש"ח (מאה ושמונים אלף שקלים)',
      ketubahRequest: 'מבוקש לפסוק את סכום הכתובה במלואו',
      propertyDispute: 'כן',
      needSupport: 'כן',
      childrenDispute: 'כן',
    },
    property: {
      separationDate: '2024-01-01',
      hasAssets: 'yes',
    },
    // נכסי מקרקעין (Apartments)
    apartments: [
      {
        address: 'רחוב הרצל 10, תל אביב',
        owner: 'שני הצדדים',
        gush: '6234',
        helka: '45',
        divisionRequest: 'לחלק בשווה בין הצדדים או למכור ולחלק את התמורה',
      },
      {
        address: 'רחוב ויצמן 5, הרצליה',
        owner: 'הבעל',
        gush: '6521',
        helka: '12',
        divisionRequest: 'להכליל ברכוש המשותף לחלוקה',
      },
    ],
    // כלי רכב (Vehicles)
    vehicles: [
      {
        type: 'מאזדה 3',
        licenseNumber: '12-345-67',
        year: '2021',
        owner: 'הבעל',
      },
      {
        type: 'טויוטה קורולה',
        licenseNumber: '98-765-43',
        year: '2019',
        owner: 'האישה',
      },
    ],
    // חסכונות (Savings)
    savings: [
      {
        type: 'חשבון עו"ש',
        bank: 'בנק הפועלים',
        accountNumber: '123456',
        owner: 'שני הצדדים',
        amount: '85,000 ש"ח',
      },
      {
        type: 'תוכנית חיסכון',
        bank: 'בנק לאומי',
        accountNumber: '789012',
        owner: 'הבעל',
        amount: '120,000 ש"ח',
      },
    ],
    // קופות גמל וזכויות פנסיוניות (Benefits)
    benefits: [
      {
        type: 'קרן פנסיה',
        institution: 'מנורה מבטחים',
        owner: 'הבעל',
        amount: '450,000 ש"ח',
      },
      {
        type: 'קופת גמל',
        institution: 'הראל',
        owner: 'האישה',
        amount: '180,000 ש"ח',
      },
    ],
    // חובות (Debts)
    debts: [
      {
        type: 'משכנתא',
        creditor: 'בנק מזרחי',
        owner: 'שני הצדדים',
        amount: '650,000 ש"ח',
        isMortgage: true,
      },
      {
        type: 'הלוואה',
        creditor: 'בנק הפועלים',
        owner: 'הבעל',
        amount: '45,000 ש"ח',
        paymentDate: '12/2025',
      },
    ],
    // מזונות (Alimony)
    alimony: {
      husbandIncome: '25,000 ש"ח נטו לחודש',
      wifeIncome: '12,000 ש"ח נטו לחודש',
      additionalIncome: 'הכנסות משכירות דירה בהרצליה - 5,500 ש"ח לחודש',
      wifeExpenses: '8,000 ש"ח לחודש',
      housingExpenses: '4,500 ש"ח לחודש (משכנתא + ארנונה + ועד בית)',
      childExpenses: '3,500 ש"ח לילד לחודש',
      childHousingExpenses: '2,000 ש"ח לחודש',
      requestedWifeAlimony: '6,000 ש"ח',
      requestedChildAlimony: '7,000 ש"ח (3,500 ש"ח לכל ילד)',
    },
    // משמורת (Custody)
    custody: {
      currentLivingArrangement: 'with_applicant',
      custodyRequest: 'משמורת בלעדית לאב עם הסדרי שהות מורחבים לאם',
      custodyReason: 'האב היה ההורה העיקרי המטפל בילדים בשנים האחרונות',
      visitationRequest: 'הסדרי שהות: סופי שבוע לסירוגין (שישי 16:00 עד ראשון 18:00), יום רביעי בשבוע (16:00-20:00), חצי מהחגים וחצי מחופשות הקיץ',
      currentEducation: 'דוד - בית ספר יסודי "אלון" כיתה ו\', מיכל - גן ילדים "פרפרים"',
      educationRequest: 'להמשיך במסגרות החינוכיות הנוכחיות',
    },
  };

  const selectedClaims = ['divorce'];

  // Fake attachments for testing (empty image buffers - just to test the attachment list)
  const testAttachments = [
    {
      label: 'נספח א',
      description: 'תעודת נישואין',
      images: [] as Buffer[],
    },
    {
      label: 'נספח ב',
      description: 'נסח טאבו - דירת מגורים ברחוב הרצל 10, תל אביב',
      images: [] as Buffer[],
    },
    {
      label: 'נספח ג',
      description: 'נסח טאבו - דירה ברחוב ויצמן 5, הרצליה',
      images: [] as Buffer[],
    },
    {
      label: 'נספח ד',
      description: 'תלושי משכורת של הבעל (3 חודשים אחרונים)',
      images: [] as Buffer[],
    },
    {
      label: 'נספח ה',
      description: 'תלושי משכורת של האישה (3 חודשים אחרונים)',
      images: [] as Buffer[],
    },
    {
      label: 'נספח ו',
      description: 'דפי חשבון בנק - חשבון משותף',
      images: [] as Buffer[],
    },
    {
      label: 'נספח ז',
      description: 'כתובה',
      images: [] as Buffer[],
    },
    {
      label: 'נספח ח',
      description: 'תעודות לידה של הקטינים',
      images: [] as Buffer[],
    },
    {
      label: 'נספח ט',
      description: 'אישור ממרכז הגישור העירוני על ניסיון גישור כושל',
      images: [] as Buffer[],
    },
  ];

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
      attachments: testAttachments,
      selectedClaims: selectedClaims as any,
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
      attachments: testAttachments,
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
