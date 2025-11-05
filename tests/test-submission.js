/**
 * Test submission script - sends realistic test data to the backend
 */

const fs = require('fs');
const path = require('path');

// Read the lawyer signature as a buffer and convert to proper base64
const signatureBuffer = fs.readFileSync(path.join(__dirname, '..', 'Signature.png'));
const signatureBase64 = `data:image/png;base64,${signatureBuffer.toString('base64')}`;

console.log(`📷 Loaded signature: ${signatureBuffer.length} bytes`);

const testData = {
  basicInfo: {
    fullName: "יוסי כהן",
    idNumber: "123456789",
    address: "רחוב הרצל 25, תל אביב",
    phone: "054-1234567",
    email: "yossi.cohen@example.com",
    birthDate: "1985-05-15",
    gender: "male", // התובע
    fullName2: "שרה לוי",
    idNumber2: "987654321",
    address2: "רחוב דיזנגוף 100, תל אביב",
    phone2: "052-9876543",
    email2: "sarah.levi@example.com",
    birthDate2: "1987-03-20",
    gender2: "female", // הנתבעת
    relationshipType: "married",
    weddingDay: "2010-06-15",
  },
  formData: {
    // Child custody information
    children: [
      {
        __id: "child-1",
        firstName: "נועה",
        lastName: "כהן",
        birthDate: "2012-08-10",
        idNumber: "123456789",
        address: "רחוב הרצל 25, תל אביב",
        nameOfParent: "שרה לוי",
      },
      {
        __id: "child-2",
        firstName: "תומר",
        lastName: "כהן",
        birthDate: "2015-12-05",
        idNumber: "987654321",
        address: "רחוב הרצל 25, תל אביב",
        nameOfParent: "שרה לוי",
      },
    ],
    // Divorce claim
    separationReason: "אנחנו חיים בנפרד כבר שנתיים. המערכת היחסים התפרקה בגלל חוסר תקשורת והבדלי דעות על חינוך הילדים.",
    relationshipDescription: "התחלנו יחד לפני 15 שנה. היו לנו שנים טובות אבל בשנתיים האחרונות כבר לא מדברים ולא חולקים אותן מטרות.",

    // Custody claim
    whoShouldHaveCustody: "המשמורת צריכה להיות אצלי כי אני הורה העיקרי שמטפל בילדים מאז הפרידה. הילדים יציבים איתי ואני יכול לספק להם סביבה טובה.",
    childRelationship: "יש לי קשר מאוד חזק עם הילדים. אני לוקח אותם לבית הספר כל בוקר ומבלה איתם כל אחר צהריים.",

    // Property claim
    wereMarried: "yes",
    separationDate: "2023-08-01",
    propertyDescription: "יש לנו דירה משותפת ברחוב הרצל 25 בתל אביב, שווי מוערך של 2.5 מיליון שקל. בנוסף חשבון חיסכון משותף עם כ-200,000 שקל.",
    job1: {
      monthlySalary: "13839",
    },
    job2: {
      monthlySalary: "15000",
    },
    properties: [
      {
        description: "דירת מגורים ברח' הרצל 25, תל אביב",
        value: "2500000",
        owner: "שניהם",
      },
      {
        description: "רכב טויוטה קורולה 2020",
        value: "85000",
        owner: "המבקש",
      },
      {
        description: "חשבון חיסכון משותף",
        value: "200000",
        owner: "שניהם",
      },
    ],

    // Alimony needs
    needs: [
      {
        __id: "need-1",
        type: "food",
        label: "מזון",
        amounts: {
          "child-1": 1500,
          "child-2": 1200,
        },
      },
      {
        __id: "need-2",
        type: "clothing",
        label: "ביגוד והנעלה",
        amounts: {
          "child-1": 800,
          "child-2": 600,
        },
      },
      {
        __id: "need-3",
        type: "education",
        label: "חינוך",
        amounts: {
          "child-1": 2000,
          "child-2": 1500,
        },
      },
    ],
  },
  selectedClaims: ["property"], // Testing property claim only
  signature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", // 1x1 transparent PNG

  // Lawyer signature with stamp
  lawyerSignature: signatureBase64,

  // Mock attachments (payslips, property documents, etc.)
  attachments: [
    {
      label: "א",
      description: "תלוש שכר - מרץ 2024",
      images: [
        Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAiYAAALuCAIAAABuj461AAAADElEQVR4nGP4//8/AAX+Av7czFnnAAAAAElFTkSuQmCC", "base64"),
      ],
    },
    {
      label: "ב",
      description: "תלוש שכר - פברואר 2024",
      images: [
        Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAiYAAALuCAIAAABuj461AAAADElEQVR4nGP4//8/AAX+Av7czFnnAAAAAElFTkSuQmCC", "base64"),
      ],
    },
    {
      label: "ג",
      description: "תלוש שכר - ינואר 2024",
      images: [
        Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAiYAAALuCAIAAABuj461AAAADElEQVR4nGP4//8/AAX+Av7czFnnAAAAAElFTkSuQmCC", "base64"),
      ],
    },
  ],

  paymentData: {
    paid: true,
    date: new Date(),
  },
  filledDocuments: {
    powerOfAttorney: "filled",
    form3: "filled",
  },
  submittedAt: new Date().toISOString(),
  source: "test-submission",
};

console.log("🧪 Sending test submission to backend...\n");
console.log("📋 Test Data:");
console.log(`   Name: ${testData.basicInfo.fullName}`);
console.log(`   Partner: ${testData.basicInfo.fullName2}`);
console.log(`   Children: ${testData.formData.children.length}`);
console.log(`   Claims: ${testData.selectedClaims.join(", ")}`);
console.log("");

fetch("http://localhost:3000/api/submission/submit", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(testData),
})
  .then((res) => {
    console.log(`📡 Response status: ${res.status}`);
    return res.json();
  })
  .then((data) => {
    console.log("\n✅ Response from backend:");
    console.log(JSON.stringify(data, null, 2));

    if (data.success) {
      console.log("\n🎉 SUCCESS! Check your Google Drive folder:");
      console.log(`   📁 Folder: ${data.folderName}`);
      console.log(`   🔗 https://drive.google.com/drive/folders/${data.folderId}`);
    }
  })
  .catch((error) => {
    console.error("\n❌ Error:", error.message);
  });
