/**
 * Form 4 Text Overlay - Since PDF has no fillable fields, we overlay text at specific coordinates
 *
 * COORDINATE SYSTEM:
 * - PDF uses bottom-left origin (0,0 at bottom-left)
 * - Y-axis increases upward
 * - We convert from top-down coordinates by: y_pdf = height - y_top
 *
 * ADJUSTMENT GUIDE:
 * If text appears in wrong position, adjust the coordinates in the sections below.
 * Each section is clearly marked with page number and field descriptions.
 */
import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb } from 'pdf-lib';
import { createCanvas } from 'canvas';
import fontkit from '@pdf-lib/fontkit';
import type { Form4Data } from './form4-filler';
import { ensureHebrewFontPath } from './font-utils';

// Note: pdfjs-dist is imported dynamically in the function for Node.js compatibility

// Cache for the Hebrew font
let hebrewFontBytes: Uint8Array | null = null;

const numericAmount = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

/**
 * Load Assistant font from local file (supports Hebrew characters and numerals)
 */
async function loadHebrewFont(): Promise<Uint8Array> {
  if (hebrewFontBytes) {
    return hebrewFontBytes;
  }

  const fontPath = await ensureHebrewFontPath();
  const fontBuffer = fs.readFileSync(fontPath);
  hebrewFontBytes = new Uint8Array(fontBuffer);

  return hebrewFontBytes;
}

// Relationship type labels in Hebrew
const RELATIONSHIP_LABELS: Record<string, string> = {
  'married': 'נשוי/אה',
  'divorced': 'גרוש/ה',
  'separated': 'פרוד/ה',
  'never-married': 'רווק/ה',
};

// Housing type labels in Hebrew
const HOUSING_LABELS: Record<string, string> = {
  'owner': 'בעלות',
  'renter': 'שוכר/ת',
  'living-with-family': 'גר/ה אצל משפחה',
  'other': 'אחר',
};

/**
 * Fill Form 4 with text overlays and convert to images
 */
