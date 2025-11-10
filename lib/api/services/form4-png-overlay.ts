/**
 * Form 4 PNG Overlay - High-quality PNG generation with text overlay
 *
 * This approach (USER SUGGESTED):
 * 1. Convert blank PDF template to high-resolution PNG (150 DPI)
 * 2. Use canvas to draw Hebrew text directly on PNG at specific coordinates
 * 3. Return filled PNG images (no PDF field dependency!)
 *
 * Why this works better:
 * - No dependency on PDF field names
 * - Full control over text positioning
 * - Works with any PDF template
 * - High-quality output suitable for court documents
 */

import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage, registerFont } from 'canvas';
import type { Form4Data } from './form4-filler';
import { ensureHebrewFontPath } from './font-utils';

let hebrewFontRegistered = false;

async function ensureCanvasFontRegistered() {
  if (hebrewFontRegistered) {
    return;
  }

  try {
    const fontPath = await ensureHebrewFontPath();
    registerFont(fontPath, { family: 'Noto Sans Hebrew' });
    hebrewFontRegistered = true;
    console.log(`✅ Hebrew font registered for Form 4 overlay (${fontPath})`);
  } catch (error) {
    console.error('⚠️ Failed to register Hebrew font for Form 4 overlay:', error);
  }
}

/**
 * Field coordinate definition for text overlay
 * Coordinates are at 150 DPI resolution
 */
interface FieldCoordinate {
  x: number; // X position (pixels from left)
  y: number; // Y position (pixels from top)
  fontSize: number; // Font size in pixels
  maxWidth?: number; // Max width for text (optional, for wrapping)
  align?: 'right' | 'left' | 'center'; // Text alignment (default: right for Hebrew)
}

const CHILDREN_NEEDS_LAYOUT = {
  startY: 260,
  rowSpacing: 55,
  maxRows: 15,
  categoryX: 450,
  descriptionX: 260,
  amountX: 110,
  fontSize: 20,
  totalOffset: 30,
};

const HOUSEHOLD_NEEDS_LAYOUT = {
  startY: 260,
  rowSpacing: 55,
  maxRows: 15,
  categoryX: 450,
  descriptionX: 260,
  amountX: 110,
  fontSize: 20,
  totalOffset: 30,
};

const toCurrencyNumber = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

function resolveForm4TemplateFolder(): string {
  const explicitDir = process.env.FORM4_TEMPLATE_DIR;
  if (explicitDir && fs.existsSync(explicitDir)) {
    return explicitDir;
  }

  const candidateSet = new Set<string>();
  const visited = new Set<string>();
  const rootsToCheck = [process.cwd(), __dirname];

  const appendCandidatesForRoot = (root: string) => {
    let current = root;
    const { root: fsRoot } = path.parse(current);

    while (!visited.has(current)) {
      visited.add(current);
      candidateSet.add(path.join(current, 'templates', 'form4-templates'));
      candidateSet.add(path.join(current, 'public', 'form4-templates'));
      candidateSet.add(path.join(current, '.next', 'standalone', 'public', 'form4-templates'));

      if (current === fsRoot) {
        break;
      }

      const parent = path.dirname(current);
      if (parent === current) {
        break;
      }
      current = parent;
    }
  };

  rootsToCheck.forEach(appendCandidatesForRoot);

  for (const candidate of candidateSet) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    `Form 4 PNG template folder not found. Checked: ${Array.from(candidateSet).join(', ')}`
  );
}

/**
 * Form 4 field coordinate mappings
 * Measured for 150 DPI PNG templates (1654×2339 pixels per page)
 *
 * COORDINATE SYSTEM:
 * - Origin (0,0) is top-left corner
 * - X increases from left to right
 * - Y increases from top to bottom
 * - For Hebrew RTL text, use align: 'right'
 *
 * FORM STRUCTURE:
 * Page 1: Header boxes, Section A (fields 1-8 start)
 * Page 2: Field 8 continuation, fields 9-12
 * Page 3: Fields 13-15, Section B (spouse alimony)
 * Pages 4-6: Expense tables and additional details
 */
