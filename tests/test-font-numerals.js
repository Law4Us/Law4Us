const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

console.log('Testing NotoSansHebrew font rendering...\n');

// Test 1: Verify font file exists
const fontPath = path.join(__dirname, '..', 'public', 'fonts', 'NotoSansHebrew-Regular.ttf');
console.log(`1. Checking font file: ${fontPath}`);
if (!fs.existsSync(fontPath)) {
  console.error('❌ Font file not found!');
  process.exit(1);
}
console.log(`   ✓ Font file exists (${fs.statSync(fontPath).size} bytes)\n`);

// Test 2: Register font
console.log('2. Registering font with Canvas...');
try {
  registerFont(fontPath, { family: 'Noto Sans Hebrew' });
  console.log('   ✓ Font registered successfully\n');
} catch (error) {
  console.error('❌ Failed to register font:', error.message);
  process.exit(1);
}

// Test 3: Create canvas and render test string
console.log('3. Rendering test string with Hebrew letters AND numbers...');
const testString = 'שלום 123 תאריך 456 סכום 7890 ₪';
console.log(`   Test string: "${testString}"`);
console.log('   Expected: Hebrew letters (שלום, תאריך, סכום) + Numbers (123, 456, 7890) + Shekel (₪)\n');

// Create canvas with enough width for the text
const canvas = createCanvas(800, 150);
const ctx = canvas.getContext('2d');

// Fill background with white
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, 800, 150);

// Set text properties
ctx.fillStyle = '#000000';
ctx.font = '48px "Noto Sans Hebrew"';
ctx.direction = 'rtl'; // Right-to-left for Hebrew
ctx.textAlign = 'right';

// Draw the test string
ctx.fillText(testString, 750, 80);

// Test 4: Save to PNG
const outputPath = path.join(__dirname, '..', 'tmp', 'test-font-output.png');
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('4. Saving output to PNG...');
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(outputPath, buffer);
console.log(`   ✓ Saved to: ${outputPath}\n`);

console.log('='.repeat(60));
console.log('TEST COMPLETE');
console.log('='.repeat(60));
console.log('\nPlease open the output PNG file and verify:');
console.log('  ✓ Hebrew letters render correctly (should see שלום, תאריך, סכום)');
console.log('  ? Numbers render correctly (should see 123, 456, 7890)');
console.log('  ✓ Special characters render (should see ₪)');
console.log('\nIf numbers are MISSING or show as blank spaces, this confirms');
console.log('the issue is in the rendering pipeline, not the font file itself.');
console.log('\nFont file path:', fontPath);
