/**
 * File conversion utilities for handling file uploads
 * Supports both legacy File objects (converted to base64) and
 * BlobFile objects (from Vercel Blob, passed through as-is)
 */

import { compressImage, isCompressibleImage } from './image-compression';

/**
 * BlobFile type from FileUploadBlob component
 */
export interface BlobFile {
  url: string;
  pathname: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

/**
 * Check if a value is a BlobFile (uploaded to Vercel Blob)
 */
function isBlobFile(value: unknown): value is BlobFile {
  return (
    typeof value === 'object' &&
    value !== null &&
    'url' in value &&
    'fileName' in value &&
    'mimeType' in value &&
    typeof (value as any).url === 'string' &&
    (value as any).url.includes('blob.vercel-storage.com')
  );
}

const MIME_EXTENSION_MAP: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
};

function ensureExtension(name: string, extension: string) {
  const normalized = extension.replace(/^\./, '').toLowerCase();
  if (!normalized) {
    return name;
  }
  return name.toLowerCase().endsWith(`.${normalized}`) ? name : `${name}.${normalized}`;
}

/**
 * Parsed file source - can be either a data URL (base64) or a blob URL
 */
interface ParsedFileSource {
  dataUrl?: string;      // For base64 data URLs
  blobUrl?: string;      // For Vercel Blob URLs
  mimeType: string;
  name: string;
  isBlob: boolean;
}

function parseFileSource(
  input: any,
  fallbackName: string,
  fallbackMime: string = 'application/octet-stream'
): ParsedFileSource | null {
  if (!input) return null;

  // Handle BlobFile objects (from Vercel Blob)
  if (isBlobFile(input)) {
    const extension =
      MIME_EXTENSION_MAP[input.mimeType] || input.mimeType.split('/')[1] || 'bin';
    return {
      blobUrl: input.url,
      mimeType: input.mimeType,
      name: ensureExtension(input.fileName.replace(/\.[^./\\]+$/, ''), extension),
      isBlob: true,
    };
  }

  let dataUrl: string | null = null;
  let inferredMime: string | undefined;
  let explicitName: string | undefined =
    typeof input === 'object' && input !== null
      ? input.fileName || input.name
      : undefined;

  if (typeof input === 'string') {
    dataUrl = input;
  } else if (typeof input === 'object') {
    if (typeof input.content === 'string') {
      dataUrl = input.content;
    } else if (typeof input.data === 'string') {
      dataUrl = input.data;
    } else if (typeof input.file === 'string') {
      dataUrl = input.file;
    } else if (typeof input.base64 === 'string') {
      dataUrl = input.base64;
    }
    inferredMime = input.mimeType || input.type;
  }

  if (!dataUrl) return null;

  const dataUrlMatch = /^data:([^;,]+)(?:;[^,]*)?,/.exec(dataUrl);
  if (dataUrlMatch) {
    inferredMime = inferredMime || dataUrlMatch[1];
  } else if (!dataUrl.startsWith('data:')) {
    const mime = inferredMime || fallbackMime;
    dataUrl = `data:${mime};base64,${dataUrl}`;
    inferredMime = mime;
  }

  const mimeType = inferredMime || fallbackMime;
  const extension =
    MIME_EXTENSION_MAP[mimeType] || mimeType.split('/')[1] || 'bin';

  const rawName =
    explicitName && explicitName.trim().length > 0
      ? explicitName.trim()
      : fallbackName;
  const baseName = rawName.replace(/\.[^./\\]+$/, '');

  return {
    dataUrl,
    mimeType,
    name: ensureExtension(baseName, extension),
    isBlob: false,
  };
}

/**
 * Convert a File object to base64 string
 * Images are automatically compressed before conversion
 */
export async function fileToBase64(file: File): Promise<string> {
  // Compress images before converting to base64
  let processedFile = file;
  if (isCompressibleImage(file)) {
    try {
      processedFile = await compressImage(file);
    } catch (error) {
      console.warn(`Failed to compress ${file.name}, using original:`, error);
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(processedFile);
  });
}

/**
 * Convert File or File[] to base64 format
 */
export async function convertFileField(
  value: File | File[] | null | undefined
): Promise<string | string[] | null> {
  if (!value) return null;

  if (Array.isArray(value)) {
    return Promise.all(value.map((file) => fileToBase64(file)));
  }

  return fileToBase64(value);
}

/**
 * Recursively process all file objects in formData
 * - BlobFile objects are passed through as-is (already uploaded to Vercel Blob)
 * - Legacy File objects are converted to base64 (for backwards compatibility)
 */
