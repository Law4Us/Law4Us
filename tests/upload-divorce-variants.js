/**
 * Upload multiple divorce variants to Google Drive via the submission API.
 * Requires the local server running (npm run dev) and .env.local with Drive creds.
 *
 * Run with:
 *   node tests/upload-divorce-variants.js
 */
require("dotenv").config({ path: ".env.local" });
const axios = require("axios");

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:3000";

const basicInfo = {
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
];

const commonDivorceFields = {
  whoWantsDivorceAndWhy:
    "המבקשת מבקשת גירושין בשל הפרדת חשבונות, הסתרת נכסים ופערים עמוקים באמון.",
  divorceReasons: "היעדר אמון מתמשך\nניהול סיכונים פיננסיים בלי שיתוף\nפערים חינוכיים",
  weddingCity: "תל אביב",
  religiousMarriage: "כן",
  religiousCouncil: "תל אביב",
};

const variants = [
  {
    name: "01-shalom-bayit-alt",
    title: "שלום בית ולחילופין גירושין",
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
        hadPreviousMediation: "כן",
        previousMediationDetails:
          "התקיים גישור בחודש 03/2023 בפני המגשרת עו\"ד רונית כהן, לא הושגו הסכמות.",
        marriageCounselingDetails:
          "טיפול זוגי 2022 במרכז המשפחה תל אביב, יועצת גב' מיכל לוי.",
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
    title: "גירושין בלבד",
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
    title: "גירושין + סעדים דחופים",
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
    title: "גירושין + הליכים תלויים",
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
        parallelCasesDetails:
          "תביעת משמורת פתוחה בבית משפט לענייני משפחה, תיק 12345-01-24.",
        religiousMarriage: "כן",
      },
    },
  },
  {
    name: "05-civil-marriage",
    title: "נישואין אזרחיים",
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
    title: "רכוש ללא ילדים",
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
      apartments: [
        {
          description: "דירת מגורים ברח' בר אילן 5, פתח תקווה",
          owner: "שניהם",
          purchaseDate: "2018",
        },
      ],
    },
  },
];

async function run() {
  for (const variant of variants) {
    const payload = {
      basicInfo,
      folderNameOverride: `${basicInfo.fullName} - ${variant.title}`,
      selectedClaims: ["divorce"],
      formData: variant.formData,
      signature:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      paymentData: { paid: true, date: new Date() },
      filledDocuments: {},
      submittedAt: new Date().toISOString(),
    };

    console.log(`\n🧪 Uploading variant: ${variant.name}`);
    try {
      const res = await axios.post(`${BASE_URL}/api/submission`, payload);
      console.log("✅ SUCCESS");
      console.log(`📁 Folder: ${res.data.folderName}`);
      console.log(`🔗 https://drive.google.com/drive/folders/${res.data.folderId}`);
    } catch (error) {
      console.error("❌ FAILED", error.response ? error.response.data : error.message);
    }
  }
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
