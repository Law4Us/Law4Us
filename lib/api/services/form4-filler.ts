/**
 * Form 4 (הרצאת פרטים) PDF Filler and Image Converter
 * Fills the official lfc525 PDF form and converts it to high-resolution images
 * for insertion into the alimony claim Word document.
 */

import { PDFDocument, PDFForm, PDFTextField, PDFCheckBox, rgb } from 'pdf-lib';
import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

// Note: pdfjs-dist will be imported dynamically in functions that use it
// to avoid Node.js compatibility issues with DOM APIs

/**
 * Input data structure for Form 4
 */
export interface Form4Data {
  // Section A: Common fields (1-15)

  // Fields 1-4: Personal details
  applicantName: string;
  applicantId: string;
  applicantAddress: string;
  applicantBirthDate: string;

  respondentName: string;
  respondentId: string;
  respondentAddress: string;
  respondentBirthDate: string;

  // Field 5: Relationship
  relationshipType: 'married' | 'divorced' | 'separated' | 'never-married';

  // Field 6: Previous legal proceedings
  hasPreviousProceedings: boolean;
  previousProceedingsDetails?: string;

  // Field 7: Last alimony
  lastAlimonyAmount?: string;
  lastAlimonyDate?: string;

  // Field 8: Applicant employment & income (12 months)
  applicantEmployment: {
    status: string;
    employer?: string;
    monthlyIncome?: number;
    annualIncome?: number;
    additionalIncome?: string;
  };

  // Field 9: Respondent employment & income (12 months)
  respondentEmployment: {
    status: string;
    employer?: string;
    estimatedIncome?: number;
    additionalIncome?: string;
  };

  // Field 10: Property details
  applicantProperty: {
    realEstate?: string;
    movableProperty?: string;
    investments?: string;
  };
  respondentProperty: {
    realEstate?: string;
    movableProperty?: string;
    investments?: string;
  };

  // Field 11: Debts
  applicantDebts?: string;
  respondentDebts?: string;

  // Field 12: Housing
  applicantHousing: {
    type: string; // owner, renter, living-with-family, etc.
    monthlyExpense?: number;
  };
  respondentHousing: {
    type: string;
    monthlyExpense?: number;
  };

  // Field 13: Bank accounts
  bankAccounts: Array<{
    bankName: string;
    accountNumber: string;
    balance?: number;
  }>;

  // Field 14: Vehicle
  hasVehicle: boolean;
  vehicleDetails?: string;

  // Field 15: Requested alimony amount
  requestedAmount: number;

  // Section B: Spouse-specific fields
  marriageDate?: string;
  separationDate?: string;
  applicantCitizenship?: string;
  respondentCitizenship?: string;
  applicantReligion?: string;
  respondentReligion?: string;
  livingTogether: boolean;

  // Children information
  children: Array<{
    name: string;
    birthDate: string;
    residingWith: 'applicant' | 'respondent' | 'both';
  }>;

  // Expense tables
  childrenNeeds: Array<{
    category: string;
    description: string;
    monthlyAmount: number;
  }>;
  householdNeeds: Array<{
    category: string;
    description: string;
    monthlyAmount: number;
  }>;
}

/**
 * Maps relationship types to Hebrew labels for PDF form
 */
const RELATIONSHIP_LABELS: Record<string, string> = {
  'married': 'נשוי/אה',
  'divorced': 'גרוש/ה',
  'separated': 'פרוד/ה',
  'never-married': 'רווק/ה',
};

/**
 * Maps housing types to Hebrew labels
 */
const HOUSING_LABELS: Record<string, string> = {
  'owner': 'בעלות',
  'renter': 'שוכר/ת',
  'living-with-family': 'גר/ה אצל משפחה',
  'other': 'אחר',
};

/**
 * Load the template PDF and fill it with data
 */