export async function convertFormDataFiles(formData: any): Promise<any> {
  if (!formData || typeof formData !== 'object') {
    return formData;
  }

  const converted: any = Array.isArray(formData) ? [] : {};
  let blobCount = 0;
  let fileCount = 0;

  for (const key in formData) {
    const value = formData[key];

    // Check if value is a BlobFile (already uploaded to Vercel Blob)
    if (isBlobFile(value)) {
      console.log(`☁️ BlobFile: ${key} -> ${value.fileName} (${value.url})`);
      converted[key] = value; // Pass through as-is
      blobCount++;
    }
    // Check if value is an array of BlobFiles
    else if (Array.isArray(value) && value.length > 0 && isBlobFile(value[0])) {
      console.log(`☁️ BlobFile array: ${key} -> ${value.length} files`);
      converted[key] = value; // Pass through as-is
      blobCount += value.length;
    }
    // Check if value is a File object (legacy path)
    else if (value instanceof File) {
      console.log(`📎 Converting File: ${key} -> ${value.name} (${value.size} bytes, ${value.type})`);
      converted[key] = await fileToBase64(value);
      fileCount++;
    }
    // Check if value is an array of Files (legacy path)
    else if (Array.isArray(value) && value.length > 0 && value[0] instanceof File) {
      console.log(`📎 Converting File array: ${key} -> ${value.length} files`);
      converted[key] = await Promise.all(value.map((file) => fileToBase64(file)));
      fileCount += value.length;
    }
    // Recursively handle nested objects
    else if (value && typeof value === 'object' && !(value instanceof Date)) {
      converted[key] = await convertFormDataFiles(value);
    }
    // Copy primitive values
    else {
      converted[key] = value;
    }
  }

  if (blobCount > 0) {
    console.log(`☁️ Passed through ${blobCount} BlobFile(s)`);
  }
  if (fileCount > 0) {
    console.log(`✅ Converted ${fileCount} File(s) to base64`);
  }

  return converted;
}

/**
 * Attachment format for document generation
 * Supports both base64 data URLs and Vercel Blob URLs
 */
export interface ExtractedAttachment {
  label: string;
  description: string;
  file?: string;       // base64 data URL (legacy)
  blobUrl?: string;    // Vercel Blob URL (new)
  name: string;
  mimeType: string;
  isBlob: boolean;
}

/**
 * Extract attachment files from formData and prepare them for document generation
 * Returns array in format expected by document generator
 * Supports both base64 data URLs and Vercel Blob URLs
 */
