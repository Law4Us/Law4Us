/**
 * Property Template Smoke Test
 * Generates the תביעת רכושית DOCX from the new template and saves it to /tmp.
 *
 * Run with:
 *    npx tsx tests/test-property-template.ts
 *
 * Requires GROQ_API_KEY (for text polishing) and Signature.png in project root.
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import type { BasicInfo, FormData } from "../lib/types";
import { generateDocument } from "../lib/services/document-service";

async function run() {
  const outputDir = path.join(process.cwd(), "tmp");
  fs.mkdirSync(outputDir, { recursive: true });

  const basicInfo: BasicInfo = {
    fullName: "בני בן",
    idNumber: "123456789",
    email: "benny@example.com",
    phone: "050-1234567",
    address: "רחוב הפרחים 5, תל אביב",
    birthDate: "1984-04-12",
    gender: "male",
    fullName2: "דנה בן",
    idNumber2: "987654321",
    email2: "dana@example.com",
    phone2: "050-9876543",
    address2: "רחוב הכרמל 8, תל אביב",
    birthDate2: "1985-09-20",
    gender2: "female",
    relationshipType: "married",
    weddingDay: "2010-06-15",
  };

  const formData: FormData = {
    children: [
      {
        firstName: "נועם",
        lastName: "בן",
        idNumber: "567890123",
        birthDate: "2014-03-14",
        address: "רחוב הפרחים 5, תל אביב",
      },
    ],
    apartments: [
      {
        description: "דירת מגורים – רחוב הפרחים 5, תל אביב",
        owner: "שניהם",
        purchaseDate: "2012",
      },
      {
        description: "דירת השקעה – רחוב הרימון 12, ראשון לציון",
        owner: "בני בן",
        purchaseDate: "2018",
      },
    ],
    vehicles: [
      { description: "מאזדה 3, 2019", owner: "בני בן", purchaseDate: "2019" },
      { description: "יונדאי טוסון, 2021", owner: "דנה בן", purchaseDate: "2021" },
    ],
    savings: [
      { amount: "150000", owner: "בני בן" },
      { amount: "220000", owner: "דנה בן" },
    ],
    benefits: [
      { amount: "320000", owner: "בני בן" },
      { amount: "280000", owner: "דנה בן" },
    ],
    debts: [
      {
        amount: "950000",
        owner: "שניהם",
        date: "2015-01-01",
        purpose: "משכנתא ראשית על דירת המגורים",
        appendix: "א",
      },
      {
        amount: "75000",
        owner: "בני בן",
        date: "2022-04-01",
        purpose: "הלוואה לרכישת רכב",
        appendix: "ב",
      },
    ],
    relationship:
      "הצדדים נישאו בשנת 2010 וניהלו משק בית משותף, כאשר התובעת נשאה בעיקר הנטל הכלכלי והטיפולי. במהלך השנים נרכשו נכסים משותפים משמעותיים.",
    livingTogether: "no",
    separationDate: "2023-11-01",
    courtProceedings: "no",
    husbandJobType: "selfEmployed",
    occupation: "יועץ פיננסי עצמאי",
    establishedDate: "2012",
    registeredOwner: "בני בן",
    grossSalary: "18000",
    remedies:
      "להורות על איזון מלא של מאסת הנכסים, לרבות חלוקה שוויונית של דירות, רכבים וחסכונות, וכן חיוב הנתבעת בהשבת משיכות יתר מחשבונות משותפים.",
  };

  const documentData = {
    basicInfo,
    formData,
    selectedClaims: ["property"] as const,
  };

  console.log("🧪 Generating תביעת רכושית.docx (template test)...");
  const buffer = await generateDocument(documentData as any, "property");
  const outputPath = path.join(
    outputDir,
    `property-template-test-${Date.now()}.docx`
  );
  fs.writeFileSync(outputPath, buffer);
  console.log("✅ Property template generated:", outputPath);
  console.log(`📏 File size: ${(buffer.length / 1024).toFixed(2)} KB`);
}

run().catch((err) => {
  console.error("❌ Property template test failed:", err);
  process.exit(1);
});
