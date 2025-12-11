/**
 * Comprehensive Shalom Bayit Test
 * Tests: Reconciliation claim (תביעת שלום בית)
 */

const axios = require('axios');

// 1x1 pixel orange PNG for sample attachments
const SAMPLE_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAHl6u3QAAAABJRU5ErkJggg==';

const testData = {
  basicInfo: {
    fullName: 'אסתר מלכה',
    idNumber: '789012345',
    email: 'test-shalombayit@law4us.co.il',
    phone: '050-7890123',
    address: 'רחוב בר אילן 25, בני ברק',
    birthDate: '1992-02-14',
    gender: 'female',
    fullName2: 'חיים מלכה',
    idNumber2: '321098765',
    phone2: '052-3210987',
    email2: 'haim@example.com',
    address2: 'רחוב הרב שך 10, בני ברק',
    birthDate2: '1988-08-20',
    gender2: 'male',
    relationshipType: 'married',
    weddingDay: '2014-03-25',
  },

  selectedClaims: ['shalomBayit'],

  formData: {
    // GLOBAL: Children
    hasSharedChildren: 'yes',
    children: [
      {
        firstName: 'יוסף',
        lastName: 'מלכה',
        idNumber: '890123456',
        birthDate: '2016-07-10',
        address: 'רחוב בר אילן 25, בני ברק',
        nameOfParent: 'חיים מלכה',
        childRelationship: 'יוסף הוא ילד חכם ורגיש. לומד בתלמוד תורה ומצטיין.',
      },
      {
        firstName: 'שרה',
        lastName: 'מלכה',
        idNumber: '901234567',
        birthDate: '2018-11-05',
        address: 'רחוב בר אילן 25, בני ברק',
        nameOfParent: 'חיים מלכה',
        childRelationship: 'שרה היא ילדה מקסימה ושמחה. לומדת בגן חרדי.',
      },
      {
        firstName: 'דוד',
        lastName: 'מלכה',
        idNumber: '012345678',
        birthDate: '2021-04-22',
        address: 'רחוב בר אילן 25, בני ברק',
        nameOfParent: 'חיים מלכה',
        childRelationship: 'דוד הוא הקטן שלנו, תינוק מתוק.',
      },
    ],

    // GLOBAL: Previous marriages
    marriedBefore: 'no',
    hadChildrenFromPrevious: 'no',
    marriedBefore2: 'no',
    hadChildrenFromPrevious2: 'no',

    // GLOBAL: Housing
    applicantHomeType: 'rental',
    partnerHomeType: 'rental',

    // GLOBAL: Separation
    livingSeparately: 'כן',
    separationDate: '2024-10-01',

    // GLOBAL: Violence & Protection
    protectionOrderRequested: 'no',
    pastViolenceReported: 'no',

    // GLOBAL: Welfare & Counseling
    contactedWelfare: 'no',
    contactedMarriageCounseling: 'yes',
    willingToJoinFamilyCounseling: 'yes',
    willingToJoinMediation: 'yes',

    // GLOBAL: Other cases
    otherFamilyCases: [],

    // GLOBAL: Relationship description
    relationshipDescription: 'אנחנו נשואים כ-10 שנים ויש לנו 3 ילדים יפים. בחודשים האחרונים נוצר משבר בגלל לחצים כלכליים ומשפחתיים, אבל אני מאמינה שאפשר לתקן.',

    // SHALOM BAYIT SPECIFIC DATA
    shalomBayit: {
      marriageQuality: 'difficult',
      crisisDuration: 'year',
      crisisReasons: `המשבר בינינו התחיל לפני כשנה והסיבות העיקריות הן:

1. לחצים כלכליים - פיטורים של בעלי מהעבודה לפני 8 חודשים גרמו ללחץ כלכלי קשה. החובות הצטברו ויצרו מתח יומיומי.

2. התערבות משפחות - הורי בעלי מתערבים יותר מדי בחיינו ומבקרים כל החלטה שלי. זה יוצר חיכוכים מתמידים.

3. חוסר תקשורת - הפסקנו לדבר על רגשות ובעיות. כל שיחה הופכת לוויכוח.

4. עייפות וחוסר זמן איכות - עם 3 ילדים קטנים, אין לנו כמעט זמן זוגי. בעלי עובד הרבה שעות ואני מותשת מהטיפול בילדים.

5. ריחוק רגשי - הרגשנו שאנחנו מתרחקים זה מזה. פחות חיבה, פחות קרבה.`,

      previousAttempts: 'professional',
      counselingDetails: 'פנינו ליועצת נישואין בקהילה לפני 4 חודשים. היו 6 פגישות שעזרו, אבל אז בעלי הפסיק להגיע בגלל לחץ בעבודה. אני מוכנה להמשיך.',

      partnerWillingness: 'maybe',

      whatWouldHelp: `אני מאמינה שהדברים הבאים יכולים לעזור לנו:

1. המשך ייעוץ זוגי - חשוב שנחזור לייעוץ ושבעלי יתחייב להשתתף באופן קבוע.

2. הגדרת גבולות מול המשפחה - צריך לקבוע כללים ברורים לגבי מעורבות ההורים בחיינו.

3. זמן איכות - לקבוע לפחות ערב אחד בשבוע לזמן זוגי, גם אם צריך לסדר שמרטף.

4. ייעוץ כלכלי - להתייעץ עם מומחה כדי לצאת מהמצב הכלכלי הקשה ולהפחית את הלחץ.

5. סבלנות והקשבה - שנינו צריכים ללמוד להקשיב אחד לשני בלי לשפוט.

אני מאמינה שאם שנינו נשקיע מאמץ, אפשר להציל את הנישואין ולבנות מחדש. למען הילדים ולמעננו.`,

      commitment: 'full',

      livingArrangement: 'sameHouseSeparate',

      additionalInfo: `דברים חשובים נוספים:

1. למרות הקשיים, אנחנו עדיין אוהבים אחד את השני. יש רגעים טובים בין הרגעים הקשים.

2. הילדים מרגישים את המתח ואני רואה שזה משפיע עליהם. זו סיבה מרכזית שאני רוצה לתקן.

3. בעלי אדם טוב ואב מסור. הוא פשוט לא יודע לבטא רגשות ולהתמודד עם לחץ.

4. אני מוכנה לעשות הכול כדי להציל את הנישואין, כולל לעבור לגור קרוב יותר להורים שלי כדי לקבל עזרה עם הילדים.

5. מבחינה דתית, אנחנו שניהם שומרי מצוות והגירושין הם אופציה אחרונה. רוצים למצות את כל האפשרויות לפני כן.

אני פונה לבית הדין בבקשה שיעזור לנו לחזור לשלום בית ולבנות מחדש את המשפחה שלנו.`,
    },
  },

  signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',

  attachments: [
    { label: 'א', description: 'תעודת נישואין', file: SAMPLE_IMAGE, name: 'marriage-certificate.png', mimeType: 'image/png' },
    { label: 'ב', description: 'אישור מיועצת הנישואין', file: SAMPLE_IMAGE, name: 'counselor-confirmation.png', mimeType: 'image/png' },
    { label: 'ג', description: 'מכתב אישי לבן הזוג', file: SAMPLE_IMAGE, name: 'personal-letter.png', mimeType: 'image/png' },
  ],

  paymentData: { paid: true, date: new Date().toISOString() },
  filledDocuments: {},
  submittedAt: new Date().toISOString(),
  folderNameOverride: 'TEST-Shalom-Bayit-' + new Date().toISOString().split('T')[0],
};