export async function fillForm4WithTextOverlay(
  data: Form4Data,
  dpi: number = 200
): Promise<Buffer[]> {
  console.log('📝 Adding text overlays to Form 4 PDF...');
  console.log(`   Applicant: ${data.applicantName}`);
  console.log(`   Respondent: ${data.respondentName}`);
  console.log(`   Children: ${data.children.length}`);
  console.log(`   Children needs: ${data.childrenNeeds.length}`);
  console.log(`   Household needs: ${data.householdNeeds.length}`);

  try {
    // Load the template PDF
    const templatePath = path.join(process.cwd(), 'form4-template.pdf');

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Form 4 template not found at: ${templatePath}`);
    }

    const pdfBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Register fontkit to support custom fonts
    pdfDoc.registerFontkit(fontkit);

    // Load and embed Hebrew-supporting font
    console.log('   📥 Loading Hebrew font...');
    const fontBytes = await loadHebrewFont();
    const font = await pdfDoc.embedFont(fontBytes);
    console.log('   ✅ Hebrew font embedded');

    const pages = pdfDoc.getPages();
    console.log(`   PDF has ${pages.length} pages`);

    // ==============================================
    // PAGE 1 - BASIC INFORMATION
    // ==============================================
    if (pages[0]) {
      console.log('   📄 Filling Page 1: Basic Information');
      const page = pages[0];
      const { width, height } = page.getSize();

      const drawText = (text: string, x: number, y: number, size: number = 10) => {
        if (!text) return;
        try {
          page.drawText(text, {
            x,
            y: height - y,
            size,
            font,
            color: rgb(0, 0, 0),
          });
        } catch (error) {
          console.log(`   ⚠️ Error drawing text at (${x}, ${y}):`, error instanceof Error ? error.message : String(error));
        }
      };

      // Section 1: Applicant Details (adjust Y coordinates as needed)
      drawText(data.applicantName, 350, 180, 10);
      drawText(data.applicantId, 200, 180, 10);
      drawText(data.applicantAddress, 350, 200, 9);
      drawText(data.applicantBirthDate, 200, 200, 9);

      // Section 2: Respondent Details
      drawText(data.respondentName, 350, 230, 10);
      drawText(data.respondentId, 200, 230, 10);
      drawText(data.respondentAddress, 350, 250, 9);
      drawText(data.respondentBirthDate, 200, 250, 9);

      // Section 3: Relationship Status
      const relationshipLabel = RELATIONSHIP_LABELS[data.relationshipType] || data.relationshipType;
      drawText(relationshipLabel, 350, 280, 10);

      // Marriage and separation dates
      if (data.marriageDate) {
        drawText(data.marriageDate, 350, 300, 9);
      }
      if (data.separationDate) {
        drawText(data.separationDate, 200, 300, 9);
      }

      // Living together status
      const livingTogetherLabel = data.livingTogether ? 'כן' : 'לא';
      drawText(livingTogetherLabel, 350, 320, 9);

      // Section 4: Children (up to 6 children on page 1)
      let childY = 360;
      data.children.slice(0, 6).forEach((child, index) => {
        drawText(child.name, 400, childY, 9);
        drawText(child.birthDate, 300, childY, 9);
        const residingLabel =
          child.residingWith === 'applicant' ? 'אצל התובע/ת' :
          child.residingWith === 'respondent' ? 'אצל הנתבע/ת' : 'גם וגם';
        drawText(residingLabel, 150, childY, 8);
        childY += 20;
      });

      // Section 5: Previous Proceedings
      const hasPreviousLabel = data.hasPreviousProceedings ? 'כן' : 'לא';
      drawText(hasPreviousLabel, 350, 520, 9);
      if (data.hasPreviousProceedings && data.previousProceedingsDetails) {
        drawText(data.previousProceedingsDetails.substring(0, 60), 200, 540, 8);
      }

      // Section 6: Last Alimony
      if (data.lastAlimonyAmount) {
        drawText(data.lastAlimonyAmount, 350, 570, 9);
      }
      if (data.lastAlimonyDate) {
        drawText(data.lastAlimonyDate, 200, 570, 9);
      }
    }

    // ==============================================
    // PAGE 2 - EMPLOYMENT & FINANCIAL INFORMATION
    // ==============================================
    if (pages[1]) {
      console.log('   📄 Filling Page 2: Employment & Financial Info');
      const page = pages[1];
      const { width, height} = page.getSize();

      const drawText = (text: string, x: number, y: number, size: number = 10) => {
        if (!text) return;
        try {
          page.drawText(text, {
            x,
            y: height - y,
            size,
            font,
            color: rgb(0, 0, 0),
          });
        } catch (error) {
          console.log(`   ⚠️ Error drawing text at (${x}, ${y}):`, error instanceof Error ? error.message : String(error));
        }
      };

      // Section 8: Applicant Employment
      drawText(data.applicantEmployment.status, 350, 120, 9);
      if (data.applicantEmployment.employer) {
        drawText(data.applicantEmployment.employer, 350, 140, 9);
      }
      if (data.applicantEmployment.monthlyIncome) {
        drawText(`₪${data.applicantEmployment.monthlyIncome.toLocaleString('he-IL')}`, 250, 160, 9);
      }
      if (data.applicantEmployment.annualIncome) {
        drawText(`₪${data.applicantEmployment.annualIncome.toLocaleString('he-IL')}`, 150, 160, 9);
      }
      if (data.applicantEmployment.additionalIncome) {
        drawText(data.applicantEmployment.additionalIncome.substring(0, 50), 200, 180, 8);
      }

      // Section 9: Respondent Employment
      drawText(data.respondentEmployment.status, 350, 220, 9);
      if (data.respondentEmployment.employer) {
        drawText(data.respondentEmployment.employer, 350, 240, 9);
      }
      if (data.respondentEmployment.estimatedIncome) {
        drawText(`₪${data.respondentEmployment.estimatedIncome.toLocaleString('he-IL')}`, 250, 260, 9);
      }
      if (data.respondentEmployment.additionalIncome) {
        drawText(data.respondentEmployment.additionalIncome.substring(0, 50), 200, 280, 8);
      }

      // Section 10: Property
      if (data.applicantProperty.realEstate) {
        drawText(data.applicantProperty.realEstate.substring(0, 50), 350, 320, 8);
      }
      if (data.applicantProperty.movableProperty) {
        drawText(data.applicantProperty.movableProperty.substring(0, 50), 350, 340, 8);
      }
      if (data.applicantProperty.investments) {
        drawText(data.applicantProperty.investments.substring(0, 50), 350, 360, 8);
      }

      if (data.respondentProperty.realEstate) {
        drawText(data.respondentProperty.realEstate.substring(0, 50), 350, 400, 8);
      }
      if (data.respondentProperty.movableProperty) {
        drawText(data.respondentProperty.movableProperty.substring(0, 50), 350, 420, 8);
      }
      if (data.respondentProperty.investments) {
        drawText(data.respondentProperty.investments.substring(0, 50), 350, 440, 8);
      }

      // Section 11: Debts
      if (data.applicantDebts) {
        drawText(data.applicantDebts.substring(0, 60), 350, 480, 8);
      }
      if (data.respondentDebts) {
        drawText(data.respondentDebts.substring(0, 60), 350, 500, 8);
      }

      // Section 12: Housing
      const applicantHousingLabel = HOUSING_LABELS[data.applicantHousing.type] || data.applicantHousing.type;
      drawText(applicantHousingLabel, 350, 540, 9);
      if (data.applicantHousing.monthlyExpense) {
        drawText(`₪${data.applicantHousing.monthlyExpense.toLocaleString('he-IL')}`, 250, 540, 9);
      }

      const respondentHousingLabel = HOUSING_LABELS[data.respondentHousing.type] || data.respondentHousing.type;
      drawText(respondentHousingLabel, 350, 560, 9);
      if (data.respondentHousing.monthlyExpense) {
        drawText(`₪${data.respondentHousing.monthlyExpense.toLocaleString('he-IL')}`, 250, 560, 9);
      }

      // Section 13: Bank Accounts (up to 4)
      let bankY = 600;
      data.bankAccounts.slice(0, 4).forEach((account) => {
        drawText(account.bankName, 400, bankY, 8);
        drawText(account.accountNumber, 280, bankY, 8);
        if (account.balance) {
          drawText(`₪${account.balance.toLocaleString('he-IL')}`, 150, bankY, 8);
        }
        bankY += 18;
      });

      // Section 14: Vehicle
      const hasVehicleLabel = data.hasVehicle ? 'כן' : 'לא';
      drawText(hasVehicleLabel, 350, 690, 9);
      if (data.hasVehicle && data.vehicleDetails) {
        drawText(data.vehicleDetails.substring(0, 50), 200, 710, 8);
      }

    }

    // ==============================================
    // PAGE 3 - CHILDREN'S NEEDS TABLE
    // ==============================================
    if (pages[2] && data.childrenNeeds && data.childrenNeeds.length > 0) {
      console.log(`   📄 Filling Page 3: Children's Needs (${data.childrenNeeds.length} items)`);
      const page = pages[2];
      const { width, height } = page.getSize();

      const drawText = (text: string, x: number, y: number, size: number = 9) => {
        if (!text) return;
        try {
          page.drawText(text, {
            x,
            y: height - y,
            size,
            font,
            color: rgb(0, 0, 0),
          });
        } catch (error) {
          console.log(`   ⚠️ Error drawing text at (${x}, ${y}):`, error instanceof Error ? error.message : String(error));
        }
      };

      // Table headers (adjust Y coordinate to match form)
      let expenseY = 200;
      const ROW_HEIGHT = 22;

      // Add expense rows (limit to 15 rows per page)
      data.childrenNeeds.slice(0, 15).forEach((need, index) => {
        // Category column
        drawText(need.category, 450, expenseY, 8);
        // Description column (truncate if too long)
        const description = need.description.substring(0, 35);
        drawText(description, 250, expenseY, 8);
        // Amount column
        const amount = numericAmount(need.monthlyAmount);
        drawText(`₪${amount.toLocaleString('he-IL')}`, 100, expenseY, 8);
        expenseY += ROW_HEIGHT;
      });

      // Total row
      const childrenTotal = data.childrenNeeds.reduce((sum, n) => sum + numericAmount(n.monthlyAmount), 0);
      drawText('סה"כ:', 450, expenseY + 10, 10);
      drawText(`₪${childrenTotal.toLocaleString('he-IL')}`, 100, expenseY + 10, 10);
    }

    // ==============================================
    // PAGE 4 - HOUSEHOLD NEEDS TABLE
    // ==============================================
    if (pages[3] && data.householdNeeds && data.householdNeeds.length > 0) {
      console.log(`   📄 Filling Page 4: Household Needs (${data.householdNeeds.length} items)`);
      const page = pages[3];
      const { width, height } = page.getSize();

      const drawText = (text: string, x: number, y: number, size: number = 9) => {
        if (!text) return;
        try {
          page.drawText(text, {
            x,
            y: height - y,
            size,
            font,
            color: rgb(0, 0, 0),
          });
        } catch (error) {
          console.log(`   ⚠️ Error drawing text at (${x}, ${y}):`, error instanceof Error ? error.message : String(error));
        }
      };

      // Table starts at similar position as page 3
      let expenseY = 200;
      const ROW_HEIGHT = 22;

      // Add expense rows (limit to 15 rows per page)
      data.householdNeeds.slice(0, 15).forEach((need, index) => {
        // Category column
        drawText(need.category, 450, expenseY, 8);
        // Description column (truncate if too long)
        const description = need.description.substring(0, 35);
        drawText(description, 250, expenseY, 8);
        // Amount column
        const amount = numericAmount(need.monthlyAmount);
        drawText(`₪${amount.toLocaleString('he-IL')}`, 100, expenseY, 8);
        expenseY += ROW_HEIGHT;
      });

      // Total row
      const householdTotal = data.householdNeeds.reduce((sum, n) => sum + numericAmount(n.monthlyAmount), 0);
      drawText('סה"כ:', 450, expenseY + 10, 10);
      drawText(`₪${householdTotal.toLocaleString('he-IL')}`, 100, expenseY + 10, 10);
    }

    // Save the modified PDF for debugging
    const modifiedPdfBytes = await pdfDoc.save();
    const outputDir = path.join(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const outputPath = path.join(outputDir, `form4-filled-${Date.now()}.pdf`);
    fs.writeFileSync(outputPath, modifiedPdfBytes);
    console.log(`   💾 Saved filled PDF: ${outputPath}`);

    // Convert to images
    console.log('   🖼️ Converting PDF to images...');

    // Dynamically import pdfjs-dist/legacy for Node.js compatibility
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

    // Configure worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = require.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs');

    // Load the PDF with PDF.js
    const loadingTask = pdfjsLib.getDocument({
      data: modifiedPdfBytes,
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    console.log(`   Pages to convert: ${numPages}`);

    const images: Buffer[] = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: dpi / 72 });

      const canvas = createCanvas(viewport.width, viewport.height);
      const context = canvas.getContext('2d');

      await page.render({
        canvasContext: context as any,
        viewport: viewport,
      } as any).promise; // Type assertion for PDF.js compatibility

      const imageBuffer = canvas.toBuffer('image/png');
      images.push(imageBuffer);

      const sizeKB = (imageBuffer.length / 1024).toFixed(2);
      console.log(`   ✅ Page ${pageNum}/${numPages} converted (${sizeKB} KB)`);
    }

    console.log(`✅ Form 4 completed: ${images.length} images created`);
    return images;
  } catch (error) {
    console.error('❌ Error in Form 4 text overlay:', error);
    throw error;
  }
}
