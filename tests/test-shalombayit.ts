/**
 * Shalom Bayit Claim Template Test
 * Generates תביעה לשלום בית with representative data.
 *
 * Run with:
 *    npx tsx tests/test-shalombayit.ts
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
    fullName: "אריק זמר",
    idNumber: "25193475",
    email: "arik@example.com",
    phone: "050-1234567",
    address: "רחוב הרצל 15, תל אביב",
    birthDate: "1980-05-12",
    gender: "male",
    fullName2: "יעל זמר",
    idNumber2: "0132442656",
    email2: "yael@example.com",
    phone2: "054-5442344",
    address2: "מאיר אריאל 4, דירה 7, כפר סבא",
    birthDate2: "1983-11-03",
    gender2: "female",
    relationshipType: "married",
    weddingDay: "2006-08-17",
  };

  const formData: FormData = {
    children: [
      {
        firstName: "גוני",
        lastName: "זמר",
        idNumber: "321654987",
        birthDate: "2011-01-28",
        address: "רחוב הרצל 15, תל אביב",
        nameOfParent: "יעל זמר",
        childRelationship: "קשר טוב עם שני ההורים",
        gender: "female",
      },
    ],
    relationship: "הצדדים התחתנו ב-2006 וניהלו חיים משותפים עד לאחרונה.",
    livingTogether: "no",
    livingSeparately: "כן",
    separationDate: "2012-06-01",
    courtProceedings: "no",
    shalomBayit: {
      marriageQuality: "good",
      crisisDuration: "months",
      crisisReasons: "האישה עזבה את הבית המשותף על דעת עצמה בלבד",
      livingArrangement: "separated",
      previousAttempts: "professional",
      counselingDetails: "הצדדים החלו טיפול זוגי אך האישה הקפיאה אותו לאחר מספר פגישות",
      partnerWillingness: "no",
      whatWouldHelp: "טיפול זוגי מקיף וייעוץ מקצועי",
      commitment: "full",
      additionalInfo: "האישה שכנעה את הבעל שהיא צריכה פסק זמן בלבד ולא עזיבה קבועה",
    },
  };

  const documentData = {
    basicInfo,
    formData,
    selectedClaims: ["shalomBayit" as const],
    claimType: "shalomBayit" as const,
  };

  console.log("🧪 Generating תביעה לשלום בית.docx (template test)...");
  const buffer = await generateDocument(documentData);
  const outputPath = path.join(
    outputDir,
    `shalombayit-test-${Date.now()}.docx`
  );
  fs.writeFileSync(outputPath, buffer);
  console.log("✅ Shalom Bayit claim generated:", outputPath);
  console.log(`📏 File size: ${(buffer.length / 1024).toFixed(2)} KB`);
}

run().catch((err) => {
  console.error("❌ Shalom Bayit test failed:", err);
  process.exit(1);
});
