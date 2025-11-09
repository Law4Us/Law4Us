/**
 * Upload lawyer signature to Google Drive (one-time setup)
 * Run with: npx tsx scripts/upload-signature-to-drive.ts
 */

import { uploadToDrive } from '../lib/api/services/google-drive';
import * as fs from 'fs';
import * as path from 'path';

// Environment variables are automatically loaded by Node.js from .env.local

async function uploadSignature() {
  console.log('📤 Uploading lawyer signature to Google Drive...\n');

  const signaturePath = path.join(__dirname, '..', 'Signature.png');

  if (!fs.existsSync(signaturePath)) {
    console.error('❌ Signature.png not found!');
    process.exit(1);
  }

  const buffer = fs.readFileSync(signaturePath);
  console.log(`📄 File size: ${(buffer.length / 1024).toFixed(2)} KB`);

  try {
    const fileId = await uploadToDrive({
      fileName: 'lawyer-signature.png',
      mimeType: 'image/png',
      buffer,
      folderId: process.env.GOOGLE_DRIVE_FOLDER_ID, // Upload to main folder
    });

    console.log('\n✅ SUCCESS!');
    console.log(`\n📋 Add this to your Vercel environment variables:`);
    console.log(`LAWYER_SIGNATURE_FILE_ID=${fileId}`);
    console.log('\nThis is only ~44 characters (well under the 65KB limit)!');
  } catch (error) {
    console.error('❌ Upload failed:', error);
    process.exit(1);
  }
}

uploadSignature();
