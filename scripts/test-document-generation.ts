/**
 * Test script for document generation
 * Run with: npx tsx scripts/test-document-generation.ts
 */

import { generateDocument } from "../lib/services/document-service";
import fs from "fs";
import path from "path";

// Sample test data
const testData = {
  basicInfo: {
    fullName: "יוסי כהן",
    idNumber: "123456789",
    address: "רחוב הרצל 10, תל אביב",
    phone: "050-1234567",
    email: "yossi@example.com",
    birthDate: "01/01/1980",

    fullName2: "שרה לוי",
    idNumber2: "987654321",
    address2: "רחוב דיזנגוף 20, תל אביב",
    phone2: "052-7654321",
    email2: "sara@example.com",
    birthDate2: "02/02/1982",

    relationshipType: "married" as const,
    weddingDay: "15/06/2005",
  },
  formData: {
    // Property claim specific data
    propertyDescription: `אני ובעלי רכשנו דירה משותפת בשנת 2010. הדירה נמצאת ברחוב הרצל 10 בתל אביב.
שילמנו על הדירה ביחד מהחיסכון המשותף שלנו. לדירה יש משכנתא שאנחנו משלמים עליה ביחד כל חודש.
בנוסף, יש לנו שני רכבים - אחד על שמי ואחד על שמו. הרכב שלי הוא טויוטה קורולה משנת 2018 והרכב שלו הוא הונדה סיוויק משנת 2019.`,

    relationshipDescription: `התחלנו את מערכת היחסים בשנת 2003 והתחתנו בשנת 2005. בתחילת הנישואים הכל היה טוב,
אבל בשנים האחרונות היחסים התדרדרו. יש הרבה ויכוחים על כסף ועל חלוקת התפקידים בבית.`,

    separationReason: `הסיבה העיקרית לפרידה היא חוסר תקשורת. בעלי לא מסוגל לדבר איתי על דברים חשובים
ותמיד נמנע משיחות. בנוסף, הוא מבלה הרבה זמן בעבודה ולא מקדיש זמן למשפחה. ניסינו ללכת לייעוץ זוגי
אבל זה לא עזר כי הוא לא באמת השתתף בתהליך.`,

    // Property specific fields
    "property.hasSharedProperty": "כן",
    "property.propertyRegime": "community",
    "property.hasApartment": "כן",
    "property.apartmentValue": "2500000",
    "property.apartmentMortgage": "800000",
    "property.whoWantsApartment": "applicant",
    "property.hasCars": "כן",
    "property.hasPensions": "כן",
    "property.hasDebts": "לא",
    "property.additionalAssets": "יש לנו גם תכשיטים ששווים כ-50,000 ש\"ח",
  },
  selectedClaims: ["property" as const],
};

async function testDocumentGeneration() {
  console.log("🧪 Starting document generation test...\n");

  try {
    // Check if .env.local exists and has GROQ_API_KEY
    const envPath = path.join(process.cwd(), ".env.local");
    if (!fs.existsSync(envPath)) {
      console.error(
        "❌ Error: .env.local file not found. Please create it with GROQ_API_KEY"
      );
      process.exit(1);
    }

    // Load environment variables
    require("dotenv").config({ path: envPath });

    if (!process.env.GROQ_API_KEY) {
      console.error(
        "❌ Error: GROQ_API_KEY not found in .env.local\n" +
          "   Please add: GROQ_API_KEY=your_api_key_here"
      );
      process.exit(1);
    }

    console.log("✅ Environment variables loaded");
    console.log("✅ GROQ_API_KEY configured\n");

    console.log("📝 Test data:");
    console.log(`   Applicant: ${testData.basicInfo.fullName}`);
    console.log(`   Respondent: ${testData.basicInfo.fullName2}`);
    console.log(`   Claim type: ${testData.selectedClaims.join(", ")}\n`);

    console.log("🔄 Generating document with AI transformation...\n");

    const buffer = await generateDocument(testData, "property");

    // Save to output directory
    const outputDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `test_property_claim_${timestamp}.docx`;
    const outputPath = path.join(outputDir, filename);

    fs.writeFileSync(outputPath, buffer);

    console.log("✅ Document generated successfully!");
    console.log(`📄 Output file: ${outputPath}`);
    console.log(`📊 File size: ${(buffer.length / 1024).toFixed(2)} KB\n`);

    console.log("🎉 Test completed successfully!");
    console.log(
      "\nYou can now open the generated document and verify that:"
    );
    console.log("1. User data was filled correctly");
    console.log(
      "2. Long-text fields were transformed to legal language (third person)"
    );
    console.log("3. All placeholders were replaced\n");
  } catch (error) {
    console.error("❌ Test failed:", error);
    if (error instanceof Error) {
      console.error("   Message:", error.message);
      console.error("   Stack:", error.stack);
    }
    process.exit(1);
  }
}

// Run the test
testDocumentGeneration();
