/**
 * File conversion utilities for handling file uploads
 */

import { compressImage, isCompressibleImage } from './image-compression';

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

function parseFileSource(
  input: any,
  fallbackName: string,
  fallbackMime: string = 'application/octet-stream'
): { dataUrl: string; mimeType: string; name: string } | null {
  if (!input) return null;

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
 * Recursively convert all File objects in formData to base64
 */
export async function convertFormDataFiles(formData: any): Promise<any> {
  if (!formData || typeof formData !== 'object') {
    return formData;
  }

  const converted: any = Array.isArray(formData) ? [] : {};
  let fileCount = 0;

  for (const key in formData) {
    const value = formData[key];

    // Check if value is a File object
    if (value instanceof File) {
      console.log(`📎 Converting File: ${key} -> ${value.name} (${value.size} bytes, ${value.type})`);
      converted[key] = await fileToBase64(value);
      fileCount++;
    }
    // Check if value is an array of Files
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

  if (fileCount > 0) {
    console.log(`✅ Converted ${fileCount} file(s) to base64`);
  }

  return converted;
}

/**
 * Extract attachment files from formData and prepare them for document generation
 * Returns array in format expected by document generator
 */
export function extractAttachmentsFromFormData(formData: any): Array<{
  label: string;
  description: string;
  file: string; // base64
  name: string;
  mimeType: string;
}> {
  console.log('🔍 Extracting attachments from formData...');
  console.log('📊 FormData keys:', Object.keys(formData));

  const attachments: Array<{
    label: string;
    description: string;
    file: string;
    name: string;
    mimeType: string;
  }> = [];

  // Property section attachments
  if (formData.property) {
    const property = formData.property;
    console.log('📊 Property keys:', Object.keys(property));

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

        attachments.push({
          label,
          description,
          file: meta.dataUrl,
          name: meta.name,
          mimeType: meta.mimeType,
        });
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
          console.log(`  ✓ Adding applicant pay slip ${index + 1} (${meta.mimeType})`);
          attachments.push({
            label: `תלוש משכורת ${index + 1} - ${formData.basicInfo?.fullName || 'תובע/ת'}`,
            description: 'תלוש משכורת',
            file: meta.dataUrl,
            name: meta.name,
            mimeType: meta.mimeType,
          });
        }
      });
    } else {
      console.log('  ℹ️ No applicantPaySlips found');
    }

    // Applicant income proof
    if (property.applicantIncomeProof) {
      const meta = parseFileSource(property.applicantIncomeProof, 'income-proof-applicant', 'application/pdf');
      if (meta) {
        attachments.push({
          label: `אישור רו"ח - ${formData.basicInfo?.fullName || 'תובע/ת'}`,
          description: 'אישור רואה חשבון על השתכרות',
          file: meta.dataUrl,
          name: meta.name,
          mimeType: meta.mimeType,
        });
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
          attachments.push({
            label: `תלוש משכורת ${index + 1} - ${formData.basicInfo?.fullName2 || 'נתבע/ת'}`,
            description: 'תלוש משכורת',
            file: meta.dataUrl,
            name: meta.name,
            mimeType: meta.mimeType,
          });
        }
      });
    }

    // Respondent income proof
    if (property.respondentIncomeProof) {
      const meta = parseFileSource(property.respondentIncomeProof, 'income-proof-respondent', 'application/pdf');
      if (meta) {
        attachments.push({
          label: `אישור רו"ח - ${formData.basicInfo?.fullName2 || 'נתבע/ת'}`,
          description: 'אישור רואה חשבון על השתכרות',
          file: meta.dataUrl,
          name: meta.name,
          mimeType: meta.mimeType,
        });
      }
    }

    // Court document
    if (property.courtDocument) {
      const meta = parseFileSource(property.courtDocument, 'court-document', 'application/pdf');
      if (meta) {
        attachments.push({
          label: 'מסמך מבית המשפט',
          description: 'מסמך קיים מבית המשפט',
          file: meta.dataUrl,
          name: meta.name,
          mimeType: meta.mimeType,
        });
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

  // Divorce agreement
  if (formData.divorceAgreement?.uploadedAgreement) {
    const meta = parseFileSource(
      formData.divorceAgreement.uploadedAgreement,
      'divorce-agreement',
      'application/pdf'
    );
    if (meta) {
      console.log('  ✓ Adding divorce agreement');
      attachments.push({
        label: 'הסכם גירושין קיים',
        description: 'הסכם גירושין שהועלה',
        file: meta.dataUrl,
        name: meta.name,
        mimeType: meta.mimeType,
      });
    }
  }

  if (Array.isArray(formData.attachments)) {
    formData.attachments.forEach((attachment: any, index: number) => {
      const meta = parseFileSource(
        attachment?.data || attachment?.file || attachment?.content || attachment?.base64,
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

      attachments.push({
        label,
        description,
        file: meta.dataUrl,
        name: meta.name,
        mimeType: meta.mimeType,
      });
    });
  }

  console.log(`📋 Extraction complete: Found ${attachments.length} attachment(s)`);
  if (attachments.length > 0) {
    console.log('📎 Attachments:', attachments.map(a => a.label).join(', '));
  }

  return attachments;
}
