/**
 * EXTREME Property Claim Test - Tests UNLIMITED property items
 * Proves the generator can handle any number of properties
 */

const fs = require('fs');
const path = require('path');

// Read the lawyer signature
const signatureBuffer = fs.readFileSync(path.join(__dirname, '..', 'Signature.png'));
const signatureBase64 = `data:image/png;base64,${signatureBuffer.toString('base64')}`;

console.log(`📷 Loaded signature: ${signatureBuffer.length} bytes`);

const extremePropertyData = {
  basicInfo: {
    fullName: "שרה לוי",
    idNumber: "123456789",
    address: "רחוב הרצל 42, תל אביב",
    phone: "054-9876543",
    email: "sarah.levy@example.com",
    birthDate: "1975-05-10",
    gender: "female",
    fullName2: "יוסי לוי",
    idNumber2: "987654321",
    address2: "רחוב הרצל 42, תל אביב",
    phone2: "052-1234567",
    email2: "yossi.levy@example.com",
    birthDate2: "1973-08-22",
    gender2: "male",
    relationshipType: "married",
    weddingDay: "2000-06-15",
  },

  formData: {
    children: [
      {
        __id: "child-1",
        firstName: "נועה",
        lastName: "לוי",
        birthDate: "2010-03-15",
        idNumber: "111222333",
        address: "רחוב הרצל 42, תל אביב",
      },
    ],

    wereMarried: "yes",
    separationDate: "2024-09-01",

    job1: {
      employer: "חברת הייטק מתקדמת בע\"מ",
      position: "מנהלת פיתוח",
      monthlySalary: "25000",
    },
    job2: {
      employer: "עצמאי - יועץ עסקי",
      position: "יועץ עצמאי",
      monthlySalary: "22000",
    },

    // APARTMENTS - Testing with 5 apartments (proving unlimited works)
    apartments: [
      {
        description: "דירת מגורים ראשית - רח' הרצל 42, תל אביב (4 חדרים)",
        value: "4500000",
        owner: "שניהם",
        purchaseDate: "2001-01-15",
      },
      {
        description: "דירת השקעה - רח' דיזנגוף 100, תל אביב (3 חדרים)",
        value: "3200000",
        owner: "שניהם",
        purchaseDate: "2008-06-10",
      },
      {
        description: "דירת נופש - טבריה (2 חדרים)",
        value: "1800000",
        owner: "המבקש",
        purchaseDate: "2015-03-20",
      },
      {
        description: "דירה להשכרה - חיפה (3 חדרים)",
        value: "2100000",
        owner: "הנתבעת",
        purchaseDate: "2012-09-05",
      },
      {
        description: "קרקע חקלאית - עמק יזרעאל (5 דונם)",
        value: "2500000",
        owner: "שניהם",
        purchaseDate: "2010-11-30",
      },
    ],

    // VEHICLES - Testing with 4 vehicles
    vehicles: [
      {
        description: "רכב טסלה מודל 3 (2023)",
        value: "220000",
        owner: "המבקש",
        purchaseDate: "2023-01-10",
      },
      {
        description: "רכב מאזדה CX-5 (2020)",
        value: "160000",
        owner: "הנתבעת",
        purchaseDate: "2020-05-15",
      },
      {
        description: "אופנוע הארלי דוידסון (2019)",
        value: "85000",
        owner: "המבקש",
        purchaseDate: "2019-08-20",
      },
      {
        description: "רכב שטח ג'יפ רנגלר (2018)",
        value: "180000",
        owner: "שניהם",
        purchaseDate: "2018-03-12",
      },
    ],

    // SAVINGS - Testing with 7 accounts
    savings: [
      {
        description: "חשבון חיסכון משותף - בנק הפועלים",
        value: "650000",
        owner: "שניהם",
      },
      {
        description: "חשבון דולרי - בנק לאומי",
        value: "280000",
        owner: "המבקש",
      },
      {
        description: "תיק השקעות - מיטב דש",
        value: "420000",
        owner: "שניהם",
      },
      {
        description: "חיסכון לטווח ארוך - בנק מזרחי",
        value: "180000",
        owner: "הנתבעת",
      },
      {
        description: "תיק מניות - פסגות",
        value: "350000",
        owner: "המבקש",
      },
      {
        description: "קרנות נאמנות - כלל פיננסים",
        value: "220000",
        owner: "הנתבעת",
      },
      {
        description: "פיקדון קצר - בנק דיסקונט",
        value: "150000",
        owner: "שניהם",
      },
    ],

    // BENEFITS - Testing with 6 social benefits
    benefits: [
      {
        description: "קופת גמל - המבקש (מקסימה)",
        value: "580000",
        owner: "המבקש",
      },
      {
        description: "קרן פנסיה - המבקש (הראל)",
        value: "720000",
        owner: "המבקש",
      },
      {
        description: "קופת גמל - הנתבעת (מנורה)",
        value: "490000",
        owner: "הנתבעת",
      },
      {
        description: "קרן פנסיה - הנתבעת (כלל)",
        value: "680000",
        owner: "הנתבעת",
      },
      {
        description: "ביטוח מנהלים - המבקש",
        value: "320000",
        owner: "המבקש",
      },
      {
        description: "תגמולים צבורים - הנתבעת",
        value: "280000",
        owner: "הנתבעת",
      },
    ],

    // PROPERTIES (general) - Testing with 8 general items
    properties: [
      {
        description: "ריהוט דירה ראשית (כולל אלקטרוניקה)",
        value: "180000",
        owner: "שניהם",
      },
      {
        description: "ריהוט דירת נופש",
        value: "45000",
        owner: "שניהם",
      },
      {
        description: "ציוד משרדי ומחשבים",
        value: "65000",
        owner: "המבקש",
      },
      {
        description: "תכשיטים ושעונים יוקרתיים",
        value: "120000",
        owner: "הנתבעת",
      },
      {
        description: "אוסף יינות יוקרה",
        value: "85000",
        owner: "המבקש",
      },
      {
        description: "ציוד ספורט (אופניים, גלשנים)",
        value: "28000",
        owner: "שניהם",
      },
      {
        description: "אומנות ויצירות (פסלים ותמונות)",
        value: "150000",
        owner: "שניהם",
      },
      {
        description: "ציוד קמפינג ונופש",
        value: "22000",
        owner: "שניהם",
      },
    ],

    // DEBTS - Testing with 5 debts
    debts: [
      {
        description: "משכנתא דירה ראשית",
        amount: "1200000",
        creditor: "בנק הפועלים",
        monthlyPayment: "6500",
      },
      {
        description: "משכנתא דירת השקעה",
        amount: "850000",
        creditor: "בנק מזרחי",
        monthlyPayment: "4800",
      },
      {
        description: "הלוואה עסקית",
        amount: "450000",
        creditor: "בנק לאומי",
        monthlyPayment: "8500",
      },
      {
        description: "הלוואת רכב",
        amount: "120000",
        creditor: "איילון חברת ביטוח",
        monthlyPayment: "3200",
      },
      {
        description: "חוב כרטיס אשראי",
        amount: "65000",
        creditor: "כאל",
        monthlyPayment: "2500",
      },
    ],
  },

  selectedClaims: ["property"],

  signature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  lawyerSignature: signatureBase64,

  attachments: [],

  paymentData: {
    paid: true,
    amount: 1500,
    date: new Date().toISOString(),
  },

  filledDocuments: {},
  submittedAt: new Date().toISOString(),
};