const FORM4_FIELD_COORDINATES: Record<string, FieldCoordinate> = {
  //==========================================================================
  // PAGE 1 - Header and Basic Information
  //==========================================================================

  // Header boxes (top of page) - Adjusted to center text inside boxes
  // Right box (plaintiff): x=500-815, center≈657, y=305-365, text baseline≈340
  'header_plaintiff_name': { x: 1300, y: 600, fontSize: 40, align: 'center' },
  // Left box (defendant): x=120-370, center≈245, y=305-365, text baseline≈340
  'header_defendant_name': { x: 500, y: 600, fontSize: 40, align: 'center' },

  // Section A - Main personal info table (5 columns)
  // Table starts at y≈435, row height≈55px
  // Columns (left to right): Col5 (Relationship), Col4 (Birthdate), Col3 (Address), Col2 (ID), Col1 (Name)

  // Row 1: Plaintiff/Applicant (first data row, y≈465-520, text baseline≈492)
  'table_row1_col1_name': { x: 1400, y: 870, fontSize: 24, align: 'center' },        // Rightmost column
  'table_row1_col2_id': { x: 1130, y: 870, fontSize: 24, align: 'center' },
  'table_row1_col3_address': { x: 900, y: 870, fontSize: 24, align: 'center', maxWidth: 180 },
  'table_row1_col4_birthdate': { x: 650, y: 870, fontSize: 24, align: 'center' },
  'table_row1_col5_relationship': { x: 380, y: 870, fontSize: 24, align: 'center' }, // Leftmost column

  // Field 6: Previous proceedings (checkboxes y≈630 and y≈672)
  // Checkboxes are at x≈745 (right side)
  'field6_checkbox_yes': { x: 1420, y: 970, fontSize: 28, align: 'center' },
  'field6_checkbox_no': { x: 1420, y: 1070, fontSize: 28, align: 'center' },
  'field6_details': { x: 1200, y: 1000, fontSize: 20, align: 'right', maxWidth: 600 },

  // Field 7: Last alimony (text baseline≈760)
  'field7_amount': { x: 1200, y: 1180, fontSize: 22, align: 'right' },
  'field7_date': { x: 600, y: 1180, fontSize: 22, align: 'right' },

  // Field 8: Employment table - First data row baseline≈965
  // Table has 3 columns from right to left: התקופה (Period), ברוטו (Amount 1), ברוטו (Amount 2)
  // Each row is about 50px apart
  'field8_row1_col1': { x: 1200, y: 1350, fontSize: 20, align: 'center' },  // Period (rightmost)
  'field8_row1_col2': { x: 820, y: 1350, fontSize: 20, align: 'center' },  // Respondent amount
  'field8_row1_col3': { x: 400, y: 1350, fontSize: 20, align: 'center' },  // Applicant amount (leftmost)

  'field8_row2_col1': { x: 1200, y: 1400, fontSize: 9, align: 'center' },
  'field8_row2_col2': { x: 820, y: 1400, fontSize: 9, align: 'center' },
  'field8_row2_col3': { x: 400, y: 1400, fontSize: 9, align: 'center' },

  'field8_row3_col1': { x: 1200, y: 1450, fontSize: 9, align: 'center' },
  'field8_row3_col2': { x: 820, y: 1450, fontSize: 9, align: 'center' },
  'field8_row3_col3': { x: 400, y: 1450, fontSize: 9, align: 'center' },

  'field8_row4_col1': { x: 1200, y: 1500, fontSize: 9, align: 'center' },
  'field8_row4_col2': { x: 820, y: 1500, fontSize: 9, align: 'center' },
  'field8_row4_col3': { x: 400, y: 1500, fontSize: 9, align: 'center' },

  'field8_row5_col1': { x: 1200, y: 1550, fontSize: 9, align: 'center' },
  'field8_row5_col2': { x: 820, y: 1550, fontSize: 9, align: 'center' },
  'field8_row5_col3': { x: 400, y: 1550, fontSize: 9, align: 'center' },

  'field8_row6_col1': { x: 1200, y: 1600, fontSize: 9, align: 'center' },
  'field8_row6_col2': { x: 820, y: 1600, fontSize: 9, align: 'center' },
  'field8_row6_col3': { x: 400, y: 1600, fontSize: 9, align: 'center' },

  'field8_row7_col1': { x: 1200, y: 1650, fontSize: 9, align: 'center' },
  'field8_row7_col2': { x: 820, y: 1650, fontSize: 9, align: 'center' },
  'field8_row7_col3': { x: 400, y: 1650, fontSize: 9, align: 'center' },

  'field8_row8_col1': { x: 1200, y: 1700, fontSize: 9, align: 'center' },
  'field8_row8_col2': { x: 820, y: 1700, fontSize: 9, align: 'center' },
  'field8_row8_col3': { x: 400, y: 1700, fontSize: 9, align: 'center' },

  'field8_row9_col1': { x: 1200, y: 1750, fontSize: 9, align: 'center' },
  'field8_row9_col2': { x: 820, y: 1750, fontSize: 9, align: 'center' },
  'field8_row9_col3': { x: 400, y: 1750, fontSize: 9, align: 'center' },

  'field8_row10_col1': { x: 1200, y: 1800, fontSize: 9, align: 'center' },
  'field8_row10_col2': { x: 820, y: 1800, fontSize: 9, align: 'center' },
  'field8_row10_col3': { x: 400, y: 1800, fontSize: 9, align: 'center' },

  'field8_row11_col1': { x: 1200, y: 1850, fontSize: 9, align: 'center' },
  'field8_row11_col2': { x: 820, y: 1850, fontSize: 9, align: 'center' },
  'field8_row11_col3': { x: 400, y: 1850, fontSize: 9, align: 'center' },

  'field8_row12_col1': { x: 1200, y: 1900, fontSize: 9, align: 'center' },
  'field8_row12_col2': { x: 820, y: 1900, fontSize: 9, align: 'center' },
  'field8_row12_col3': { x: 400, y: 1900, fontSize: 9, align: 'center' },

  //==========================================================================
  // PAGE 2 - Employment continuation, Property, Housing
  //==========================================================================

  // Field 8 continuation - Next 12 rows (Page 2 starts around y=100)
  'field8_row13_col1': { x: 1200, y: 1950, fontSize: 9, align: 'center' },
  'field8_row13_col2': { x: 820, y: 1950, fontSize: 9, align: 'center' },
  'field8_row13_col3': { x: 400, y: 1950, fontSize: 9, align: 'center' },

  // ... (rows 14-24 follow same pattern, incrementing y by 50)

  // Field 10: Property details table (around y=750)
  'field10_plaintiff_property': { x: 1400, y: 1050, fontSize: 18, align: 'center', maxWidth: 350 },
  'field10_respondent_property': { x: 800, y: 1050, fontSize: 18, align: 'center', maxWidth: 350 },

  // Field 11: Debts table (around y=950)
  'field11_plaintiff_income': { x: 1400, y: 1600, fontSize: 20, align: 'center' },
  'field11_plaintiff_payments': { x: 1000, y: 1600, fontSize: 20, align: 'center' },
  'field11_plaintiff_debts': { x: 600, y: 1600, fontSize: 18, align: 'center' },

  'field11_respondent_income': { x: 1400, y: 1750, fontSize: 20, align: 'center' },
  'field11_respondent_payments': { x: 1000, y: 1750, fontSize: 20, align: 'center' },
  'field11_respondent_debts': { x: 600, y: 1750, fontSize: 18, align: 'center' },

  // Field 12: Housing details (around y=1230)
  'field12_plaintiff_address': { x: 1400, y: 1950, fontSize: 18, align: 'center' },
  'field12_plaintiff_rooms': { x: 1000, y: 1950, fontSize: 20, align: 'center' },
  'field12_plaintiff_expense': { x: 600, y: 1950, fontSize: 20, align: 'center' },

  'field12_respondent_address': { x: 1400, y: 2090, fontSize: 18, align: 'center' },
  'field12_respondent_rooms': { x: 1000, y: 2090, fontSize: 20, align: 'center' },
  'field12_respondent_expense': { x: 600, y: 2090, fontSize: 20, align: 'center' },

  //==========================================================================
  // PAGE 3 - Bank Accounts, Vehicle, Requested Amount, Section B
  //==========================================================================

  // Field 13: Bank accounts (4 rows starting around y=200)
  'field13_bank1_name': { x: 1300, y: 350, fontSize: 20, align: 'center' },
  'field13_bank1_account': { x: 750, y: 350, fontSize: 20, align: 'center' },

  'field13_bank2_name': { x: 1300, y: 375, fontSize: 20, align: 'center' },
  'field13_bank2_account': { x: 750, y: 375, fontSize: 20, align: 'center' },

  'field13_bank3_name': { x: 1300, y: 425, fontSize: 20, align: 'center' },
  'field13_bank3_account': { x: 750, y: 425, fontSize: 20, align: 'center' },

  'field13_bank4_name': { x: 1300, y: 475, fontSize: 20, align: 'center' },
  'field13_bank4_account': { x: 750, y: 475, fontSize: 20, align: 'center' },

  // Field 14: Vehicle (around y=470)
  'field14_details': { x: 600, y: 550, fontSize: 20, align: 'right', maxWidth: 500 },

  // Field 15: Requested amount (around y=510)

  // Section B: Spouse alimony (starting around y=650)
  'sectionB_marriage_date': { x: 1400, y: 880, fontSize: 22, align: 'right' },
  'sectionB_plaintiff_residence': { x: 1100, y: 1000, fontSize: 20, align: 'right' },

  // More Section B fields...
};

