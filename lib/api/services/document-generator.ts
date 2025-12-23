/**
 * Main Document Generation Service
 * Orchestrates document generation with AI transformation and attachment insertion
 */

import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import fs from 'fs';
import path from 'path';
import { prepareFormattedData } from './data-formatter';
import {
  transformToLegalLanguage,
  getClaimTypeInHebrew,
  TransformContext,
} from './groq-service';
import { generatePropertyClaimDocument } from './property-claim-generator';
import { generateCustodyClaim } from './custody-claim-generator';
import { generateAlimonyClaim } from './alimony-claim-generator';
import { generateDivorceClaim } from './divorce-claim-generator';
import { generateDivorceAgreement } from './divorce-agreement-generator';
import { generateShalomBayitClaim } from './shalombayit-claim-generator';
import {
  ClaimType,
  BasicInfo,
  FormData,
  UploadedFile,
  ProcessedAttachment,
} from '@/lib/api/types';

export interface DocumentGenerationOptions {
  basicInfo: BasicInfo;
  formData: FormData;
  selectedClaims: ClaimType[];
  claimType: ClaimType;
  signature?: string; // base64 - client signature
  lawyerSignature?: string; // base64 - lawyer signature with stamp
  attachments?: Array<{
    label: string;
    description: string;
    images: Buffer[];
  }>;
}

/**
 * Get template path for a claim type
 * Note: Most claims are now programmatically generated, this is for legacy template support
 */
function getTemplatePath(claimType: ClaimType): string {
  // Use Partial since not all claim types have templates (most are programmatically generated)
  const templates: Partial<Record<ClaimType, string>> = {
    property: 'תביעת רכושית.docx',
    custody: 'תביעת משמורת.docx',
    alimony: 'תביעת מזונות.docx',
    divorceAgreement: 'הסכם גירושין.docx',
    shalomBayit: 'תביעת שלום בית.docx',        // Programmatically generated
    divorceRabbinical: 'תביעת גירושין רבני.docx', // Programmatically generated (בית הדין הרבני only)
  };

  const filename = templates[claimType] || `${claimType}.docx`;
  return path.join(process.cwd(), 'templates', filename);
}

/**
 * Check if template exists
 */
export function templateExists(claimType: ClaimType): boolean {
  // These claims are programmatically generated (no templates needed)
  const programmaticClaims: ClaimType[] = [
    'property',
    'custody',
    'alimony',
    'divorceAgreement',
    'shalomBayit',
    'divorceRabbinical', // Bundled divorce at בית הדין הרבני (only rabbinical - no family court)
  ];
  if (programmaticClaims.includes(claimType)) {
    return true;
  }

  // For other claim types, check if template file exists
  try {
    const templatePath = getTemplatePath(claimType);
    return fs.existsSync(templatePath);
  } catch {
    return false;
  }
}

/**
 * Identify fields that need AI transformation
 */
function getFieldsForAITransformation(
  claimType: ClaimType,
  formData: FormData
): Array<{ key: string; value: string; label: string }> {
  const fieldsToTransform: Array<{ key: string; value: string; label: string }> = [];

  const textareaFields = [
    { key: 'relationshipDescription', label: 'תיאור מערכת היחסים' },
    { key: 'separationReason', label: 'סיבת הפרידה' },
    { key: 'childRelationship', label: 'מערכת היחסים עם הילדים' },
    { key: 'propertyDescription', label: 'תיאור הרכוש' },
    { key: 'additionalInfo', label: 'מידע נוסף' },
    { key: 'remedies', label: 'סעדים מבוקשים' },
  ];

  fieldsToTransform.push(
    ...textareaFields.filter(
      (f) =>
        formData[f.key] &&
        typeof formData[f.key] === 'string' &&
        (formData[f.key] as string).length > 50
    ).map(f => ({ ...f, value: formData[f.key] as string })) // Add value property
  );

  return fieldsToTransform.map((f) => ({
    key: f.key,
    value: formData[f.key] as string,
    label: f.label,
  }));
}

/**
 * Prepare document data with AI transformation
 */
async function prepareDocumentData(
  options: DocumentGenerationOptions
): Promise<Record<string, any>> {
  const { basicInfo, formData, claimType } = options;

  console.log('\n📊 Preparing document data...');

  // Step 1: Format all data
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

  // Step 3: Identify fields for AI transformation
  const fieldsToTransform = getFieldsForAITransformation(claimType, formData);

  console.log(`🤖 Transforming ${fieldsToTransform.length} fields with AI...`);

  // Step 4: Transform with Groq AI
  for (const field of fieldsToTransform) {
    try {
      const context: TransformContext = {
        claimType: getClaimTypeInHebrew(claimType),
        applicantName: basicInfo.fullName,
        respondentName: basicInfo.fullName2,
        fieldLabel: field.label,
      };

      const transformedText = await transformToLegalLanguage(field.value, context);

      data[field.key] = transformedText;
      data[`${field.key}_original`] = field.value;

      console.log(`  ✅ ${field.label}`);
    } catch (error) {
      console.error(`  ❌ Error transforming ${field.key}:`, error);
      data[field.key] = field.value;
    }
  }

  return data;
}

/**
 * Generate document from template with data
 */
