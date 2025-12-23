/**
 * Download files from Vercel Blob URLs
 * Converts blob URLs back to buffers for document processing
 */

import { ExtractedAttachment } from './file-converter';

/**
 * Attachment with resolved file data (buffer instead of blob URL)
 */
export interface ResolvedAttachment {
  label: string;
  description: string;
  buffer: Buffer;
  name: string;
  mimeType: string;
}

/**
 * Download a file from a Vercel Blob URL
 */
export async function downloadFromBlobUrl(url: string): Promise<Buffer> {
  console.log(`☁️ Downloading from blob: ${url}`);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download blob: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  console.log(`✅ Downloaded ${(buffer.length / 1024).toFixed(1)} KB`);

  return buffer;
}

/**
 * Convert a base64 data URL to a Buffer
 */
function dataUrlToBuffer(dataUrl: string): Buffer {
  // Remove data URL prefix (e.g., "data:image/png;base64,")
  const base64Data = dataUrl.replace(/^data:[^;]+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

/**
 * Resolve all attachments to buffers
 * Downloads blob URLs and converts base64 data URLs to buffers
 */
export async function resolveAttachments(
  attachments: ExtractedAttachment[]
): Promise<ResolvedAttachment[]> {
  console.log(`\n🔄 Resolving ${attachments.length} attachments...`);

  const resolved: ResolvedAttachment[] = [];

  for (const attachment of attachments) {
    try {
      let buffer: Buffer;

      if (attachment.isBlob && attachment.blobUrl) {
        // Download from Vercel Blob
        buffer = await downloadFromBlobUrl(attachment.blobUrl);
      } else if (attachment.file) {
        // Convert base64 data URL to buffer
        buffer = dataUrlToBuffer(attachment.file);
      } else {
        console.warn(`⚠️ Skipping attachment ${attachment.name}: no file data`);
        continue;
      }

      resolved.push({
        label: attachment.label,
        description: attachment.description,
        buffer,
        name: attachment.name,
        mimeType: attachment.mimeType,
      });

      console.log(`  ✓ Resolved: ${attachment.name} (${attachment.isBlob ? 'blob' : 'base64'})`);
    } catch (error) {
      console.error(`  ✗ Failed to resolve ${attachment.name}:`, error);
      // Continue with other attachments
    }
  }

  console.log(`✅ Resolved ${resolved.length}/${attachments.length} attachments`);

  return resolved;
}

/**
 * Convert resolved attachments to the UploadedFile format expected by document generators
 */
export function toUploadedFiles(
  resolved: ResolvedAttachment[]
): Array<{
  file: {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
  };
  label: string;
  description: string;
}> {
  return resolved.map((attachment, index) => ({
    file: {
      fieldname: `attachment_${index}`,
      originalname: attachment.name,
      encoding: '7bit',
      mimetype: attachment.mimeType,
      buffer: attachment.buffer,
      size: attachment.buffer.length,
    },
    label: attachment.label,
    description: attachment.description,
  }));
}
