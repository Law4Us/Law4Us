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
 * Add your test coordinates here to calibrate
 */
const PAGE_1_TEST_FIELDS = [
  // Header boxes
  { label: 'Plaintiff Name', text: 'שרה לוי', x: 640, y: 310, fontSize: 12, align: 'center' },
  { label: 'Defendant Name', text: 'יוסי לוי', x: 180, y: 310, fontSize: 12, align: 'center' },

  // Table row 1 - Personal info (5 columns)
  { label: 'Col1: Name (Plaintiff)', text: 'שרה לוי', x: 720, y: 480, fontSize: 10, align: 'center' },
  { label: 'Col2: ID (Plaintiff)', text: '345678901', x: 580, y: 480, fontSize: 10, align: 'center' },
  { label: 'Col3: Address (Plaintiff)', text: 'רחוב ירושלים 24', x: 380, y: 480, fontSize: 9, align: 'center' },
  { label: 'Col4: Birth Date (Plaintiff)', text: '1985-05-10', x: 200, y: 480, fontSize: 10, align: 'center' },
  { label: 'Col5: Relationship', text: 'בעל ובעלה', x: 80, y: 480, fontSize: 9, align: 'center' },

  // Field 6: Previous proceedings checkbox
  { label: 'Field 6: Yes checkbox', text: '✓', x: 170, y: 615, fontSize: 14, align: 'center' },
  { label: 'Field 6: Details line', text: 'פרטי הליך קודם...', x: 400, y: 650, fontSize: 10, align: 'right' },

  // Field 7: Last alimony
  { label: 'Field 7: Amount', text: '₪5,000', x: 580, y: 720, fontSize: 10, align: 'right' },
  { label: 'Field 7: Date', text: '2023-01-15', x: 220, y: 720, fontSize: 10, align: 'right' },

  // Field 8: Employment table (first row)
  { label: 'Field 8 Row 1: Period', text: 'התקופה', x: 680, y: 870, fontSize: 9, align: 'center' },
  { label: 'Field 8 Row 1: Amount 1', text: 'ברוטו', x: 480, y: 870, fontSize: 9, align: 'center' },
  { label: 'Field 8 Row 1: Amount 2', text: 'ברוטו', x: 280, y: 870, fontSize: 9, align: 'center' },
];

/**
 * Add text overlay to PNG and save result
 */
async function calibrateCoordinates(pageNum, testFields) {
  console.log(`\n🎯 Calibrating Page ${pageNum}...\n`);

  // Load template PNG
  const templatePath = path.join(__dirname, '..', 'lfc525 (2)', `lfc525 (2)-${pageNum}.png`);
  if (!fs.existsSync(templatePath)) {
    console.error(`❌ Template not found: ${templatePath}`);
    return;
  }

  const image = await loadImage(templatePath);
  console.log(`📐 Image dimensions: ${image.width}×${image.height} pixels`);

  // Create canvas
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');

  // Draw base image
  ctx.drawImage(image, 0, 0);

  // Draw grid lines (optional, helpful for measuring)
  ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
  ctx.lineWidth = 1;

  // Vertical lines every 100px
  for (let x = 0; x < image.width; x += 100) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, image.height);
    ctx.stroke();
  }

  // Horizontal lines every 100px
  for (let y = 0; y < image.height; y += 100) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(image.width, y);
    ctx.stroke();
  }

  // Draw test fields
  testFields.forEach((field, index) => {
    // Draw crosshair at position
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    const crosshairSize = 20;

    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(field.x - crosshairSize, field.y);
    ctx.lineTo(field.x + crosshairSize, field.y);
    ctx.stroke();

    // Vertical line
    ctx.beginPath();
    ctx.moveTo(field.x, field.y - crosshairSize);
    ctx.lineTo(field.x, field.y + crosshairSize);
    ctx.stroke();

    // Draw text
    ctx.fillStyle = '#0000FF'; // Blue for test text
    ctx.textBaseline = 'top';
    ctx.direction = 'rtl';
    ctx.font = `${field.fontSize}px "Noto Sans Hebrew", Arial`;
    ctx.textAlign = field.align || 'right';
    ctx.fillText(field.text, field.x, field.y);

    // Draw label above
    ctx.fillStyle = '#FF0000'; // Red for labels
    ctx.font = `8px Arial`;
    ctx.textAlign = 'left';
    ctx.fillText(`[${index + 1}] ${field.label}`, field.x + 25, field.y - 15);

    console.log(`   ✓ [${index + 1}] ${field.label}: (${field.x}, ${field.y})`);
  });

  // Save output
  const outputDir = path.join(__dirname, 'calibration-output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, `page-${pageNum}-calibrated.png`);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);

  console.log(`\n✅ Calibration image saved: ${outputPath}`);
  console.log(`   Size: ${(buffer.length / 1024).toFixed(2)} KB\n`);
}

// Run calibration
(async () => {
  console.log('\n🎯 Form 4 Coordinate Calibration Tool');
  console.log('='.repeat(50));

  try {
    // Calibrate Page 1
    await calibrateCoordinates(1, PAGE_1_TEST_FIELDS);

    console.log('\n📋 Next Steps:');
    console.log('1. Open calibration-output/page-1-calibrated.png');
    console.log('2. Check if blue text aligns with form fields');
    console.log('3. Check if red crosshairs mark the correct positions');
    console.log('4. Adjust coordinates in this script and re-run');
    console.log('5. Once calibrated, copy coordinates to form4-png-overlay.ts\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
  }
})();