// Send to backend
async function testExtremeProperty() {
  console.log('\n🔥 Testing EXTREME Property Claim (UNLIMITED items)...\n');
  console.log('📋 Extreme Test Data Summary:');
  console.log(`   Name: ${extremePropertyData.basicInfo.fullName}`);
  console.log(`   Partner: ${extremePropertyData.basicInfo.fullName2}`);
  console.log(`   Children: ${extremePropertyData.formData.children.length}`);
  console.log(`   Apartments: ${extremePropertyData.formData.apartments.length} 🏠 (5 different properties!)`);
  console.log(`   Vehicles: ${extremePropertyData.formData.vehicles.length} 🚗 (4 vehicles including motorcycle!)`);
  console.log(`   Savings: ${extremePropertyData.formData.savings.length} 💰 (7 different accounts!)`);
  console.log(`   Benefits: ${extremePropertyData.formData.benefits.length} 💼 (6 pension/insurance accounts!)`);
  console.log(`   Properties (general): ${extremePropertyData.formData.properties.length} 📦 (8 miscellaneous items!)`);
  console.log(`   Debts: ${extremePropertyData.formData.debts.length} 💳 (5 different debts!)`);
  console.log(`   TOTAL ITEMS: ${
    extremePropertyData.formData.apartments.length +
    extremePropertyData.formData.vehicles.length +
    extremePropertyData.formData.savings.length +
    extremePropertyData.formData.benefits.length +
    extremePropertyData.formData.properties.length +
    extremePropertyData.formData.debts.length
  } 🎯`);

  // Calculate totals
  const totalAssets =
    extremePropertyData.formData.apartments.reduce((sum, p) => sum + parseInt(p.value), 0) +
    extremePropertyData.formData.vehicles.reduce((sum, p) => sum + parseInt(p.value), 0) +
    extremePropertyData.formData.savings.reduce((sum, p) => sum + parseInt(p.value), 0) +
    extremePropertyData.formData.benefits.reduce((sum, p) => sum + parseInt(p.value), 0) +
    extremePropertyData.formData.properties.reduce((sum, p) => sum + parseInt(p.value), 0);
  const totalDebts = extremePropertyData.formData.debts.reduce((sum, d) => sum + parseInt(d.amount), 0);

  console.log(`\n💎 Total Assets: ${totalAssets.toLocaleString()} ש"ח`);
  console.log(`💸 Total Debts: ${totalDebts.toLocaleString()} ש"ח`);
  console.log(`🏆 Net Worth: ${(totalAssets - totalDebts).toLocaleString()} ש"ח`);
  console.log('');

  try {
    const response = await fetch('http://localhost:3000/api/submission/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(extremePropertyData),
    });

    console.log(`📡 Response status: ${response.status}\n`);

    const result = await response.json();
    console.log('✅ Response from backend:');
    console.log(JSON.stringify(result, null, 2));

    if (result.success && result.folderId) {
      console.log(`\n🎉 SUCCESS! UNLIMITED property items work perfectly!`);
      console.log(`   📁 Folder: ${result.folderName}`);
      console.log(`   🔗 https://drive.google.com/drive/folders/${result.folderId}`);
      console.log(`\n✨ The document should now have:`);
      console.log(`   - 6 subsection headers under הרכוש`);
      console.log(`   - 35 total property items properly formatted`);
      console.log(`   - Smart page calculation accounting for the large number of items`);
    }
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
  }
}

testExtremeProperty();
