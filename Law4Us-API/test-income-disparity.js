/**
 * Test Income Disparity Edge Case
 * Tests that when one party's income is 2x the other, a special remedy is added
 */

const fs = require('fs');
const path = require('path');

async function testIncomeDisparity() {
  console.log('\n💰 Testing Income Disparity Edge Case...\n');

  // Read the lawyer signature
  const signatureBuffer = fs.readFileSync(path.join(__dirname, '..', 'Signature.png'));
  const signatureBase64 = `data:image/png;base64,${signatureBuffer.toString('base64')}`;

  const createMockImage = () => {
    const base64 = "iVBORw0KGgoAAAANSUhEUgAAAiYAAALuCAIAAABuj461AAAADElEQVR4nGP4//8/AAX+Av7czFnnAAAAAElFTkSuQmCC";
    return Buffer.from(base64, "base64");
  };

  // Test Case 1: Significant Income Disparity (2.5x ratio)
  const testWithDisparity = {
    basicInfo: {
      fullName: "שרה לוי",
      idNumber: "123456789",
      address: "רחוב הרצל 10, תל אביב",
      phone: "050-1234567",
      email: "sarah.levi@example.com",
      birthDate: "1985-05-15",
      gender: "female",
      fullName2: "יוסי כהן",
      idNumber2: "987654321",
      address2: "רחוב הרצל 10, תל אביב",
      phone2: "052-9876543",
      email2: "yossi.cohen@example.com",
      birthDate2: "1983-08-20",
      gender2: "male",
      relationshipType: "married",
      weddingDay: "2010-06-15",
    },

    formData: {
      children: [
        {
          __id: "child-1",
          firstName: "נועה",
          lastName: "כהן",
          birthDate: "2012-03-10",
          idNumber: "111222333",
          address: "רחוב הרצל 10, תל אביב",
        },
      ],

      wereMarried: "yes",
      separationDate: "2024-09-01",

      // INCOME DISPARITY: Sarah earns 25,000, Yossi earns 10,000 (2.5x ratio)
      job1: {
        employer: "חברת הייטק גדולה בע\"מ",
        position: "מנהלת פיתוח",
        monthlySalary: "25000",
      },
      job2: {
        employer: "חנות ספרים",
        position: "מנהל סניף",
        monthlySalary: "10000",
      },

      apartments: [
        {
          description: "דירת מגורים - רח' הרצל 10, תל אביב",
          value: "2800000",
          owner: "שניהם",
        },
      ],

      vehicles: [
        {
          description: "רכב טויוטה קורולה (2020)",
          value: "95000",
          owner: "שניהם",
        },
      ],

      savings: [
        {
          description: "חשבון חיסכון משותף - בנק הפועלים",
          value: "150000",
          owner: "שניהם",
        },
      ],

      benefits: [
        {
          description: "קרן פנסיה - שרה",
          value: "450000",
          owner: "המבקש",
        },
        {
          description: "קרן פנסיה - יוסי",
          value: "180000",
          owner: "הנתבעת",
        },
      ],

      properties: [
        {
          description: "ריהוט ומוצרי חשמל",
          value: "80000",
          owner: "שניהם",
        },
      ],

      debts: [
        {
          description: "משכנתא",
          amount: "650000",
          creditor: "בנק מזרחי טפחות",
        },
      ],
    },

    selectedClaims: ['property'],
    signature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    lawyerSignature: signatureBase64,

    attachments: [
      {
        label: "א",
        description: "תלושי שכר - שרה לוי",
        images: [createMockImage()],
      },
      {
        label: "ב",
        description: "תלושי שכר - יוסי כהן",
        images: [createMockImage()],
      },
    ],
  };

  console.log('📋 Test Case 1: WITH Income Disparity (2.5x ratio)');
  console.log(`   Sarah's salary: 25,000 ₪`);
  console.log(`   Yossi's salary: 10,000 ₪`);
  console.log(`   Ratio: 2.5x (triggers special remedy)`);
  console.log('');

  try {
    const response1 = await fetch('http://localhost:3001/api/submission/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testWithDisparity),
    });

    const result1 = await response1.json();

    if (result1.success) {
      console.log(`✅ SUCCESS! Document uploaded to Google Drive`);
      console.log(`   Folder ID: ${result1.folderId}`);
      console.log(`   📄 Document should contain 9 remedies (including disparity remedy #2)`);
    } else {
      console.error(`❌ Failed: ${result1.message}`);
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Test Case 2: NO Income Disparity (1.5x ratio - below threshold)
  const testWithoutDisparity = {
    ...testWithDisparity,
    basicInfo: {
      ...testWithDisparity.basicInfo,
      fullName: "רחל אברהם",
      idNumber: "234567890",
      fullName2: "דוד אברהם",
      idNumber2: "876543210",
    },
    formData: {
      ...testWithDisparity.formData,
      // NO DISPARITY: Rachel earns 15,000, David earns 11,000 (1.36x ratio - below 2.0 threshold)
      job1: {
        employer: "חברת ייעוץ בע\"מ",
        position: "יועצת ניהול",
        monthlySalary: "15000",
      },
      job2: {
        employer: "משרד ממשלתי",
        position: "פקיד בכיר",
        monthlySalary: "11000",
      },
    },
  };

  console.log('📋 Test Case 2: WITHOUT Income Disparity (1.36x ratio)');
  console.log(`   Rachel's salary: 15,000 ₪`);
  console.log(`   David's salary: 11,000 ₪`);
  console.log(`   Ratio: 1.36x (below 2.0 threshold - no special remedy)`);
  console.log('');

  try {
    const response2 = await fetch('http://localhost:3001/api/submission/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testWithoutDisparity),
    });

    const result2 = await response2.json();

    if (result2.success) {
      console.log(`✅ SUCCESS! Document uploaded to Google Drive`);
      console.log(`   Folder ID: ${result2.folderId}`);
      console.log(`   📄 Document should contain 8 remedies (standard, no disparity remedy)`);
    } else {
      console.error(`❌ Failed: ${result2.message}`);
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }

  console.log('\n' + '='.repeat(80) + '\n');
  console.log('🎉 Testing complete! Check the generated documents in Google Drive:');
  console.log('   - Case 1 (Sarah/Yossi): Should have 9 remedies');
  console.log('   - Case 2 (Rachel/David): Should have 8 remedies');
  console.log('\nLook for remedy #2 in Case 1 about unequal property division due to income disparity.');
}

testIncomeDisparity();
