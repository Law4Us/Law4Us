/**
 * Data Formatting Service
 * Formats complex data structures for document templates
 * Matches the output of Make.com iterators/aggregators
 */

import { FormData, BasicInfo } from "../types";

interface Child {
  firstName: string;
  lastName: string;
  idNumber: string;
  birthDate: string;
  address?: string;
  nameOfParent?: string;
  childRelationship?: string;
}

interface Property {
  purchaseDate: string;
  owner: string;
}

interface Financial {
  amount: string;
  owner: string;
  date?: string;
  purpose?: string;
  appendix?: string; // Reference to attached document (e.g., "א", "ב", "ג")
}

/**
 * Format children list for basic documents (property claims)
 * Matches Make.com: "• שם: {firstName} {lastName} ת״ז: {idNumber} ת״ל: {birthDate}"
 */
export function formatChildrenBasic(children: Child[]): string {
  if (!children || children.length === 0) return "";

  return children
    .map(
      (child) =>
        `• שם: ${child.firstName} ${child.lastName} ת״ז: ${child.idNumber} ת״ל: ${child.birthDate}`
    )
    .join("\n");
}

/**
 * Format children list for custody claims (detailed)
 * Matches Make.com complex iterator output
 */
export function formatChildrenDetailed(children: Child[]): string {
  if (!children || children.length === 0) return "";

  return children
    .map((child) => {
      let output = `• שם: ${child.firstName} ${child.lastName} ת״ז: ${child.idNumber} ת״ל: ${child.birthDate}`;

      if (child.address) {
        output += ` כתובת: ${child.address}`;
      }

      if (child.nameOfParent) {
        output += `\nשם ההורה שלא התובע: ${child.nameOfParent}`;
      }

      if (child.childRelationship) {
        output += `\nמערכת היחסים עם הילד: ${child.childRelationship}`;
      }

      return output;
    })
    .join("\n\n");
}

/**
 * Format apartments list
 * Matches Make.com: "נרכש ב: {purchaseDate} בעלים: {owner}"
 */
export function formatApartments(apartments: Property[]): string {
  if (!apartments || apartments.length === 0) return "";

  return apartments
    .map((apt) => `נרכש ב: ${apt.purchaseDate} בעלים: ${apt.owner}`)
    .join("\n");
}

/**
 * Format vehicles list
 * Matches Make.com: "נרכש ב: {purchaseDate} בעלים: {owner}"
 */
export function formatVehicles(vehicles: Property[]): string {
  if (!vehicles || vehicles.length === 0) return "";

  return vehicles
    .map((vehicle) => `נרכש ב: ${vehicle.purchaseDate} בעלים: ${vehicle.owner}`)
    .join("\n");
}

/**
 * Format savings list
 * Matches Make.com: "על סך: {amount} בעלים: {owner}"
 */
export function formatSavings(savings: Financial[]): string {
  if (!savings || savings.length === 0) return "";

  return savings
    .map((saving) => `על סך: ${saving.amount} בעלים: ${saving.owner}`)
    .join("\n");
}

/**
 * Format benefits list (pension, severance pay, etc.)
 * Matches Make.com: "על סך: {amount} בעלים: {owner}"
 */
export function formatBenefits(benefits: Financial[]): string {
  if (!benefits || benefits.length === 0) return "";

  return benefits
    .map((benefit) => `על סך: ${benefit.amount} בעלים: ${benefit.owner}`)
    .join("\n");
}

/**
 * Format debts list (detailed version with attachments)
 * Format: "על סך: {amount} בעלים: {owner} נלקח בתאריך {date} בשביל: {purpose}
 *          מצ״ב מסמך המשקף החוב כנספח {appendix}"
 */
export function formatDebts(debts: Financial[]): string {
  if (!debts || debts.length === 0) return "";

  return debts
    .map((debt) => {
      let output = `על סך: ${debt.amount} בעלים: ${debt.owner}`;

      if (debt.date) {
        output += ` נלקח בתאריך ${debt.date}`;
      }

      if (debt.purpose) {
        output += ` בשביל: ${debt.purpose}`;
      }

      if (debt.appendix) {
        output += `\nמצ״ב מסמך המשקף החוב כנספח ${debt.appendix}`;
      }

      return output;
    })
    .join("\n\n");
}

/**
 * Format selected claims as comma-separated list in Hebrew
 */
export function formatSelectedClaims(claims: string[]): string {
  const claimLabels: Record<string, string> = {
    divorceAgreement: "הסכם גירושין",
    divorce: "גירושין",
    property: "רכוש",
    custody: "משמורת",
    alimony: "מזונות",
  };

  return claims
    .map((claim) => claimLabels[claim] || claim)
    .join('","');
}

/**
 * Format other family cases
 */
export function formatOtherFamilyCases(cases: string[]): string {
  if (!cases || cases.length === 0) return "";
  return cases.join('","');
}

/**
 * Convert yes/no to Hebrew
 */
export function formatYesNo(value: string): string {
  return value === "yes" || value === "כן" ? "כן" : "לא";
}

/**
 * Main function to prepare all formatted data for documents
 * This consolidates all the formatting that Make.com does
 */
