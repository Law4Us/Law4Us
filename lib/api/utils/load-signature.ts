/**
 * Load lawyer signature on-demand
 * Downloads from Google Drive for serverless compatibility (no size limits!)
 */

import { downloadFile } from '../services/google-drive';

let cachedSignature: string | null = null;

/**
 * Load lawyer signature (Ariel Dror with stamp)
 * Returns base64 data URL format
 *
 * For Vercel deployment, set LAWYER_SIGNATURE_FILE_ID environment variable
 * Run scripts/upload-signature-to-drive.ts to get the file ID
 */
export async function loadLawyerSignature(): Promise<string> {
  // Return cached version if available
  if (cachedSignature) {
    console.log('♻️  Using cached lawyer signature');
    return cachedSignature;
  }

  try {
    const fileId = process.env.LAWYER_SIGNATURE_FILE_ID;

    if (!fileId) {
      throw new Error('LAWYER_SIGNATURE_FILE_ID environment variable not set. Run: npx tsx scripts/upload-signature-to-drive.ts');
    }

    console.log(`📥 Downloading lawyer signature from Google Drive (ID: ${fileId})...`);

    // Download file from Google Drive
    const buffer = await downloadFile(fileId);

    // Convert to base64 data URL
    const base64 = buffer.toString('base64');
    cachedSignature = `data:image/png;base64,${base64}`;

    console.log(`✅ Loaded lawyer signature from Google Drive (${(buffer.length / 1024).toFixed(2)} KB)`);
    return cachedSignature;
  } catch (error) {
    console.error('❌ Failed to load lawyer signature:', error);
    throw new Error(`Lawyer signature not available: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
