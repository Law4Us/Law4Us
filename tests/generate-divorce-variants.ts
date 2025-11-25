/**
 * Generate multiple divorce-claim variants for manual QA
 * Run with: npx tsx tests/generate-divorce-variants.ts
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import fs from "fs";
import path from "path";
import { generateDivorceClaim } from "../lib/api/services/divorce-claim-generator";
import type { BasicInfo, FormData } from "../lib/types";

const baseInfo: BasicInfo = {
  fullName: "שרה כהן",
  idNumber: "123456789",
  email: "sara@example.com",
  phone: "050-1112233",
  address: "רחוב הרצל 10, תל אביב",
  birthDate: "1987-05-12",
  gender: "female",
  fullName2: "דניאל כהן",
  idNumber2: "987654321",
  phone2: "052-9988776",
  email2: "daniel@example.com",
  address2: "רחוב ביאליק 22, תל אביב",
  birthDate2: "1984-11-03",
  gender2: "male",
  relationshipType: "married",
  weddingDay: "2012-06-20",
};

const children = [
  {
    __id: "1",
    firstName: "נועם",
    lastName: "כהן",
    idNumber: "321654987",
    birthDate: "2014-04-18",
    address: "רחוב הרצל 10, תל אביב",
    nameOfParent: "דניאל כהן",
  },
  {
    __id: "2",
    firstName: "הילה",
    lastName: "כהן",
    idNumber: "321654988",
    birthDate: "2017-09-02",
    address: "רחוב הרצל 10, תל אביב",
    nameOfParent: "דניאל כהן",
  },
];

type Variant = {
  name: string;
  formData: FormData;
};

const commonDivorceFields = {
  whoWantsDivorceAndWhy: "המבקשת מבקשת גירושין בשל הפרדת חשבונות, הסתרת נכסים ופערים עמוקים באמון.",
  divorceReasons: "היעדר אמון מתמשך\nניהול סיכונים פיננסיים בלי שיתוף\nפערים חינוכיים",
  weddingCity: "תל אביב",
};

const variants: Variant[] = [
  {
    name: "01-shalom-bayit-alt",
    formData: {
      children,
      divorce: {
        ...commonDivorceFields,
        reconcileNow: "כן",
        wantDivorceNow: "לא",
        childrenDispute: "כן",
        needSupport: "כן",
        propertyDispute: "כן",
        urgentRelief: "לא",
        urgentReliefDetails: "",
        parallelCases: "לא",
        parallelCasesDetails: "",
        religiousMarriage: "כן",
        religiousCouncil: "תל אביב",
        hadPreviousMediation: "כן",
        previousMediationDetails: "התקיים גישור בחודש 03/2023 בפני המגשרת עו\"ד רונית כהן, לא הושגו הסכמות.",
        marriageCounselingDetails: "טיפול זוגי 2022-2022 במרכז המשפחה תל אביב.",
        ketubahAmount: "200 זוז כסף",
        ketubahRequest: "מבוקש תשלום מלוא הכתובה.",
        policeComplaints: "לא",
      },
      livingSeparately: "כן",
      separationDate: "2023-05-01",
    },
  },
  {
    name: "02-divorce-only",
    formData: {
      divorce: {
        ...commonDivorceFields,
        reconcileNow: "לא",
        wantDivorceNow: "כן",
        childrenDispute: "לא",
        needSupport: "לא",
        propertyDispute: "לא",
        urgentRelief: "לא",
        parallelCases: "לא",
        religiousMarriage: "כן",
      },
      livingSeparately: "כן",
      separationDate: "2024-01-15",
    },
  },
  {
    name: "03-urgent-relief",
    formData: {
      children,
      divorce: {
        ...commonDivorceFields,
        reconcileNow: "לא",
        wantDivorceNow: "כן",
        childrenDispute: "כן",
        needSupport: "כן",
        propertyDispute: "כן",
        urgentRelief: "כן",
        urgentReliefDetails: "מבוקש צו מניעה לעיקול כספים וצו משמורת זמנית.",
        parallelCases: "לא",
        religiousMarriage: "כן",
      },
    },
  },
  {
    name: "04-parallel-cases",
    formData: {
      children,
      divorce: {
        ...commonDivorceFields,
        reconcileNow: "לא",
        wantDivorceNow: "כן",
        childrenDispute: "כן",
        needSupport: "כן",
        propertyDispute: "לא",
        urgentRelief: "לא",
        parallelCases: "כן",
        parallelCasesDetails: "תביעת משמורת פתוחה בבית משפט לענייני משפחה, תיק 12345-01-24.",
        religiousMarriage: "כן",
      },
    },
  },
  {
    name: "05-civil-marriage",
    formData: {
      children,
      divorce: {
        ...commonDivorceFields,
        reconcileNow: "לא",
        wantDivorceNow: "כן",
        childrenDispute: "לא",
        needSupport: "כן",
        propertyDispute: "כן",
        urgentRelief: "לא",
        parallelCases: "לא",
        religiousMarriage: "לא",
      },
    },
  },
  {
    name: "06-property-no-children",
    formData: {
      divorce: {
        ...commonDivorceFields,
        reconcileNow: "לא",
        wantDivorceNow: "כן",
        childrenDispute: "לא",
        needSupport: "לא",
        propertyDispute: "כן",
        urgentRelief: "לא",
        parallelCases: "לא",
        religiousMarriage: "כן",
      },
      property: {
        hasAssets: "yes",
      },
      apartments: [{ description: "דירת מגורים ברח' בר אילן 5, פתח תקווה", owner: "שניהם", purchaseDate: "2018" }],
    },
  },
];

async function run() {
  const outDir = path.join(process.cwd(), "tmp", "divorce-variants");
  fs.mkdirSync(outDir, { recursive: true });

  for (const variant of variants) {
    const docData = {
      basicInfo: baseInfo,
      formData: variant.formData,
      selectedClaims: ["divorce"] as const,
    };

    console.log(`🧪 Generating ${variant.name}...`);
    const buffer = await generateDivorceClaim(docData as any);
    const filePath = path.join(outDir, `${variant.name}.docx`);
    fs.writeFileSync(filePath, buffer);
    console.log(`✅ Saved: ${filePath}`);
  }
}

run().catch((err) => {
  console.error("❌ Failed to generate variants:", err);
  process.exit(1);
});