/**
 * Load pre-generated Form 4 PNG template pages
 * Much faster than converting PDF every time!
 */
async function loadForm4PngTemplates(): Promise<Buffer[]> {
  console.log(`🖼️  Loading pre-generated Form 4 PNG templates...`);

  // Path to pre-generated PNG folder (in public directory for Vercel deployment)
  const pngFolderPath = resolveForm4TemplateFolder();
  console.log(`   תבניות: ${pngFolderPath}`);

  if (!fs.existsSync(pngFolderPath)) {
    throw new Error(`Form 4 PNG template folder not found at: ${pngFolderPath}`);
  }

  // Form 4 has 6 pages
  const numPages = 6;
  const images: Buffer[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const filename = `lfc525 (2)-${pageNum}.png`;
    const filepath = path.join(pngFolderPath, filename);

    if (!fs.existsSync(filepath)) {
      throw new Error(`Form 4 PNG page ${pageNum} not found at: ${filepath}`);
    }

    const imageBuffer = fs.readFileSync(filepath);
    images.push(imageBuffer);

    const sizeKB = (imageBuffer.length / 1024).toFixed(2);
    console.log(`   ✅ Loaded page ${pageNum}/${numPages}: ${filename} (${sizeKB} KB)`);
  }

  return images;
}

/**
 * Text element for overlay
 */
