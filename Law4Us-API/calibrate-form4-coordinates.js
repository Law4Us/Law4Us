/**
 * Form 4 Coordinate Calibration Helper
 *
 * This script helps measure exact pixel coordinates for Form 4 fields.
 * It loads a PNG template, overlays test text at specified coordinates,
 * and saves the result for visual inspection.
 *
 * Usage:
 * 1. Run: node calibrate-form4-coordinates.js
 * 2. Open the output PNG in calibration-output/
 * 3. Check if text aligns with form fields
 * 4. Adjust coordinates and repeat
 */

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage, registerFont } = require('canvas');

// Register Hebrew font
const fontPath = path.join(__dirname, 'NotoSansHebrew-Regular.ttf');
if (fs.existsSync(fontPath)) {
  registerFont(fontPath, { family: 'Noto Sans Hebrew' });
  console.log('✅ Hebrew font registered');
}

/**
 * Test coordinates for Page 1
 */
const PAGE_1_TEST_FIELDS = [
  { label: 'Plaintiff Name', text: 'שרה לוי', x: 640, y: 310, fontSize: 18, align: 'center' },
  { label: 'Defendant Name', text: 'יוסי לוי', x: 245, y: 310, fontSize: 18, align: 'center' },
  { label: 'Row1 Name', text: 'שרה לוי', x: 730, y: 492, fontSize: 20, align: 'center' },
  { label: 'Row1 ID', text: '345678901', x: 590, y: 492, fontSize: 20, align: 'center' },
  { label: 'Row1 Address', text: 'רחוב 1', x: 390, y: 492, fontSize: 20, align: 'center' },
  { label: 'Row1 Birthdate', text: '1985-05-10', x: 210, y: 492, fontSize: 20, align: 'center' },
  { label: 'Row1 Relationship', text: 'בעל', x: 85, y: 492, fontSize: 20, align: 'center' },
  { label: 'Field6 ✓', text: '✓', x: 745, y: 645, fontSize: 28, align: 'center' },
  { label: 'Field7 Amount', text: '₪12,000', x: 500, y: 760, fontSize: 22, align: 'right' },
  { label: 'Field8 Period', text: 'תקופה', x: 700, y: 965, fontSize: 20, align: 'center' },
];

/**
 * Test coordinates for Page 2
 */
const PAGE_2_TEST_FIELDS = [
  { label: 'Field10 Applicant Property', text: 'נדל"ן', x: 620, y: 770, fontSize: 22, align: 'center' },
  { label: 'Field10 Respondent Property', text: 'נדל"ן', x: 200, y: 770, fontSize: 22, align: 'center' },
  { label: 'Field11 Applicant Income', text: '₪12,000', x: 620, y: 975, fontSize: 20, align: 'center' },
  { label: 'Field11 Respondent Income', text: '₪22,000', x: 620, y: 1055, fontSize: 20, align: 'center' },
  { label: 'Field12 Applicant Address', text: 'רחוב 1', x: 600, y: 1255, fontSize: 20, align: 'center' },
  { label: 'Field12 Respondent Address', text: 'רחוב 2', x: 600, y: 1335, fontSize: 20, align: 'center' },
];

/**
 * Test coordinates for Page 3
 */
const PAGE_3_TEST_FIELDS = [
  { label: 'Field13 Bank Name', text: 'בנק', x: 510, y: 230, fontSize: 22, align: 'center' },
  { label: 'Field13 Account Number', text: '123456', x: 230, y: 230, fontSize: 22, align: 'center' },
  { label: 'Field14 ✓', text: '✓', x: 650, y: 475, fontSize: 28, align: 'center' },
  { label: 'Field15 Amount', text: '₪10,000', x: 400, y: 515, fontSize: 26, align: 'right' },
  { label: 'SectionB Marriage Date', text: '10/06/2010', x: 400, y: 750, fontSize: 24, align: 'right' },
];

/**
 * Test coordinates for Pages 4-6 (expenses tables)
 */
