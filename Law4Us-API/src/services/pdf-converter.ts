/**
 * PDF to Image Conversion Service
 * Converts PDF pages to high-quality PNG images for insertion into Word documents
 */

import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import { UploadedFile, ProcessedAttachment } from '../types';

/**
 * Convert a PDF file to array of PNG image buffers (one per page)
 *
 * @param pdfBuffer - PDF file as Buffer
 * @param options - Conversion options
 * @returns Array of PNG buffers, one per page
 */
export async function convertPdfToImages(
  pdfBuffer: Buffer,
  options: {
    dpi?: number;
    maxWidth?: number;
    quality?: number;
  } = {}
): Promise<Buffer[]> {
  const { dpi = 150, maxWidth = 794, quality = 90 } = options; // 794px = A4 width at 96 DPI

  try {
    // Load PDF
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pageCount = pdfDoc.getPageCount();

    console.log(`📄 Converting PDF: ${pageCount} pages`);

    const images: Buffer[] = [];

    // For now, we'll use a simpler approach: render each page using pdf-lib
    // In production, you might want to use pdf2pic or pdfjs-dist for better rendering

    // Extract each page as a separate PDF, then convert
    for (let i = 0; i < pageCount; i++) {
      console.log(`  📝 Processing page ${i + 1}/${pageCount}...`);

      // Create a new PDF with just this page
      const singlePagePdf = await PDFDocument.create();
      const [copiedPage] = await singlePagePdf.copyPages(pdfDoc, [i]);
      singlePagePdf.addPage(copiedPage);

      // Get page dimensions
      const page = singlePagePdf.getPages()[0];
      const { width, height } = page.getSize();

      // Save as buffer
      const pdfBytes = await singlePagePdf.save();

      // For true PDF->Image conversion, we need a rendering library
      // Since sharp doesn't handle PDF directly, we'll use a placeholder approach
      // In production, integrate with pdf-poppler or similar

      // TEMPORARY: Create a placeholder image with page number
      // TODO: Replace with actual PDF rendering using pdf-poppler or canvas
      const placeholderImage = await createPlaceholderImage(
        i + 1,
        Math.round(width),
        Math.round(height)
      );

      images.push(placeholderImage);
    }

    console.log(`✅ Converted ${pageCount} pages to images`);
    return images;
  } catch (error) {
    console.error('❌ Error converting PDF to images:', error);
    throw new Error(`PDF conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create a placeholder image (temporary until we integrate proper PDF rendering)
 *
 * @param pageNumber - Page number to display
 * @param width - Image width
 * @param height - Image height
 * @returns PNG buffer
 */
async function createPlaceholderImage(
  pageNumber: number,
  width: number,
  height: number
): Promise<Buffer> {
  // Create a white background with text
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white"/>
      <rect width="100%" height="100%" fill="none" stroke="#ddd" stroke-width="2"/>
      <text
        x="50%"
        y="50%"
        font-family="Arial, sans-serif"
        font-size="24"
        fill="#666"
        text-anchor="middle"
        dominant-baseline="middle"
      >
        PDF Page ${pageNumber}
      </text>
      <text
        x="50%"
        y="60%"
        font-family="Arial, sans-serif"
        font-size="14"
        fill="#999"
        text-anchor="middle"
        dominant-baseline="middle"
      >
        (Original PDF content will appear here)
      </text>
    </svg>
  `;

  return sharp(Buffer.from(svg))
    .png()
    .toBuffer();
}

/**
 * Convert an image file to optimized PNG for Word document insertion
 *
 * @param imageBuffer - Image file as Buffer
 * @param options - Conversion options
 * @returns Optimized PNG buffer
 */
export async function convertImageToPng(
  imageBuffer: Buffer,
  options: {
    maxWidth?: number;
    quality?: number;
  } = {}
): Promise<Buffer> {
  const { maxWidth = 794, quality = 90 } = options;

  try {
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    console.log(`🖼️  Converting image: ${metadata.width}x${metadata.height} ${metadata.format}`);

    // Resize if needed while maintaining aspect ratio
    let processor = image;
    if (metadata.width && metadata.width > maxWidth) {
      processor = processor.resize(maxWidth, undefined, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Convert to PNG
    const pngBuffer = await processor
      .png({ quality })
      .toBuffer();

    console.log(`✅ Converted to PNG: ${pngBuffer.length} bytes`);
    return pngBuffer;
  } catch (error) {
    console.error('❌ Error converting image to PNG:', error);
    throw new Error(`Image conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Process uploaded attachment file (PDF or image) into PNG images
 *
 * @param file - Uploaded file
 * @param label - Attachment label (e.g., "נספח א")
 * @returns Processed attachment with PNG images
 */
export async function processAttachment(
  file: UploadedFile,
  label: string
): Promise<ProcessedAttachment> {
  console.log(`\n📎 Processing attachment: ${label} (${file.originalname})`);
  console.log(`   Type: ${file.mimetype}, Size: ${(file.size / 1024).toFixed(2)} KB`);

  let images: Buffer[] = [];

  try {
    if (file.mimetype === 'application/pdf') {
      // Convert PDF pages to images
      images = await convertPdfToImages(file.buffer);
    } else if (file.mimetype.startsWith('image/')) {
      // Convert image to optimized PNG
      const pngImage = await convertImageToPng(file.buffer);
      images = [pngImage];
    } else {
      throw new Error(`Unsupported file type: ${file.mimetype}`);
    }

    console.log(`✅ Processed: ${images.length} page(s)`);

    return {
      label,
      images,
      originalFile: file,
    };
  } catch (error) {
    console.error(`❌ Error processing attachment ${label}:`, error);
    throw error;
  }
}

/**
 * Batch process multiple attachments
 *
 * @param attachments - Array of files with labels
 * @returns Array of processed attachments
 */
export async function processAttachments(
  attachments: Array<{ file: UploadedFile; label: string }>
): Promise<ProcessedAttachment[]> {
  console.log(`\n🔄 Processing ${attachments.length} attachments...`);

  const results: ProcessedAttachment[] = [];

  for (const { file, label } of attachments) {
    try {
      const processed = await processAttachment(file, label);
      results.push(processed);
    } catch (error) {
      console.error(`Failed to process ${label}:`, error);
      // Continue with other attachments even if one fails
    }
  }

  console.log(`\n✅ Successfully processed ${results.length}/${attachments.length} attachments`);
  return results;
}