export function extractAttachmentsFromFormData(formData: any): ExtractedAttachment[] {
  console.log('🔍 Extracting attachments from formData...');
  console.log('📊 FormData keys:', Object.keys(formData));

  const attachments: ExtractedAttachment[] = [];

  // Property section attachments
  if (formData.property) {
    const property = formData.property;
    console.log('📊 Property keys:', Object.keys(property));

    // Helper to create attachment from parsed file source
    const createAttachment = (
      meta: ParsedFileSource,
      label: string,
      description: string
    ): ExtractedAttachment => ({
      label,
      description,
      file: meta.isBlob ? undefined : meta.dataUrl,
      blobUrl: meta.isBlob ? meta.blobUrl : undefined,
      name: meta.name,
      mimeType: meta.mimeType,
      isBlob: meta.isBlob,
    });

    const pushProofAttachments = (
      collection: any[] | undefined,
      options: { fallbackName: string; labelPrefix: string }
    ) => {
      if (!Array.isArray(collection)) {
        return;
      }

      collection.forEach((item, index) => {
        const proofSource = item?.proof || item?.attachment || item?.file;
        if (!proofSource) {
          return;
        }

        const meta = parseFileSource(
          proofSource,
          `${options.fallbackName}-${index + 1}`,
          'application/pdf'
        );

        if (!meta) {
          return;
        }

        const fallbackDescription = `${options.labelPrefix} ${index + 1}`;
        const description =
          typeof item?.description === 'string' && item.description.trim().length > 0
            ? item.description.trim()
            : fallbackDescription;

        const label =
          description === fallbackDescription
            ? description
            : `${options.labelPrefix} - ${description}`;

        attachments.push(createAttachment(meta, label, description));
      });
    };

    // Applicant pay slips
    if (property.applicantPaySlips && Array.isArray(property.applicantPaySlips)) {
      console.log(`📎 Found applicantPaySlips: ${property.applicantPaySlips.length} items`);
      property.applicantPaySlips.forEach((fileData: any, index: number) => {
        const meta = parseFileSource(
          fileData,
          `payslip-applicant-${index + 1}`,
          'application/pdf'
        );
        if (meta) {
          console.log(`  ✓ Adding applicant pay slip ${index + 1} (${meta.mimeType})${meta.isBlob ? ' [blob]' : ''}`);
          attachments.push(createAttachment(
            meta,
            `תלוש משכורת ${index + 1} - ${formData.basicInfo?.fullName || 'תובע/ת'}`,
            'תלוש משכורת'
          ));
        }
      });
    } else {
      console.log('  ℹ️ No applicantPaySlips found');
    }

    // Applicant income proof
    if (property.applicantIncomeProof) {
      const meta = parseFileSource(property.applicantIncomeProof, 'income-proof-applicant', 'application/pdf');
      if (meta) {
        attachments.push(createAttachment(
          meta,
          `אישור רו"ח - ${formData.basicInfo?.fullName || 'תובע/ת'}`,
          'אישור רואה חשבון על השתכרות'
        ));
      }
    }

    // Respondent pay slips
    if (property.respondentPaySlips && Array.isArray(property.respondentPaySlips)) {
      property.respondentPaySlips.forEach((fileData: any, index: number) => {
        const meta = parseFileSource(
          fileData,
          `payslip-respondent-${index + 1}`,
          'application/pdf'
        );
        if (meta) {
          attachments.push(createAttachment(
            meta,
            `תלוש משכורת ${index + 1} - ${formData.basicInfo?.fullName2 || 'נתבע/ת'}`,
            'תלוש משכורת'
          ));
        }
      });
    }

    // Respondent income proof
    if (property.respondentIncomeProof) {
      const meta = parseFileSource(property.respondentIncomeProof, 'income-proof-respondent', 'application/pdf');
      if (meta) {
        attachments.push(createAttachment(
          meta,
          `אישור רו"ח - ${formData.basicInfo?.fullName2 || 'נתבע/ת'}`,
          'אישור רואה חשבון על השתכרות'
        ));
      }
    }

    // Court document
    if (property.courtDocument) {
      const meta = parseFileSource(property.courtDocument, 'court-document', 'application/pdf');
      if (meta) {
        attachments.push(createAttachment(
          meta,
          'מסמך מבית המשפט',
          'מסמך קיים מבית המשפט'
        ));
      }
    }

    pushProofAttachments(property.apartments, {
      fallbackName: 'apartment',
      labelPrefix: 'דירה',
    });

    pushProofAttachments(property.vehicles, {
      fallbackName: 'vehicle',
      labelPrefix: 'רכב',
    });

    pushProofAttachments(property.savings, {
      fallbackName: 'savings',
      labelPrefix: 'חיסכון',
    });

    pushProofAttachments(property.benefits, {
      fallbackName: 'benefit',
      labelPrefix: 'זכויות סוציאליות',
    });

    pushProofAttachments(property.properties, {
      fallbackName: 'property-item',
      labelPrefix: 'מיטלטלין',
    });

    pushProofAttachments(property.debts, {
      fallbackName: 'debt',
      labelPrefix: 'חוב',
    });
  }

  // Helper to create attachment (moved outside property block for reuse)
  const createAttachmentGlobal = (
    meta: ParsedFileSource,
    label: string,
    description: string
  ): ExtractedAttachment => ({
    label,
    description,
    file: meta.isBlob ? undefined : meta.dataUrl,
    blobUrl: meta.isBlob ? meta.blobUrl : undefined,
    name: meta.name,
    mimeType: meta.mimeType,
    isBlob: meta.isBlob,
  });

  // Divorce agreement
  if (formData.divorceAgreement?.uploadedAgreement) {
    const meta = parseFileSource(
      formData.divorceAgreement.uploadedAgreement,
      'divorce-agreement',
      'application/pdf'
    );
    if (meta) {
      console.log('  ✓ Adding divorce agreement');
      attachments.push(createAttachmentGlobal(
        meta,
        'הסכם גירושין קיים',
        'הסכם גירושין שהועלה'
      ));
    }
  }

  if (Array.isArray(formData.attachments)) {
    formData.attachments.forEach((attachment: any, index: number) => {
      // Handle BlobFile directly in attachments array
      if (isBlobFile(attachment)) {
        attachments.push({
          label: attachment.fileName,
          description: attachment.fileName,
          blobUrl: attachment.url,
          name: attachment.fileName,
          mimeType: attachment.mimeType,
          isBlob: true,
        });
        return;
      }

      const meta = parseFileSource(
        attachment?.data || attachment?.file || attachment?.content || attachment?.base64 || attachment,
        attachment?.name || `attachment-${index + 1}`,
        attachment?.mimeType || 'application/pdf'
      );

      if (!meta) {
        return;
      }

      const label =
        attachment?.label && attachment.label.trim().length > 0
          ? attachment.label.trim()
          : `מסמך ${index + 1}`;

      const description =
        attachment?.description && attachment.description.trim().length > 0
          ? attachment.description.trim()
          : label;

      attachments.push(createAttachmentGlobal(meta, label, description));
    });
  }

  console.log(`📋 Extraction complete: Found ${attachments.length} attachment(s)`);
  if (attachments.length > 0) {
    console.log('📎 Attachments:', attachments.map(a => a.label).join(', '));
  }

  return attachments;
}