async function fillTemplate(
  claimType: ClaimType,
  data: Record<string, any>
): Promise<Buffer> {
  console.log('\n📝 Filling document template...');

  const templatePath = getTemplatePath(claimType);

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }

  // Read template
  const content = fs.readFileSync(templatePath, 'binary');
  const zip = new PizZip(content);

  // Create docxtemplater instance
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    nullGetter: () => '',
    delimiters: {
      start: '{{',
      end: '}}',
    },
  });

  // Fill template
  doc.render(data);

  // Generate buffer
  const buffer = doc.getZip().generate({
    type: 'nodebuffer',
    compression: 'DEFLATE',
  });

  console.log('✅ Template filled successfully');
  return buffer;
}

/**
 * Main document generation function
 * Combines template filling, AI transformation, and attachment insertion
 */
export async function generateDocument(
  options: DocumentGenerationOptions
): Promise<Buffer> {
  const { claimType, attachments, basicInfo, formData } = options;

  console.log('\n' + '='.repeat(80));
  console.log(`🚀 GENERATING DOCUMENT: ${getClaimTypeInHebrew(claimType)}`);
  console.log('='.repeat(80));

  try {
    let documentBuffer: Buffer;

    // Use programmatic generator for property, custody, and alimony claims (better quality, no placeholders)
    if (claimType === 'property') {
      console.log('📝 Using programmatic generator (no LLM needed)...');
      documentBuffer = await generatePropertyClaimDocument({
        basicInfo,
        formData,
        signature: options.signature,
        lawyerSignature: options.lawyerSignature,
        attachments: options.attachments,
      });
    } else if (claimType === 'custody') {
      console.log('📝 Using programmatic generator (no LLM needed)...');
      documentBuffer = await generateCustodyClaim({
        basicInfo,
        formData,
        signature: options.signature,
        lawyerSignature: options.lawyerSignature,
        attachments: options.attachments,
      });
    } else if (claimType === 'alimony') {
      console.log('📝 Using programmatic generator with Form 4 PDF integration...');
      const document = await generateAlimonyClaim({
        basicInfo,
        formData,
        signature: options.signature,
        lawyerSignature: options.lawyerSignature,
        attachments: options.attachments,
      });

      // Convert docx Document object to buffer
      const { Packer } = await import('docx');
      documentBuffer = await Packer.toBuffer(document);
    } else if (claimType === 'divorceAgreement') {
      console.log('📝 Using compact programmatic generator for divorce agreement...');
      documentBuffer = await generateDivorceAgreement({
        basicInfo,
        formData,
        applicantSignature: options.signature,
        respondentSignature: undefined, // Will be added in future if needed
        lawyerSignature: options.lawyerSignature,
        attachments: options.attachments,
        selectedClaims: options.selectedClaims, // Pass to enable smart referencing
      });
    } else if (claimType === 'shalomBayit') {
      console.log('📝 Using Shalom Bayit generator for Rabbinical Court...');
      documentBuffer = await generateShalomBayitClaim({
        basicInfo,
        formData,
        signature: options.signature,
        lawyerSignature: options.lawyerSignature,
        selectedClaims: options.selectedClaims,
      });
    } else if (claimType === 'divorceRabbinical') {
      // Rabbinical bundled divorce - תביעת גירושין כרוכה בבית הדין הרבני
      console.log('📝 Using Rabbinical Court bundled divorce generator...');
      documentBuffer = await generateDivorceClaim({
        basicInfo,
        formData,
        signature: options.signature,
        lawyerSignature: options.lawyerSignature,
        attachments: options.attachments,
        selectedClaims: options.selectedClaims,
      });
    } else {
      // Step 1: Prepare data with AI transformation
      const data = await prepareDocumentData(options);

      // Step 2: Fill template with data
      documentBuffer = await fillTemplate(claimType, data);
    }

    // Note: Attachments are handled by individual generators using generateAttachmentsSection()
    // No need to call insertAttachmentPages() here - it was causing duplicate attachments

    console.log('\n' + '='.repeat(80));
    console.log('✅ DOCUMENT GENERATION COMPLETE');
    console.log('='.repeat(80) + '\n');

    return documentBuffer;
  } catch (error) {
    console.error('\n❌ DOCUMENT GENERATION FAILED:', error);
    throw error;
  }
}

/**
 * Generate multiple documents for all selected claims
 */
export async function generateMultipleDocuments(
  options: Omit<DocumentGenerationOptions, 'claimType'>
): Promise<Map<ClaimType, Buffer>> {
  const { selectedClaims } = options;
  const documents = new Map<ClaimType, Buffer>();

  console.log(`\n📚 Generating ${selectedClaims.length} documents...`);

  for (const claimType of selectedClaims) {
    if (templateExists(claimType)) {
      try {
        const buffer = await generateDocument({
          ...options,
          claimType,
        });
        documents.set(claimType, buffer);
      } catch (error) {
        console.error(`Failed to generate ${claimType}:`, error);
      }
    } else {
      console.warn(`Template not found for: ${claimType}`);
    }
  }

  return documents;
}

/**
 * Save generated document to output directory
 */
export function saveDocument(
  buffer: Buffer,
  filename: string
): string {
  const outputDir = path.join(process.cwd(), 'output');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filePath = path.join(outputDir, filename);
  fs.writeFileSync(filePath, buffer);

  console.log(`💾 Document saved: ${filePath}`);
  return filePath;
}
