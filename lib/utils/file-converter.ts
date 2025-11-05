/**
 * File conversion utilities for handling file uploads
 */

/**
 * Convert a File object to base64 string
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
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

    // Applicant pay slips
    if (property.applicantPaySlips && Array.isArray(property.applicantPaySlips)) {
      console.log(`📎 Found applicantPaySlips: ${property.applicantPaySlips.length} items`);
      property.applicantPaySlips.forEach((fileData: string, index: number) => {
        if (fileData) {
          console.log(`  ✓ Adding applicant pay slip ${index + 1}`);
          attachments.push({
            label: `תלוש משכורת ${index + 1} - ${formData.basicInfo?.fullName || 'תובע/ת'}`,
            description: 'תלוש משכורת',
            file: fileData,
            name: `payslip-applicant-${index + 1}.pdf`,
            mimeType: 'application/pdf',
          });
        }
      });
    } else {
      console.log('  ℹ️ No applicantPaySlips found');
    }

    // Applicant income proof
    if (property.applicantIncomeProof) {
      attachments.push({
        label: `אישור רו"ח - ${formData.basicInfo?.fullName || 'תובע/ת'}`,
        description: 'אישור רואה חשבון על השתכרות',
        file: property.applicantIncomeProof,
        name: 'income-proof-applicant.pdf',
        mimeType: 'application/pdf',
      });
    }

    // Respondent pay slips
    if (property.respondentPaySlips && Array.isArray(property.respondentPaySlips)) {
      property.respondentPaySlips.forEach((fileData: string, index: number) => {
        if (fileData) {
          attachments.push({
            label: `תלוש משכורת ${index + 1} - ${formData.basicInfo?.fullName2 || 'נתבע/ת'}`,
            description: 'תלוש משכורת',
            file: fileData,
            name: `payslip-respondent-${index + 1}.pdf`,
            mimeType: 'application/pdf',
          });
        }
      });
    }

    // Respondent income proof
    if (property.respondentIncomeProof) {
      attachments.push({
        label: `אישור רו"ח - ${formData.basicInfo?.fullName2 || 'נתבע/ת'}`,
        description: 'אישור רואה חשבון על השתכרות',
        file: property.respondentIncomeProof,
        name: 'income-proof-respondent.pdf',
        mimeType: 'application/pdf',
      });
    }

    // Court document
    if (property.courtDocument) {
      attachments.push({
        label: 'מסמך מבית המשפט',
        description: 'מסמך קיים מבית המשפט',
        file: property.courtDocument,
        name: 'court-document.pdf',
        mimeType: 'application/pdf',
      });
    }
  }

  // Divorce agreement
  if (formData.divorceAgreement?.uploadedAgreement) {
    console.log('  ✓ Adding divorce agreement');
    attachments.push({
      label: 'הסכם גירושין קיים',
      description: 'הסכם גירושין שהועלה',
      file: formData.divorceAgreement.uploadedAgreement,
      name: 'divorce-agreement.pdf',
      mimeType: 'application/pdf',
    });
  }

  console.log(`📋 Extraction complete: Found ${attachments.length} attachment(s)`);
  if (attachments.length > 0) {
    console.log('📎 Attachments:', attachments.map(a => a.label).join(', '));
  }

  return attachments;
}
