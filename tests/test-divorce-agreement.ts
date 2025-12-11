/**
 * Divorce Agreement Template Test
 * Generates הסכם גירושין with proper legal structure.
 *
 * Run with:
 *    npx tsx tests/test-divorce-agreement.ts
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import type { BasicInfo, FormData } from "../lib/types";
import { generateDocument } from "../lib/api/services/document-generator";

async function run() {
  const outputDir = path.join(process.cwd(), "tmp");
  fs.mkdirSync(outputDir, { recursive: true });

  const basicInfo: BasicInfo = {
    fullName: "אודליה עמית גור",
    idNumber: "302235346",
    email: "odelia@example.com",
    phone: "050-1234567",
    address: "רחוב אביב 1, הוד השרון",
    birthDate: "1985-03-15",
    gender: "female",
    fullName2: "יובל צבי גור",
    idNumber2: "036020667",
    email2: "yuval@example.com",
    phone2: "052-7654321",
    address2: "רחוב אביב 1, הוד השרון",
    birthDate2: "1982-07-20",
    gender2: "male",
    relationshipType: "married",
    weddingDay: "2013-09-27",
  };

  const formData: FormData = {
    property: {
      children: [
        {
          firstName: "בר",
          lastName: "עמית גור",
          idNumber: "225327774",
          birthDate: "2017-02-23",
          address: "רחוב אביב 1, הוד השרון",
          nameOfParent: "יובל צבי גור",
          childRelationship: "קשר טוב עם שני ההורים.",
          gender: "male",
        },
      ],
    },
    divorceAgreement: {
      propertyAgreement: "equalSplit",
      custodyAgreement: "jointCustody",
      alimonyAgreement: "specificAmount",
      alimonyAmount: "2500",
    },
    relationship: "הצדדים נישאו ב-2013 וניהלו חיים משותפים עד לאחרונה.",
    livingTogether: "no",
    separationDate: "2024-08-21",
    courtProceedings: "no",
  };

  const documentData = {
    basicInfo,
    formData,
    selectedClaims: ["divorceAgreement" as const],
    claimType: "divorceAgreement" as const,
  };

  console.log("🧪 Generating הסכם גירושין.docx (proper legal format)...");
  const buffer = await generateDocument(documentData);
  const outputPath = path.join(
    outputDir,
    `divorce-agreement-test-${Date.now()}.docx`
  );
  fs.writeFileSync(outputPath, buffer);
  console.log("✅ Divorce agreement generated:", outputPath);
  console.log(`📏 File size: ${(buffer.length / 1024).toFixed(2)} KB`);
}

run().catch((err) => {
  console.error("❌ Divorce agreement test failed:", err);
  process.exit(1);
});