async function fillPdfForm(data: Form4Data): Promise<Uint8Array> {
  // Load template PDF
  const templatePath = path.join(process.cwd(), 'form4-template.pdf');

  console.log(`🔍 Looking for Form 4 template at: ${templatePath}`);
  console.log(`📂 Current working directory: ${process.cwd()}`);
  console.log(`📁 Template exists: ${fs.existsSync(templatePath)}`);

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template PDF not found at: ${templatePath}`);
  }

  const templateBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();

  console.log('📄 Filling Form 4 fields...');

  try {
    // Section A: Fields 1-4 - Personal Details
    setTextFieldSafe(form, 'applicant_name', data.applicantName);
    setTextFieldSafe(form, 'applicant_id', data.applicantId);
    setTextFieldSafe(form, 'applicant_address', data.applicantAddress);
    setTextFieldSafe(form, 'applicant_birthdate', data.applicantBirthDate);

    setTextFieldSafe(form, 'respondent_name', data.respondentName);
    setTextFieldSafe(form, 'respondent_id', data.respondentId);
    setTextFieldSafe(form, 'respondent_address', data.respondentAddress);
    setTextFieldSafe(form, 'respondent_birthdate', data.respondentBirthDate);

    // Field 5: Relationship
    setTextFieldSafe(form, 'relationship_type', RELATIONSHIP_LABELS[data.relationshipType] || data.relationshipType);

    // Field 6: Previous legal proceedings
    setCheckBoxSafe(form, 'previous_proceedings_yes', data.hasPreviousProceedings);
    setCheckBoxSafe(form, 'previous_proceedings_no', !data.hasPreviousProceedings);
    if (data.hasPreviousProceedings && data.previousProceedingsDetails) {
      setTextFieldSafe(form, 'previous_proceedings_details', data.previousProceedingsDetails);
    }

    // Field 7: Last alimony
    if (data.lastAlimonyAmount) {
      setTextFieldSafe(form, 'last_alimony_amount', data.lastAlimonyAmount);
    }
    if (data.lastAlimonyDate) {
      setTextFieldSafe(form, 'last_alimony_date', data.lastAlimonyDate);
    }

    // Field 8: Applicant employment & income
    setTextFieldSafe(form, 'applicant_employment_status', data.applicantEmployment.status);
    if (data.applicantEmployment.employer) {
      setTextFieldSafe(form, 'applicant_employer', data.applicantEmployment.employer);
    }
    if (data.applicantEmployment.monthlyIncome) {
      setTextFieldSafe(form, 'applicant_monthly_income', `₪${data.applicantEmployment.monthlyIncome.toLocaleString('he-IL')}`);
    }
    if (data.applicantEmployment.annualIncome) {
      setTextFieldSafe(form, 'applicant_annual_income', `₪${data.applicantEmployment.annualIncome.toLocaleString('he-IL')}`);
    }
    if (data.applicantEmployment.additionalIncome) {
      setTextFieldSafe(form, 'applicant_additional_income', data.applicantEmployment.additionalIncome);
    }

    // Field 9: Respondent employment & income
    setTextFieldSafe(form, 'respondent_employment_status', data.respondentEmployment.status);
    if (data.respondentEmployment.employer) {
      setTextFieldSafe(form, 'respondent_employer', data.respondentEmployment.employer);
    }
    if (data.respondentEmployment.estimatedIncome) {
      setTextFieldSafe(form, 'respondent_estimated_income', `₪${data.respondentEmployment.estimatedIncome.toLocaleString('he-IL')}`);
    }
    if (data.respondentEmployment.additionalIncome) {
      setTextFieldSafe(form, 'respondent_additional_income', data.respondentEmployment.additionalIncome);
    }

    // Field 10: Property details
    if (data.applicantProperty.realEstate) {
      setTextFieldSafe(form, 'applicant_real_estate', data.applicantProperty.realEstate);
    }
    if (data.applicantProperty.movableProperty) {
      setTextFieldSafe(form, 'applicant_movable_property', data.applicantProperty.movableProperty);
    }
    if (data.applicantProperty.investments) {
      setTextFieldSafe(form, 'applicant_investments', data.applicantProperty.investments);
    }

    if (data.respondentProperty.realEstate) {
      setTextFieldSafe(form, 'respondent_real_estate', data.respondentProperty.realEstate);
    }
    if (data.respondentProperty.movableProperty) {
      setTextFieldSafe(form, 'respondent_movable_property', data.respondentProperty.movableProperty);
    }
    if (data.respondentProperty.investments) {
      setTextFieldSafe(form, 'respondent_investments', data.respondentProperty.investments);
    }

    // Field 11: Debts
    if (data.applicantDebts) {
      setTextFieldSafe(form, 'applicant_debts', data.applicantDebts);
    }
    if (data.respondentDebts) {
      setTextFieldSafe(form, 'respondent_debts', data.respondentDebts);
    }

    // Field 12: Housing
    setTextFieldSafe(form, 'applicant_housing_type', HOUSING_LABELS[data.applicantHousing.type] || data.applicantHousing.type);
    if (data.applicantHousing.monthlyExpense) {
      setTextFieldSafe(form, 'applicant_housing_expense', `₪${data.applicantHousing.monthlyExpense.toLocaleString('he-IL')}`);
    }

    setTextFieldSafe(form, 'respondent_housing_type', HOUSING_LABELS[data.respondentHousing.type] || data.respondentHousing.type);
    if (data.respondentHousing.monthlyExpense) {
      setTextFieldSafe(form, 'respondent_housing_expense', `₪${data.respondentHousing.monthlyExpense.toLocaleString('he-IL')}`);
    }

    // Field 13: Bank accounts (up to 4)
    data.bankAccounts.slice(0, 4).forEach((account, index) => {
      setTextFieldSafe(form, `bank_${index + 1}_name`, account.bankName);
      setTextFieldSafe(form, `bank_${index + 1}_account`, account.accountNumber);
      if (account.balance) {
        setTextFieldSafe(form, `bank_${index + 1}_balance`, `₪${account.balance.toLocaleString('he-IL')}`);
      }
    });

    // Field 14: Vehicle
    setCheckBoxSafe(form, 'has_vehicle_yes', data.hasVehicle);
    setCheckBoxSafe(form, 'has_vehicle_no', !data.hasVehicle);
    if (data.hasVehicle && data.vehicleDetails) {
      setTextFieldSafe(form, 'vehicle_details', data.vehicleDetails);
    }

    // Field 15: Requested alimony amount
    setTextFieldSafe(form, 'requested_alimony_amount', `₪${data.requestedAmount.toLocaleString('he-IL')}`);

    // Section B: Spouse-specific fields
    if (data.marriageDate) {
      setTextFieldSafe(form, 'marriage_date', data.marriageDate);
    }
    if (data.separationDate) {
      setTextFieldSafe(form, 'separation_date', data.separationDate);
    }
    if (data.applicantCitizenship) {
      setTextFieldSafe(form, 'applicant_citizenship', data.applicantCitizenship);
    }
    if (data.respondentCitizenship) {
      setTextFieldSafe(form, 'respondent_citizenship', data.respondentCitizenship);
    }
    if (data.applicantReligion) {
      setTextFieldSafe(form, 'applicant_religion', data.applicantReligion);
    }
    if (data.respondentReligion) {
      setTextFieldSafe(form, 'respondent_religion', data.respondentReligion);
    }

    setCheckBoxSafe(form, 'living_together_yes', data.livingTogether);
    setCheckBoxSafe(form, 'living_together_no', !data.livingTogether);

    // Children information
    data.children.forEach((child, index) => {
      if (index < 10) { // Assuming form supports up to 10 children
        setTextFieldSafe(form, `child_${index + 1}_name`, child.name);
        setTextFieldSafe(form, `child_${index + 1}_birthdate`, child.birthDate);
        setTextFieldSafe(form, `child_${index + 1}_residing`,
          child.residingWith === 'applicant' ? 'אצל התובע/ת' :
          child.residingWith === 'respondent' ? 'אצל הנתבע/ת' : 'גם וגם');
      }
    });

    // Expense tables - Children's needs
    const childrenNeedsTotal = data.childrenNeeds.reduce((sum, need) => sum + need.monthlyAmount, 0);
    data.childrenNeeds.forEach((need, index) => {
      if (index < 20) { // Assuming form supports up to 20 expense rows
        setTextFieldSafe(form, `children_need_${index + 1}_category`, need.category);
        setTextFieldSafe(form, `children_need_${index + 1}_description`, need.description);
        setTextFieldSafe(form, `children_need_${index + 1}_amount`, `₪${need.monthlyAmount.toLocaleString('he-IL')}`);
      }
    });
    setTextFieldSafe(form, 'children_needs_total', `₪${childrenNeedsTotal.toLocaleString('he-IL')}`);

    // Expense tables - Household needs
    const householdNeedsTotal = data.householdNeeds.reduce((sum, need) => sum + need.monthlyAmount, 0);
    data.householdNeeds.forEach((need, index) => {
      if (index < 20) {
        setTextFieldSafe(form, `household_need_${index + 1}_category`, need.category);
        setTextFieldSafe(form, `household_need_${index + 1}_description`, need.description);
        setTextFieldSafe(form, `household_need_${index + 1}_amount`, `₪${need.monthlyAmount.toLocaleString('he-IL')}`);
      }
    });
    setTextFieldSafe(form, 'household_needs_total', `₪${householdNeedsTotal.toLocaleString('he-IL')}`);

    console.log('✅ Form 4 fields filled successfully');

  } catch (error) {
    console.error('⚠️ Error filling form fields:', error);
    // Continue even if some fields fail - PDF might have different field names
  }

  // Flatten the form (make fields non-editable)
  form.flatten();

  // Save the filled PDF
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

/**
 * Safely set a text field value (handles missing fields)
 */
function setTextFieldSafe(form: PDFForm, fieldName: string, value: string) {
  try {
    const field = form.getTextField(fieldName);
    field.setText(value);
  } catch (error) {
    // Field doesn't exist or is not a text field - skip silently
    console.log(`⚠️ Field not found or not a text field: ${fieldName}`);
  }
}

/**
 * Safely set a checkbox value (handles missing fields)
 */
function setCheckBoxSafe(form: PDFForm, fieldName: string, checked: boolean) {
  try {
    const field = form.getCheckBox(fieldName);
    if (checked) {
      field.check();
    } else {
      field.uncheck();
    }
  } catch (error) {
    // Field doesn't exist or is not a checkbox - skip silently
    console.log(`⚠️ Field not found or not a checkbox: ${fieldName}`);
  }
}

/**
 * Convert PDF bytes to high-resolution PNG images (one per page)
 * @param pdfBytes The filled PDF as bytes
 * @param dpi Resolution in dots per inch (default: 200 for good quality)
 * @returns Array of PNG image buffers
 */
async function convertPdfToImages(pdfBytes: Uint8Array, dpi: number = 200): Promise<Buffer[]> {
  console.log('🖼️ Converting PDF to images...');

  // Dynamically import pdfjs-dist/legacy for Node.js compatibility
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

  // Configure worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = require.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs');

  // Load the PDF with PDF.js
  const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
  const pdfDocument = await loadingTask.promise;

  const numPages = pdfDocument.numPages;
  console.log(`   Pages to convert: ${numPages}`);

  const images: Buffer[] = [];

  // Convert each page to an image
  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);

    // Calculate scale factor for desired DPI
    const viewport = page.getViewport({ scale: 1.0 });
    const scale = dpi / 72; // 72 DPI is the default PDF resolution
    const scaledViewport = page.getViewport({ scale });

    // Create canvas
    const canvas = createCanvas(scaledViewport.width, scaledViewport.height);
    const context = canvas.getContext('2d');

    // Render PDF page to canvas
    const renderContext = {
      canvasContext: context as any,
      viewport: scaledViewport,
    } as any; // Type assertion for PDF.js compatibility

    await page.render(renderContext).promise;

    // Convert canvas to PNG buffer
    const imageBuffer = canvas.toBuffer('image/png');
    images.push(imageBuffer);

    console.log(`   ✅ Page ${pageNum}/${numPages} converted (${(imageBuffer.length / 1024).toFixed(2)} KB)`);
  }

  console.log(`✅ Converted ${numPages} pages to images`);

  return images;
}

/**
 * Main function: Fill Form 4 and convert to images
 * @param data Form data to fill
 * @param dpi Image resolution (default: 200)
 * @returns Array of PNG image buffers (one per page)
 */
export async function fillForm4AndConvertToImages(
  data: Form4Data,
  dpi: number = 200
): Promise<Buffer[]> {
  console.log('\n' + '🔷'.repeat(40));
  console.log('📋 FORM 4 PROCESSING');
  console.log('🔷'.repeat(40));

  try {
    // Step 1: Fill the PDF form
    const filledPdfBytes = await fillPdfForm(data);

    // Optional: Save filled PDF for debugging
    if (process.env.NODE_ENV === 'development') {
      const outputPath = path.join(process.cwd(), 'output', `form4-filled-${Date.now()}.pdf`);
      fs.writeFileSync(outputPath, filledPdfBytes);
      console.log(`💾 Saved filled PDF: ${outputPath}`);
    }

    // Step 2: Convert PDF to images
    const images = await convertPdfToImages(filledPdfBytes, dpi);

    console.log('🔷'.repeat(40));
    console.log(`✅ Form 4 processed: ${images.length} images created`);
    console.log('🔷'.repeat(40) + '\n');

    return images;

  } catch (error) {
    console.error('❌ Error processing Form 4:', error);
    throw error;
  }
}

/**
 * Helper function to create Form4Data from the standard formData structure
 * Maps our wizard formData to the Form4Data interface
 */
export function mapFormDataToForm4Data(
  basicInfo: any,
  formData: any
): Form4Data {
  // Extract property questions (reused by alimony)
  const property = formData.property || {};
  const alimony = formData.alimony || {};

  // Map employment status
  const applicantEmploymentStatus =
    property.applicantEmploymentStatus === 'employee' ? 'שכיר/ה' :
    property.applicantEmploymentStatus === 'selfEmployed' ? 'עצמאי/ת' :
    property.applicantEmploymentStatus === 'unemployed' ? 'לא עובד/ת' :
    property.applicantEmploymentStatus || 'לא צוין';

  const respondentEmploymentStatus =
    property.respondentEmploymentStatus === 'employee' ? 'שכיר/ה' :
    property.respondentEmploymentStatus === 'selfEmployed' ? 'עצמאי/ת' :
    property.respondentEmploymentStatus === 'unemployed' ? 'לא עובד/ת' :
    property.respondentEmploymentStatus || 'לא ידוע';

  // Map relationship type
  const relationshipType =
    property.currentStatus === 'married' ? 'married' :
    property.currentStatus === 'divorced' ? 'divorced' :
    property.currentStatus === 'separated' ? 'separated' :
    'never-married';

  // Filter children under 18 (קטינים)
  const children = (formData.children || [])
    .filter((child: any) => {
      if (!child.birthDate) return false;
      const birthDate = new Date(child.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age < 18;
    })
    .map((child: any) => ({
      name: child.name,
      birthDate: child.birthDate,
      residingWith: child.residingWith || 'applicant',
    }));

  return {
    // Personal details
    applicantName: basicInfo.fullName || '',
    applicantId: basicInfo.idNumber || '',
    applicantAddress: basicInfo.address || '',
    applicantBirthDate: basicInfo.birthDate || '',

    respondentName: basicInfo.fullName2 || '',
    respondentId: basicInfo.idNumber2 || '',
    respondentAddress: basicInfo.address2 || '',
    respondentBirthDate: basicInfo.birthDate2 || '',

    // Relationship
    relationshipType,

    // Previous proceedings
    hasPreviousProceedings: alimony.wasPreviousAlimony === 'yes',
    previousProceedingsDetails: alimony.previousAlimonyDetails,

    // Last alimony
    lastAlimonyAmount: alimony.lastAlimonyAmount,
    lastAlimonyDate: alimony.lastAlimonyDate,

    // Employment
    applicantEmployment: {
      status: applicantEmploymentStatus,
      employer: property.applicantEmployer,
      monthlyIncome: property.applicantGrossSalary || property.applicantGrossIncome,
      annualIncome: (property.applicantGrossSalary || property.applicantGrossIncome) ? (property.applicantGrossSalary || property.applicantGrossIncome) * 12 : undefined,
      additionalIncome: property.applicantAdditionalIncome,
    },

    respondentEmployment: {
      status: respondentEmploymentStatus,
      employer: property.respondentEmployer,
      estimatedIncome: property.respondentGrossSalary || property.respondentGrossIncome,
      additionalIncome: property.respondentAdditionalIncome,
    },

    // Property
    applicantProperty: {
      realEstate: property.applicantRealEstate,
      movableProperty: property.applicantMovableProperty,
      investments: property.applicantInvestments,
    },

    respondentProperty: {
      realEstate: property.respondentRealEstate,
      movableProperty: property.respondentMovableProperty,
      investments: property.respondentInvestments,
    },

    // Debts
    applicantDebts: property.applicantDebts,
    respondentDebts: property.respondentDebts,

    // Housing
    applicantHousing: {
      type: property.applicantHousingType || 'other',
      monthlyExpense: property.applicantHousingExpense,
    },

    respondentHousing: {
      type: property.respondentHousingType || 'other',
      monthlyExpense: property.respondentHousingExpense,
    },

    // Bank accounts
    bankAccounts: alimony.bankAccounts || [],

    // Vehicle
    hasVehicle: alimony.hasVehicle === 'yes',
    vehicleDetails: alimony.vehicleDetails,

    // Requested amount
    requestedAmount: alimony.requestedAmount || 0,

    // Spouse-specific
    marriageDate: basicInfo.weddingDay,
    separationDate: property.separationDate,
    applicantCitizenship: basicInfo.citizenship,
    respondentCitizenship: basicInfo.citizenship2,
    applicantReligion: basicInfo.religion,
    respondentReligion: basicInfo.religion2,
    livingTogether: property.currentStatus === 'married' && !property.separationDate,

    // Children
    children,

    // Expenses
    childrenNeeds: alimony.childrenNeeds || [],
    householdNeeds: alimony.householdNeeds || [],
  };
}
