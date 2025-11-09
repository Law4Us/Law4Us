/**
 * Divorce Template Smoke Test
 * Generates the תביעת גירושין docx with representative data.
 *
 * Run with:
 *    npx tsx tests/test-divorce-template.ts
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
    fullName: "שרה כהן",
    idNumber: "123456789",
    email: "sara@example.com",
    phone: "050-1112233",
    address: "רחוב הרצל 10, תל אביב",
    birthDate: "1987-05-12",
    gender: "female",
    fullName2: "דניאל כהן",
    idNumber2: "987654321",
    email2: "daniel@example.com",
    phone2: "052-9988776",
    address2: "רחוב ביאליק 22, תל אביב",
    birthDate2: "1984-11-03",
    gender2: "male",
    relationshipType: "married",
    weddingDay: "2012-06-20",
  };

  const formData: FormData = {
    children: [
      {
        firstName: "נועם",
        lastName: "כהן",
        idNumber: "321654987",
        birthDate: "2014-04-18",
        address: "רחוב הרצל 10, תל אביב",
        nameOfParent: "דניאל כהן",
        childRelationship: "התובעת היא ההורה הדומיננטי בכל התחומים.",
      },
      {
        firstName: "הילה",
        lastName: "כהן",
        idNumber: "321654988",
        birthDate: "2017-09-02",
        address: "רחוב הרצל 10, תל אביב",
        nameOfParent: "דניאל כהן",
        childRelationship: "הילדה צמודה לאמה וניזונה משגרה שהיא זו שמנהלת.",
      },
    ],
    apartments: [
      { description: "דירת מגורים רח' הרצל 10, תל אביב", owner: "שניהם", purchaseDate: "2013" },
    ],
    vehicles: [{ description: "קיה ספורטאז' 2020", owner: "דניאל כהן", purchaseDate: "2020" }],
    savings: [{ amount: "180000", owner: "שניהם" }],
    benefits: [{ amount: "250000", owner: "שרה כהן" }],
    debts: [
      {
        amount: "900000",
        owner: "שניהם",
        date: "2013-08-01",
        purpose: "משכנתא",
        appendix: "א",
      },
    ],
    relationship: "הצדדים התחתנו ב-2012, ניהלו חיים משותפים עד 2023, ונפרדו בעקבות הסלמה בעימותים כלכליים.",
    livingTogether: "no",
    separationDate: "2023-05-01",
    courtProceedings: "no",
    husbandJobType: "employee",
    occupation: "מנהלת מוצר בחברת טכנולוגיה",
    establishedDate: "",
    registeredOwner: "",
    grossSalary: "23000",
    remedies:
      "לאזן את כלל הזכויות, להורות על חלוקת הדירה לטובת המבקשת, ולהבטיח מזונות בהתאם לצרכי הקטינים.",
    divorce: {
      relationshipDescription:
        "הנישואין התאפיינו בחוסר יציבות והיעדר שיתוף פעולה פיננסי מצד המשיב.",
      whoWantsDivorceAndWhy:
        "המבקשת מבקשת גירושין בשל הפרדת חשבונות, הסתרת נכסים ופערים עמוקים באמון.",
      weddingCity: "תל אביב",
      religiousMarriage: "כן",
      religiousCouncil: "תל אביב",
      policeComplaints: "לא",
      policeComplaintsWho: "",
      policeComplaintsWhere: "",
      policeComplaintsDate: "",
      policeComplaintsOutcome: "",
      divorceReasons: "היעדר אמון מתמשך\nניהול סיכונים פיננסיים בלי שיתוף\nפערים חינוכיים",
      divorceProofsDescription: "דו\"חות בנקאי, תיעוד טיפול משפחתי.",
    },
  };

  const documentData = {
    basicInfo,
    formData,
    selectedClaims: ["divorce" as const],
    claimType: "divorce" as const,
  };

  console.log("🧪 Generating תביעת גירושין.docx (template test)...");
  const buffer = await generateDocument(documentData as any, "divorce");
  const outputPath = path.join(
    outputDir,
    `divorce-template-test-${Date.now()}.docx`
  );
  fs.writeFileSync(outputPath, buffer);
  console.log("✅ Divorce template generated:", outputPath);
  console.log(`📏 File size: ${(buffer.length / 1024).toFixed(2)} KB`);
}

run().catch((err) => {
  console.error("❌ Divorce template test failed:", err);
  process.exit(1);
});
