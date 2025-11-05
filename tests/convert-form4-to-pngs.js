/**
 * Convert Form 4 PDF to individual PNG pages
 * Run this once to create the PNG templates
 */

const fs = require('fs');
const path = require('path');

async function convertForm4ToPngs() {
  console.log('\n📄 Converting Form 4 PDF to PNG pages...\n');

  try {
    // Dynamically import pdfjs-dist
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const { createCanvas } = require('canvas');

    pdfjsLib.GlobalWorkerOptions.workerSrc = require.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs');

    // Read Form 4 PDF
    const pdfPath = path.join(__dirname, 'lfc525 (2).pdf');
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfBytes = new Uint8Array(pdfBuffer);

    console.log(`📖 Loading PDF: ${pdfPath}`);
    console.log(`   Size: ${(pdfBuffer.length / 1024).toFixed(2)} KB\n`);

    // Load PDF
    const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
    const pdfDocument = await loadingTask.promise;

    const numPages = pdfDocument.numPages;
    console.log(`📄 Found ${numPages} pages\n`);

    // Create output directory
    const outputDir = path.join(__dirname, 'form4-templates');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`📁 Created directory: ${outputDir}\n`);
    }

    // Convert each page to PNG at 150 DPI
    const dpi = 150;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      console.log(`🖼️  Processing page ${pageNum}/${numPages}...`);

      const page = await pdfDocument.getPage(pageNum);
      const viewport = page.getViewport({ scale: dpi / 72 });

      // Create canvas
      const canvas = createCanvas(viewport.width, viewport.height);
      const context = canvas.getContext('2d');

      // Render PDF page to canvas
      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      // Save as PNG
      const imageBuffer = canvas.toBuffer('image/png', { compressionLevel: 6 });
      const filename = `page-${pageNum}.png`;
      const filepath = path.join(outputDir, filename);

      fs.writeFileSync(filepath, imageBuffer);

      const sizeKB = (imageBuffer.length / 1024).toFixed(2);
      const dimensions = `${viewport.width.toFixed(0)}×${viewport.height.toFixed(0)}px`;

      console.log(`   ✅ Saved: ${filename}`);
      console.log(`      Size: ${sizeKB} KB, ${dimensions}, ${dpi} DPI\n`);
    }

    console.log('🎉 All pages converted successfully!');
    console.log(`📁 Output directory: ${outputDir}`);
    console.log('');
    console.log('✅ You can now use these PNG templates for text overlay');

  } catch (error) {
    console.error('\n❌ Error:', error);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
  }
}

convertForm4ToPngs();
