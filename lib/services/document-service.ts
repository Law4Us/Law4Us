/**
 * Document Generation Service
 * Handles Word document template filling and generation
 */

import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import fs from "fs";
import path from "path";
import { ClaimType, BasicInfo, FormData } from "../types";
import {
  transformToLegalLanguage,
  getClaimTypeInHebrew,
  TransformContext,
} from "./groq-service";
import { prepareFormattedData } from "./data-formatter";

export interface DocumentData {
  basicInfo: BasicInfo;
  formData: FormData;
  selectedClaims: ClaimType[];
}

/**
 * Get template path for a specific claim type
 */
function getTemplatePath(claimType: ClaimType): string {
  const templates: Record<ClaimType, string> = {
    property: "תביעת רכושית.docx",
    custody: "תביעת משמורת.docx",
    alimony: "תביעת מזונות.docx",
    divorce: "תביעת גירושין.docx",
    divorceAgreement: "הסכם גירושין.docx",
  };

  const filename = templates[claimType];
  return path.join(process.cwd(), "templates", filename);
}

/**
 * Check if template exists for a claim type
 */
export function templateExists(claimType: ClaimType): boolean {
  try {
    const templatePath = getTemplatePath(claimType);
    return fs.existsSync(templatePath);
  } catch {
    return false;
  }
}

/**
 * Identify which fields need AI transformation
 * These are typically long-text fields where users describe situations
 */
function getFieldsForAITransformation(
  claimType: ClaimType,
  formData: FormData
): Array<{ key: string; value: string; label: string }> {
  const fieldsToTransform: Array<{ key: string; value: string; label: string }> = [];

  // Common fields that benefit from AI transformation
  const textareaFields = [
    { key: "relationshipDescription", label: "תיאור מערכת היחסים" },
    { key: "separationReason", label: "סיבת הפרידה" },
    { key: "childRelationship", label: "מערכת היחסים עם הילדים" },
    { key: "propertyDescription", label: "תיאור הרכוש" },
    { key: "additionalInfo", label: "מידע נוסף" },
  ];

  // Claim-specific fields
  if (claimType === "property") {
    fieldsToTransform.push(
      ...textareaFields
        .filter(
          (f) =>
            formData[f.key] &&
            typeof formData[f.key] === "string" &&
            (formData[f.key] as string).length > 50
        )
        .map((f) => ({ ...f, value: formData[f.key] as string }))
    );
  }

  if (claimType === "custody") {
    fieldsToTransform.push(
      ...textareaFields
        .filter(
          (f) =>
            formData[f.key] &&
            typeof formData[f.key] === "string" &&
            (formData[f.key] as string).length > 50
        )
        .map((f) => ({ ...f, value: formData[f.key] as string }))
    );
  }

  // Add more claim-specific rules as needed

  return fieldsToTransform;
}

/**
 * Prepare document data by transforming user text to legal language
 */
async function prepareDocumentData(
  documentData: DocumentData,
  claimType: ClaimType
): Promise<Record<string, any>> {
  const { basicInfo, formData } = documentData;

  // Step 1: Format all data using data-formatter (matches Make.com output)
  const data = prepareFormattedData(basicInfo, formData);

  // Step 2: Add legacy field names for compatibility
  data.applicantFullName = basicInfo.fullName;
  data.applicantId = basicInfo.idNumber;
  data.applicantAddress = basicInfo.address;
  data.applicantPhone = basicInfo.phone;
  data.applicantEmail = basicInfo.email;
  data.applicantBirthDate = basicInfo.birthDate;

  data.respondentFullName = basicInfo.fullName2;
  data.respondentId = basicInfo.idNumber2;
  data.respondentAddress = basicInfo.address2;
  data.respondentPhone = basicInfo.phone2;
  data.respondentEmail = basicInfo.email2;
  data.respondentBirthDate = basicInfo.birthDate2;

  data.weddingDate = basicInfo.weddingDay;

  // Step 3: Identify fields that need AI transformation
  const fieldsToTransform = getFieldsForAITransformation(claimType, formData);

  // Step 4: Transform fields using Groq AI
  for (const field of fieldsToTransform) {
    try {
      const context: TransformContext = {
        claimType: getClaimTypeInHebrew(claimType),
        applicantName: basicInfo.fullName,
        respondentName: basicInfo.fullName2,
        fieldLabel: field.label,
      };

      const transformedText = await transformToLegalLanguage(
        field.value,
        context
      );

      // Store both original and transformed versions
      data[field.key] = transformedText;
      data[`${field.key}_original`] = field.value;

      console.log(`Transformed field: ${field.key}`);
    } catch (error) {
      console.error(`Error transforming field ${field.key}:`, error);
      // Keep original value if transformation fails
      data[field.key] = field.value;
    }
  }

  return data;
}

/**
 * Generate a filled document from template
 */
export async function generateDocument(
  documentData: DocumentData,
  claimType: ClaimType
): Promise<Buffer> {
  // Check if template exists
  const templatePath = getTemplatePath(claimType);

  if (!fs.existsSync(templatePath)) {
    throw new Error(
      `Template not found for claim type: ${claimType} at ${templatePath}`
    );
  }

  // Read the template file
  const content = fs.readFileSync(templatePath, "binary");

  // Create a PizZip instance with the template content
  const zip = new PizZip(content);

  // Create docxtemplater instance
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    // Handle null/undefined values gracefully
    nullGetter: () => "",
  });

  // Prepare data with AI transformations
  const preparedData = await prepareDocumentData(documentData, claimType);

  // Fill the template with data
  doc.render(preparedData);

  // Generate the output document
  const buffer = doc.getZip().generate({
    type: "nodebuffer",
    compression: "DEFLATE",
  });

  return buffer;
}

/**
 * Generate multiple documents for multiple claim types
 */
export async function generateMultipleDocuments(
  documentData: DocumentData
): Promise<Map<ClaimType, Buffer>> {
  const documents = new Map<ClaimType, Buffer>();

  for (const claimType of documentData.selectedClaims) {
    if (templateExists(claimType)) {
      try {
        const buffer = await generateDocument(documentData, claimType);
        documents.set(claimType, buffer);
        console.log(`Generated document for claim type: ${claimType}`);
      } catch (error) {
        console.error(`Error generating document for ${claimType}:`, error);
        // Continue with other documents even if one fails
      }
    } else {
      console.warn(`Template not found for claim type: ${claimType}`);
    }
  }

  return documents;
}

/**
 * Save document to temporary location
 * Returns file path
 */
export function saveDocumentToTemp(
  buffer: Buffer,
  filename: string
): string {
  const tempDir = path.join(process.cwd(), "tmp");

  // Create tmp directory if it doesn't exist
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const filePath = path.join(tempDir, filename);
  fs.writeFileSync(filePath, buffer);

  return filePath;
}