const PAGE_4_TEST_FIELDS = [
  { label: 'Children Needs Header', text: 'הוצאות ילדים', x: 400, y: 200, fontSize: 24, align: 'center' },
  { label: 'Children Need Row 1', text: 'חינוך', x: 450, y: 250, fontSize: 22, align: 'center' },
  { label: 'Children Need Amount', text: '₪2,000', x: 100, y: 250, fontSize: 22, align: 'center' },
];

const PAGE_5_TEST_FIELDS = [
  { label: 'Household Header', text: 'מדור', x: 400, y: 200, fontSize: 24, align: 'center' },
  { label: 'Household Row 1', text: 'שכר דירה', x: 450, y: 250, fontSize: 22, align: 'center' },
  { label: 'Household Amount', text: '₪4,500', x: 100, y: 250, fontSize: 22, align: 'center' },
];

const PAGE_6_TEST_FIELDS = [
  { label: 'Misc Header', text: 'הוצאות נוספות', x: 400, y: 200, fontSize: 24, align: 'center' },
  { label: 'Misc Row 1', text: 'סיכום', x: 450, y: 250, fontSize: 22, align: 'center' },
  { label: 'Misc Amount', text: '₪1,000', x: 100, y: 250, fontSize: 22, align: 'center' },
];

/**
 * Add text overlay to PNG and save result
 */
async function calibrateCoordinates(pageNum, testFields) {
  console.log(`\n🎯 Calibrating Page ${pageNum}...\n`);

  const templatePath = path.join(__dirname, '..', 'lfc525 (2)', `lfc525 (2)-${pageNum}.png`);
  if (!fs.existsSync(templatePath)) {
    console.error(`❌ Template not found: ${templatePath}`);
    return;
  }

  const image = await loadImage(templatePath);
  console.log(`📐 Image dimensions: ${image.width}×${image.height} pixels`);

  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);

  ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
  ctx.lineWidth = 1;

  for (let x = 0; x < image.width; x += 100) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, image.height);
    ctx.stroke();
  }

  for (let y = 0; y < image.height; y += 100) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(image.width, y);
    ctx.stroke();
  }

  testFields.forEach((field, index) => {
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    const size = 20;

    ctx.beginPath();
    ctx.moveTo(field.x - size, field.y);
    ctx.lineTo(field.x + size, field.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(field.x, field.y - size);
    ctx.lineTo(field.x, field.y + size);
    ctx.stroke();

    ctx.fillStyle = '#0000FF';
    ctx.textBaseline = 'top';
    ctx.direction = 'rtl';
    ctx.font = `${field.fontSize}px "Noto Sans Hebrew", Arial`;
    ctx.textAlign = field.align || 'right';
    ctx.fillText(field.text, field.x, field.y);

    ctx.fillStyle = '#FF0000';
    ctx.font = '8px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`[${index + 1}] ${field.label}`, field.x + 25, field.y - 15);

    console.log(`   ✓ [${index + 1}] ${field.label}: (${field.x}, ${field.y})`);
  });

  const outputDir = path.join(__dirname, 'calibration-output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, `page-${pageNum}-calibrated.png`);
  fs.writeFileSync(outputPath, canvas.toBuffer('image/png'));
  console.log(`\n✅ Calibration image saved: ${outputPath}\n`);
}

(async () => {
  console.log('\n🎯 Form 4 Coordinate Calibration Tool');
  console.log('='.repeat(50));

  try {
    await calibrateCoordinates(1, PAGE_1_TEST_FIELDS);
    await calibrateCoordinates(2, PAGE_2_TEST_FIELDS);
    await calibrateCoordinates(3, PAGE_3_TEST_FIELDS);
    await calibrateCoordinates(4, PAGE_4_TEST_FIELDS);
    await calibrateCoordinates(5, PAGE_5_TEST_FIELDS);
    await calibrateCoordinates(6, PAGE_6_TEST_FIELDS);
    console.log('\n📋 Calibration PNGs written for pages 1-6.');
  } catch (error) {
    console.error('\n❌ Error:', error);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
  }
})();
