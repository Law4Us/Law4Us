/**
 * Word Document Attachment Inserter
 * Sophisticated service for inserting attachment pages into Word documents
 */

import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { ProcessedAttachment } from '@/lib/api/types';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

// Use custom type names to avoid conflicts with DOM types
type XMLDocument = any;
type XMLElement = any;

/**
 * Insert attachment pages at the end of a Word document
 *
 * @param docBuffer - Original Word document buffer
 * @param attachments - Processed attachments to insert
 * @returns Modified Word document buffer with attachments
 */
export async function insertAttachmentPages(
  docBuffer: Buffer,
  attachments: ProcessedAttachment[]
): Promise<Buffer> {
  console.log(`\n📄 Inserting ${attachments.length} attachments into Word document...`);

  try {
    // Load the Word document
    const zip = new PizZip(docBuffer);

    // Get the document XML
    const documentXml = zip.file('word/document.xml')?.asText();
    if (!documentXml) {
      throw new Error('Invalid Word document: document.xml not found');
    }

    // Parse XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(documentXml, 'text/xml');
    const body = xmlDoc.getElementsByTagName('w:body')[0];

    if (!body) {
      throw new Error('Invalid Word document: body not found');
    }

    // For each attachment, add pages
    let imageCounter = 1;
    for (const attachment of attachments) {
      console.log(`  📎 Adding ${attachment.label}: ${attachment.images.length} page(s)`);

      for (let pageIndex = 0; pageIndex < attachment.images.length; pageIndex++) {
        const image = attachment.images[pageIndex];
        const isFirstPage = pageIndex === 0;

        // Add page break before each attachment (except the first one on the document)
        if (imageCounter > 1 || pageIndex > 0) {
          addPageBreak(xmlDoc, body);
        }

        // Add header with attachment label (only on first page of each attachment)
        if (isFirstPage) {
          addAttachmentHeader(xmlDoc, body, attachment.label);
        }

        // Add the image
        await addImageToDocument(
          zip,
          xmlDoc,
          body,
          image,
          imageCounter,
          `${attachment.label} - עמוד ${pageIndex + 1}`
        );

        imageCounter++;
      }
    }

    // Serialize the modified XML back
    const serializer = new XMLSerializer();
    const modifiedXml = serializer.serializeToString(xmlDoc);

    // Update the document.xml in the zip
    zip.file('word/document.xml', modifiedXml);

    // Generate the final document
    const finalBuffer = zip.generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    console.log(`✅ Successfully inserted ${imageCounter - 1} attachment pages`);
    return finalBuffer;
  } catch (error) {
    console.error('❌ Error inserting attachment pages:', error);
    throw new Error(`Failed to insert attachments: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Add a page break to the Word document
 */
function addPageBreak(xmlDoc: XMLDocument, body: XMLElement): void {
  const pageBreakParagraph = xmlDoc.createElementNS(
    'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'w:p'
  );

  const run = xmlDoc.createElementNS(
    'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'w:r'
  );

  const br = xmlDoc.createElementNS(
    'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'w:br'
  );
  br.setAttribute('w:type', 'page');

  run.appendChild(br);
  pageBreakParagraph.appendChild(run);
  body.appendChild(pageBreakParagraph);
}

/**
 * Add attachment header (e.g., "נספח א")
 */
function addAttachmentHeader(xmlDoc: XMLDocument, body: XMLElement, label: string): void {
  const headerParagraph = xmlDoc.createElementNS(
    'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'w:p'
  );

  // Add paragraph properties for centering and bold
  const pPr = xmlDoc.createElementNS(
    'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'w:pPr'
  );

  const jc = xmlDoc.createElementNS(
    'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'w:jc'
  );
  jc.setAttribute('w:val', 'center');
  pPr.appendChild(jc);

  headerParagraph.appendChild(pPr);

  // Add the text run
  const run = xmlDoc.createElementNS(
    'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'w:r'
  );

  // Run properties (bold, larger font)
  const rPr = xmlDoc.createElementNS(
    'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'w:rPr'
  );

  const bold = xmlDoc.createElementNS(
    'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'w:b'
  );

  const size = xmlDoc.createElementNS(
    'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'w:sz'
  );
  size.setAttribute('w:val', '32'); // 16pt font

  rPr.appendChild(bold);
  rPr.appendChild(size);
  run.appendChild(rPr);

  // Add the text
  const text = xmlDoc.createElementNS(
    'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'w:t'
  );
  text.textContent = label;
  run.appendChild(text);

  headerParagraph.appendChild(run);
  body.appendChild(headerParagraph);

  // Add spacing paragraph
  const spacingParagraph = xmlDoc.createElementNS(
    'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'w:p'
  );
  body.appendChild(spacingParagraph);
}

/**
 * Add image to the Word document
 * This is a simplified version - in production, use a proper image module
 */
async function addImageToDocument(
  zip: PizZip,
  xmlDoc: XMLDocument,
  body: XMLElement,
  imageBuffer: Buffer,
  imageNumber: number,
  altText: string
): Promise<void> {
  // For now, add a placeholder paragraph indicating where the image would go
  // TODO: Implement full image insertion using open-docxtemplater-image-module
  // or manual XML manipulation

  const imageParagraph = xmlDoc.createElementNS(
    'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'w:p'
  );

  const run = xmlDoc.createElementNS(
    'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'w:r'
  );

  const text = xmlDoc.createElementNS(
    'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'w:t'
  );
  text.textContent = `[תמונה: ${altText}]`;

  run.appendChild(text);
  imageParagraph.appendChild(run);
  body.appendChild(imageParagraph);

  // Store the image in the zip (in word/media/)
  const imageName = `image${imageNumber}.png`;
  zip.file(`word/media/${imageName}`, imageBuffer);

  // TODO: Add the image relationship to word/_rels/document.xml.rels
  // TODO: Add the drawing XML for the image in the paragraph
}