interface TextElement {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  align?: 'right' | 'left' | 'center';
  bold?: boolean;
  maxWidth?: number;
}

/**
 * Add text overlay to PNG image (supports Hebrew RTL)
 */
async function addTextOverlayToPng(
  imageBuffer: Buffer,
  textElements: TextElement[]
): Promise<Buffer> {
  console.log(`   📝 Adding ${textElements.length} text overlays...`);

  // Load the base image
  const image = await loadImage(imageBuffer);

  // Create canvas with same dimensions
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');

  // Draw base image
  ctx.drawImage(image, 0, 0);

  // Configure canvas for Hebrew text
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#000000'; // Black text
  ctx.direction = 'rtl'; // Right-to-left for Hebrew
  const lineHeightMultiplier = 1.2;

  // Add text overlays
  textElements.forEach((element, index) => {
    const fontWeight = element.bold ? 'bold' : 'normal';
    ctx.font = `${fontWeight} ${element.fontSize}px "Noto Sans Hebrew", Arial, sans-serif`;
    ctx.textAlign = element.align || 'right'; // Default to right for Hebrew

    if (element.maxWidth) {
      // Wrap text if maxWidth specified
      const lines = wrapText(ctx, element.text, element.maxWidth);
      if (lines.length > 0) {
        const lineHeight = element.fontSize * lineHeightMultiplier;
        const totalHeight = lines.length * lineHeight;
        const startY = element.y - (totalHeight - lineHeight) / 2;

        lines.forEach((line, lineIndex) => {
          const lineY = startY + lineIndex * lineHeight;
          ctx.fillText(line, element.x, lineY);
        });
      }
    } else {
      // Draw text at position
      ctx.fillText(element.text, element.x, element.y);
    }

    console.log(`      ✓ [${index + 1}/${textElements.length}] "${element.text.substring(0, 30)}..." at (${element.x}, ${element.y})`);
  });

  // Return PNG buffer
  return canvas.toBuffer('image/png', { compressionLevel: 6 });
}

/**
 * Wrap text to fit within maxWidth
 */