console.log('🧪 Testing SHALOM BAYIT Claim (Reconciliation)\n');
console.log('📋 Test Data Summary:');
console.log(`   Client: ${testData.basicInfo.fullName}`);
console.log(`   Partner: ${testData.basicInfo.fullName2}`);
console.log(`   Marriage Date: ${testData.basicInfo.weddingDay}`);
console.log(`   Children: ${testData.formData.children.length}`);
console.log(`   Marriage Quality: ${testData.formData.shalomBayit.marriageQuality}`);
console.log(`   Crisis Duration: ${testData.formData.shalomBayit.crisisDuration}`);
console.log(`   Partner Willingness: ${testData.formData.shalomBayit.partnerWillingness}`);
console.log(`   Commitment: ${testData.formData.shalomBayit.commitment}`);
console.log(`   Living Arrangement: ${testData.formData.shalomBayit.livingArrangement}`);
console.log(`   Attachments: ${testData.attachments.length}`);
console.log('');

axios
  .post('http://localhost:3000/api/submission', testData)
  .then((response) => {
    console.log('✅ SUCCESS!');
    console.log(`📁 Folder: ${response.data.folderName}`);
    console.log(`🔗 https://drive.google.com/drive/folders/${response.data.folderId}`);
  })
  .catch((error) => {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  });