export function prepareFormattedData(
  basicInfo: BasicInfo,
  formData: FormData
): Record<string, any> {
  const formatted: Record<string, any> = {
    // Basic info
    fullName: basicInfo.fullName,
    idNumber: basicInfo.idNumber,
    address: basicInfo.address,
    phone: basicInfo.phone,
    email: basicInfo.email,
    birthDate: basicInfo.birthDate,

    fullName2: basicInfo.fullName2,
    idNumber2: basicInfo.idNumber2,
    address2: basicInfo.address2,
    phone2: basicInfo.phone2,
    email2: basicInfo.email2,
    birthDate2: basicInfo.birthDate2,

    weddingDay: basicInfo.weddingDay,
    relationshipType: basicInfo.relationshipType,

    // Current date
    date: new Date().toLocaleDateString("he-IL"),
    currentDate: new Date().toLocaleDateString("he-IL"),

    // Formatted arrays
    childrenList: formatChildrenBasic(formData.children || []),
    childrenListDetailed: formatChildrenDetailed(formData.children || []),
    apartmentsList: formatApartments((formData.apartments || []) as any),
    vehiclesList: formatVehicles((formData.vehicles || []) as any),
    savingsList: formatSavings((formData.savings || []) as any),
    benefitsList: formatBenefits((formData.benefits || []) as any),
    debtsList: formatDebts((formData.debts || []) as any),

    // Counts
    numberOfChildren: (formData.children || []).length,

    // Financial totals
    totalDebts: calculateTotalDebts((formData.debts || []) as any),
    totalSavings: calculateTotalSavings((formData.savings || []) as any),
    totalBenefits: calculateTotalBenefits((formData.benefits || []) as any),

    // Formatted totals
    totalDebtsFormatted: formatCurrency(
      calculateTotalDebts((formData.debts || []) as any)
    ),
    totalSavingsFormatted: formatCurrency(
      calculateTotalSavings((formData.savings || []) as any)
    ),
    totalBenefitsFormatted: formatCurrency(
      calculateTotalBenefits((formData.benefits || []) as any)
    ),

    // Other formatted fields
    otherFamilyCasesBlock: formatOtherFamilyCases(
      formData.otherFamilyCases || []
    ),

    // Yes/No conversions
    livingTogether: formatYesNo(formData.livingTogether || ""),
    courtProceedings: formatYesNo(formData.courtProceedings || ""),
    marriedBefore: formData.marriedBefore,
    marriedBefore2: formData.marriedBefore2,
    hadChildrenFromPrevious: formData.hadChildrenFromPrevious,
    hadChildrenFromPrevious2: formData.hadChildrenFromPrevious2,

    // Housing
    applicantHomeType: formData.applicantHomeType,
    partnerHomeType: formData.partnerHomeType,

    // Protection orders
    protectionOrderRequested: formData.protectionOrderRequested,
    protectionOrderDate: formData.protectionOrderRequested_כן_protectionOrderDate,
    protectionOrderAgainst:
      formData.protectionOrderRequested_כן_protectionOrderAgainst,
    protectionOrderCaseNumber:
      formData.protectionOrderRequested_כן_protectionOrderCaseNumber,
    protectionOrderJudge:
      formData.protectionOrderRequested_כן_protectionOrderJudge,
    protectionOrderGiven:
      formData.protectionOrderRequested_כן_protectionOrderGiven,
    protectionOrderGivenDate:
      formData.protectionOrderRequested_כן_protectionOrderGiven_כן_protectionOrderGivenDate,
    protectionOrderContent:
      formData.protectionOrderRequested_כן_protectionOrderGiven_כן_protectionOrderContent,

    // Violence reporting
    pastViolenceReported: formData.pastViolenceReported,
    pastViolenceReportedDetails:
      formData.pastViolenceReported_כן_pastViolenceReportedDetails,

    // Welfare and counseling
    contactedWelfare: formData.contactedWelfare,
    contactedMarriageCounseling: formData.contactedMarriageCounseling,
    willingToJoinFamilyCounseling: formData.willingToJoinFamilyCounseling,
    willingToJoinMediation: formData.willingToJoinMediation,

    // Employment (for property claims)
    husbandJobType:
      formData.husbandJobType === "selfEmployed" ? "עצמאי" : "שכיר",
    occupation: formData.employmentStatus_selfEmployed_occupation,
    establishedDate: formData.employmentStatus_selfEmployed_establishedDate,
    registeredOwner: formData.employmentStatus_selfEmployed_registeredOwner,

    // Separation
    separationDate: formData.livingTogether_no_separationDate,

    // Relationship description (will be AI-transformed)
    relationship: formData.relationshipDescription,
    relationshipDescription: formData.relationshipDescription,

    // Remedies requested
    remedies: formData.remedies,
  };

  // Add all other formData fields as-is
  Object.keys(formData).forEach((key) => {
    if (!(key in formatted)) {
      formatted[key] = formData[key];
    }
  });

  return formatted;
}

/**
 * Create the childrenBlock string that Make.com generates
 * This is a specially formatted string for the הרצאת פרטים template
 */
export function createChildrenBlock(children: Child[]): string {
  return formatChildrenBasic(children);
}

/**
 * Calculate total debts
 */
export function calculateTotalDebts(debts: Financial[]): number {
  if (!debts || debts.length === 0) return 0;

  return debts.reduce((total, debt) => {
    const amount = parseFloat(debt.amount.replace(/,/g, ""));
    return total + (isNaN(amount) ? 0 : amount);
  }, 0);
}

/**
 * Calculate total savings
 */
export function calculateTotalSavings(savings: Financial[]): number {
  if (!savings || savings.length === 0) return 0;

  return savings.reduce((total, saving) => {
    const amount = parseFloat(saving.amount.replace(/,/g, ""));
    return total + (isNaN(amount) ? 0 : amount);
  }, 0);
}

/**
 * Calculate total benefits
 */
export function calculateTotalBenefits(benefits: Financial[]): number {
  if (!benefits || benefits.length === 0) return 0;

  return benefits.reduce((total, benefit) => {
    const amount = parseFloat(benefit.amount.replace(/,/g, ""));
    return total + (isNaN(amount) ? 0 : amount);
  }, 0);
}

/**
 * Format currency in Israeli Shekels
 */
export function formatCurrency(amount: number): string {
  return amount.toLocaleString("he-IL");
}