function wrapText(ctx: any, text: string, maxWidth: number): string[] {
  const sanitized = (text || '').toString().trim();
  if (!sanitized) {
    return [];
  }

  const words = sanitized.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Map Form4Data to text overlay elements for all pages
 */
function mapDataToTextOverlays(data: Form4Data, pageIndex: number): TextElement[] {
  const overlays: TextElement[] = [];

  //============================================================================
  // PAGE 1 - Header and Basic Information
  //============================================================================
  if (pageIndex === 0) {
    // Header boxes
    addField(overlays, 'header_plaintiff_name', data.applicantName);
    addField(overlays, 'header_defendant_name', data.respondentName);

    // Main personal info table - Row 1 (Plaintiff/Applicant)
    addField(overlays, 'table_row1_col1_name', data.applicantName);
    addField(overlays, 'table_row1_col2_id', data.applicantId);
    addField(overlays, 'table_row1_col3_address', data.applicantAddress);
    addField(overlays, 'table_row1_col4_birthdate', formatDate(data.applicantBirthDate));
    addField(overlays, 'table_row1_col5_relationship', getRelationshipLabel(data.relationshipType));

    // Main personal info table - Row 2 (Defendant/Respondent)
    addField(overlays, 'table_row2_col1_name', data.respondentName);
    addField(overlays, 'table_row2_col2_id', data.respondentId);
    addField(overlays, 'table_row2_col3_address', data.respondentAddress);
    addField(overlays, 'table_row2_col4_birthdate', formatDate(data.respondentBirthDate));

    // Field 6: Previous proceedings
    if (data.hasPreviousProceedings) {
      addField(overlays, 'field6_checkbox_yes', '✓');
      if (data.previousProceedingsDetails) {
        addField(overlays, 'field6_details', data.previousProceedingsDetails);
      }
    } else {
      addField(overlays, 'field6_checkbox_no', '✓');
    }

    // Field 7: Last alimony
    if (data.lastAlimonyAmount) {
      addField(overlays, 'field7_amount', data.lastAlimonyAmount);
    }
    if (data.lastAlimonyDate) {
      addField(overlays, 'field7_date', formatDate(data.lastAlimonyDate));
    }

    // Field 8: Employment table (Page 1 shows rows 1-12)
    // TODO: Add actual 12-month employment data when available
    // For now, show applicant/respondent employment status and income
    if (data.applicantEmployment.monthlyIncome) {
      addField(overlays, 'field8_row1_col3', `₪${data.applicantEmployment.monthlyIncome.toLocaleString('he-IL')}`);
    }
    if (data.respondentEmployment.estimatedIncome) {
      addField(overlays, 'field8_row1_col2', `₪${data.respondentEmployment.estimatedIncome.toLocaleString('he-IL')}`);
    }
  }

  //============================================================================
  // PAGE 2 - Employment continuation, Property, Housing
  //============================================================================
  else if (pageIndex === 1) {
    // Field 10: Property details
    const applicantPropertySummary = formatPropertySummary(data.applicantProperty);
    if (applicantPropertySummary) {
      addField(overlays, 'field10_plaintiff_property', applicantPropertySummary);
    }

    const respondentPropertySummary = formatPropertySummary(data.respondentProperty);
    if (respondentPropertySummary) {
      addField(overlays, 'field10_respondent_property', respondentPropertySummary);
    }

    // Field 11: Debts
    if (data.applicantEmployment.monthlyIncome) {
      addField(overlays, 'field11_plaintiff_income', `₪${data.applicantEmployment.monthlyIncome.toLocaleString('he-IL')}`);
    }
    if (data.applicantDebts) {
      addField(overlays, 'field11_plaintiff_debts', data.applicantDebts);
    }

    if (data.respondentEmployment.estimatedIncome) {
      addField(overlays, 'field11_respondent_income', `₪${data.respondentEmployment.estimatedIncome.toLocaleString('he-IL')}`);
    }
    if (data.respondentDebts) {
      addField(overlays, 'field11_respondent_debts', data.respondentDebts);
    }

    // Field 12: Housing
    addField(overlays, 'field12_plaintiff_address', data.applicantAddress);
    if (data.applicantHousing.monthlyExpense) {
      addField(overlays, 'field12_plaintiff_expense', `₪${data.applicantHousing.monthlyExpense.toLocaleString('he-IL')}`);
    }

    addField(overlays, 'field12_respondent_address', data.respondentAddress);
    if (data.respondentHousing.monthlyExpense) {
      addField(overlays, 'field12_respondent_expense', `₪${data.respondentHousing.monthlyExpense.toLocaleString('he-IL')}`);
    }
  }

  //============================================================================
  // PAGE 3 - Bank Accounts, Vehicle, Requested Amount, Section B
  //============================================================================
  else if (pageIndex === 2) {
    // Field 13: Bank accounts (up to 4)
    data.bankAccounts.slice(0, 4).forEach((account, index) => {
      const rowNum = index + 1;
      addField(overlays, `field13_bank${rowNum}_serial`, (index + 1).toString());
      addField(overlays, `field13_bank${rowNum}_name`, account.bankName);
      addField(overlays, `field13_bank${rowNum}_account`, account.accountNumber);
    });

    // Field 14: Vehicle
    if (data.hasVehicle) {
      addField(overlays, 'field14_checkbox_yes', '✓');
      if (data.vehicleDetails) {
        addField(overlays, 'field14_details', data.vehicleDetails);
      }
    } else {
      addField(overlays, 'field14_checkbox_no', '✓');
    }

    // Field 15: Requested alimony amount

    // Section B: Spouse alimony details
    if (data.marriageDate) {
      addField(overlays, 'sectionB_marriage_date', formatDate(data.marriageDate));
    }
    if (data.livingTogether) {
      addField(overlays, 'sectionB_marital_status_checkbox', '✓');
    }
  }

  //============================================================================
  // PAGES 4-6 - Expense tables
  //============================================================================
  else if (pageIndex === 3) {
    const layout = CHILDREN_NEEDS_LAYOUT;
    const needs = data.childrenNeeds || [];
    const rows = Math.min(needs.length, layout.maxRows);
    for (let i = 0; i < rows; i++) {
      const need = needs[i];
      const amount = toCurrencyNumber(need?.monthlyAmount);
      const rowY = layout.startY + i * layout.rowSpacing;
      overlays.push({
        text: need.category,
        x: layout.categoryX,
        y: rowY,
        fontSize: layout.fontSize,
        align: 'center',
      });
      overlays.push({
        text: (need.description || '').substring(0, 40),
        x: layout.descriptionX,
        y: rowY,
        fontSize: layout.fontSize - 2,
        align: 'center',
      });
      overlays.push({
        text: `₪${amount.toLocaleString('he-IL')}`,
        x: layout.amountX,
        y: rowY,
        fontSize: layout.fontSize,
        align: 'center',
      });
    }

    if (needs.length > 0) {
      const total = needs.reduce((sum, item) => sum + toCurrencyNumber(item?.monthlyAmount), 0);
      const totalY = layout.startY + rows * layout.rowSpacing + layout.totalOffset;
      overlays.push({
        text: 'סה"כ',
        x: layout.categoryX,
        y: totalY,
        fontSize: layout.fontSize,
        align: 'center',
      });
      overlays.push({
        text: `₪${total.toLocaleString('he-IL')}`,
        x: layout.amountX,
        y: totalY,
        fontSize: layout.fontSize,
        align: 'center',
      });
    }
  }
  else if (pageIndex === 4) {
    const layout = HOUSEHOLD_NEEDS_LAYOUT;
    const needs = data.householdNeeds || [];
    const rows = Math.min(needs.length, layout.maxRows);
    for (let i = 0; i < rows; i++) {
      const need = needs[i];
      const amount = toCurrencyNumber(need?.monthlyAmount);
      const rowY = layout.startY + i * layout.rowSpacing;
      overlays.push({
        text: need.category,
        x: layout.categoryX,
        y: rowY,
        fontSize: layout.fontSize,
        align: 'center',
      });
      overlays.push({
        text: (need.description || '').substring(0, 40),
        x: layout.descriptionX,
        y: rowY,
        fontSize: layout.fontSize - 2,
        align: 'center',
      });
      overlays.push({
        text: `₪${amount.toLocaleString('he-IL')}`,
        x: layout.amountX,
        y: rowY,
        fontSize: layout.fontSize,
        align: 'center',
      });
    }

    if (needs.length > 0) {
      const total = needs.reduce((sum, item) => sum + toCurrencyNumber(item?.monthlyAmount), 0);
      const totalY = layout.startY + rows * layout.rowSpacing + layout.totalOffset;
      overlays.push({
        text: 'סה"כ',
        x: layout.categoryX,
        y: totalY,
        fontSize: layout.fontSize,
        align: 'center',
      });
      overlays.push({
        text: `₪${total.toLocaleString('he-IL')}`,
        x: layout.amountX,
        y: totalY,
        fontSize: layout.fontSize,
        align: 'center',
      });
    }
  }

  return overlays;
}

/**
 * Helper function to add a field to overlays using the coordinate map
 */
function addField(overlays: TextElement[], fieldKey: string, value: string | undefined) {
  if (!value) return;

  const coords = FORM4_FIELD_COORDINATES[fieldKey];
  if (!coords) {
    console.warn(`⚠️ No coordinates defined for field: ${fieldKey}`);
    return;
  }

  overlays.push({
    text: value,
    x: coords.x,
    y: coords.y,
    fontSize: coords.fontSize,
    align: coords.align,
    maxWidth: coords.maxWidth,
  });
}

/**
 * Format date for display (DD/MM/YYYY)
 */
function formatDate(dateStr: string | undefined): string | undefined {
  if (!dateStr) return undefined;

  try {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr; // Return as-is if parsing fails
  }
}

/**
 * Get Hebrew label for relationship type
 */
function getRelationshipLabel(type: string): string {
  const labels: Record<string, string> = {
    'married': 'בעל ובעלה',
    'divorced': 'גרושים',
    'separated': 'פרודים',
    'never-married': 'ידועים בציבור',
  };
  return labels[type] || type;
}

/**
 * Format property summary for display
 */
function formatPropertySummary(property: any): string | undefined {
  const parts: string[] = [];

  if (property.realEstate) parts.push(`נדל"ן: ${property.realEstate}`);
  if (property.movableProperty) parts.push(`מיטלטלין: ${property.movableProperty}`);
  if (property.investments) parts.push(`השקעות: ${property.investments}`);

  return parts.length > 0 ? parts.join('; ') : undefined;
}

/**
 * Generate Form 4 PNG images with text overlay
 * NEW APPROACH (user suggested):
 * 1. Convert blank PDF to PNG
 * 2. Draw text overlay at coordinates
 * 3. Return filled PNG
 *
 * @param data Form 4 data
 * @param dpi Resolution (default: 150 for court-quality with manageable file size)
 * @returns Array of PNG image buffers with text overlay
 */
export async function generateForm4PngWithOverlay(
  data: Form4Data,
  dpi: number = 150
): Promise<Buffer[]> {
  console.log('\n🔷'.repeat(40));
  console.log('📋 FORM 4 PNG GENERATION WITH TEXT OVERLAY');
  console.log('🔷'.repeat(40));
  console.log(`   Method: PNG overlay (no PDF field dependency)`);
  console.log(`   DPI: ${dpi} (court-quality, optimized file size)`);
  console.log(`   Applicant: ${data.applicantName}`);
  console.log(`   Respondent: ${data.respondentName}`);
  console.log(`   Children: ${data.children.length}`);

  try {
    await ensureCanvasFontRegistered();

    // Step 1: Load pre-generated PNG templates
    console.log('\n📝 Step 1: Loading pre-generated Form 4 PNG templates...');
    const blankPngPages = await loadForm4PngTemplates();
    console.log(`   ✅ Loaded ${blankPngPages.length} Form 4 template pages`);

    // Step 2: Add text overlay to each page
    console.log('\n📝 Step 2: Adding text overlays...');
    const filledPngPages: Buffer[] = [];

    for (let pageIndex = 0; pageIndex < blankPngPages.length; pageIndex++) {
      console.log(`\n   Page ${pageIndex + 1}/${blankPngPages.length}:`);

      // Get text overlays for this page
      const textOverlays = mapDataToTextOverlays(data, pageIndex);

      if (textOverlays.length > 0) {
        // Add text overlay to this page
        const filledPage = await addTextOverlayToPng(blankPngPages[pageIndex], textOverlays);
        filledPngPages.push(filledPage);
        console.log(`   ✅ Added ${textOverlays.length} text overlays to page ${pageIndex + 1}`);
      } else {
        // No overlays for this page - use blank
        filledPngPages.push(blankPngPages[pageIndex]);
        console.log(`   ℹ️  No text overlays for page ${pageIndex + 1} (using blank template)`);
      }
    }

    console.log('\n🔷'.repeat(40));
    console.log(`✅ Form 4 PNG generation complete: ${filledPngPages.length} images`);
    console.log(`   Average size: ${(filledPngPages.reduce((sum, img) => sum + img.length, 0) / filledPngPages.length / 1024).toFixed(2)} KB`);
    console.log('🔷'.repeat(40) + '\n');

    return filledPngPages;

  } catch (error) {
    console.error('❌ Error generating Form 4 PNG:', error);
    throw error;
  }
}
