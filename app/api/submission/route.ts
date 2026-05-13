import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { generateDocument, DocumentGenerationOptions } from '@/lib/api/services/document-generator';
import { uploadToDrive, createFolder, searchFolders, downloadFile } from '@/lib/api/services/google-drive';
import { sendSubmissionConfirmation, sendSubmissionNotification } from '@/lib/services/email-service';
import { CLAIMS } from '@/lib/constants/claims';

interface SubmissionData {
  basicInfo: {
    fullName: string;
    idNumber: string;
    email: string;
    phone: string;
    [key: string]: any;
  };
  folderNameOverride?: string;
  formData: any;
  selectedClaims: string[];
  signature: string; // base64 - client signature
  lawyerSignature?: string; // base64 - lawyer signature with stamp
  attachments?: Array<{
    file?: string;      // base64 data URL (legacy)
    blobUrl?: string;   // Vercel Blob URL (new)
    name: string;
    mimeType: string;
    label: string;
    description?: string;
    isBlob?: boolean;
  }>;
  sessionId?: string;
  paymentData: any;
  filledDocuments: any;
  submittedAt: string;
}

// Cache lawyer signature in memory (per serverless function instance)
let cachedLawyerSignature: string | null = null;

function formatDriveTimestamp(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  const day = [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-');

  return `${day} ${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
}

/**
 * Load lawyer signature from Google Drive (with in-memory caching)
 * Downloads signature file once and caches for subsequent requests
 */
async function loadLawyerSignature(): Promise<string> {
  // Return cached version if available
  if (cachedLawyerSignature) {
    console.log('♻️  Using cached lawyer signature (no download needed)');
    return cachedLawyerSignature;
  }

  const fileId = process.env.LAWYER_SIGNATURE_FILE_ID;
  if (!fileId) {
    throw new Error('LAWYER_SIGNATURE_FILE_ID environment variable not set');
  }

  console.log(`📷 Downloading lawyer signature from Google Drive (ID: ${fileId})...`);
  const buffer = await downloadFile(fileId);
  const base64 = buffer.toString('base64');
  console.log(`✅ Lawyer signature downloaded (${buffer.length} bytes, ${(buffer.length / 1024).toFixed(1)} KB)`);

  // Cache for future requests in this function instance
  cachedLawyerSignature = `data:image/png;base64,${base64}`;
  return cachedLawyerSignature;
}

/**
 * POST /api/submission
 * Handle full form submission, generate documents, and save to Google Drive
 */
export async function POST(request: NextRequest) {
  try {
    const submissionData: SubmissionData = await request.json();

    console.log('📥 Received submission from:', submissionData.basicInfo.fullName);

    // VALIDATION: divorceAgreement must be mutually exclusive with other claims
    const hasDivorceAgreement = submissionData.selectedClaims.includes('divorceAgreement');
    const hasOtherClaims = submissionData.selectedClaims.some(
      (claim) => claim !== 'divorceAgreement'
    );

    if (hasDivorceAgreement && hasOtherClaims) {
      console.error('❌ Validation error: divorceAgreement cannot be combined with other claims');
      return NextResponse.json(
        {
          error: 'הסכם גירושין לא יכול להיבחר יחד עם תביעות אחרות',
          message: 'Divorce agreement must be selected alone',
        },
        { status: 400 }
      );
    }

    // HIERARCHICAL FOLDER STRUCTURE:
    // Parent folder: [Name] תביעות [date]
    // Subfolders: תביעה רכושית, תביעת מזונות, תביעת משמורת

    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTimestamp = formatDriveTimestamp(now);
    const folderNameBase = submissionData.folderNameOverride || submissionData.basicInfo.fullName;
    const sessionSuffix = submissionData.sessionId ? ` ${submissionData.sessionId}` : '';
    const parentFolderName = `${folderNameBase} תביעות ${currentTimestamp}${sessionSuffix}`;
    const parentFolderId = await createFolder(parentFolderName);
    console.log(`📁 Created new parent folder: ${parentFolderName} (${parentFolderId})`);

    // Load lawyer signature if not provided by client
    const lawyerSignature = submissionData.lawyerSignature || await loadLawyerSignature();
    if (!submissionData.lawyerSignature) {
      console.log('📷 Using default lawyer signature from Google Drive (Ariel Dror)');
    }

    // Save submission JSON to parent folder
    const jsonBuffer = Buffer.from(JSON.stringify(submissionData, null, 2));
    await uploadToDrive({
      fileName: `submission-data-${currentDate}.json`,
      mimeType: 'application/json',
      buffer: jsonBuffer,
      folderId: parentFolderId,
    });

    // Hebrew folder names for each claim type
    const claimFolderNames: Record<string, string> = {
      divorce: 'תביעת גירושין',
      custody: 'תביעת משמורת',
      property: 'תביעה רכושית',
      alimony: 'תביעת מזונות',
      divorceAgreement: 'הסכם גירושין',
      shalomBayit: 'תביעת שלום בית',
      divorceRabbinical: 'תביעת גירושין רבני',
    };

    // Hebrew filenames for documents
    const hebrewDocNames: Record<string, string> = {
      divorce: 'תביעת-גירושין',
      custody: 'תביעת-משמורת',
      property: 'תביעת-רכושית',
      alimony: 'תביעת-מזונות',
      divorceAgreement: 'הסכם-גירושין',
      shalomBayit: 'תביעת-שלום-בית',
      divorceRabbinical: 'תביעת-גירושין-רבני',
    };

    // Process attachments if any - handle both blob URLs and base64
    let processedAttachments: Array<{
      label: string;
      description: string;
      images: Buffer[];
    }> = [];

    if (submissionData.attachments && submissionData.attachments.length > 0) {
      console.log(`📎 Processing ${submissionData.attachments.length} attachments for document insertion...`);

      const { processAttachments } = await import('@/lib/api/services/pdf-converter');

      const uploadedFiles: Array<{
        file: { buffer: Buffer; originalname: string; mimetype: string; size: number };
        label: string;
        description: string;
      }> = [];

      for (const att of submissionData.attachments) {
        let buffer: Buffer;

        if (att.isBlob && att.blobUrl) {
          // Download from Vercel Blob
          console.log(`☁️ Downloading from blob: ${att.name}`);
          const response = await fetch(att.blobUrl);
          if (!response.ok) {
            console.error(`❌ Failed to download blob ${att.name}: ${response.status}`);
            continue;
          }
          const arrayBuffer = await response.arrayBuffer();
          buffer = Buffer.from(arrayBuffer);
          console.log(`✅ Downloaded ${(buffer.length / 1024).toFixed(1)} KB`);
        } else if (att.file) {
          // Convert base64 to Buffer
          const base64Data = att.file.split(',')[1] || att.file;
          buffer = Buffer.from(base64Data, 'base64');
        } else {
          console.warn(`⚠️ Skipping attachment ${att.name}: no file data`);
          continue;
        }

        uploadedFiles.push({
          file: {
            buffer,
            originalname: att.name,
            mimetype: att.mimeType,
            size: buffer.length,
          },
          label: att.label,
          description: att.description || '',
        });
      }

      if (uploadedFiles.length > 0) {
        processedAttachments = await processAttachments(uploadedFiles as any);
        console.log(`✅ Processed ${processedAttachments.length} attachments into ${processedAttachments.reduce((sum, att) => sum + att.images.length, 0)} pages`);
      }
    }

    // Generate documents for each selected claim
    for (const claimType of submissionData.selectedClaims) {
      console.log(`📄 Generating ${claimType} document...`);

      // Create or reuse subfolder for this claim type
      const claimFolderName = claimFolderNames[claimType] || claimType;

      // Search for existing subfolder
      const existingSubfolders = await searchFolders(claimFolderName, parentFolderId);
      let claimFolderId: string;

      if (existingSubfolders.length > 0) {
        // Reuse existing subfolder
        claimFolderId = existingSubfolders[0].id;
        console.log(`♻️  Reusing existing subfolder: ${claimFolderName} (${claimFolderId})`);
      } else {
        // Create new subfolder
        claimFolderId = await createFolder(claimFolderName, parentFolderId);
        console.log(`📂 Created claim subfolder: ${claimFolderName} (${claimFolderId})`);
      }

      // Create options object to capture divorce routing result
      const generationOptions: DocumentGenerationOptions = {
        basicInfo: submissionData.basicInfo as any, // Type assertion for request data
        formData: submissionData.formData,
        selectedClaims: submissionData.selectedClaims as any,
        claimType: claimType as any,
        signature: submissionData.signature,
        lawyerSignature: lawyerSignature,
        attachments: processedAttachments.length > 0 ? processedAttachments as any : undefined,
      };

      const claimDoc = await generateDocument(generationOptions);

      const fileName = `${hebrewDocNames[claimType] || claimType}.docx`;

      await uploadToDrive({
        fileName,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        buffer: claimDoc,
        folderId: claimFolderId, // Upload to claim subfolder
      });

      console.log(`✅ ${fileName} uploaded to ${claimFolderName}`);
    }

    // ========== CREATE BACKUP FOLDER (גיבוי) ==========
    console.log('📦 Creating backup folder (גיבוי)...');

    const backupFolderName = 'גיבוי';
    const existingBackupFolders = await searchFolders(backupFolderName, parentFolderId);
    let backupFolderId: string;

    if (existingBackupFolders.length > 0) {
      backupFolderId = existingBackupFolders[0].id;
      console.log(`♻️  Reusing existing backup folder: ${backupFolderName} (${backupFolderId})`);
    } else {
      backupFolderId = await createFolder(backupFolderName, parentFolderId);
      console.log(`📂 Created backup folder: ${backupFolderName} (${backupFolderId})`);
    }

    // Generate backup Q&A document
    console.log('📋 Generating backup Q&A document...');
    const { generateBackupDocument } = await import('@/lib/api/services/backup-document-generator');

    const backupDoc = await generateBackupDocument({
      basicInfo: submissionData.basicInfo as any,
      formData: submissionData.formData,
      selectedClaims: submissionData.selectedClaims as any,
      submittedAt: submissionData.submittedAt,
    });

    await uploadToDrive({
      fileName: 'גיבוי-תשובות-מלאות.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      buffer: backupDoc,
      folderId: backupFolderId,
    });

    console.log('✅ Backup Q&A document uploaded to backup folder');

    // Upload user's original files to backup folder
    if (submissionData.attachments && submissionData.attachments.length > 0) {
      console.log(`📎 Uploading ${submissionData.attachments.length} original user files to backup folder...`);

      for (const attachment of submissionData.attachments) {
        let buffer: Buffer;

        if (attachment.isBlob && attachment.blobUrl) {
          // Download from Vercel Blob
          const response = await fetch(attachment.blobUrl);
          if (!response.ok) {
            console.error(`❌ Failed to download blob for backup: ${attachment.name}`);
            continue;
          }
          const arrayBuffer = await response.arrayBuffer();
          buffer = Buffer.from(arrayBuffer);
        } else if (attachment.file) {
          // Convert base64 back to buffer
          const base64Data = attachment.file.split(',')[1] || attachment.file;
          buffer = Buffer.from(base64Data, 'base64');
        } else {
          console.warn(`⚠️ Skipping backup for ${attachment.name}: no file data`);
          continue;
        }

        await uploadToDrive({
          fileName: attachment.name,
          mimeType: attachment.mimeType || 'application/octet-stream',
          buffer,
          folderId: backupFolderId,
        });
      }

      console.log('✅ User files uploaded to backup folder');
    }

    // Handle formData.attachments if any - upload to parent folder (handles both blob and base64)
    if (submissionData.formData.attachments && Array.isArray(submissionData.formData.attachments)) {
      console.log('📎 Processing formData attachments...');

      for (const attachment of submissionData.formData.attachments) {
        let buffer: Buffer | null = null;
        let fileName = attachment.name || attachment.fileName || 'attachment';
        let mimeType = attachment.mimeType || 'application/octet-stream';

        // Handle BlobFile objects (from FileUploadBlob)
        if (attachment.url && attachment.url.includes('blob.vercel-storage.com')) {
          const response = await fetch(attachment.url);
          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
            fileName = attachment.fileName || fileName;
            mimeType = attachment.mimeType || mimeType;
          }
        }
        // Handle base64 data
        else if (attachment.data) {
          const base64Data = attachment.data.split(',')[1] || attachment.data;
          buffer = Buffer.from(base64Data, 'base64');
        }

        if (buffer) {
          await uploadToDrive({
            fileName,
            mimeType,
            buffer,
            folderId: parentFolderId,
          });
        }
      }

      console.log('✅ FormData attachments uploaded to parent folder');
    }

    console.log('🎉 Submission completed successfully!');

    // ========== CLEANUP: Delete blob files after successful upload ==========
    const blobUrlsToDelete: string[] = [];

    // Helper to check if value is a blob URL
    const isBlobUrl = (url: unknown): url is string =>
      typeof url === 'string' && url.includes('blob.vercel-storage.com');

    // Helper to extract blob URL from various formats
    const extractBlobUrl = (value: any): string | null => {
      if (!value) return null;
      if (isBlobUrl(value)) return value;
      if (typeof value === 'object' && isBlobUrl(value.url)) return value.url;
      if (typeof value === 'object' && isBlobUrl(value.blobUrl)) return value.blobUrl;
      return null;
    };

    // Collect blob URLs from attachments
    if (submissionData.attachments) {
      for (const att of submissionData.attachments) {
        if (att.isBlob && att.blobUrl) {
          blobUrlsToDelete.push(att.blobUrl);
        }
      }
    }

    // Collect blob URLs from formData.attachments
    if (submissionData.formData.attachments && Array.isArray(submissionData.formData.attachments)) {
      for (const att of submissionData.formData.attachments) {
        const url = extractBlobUrl(att);
        if (url) blobUrlsToDelete.push(url);
      }
    }

    // Collect blob URLs from property section file fields
    const property = submissionData.formData.property;
    if (property) {
      // Single file fields
      const singleFileFields = ['applicantIncomeProof', 'respondentIncomeProof', 'courtDocument'];
      for (const field of singleFileFields) {
        const url = extractBlobUrl(property[field]);
        if (url) blobUrlsToDelete.push(url);
      }

      // Array file fields
      const arrayFileFields = ['applicantPaySlips', 'respondentPaySlips', 'apartments', 'vehicles', 'savings', 'benefits', 'properties', 'debts'];
      for (const field of arrayFileFields) {
        if (Array.isArray(property[field])) {
          for (const item of property[field]) {
            const url = extractBlobUrl(item) || extractBlobUrl(item?.proof) || extractBlobUrl(item?.attachment);
            if (url) blobUrlsToDelete.push(url);
          }
        }
      }
    }

    // Collect from divorceAgreement
    if (submissionData.formData.divorceAgreement?.uploadedAgreement) {
      const url = extractBlobUrl(submissionData.formData.divorceAgreement.uploadedAgreement);
      if (url) blobUrlsToDelete.push(url);
    }

    // Delete all collected blob URLs
    if (blobUrlsToDelete.length > 0) {
      console.log(`🗑️  Cleaning up ${blobUrlsToDelete.length} blob file(s)...`);
      try {
        await del(blobUrlsToDelete);
        console.log('✅ Blob files deleted successfully');
      } catch (deleteError) {
        // Don't fail submission if cleanup fails
        console.error('⚠️  Failed to delete blob files:', deleteError);
      }
    }

    // Send confirmation email to user
    try {
      console.log('📧 Sending confirmation email...');

      // Get claim labels in Hebrew
      const claimLabels = submissionData.selectedClaims
        .map(claimKey => CLAIMS.find(c => c.key === claimKey)?.label)
        .filter(Boolean) as string[];

      const emailSent = await sendSubmissionConfirmation(
        submissionData.basicInfo.email,
        submissionData.basicInfo.fullName,
        parentFolderId, // Using folder ID as session ID for now
        claimLabels
      );

      if (emailSent) {
        console.log('✅ Confirmation email sent successfully');
      } else {
        console.warn('⚠️  Failed to send confirmation email (submission still successful)');
      }
    } catch (emailError) {
      // Don't fail the entire submission if email fails
      console.error('❌ Error sending confirmation email:', emailError);
    }

    // Send notification email to office
    try {
      console.log('📧 Sending submission notification to office...');

      // Get claim labels in Hebrew
      const claimLabels = submissionData.selectedClaims
        .map(claimKey => CLAIMS.find(c => c.key === claimKey)?.label)
        .filter(Boolean) as string[];

      const notificationSent = await sendSubmissionNotification(
        submissionData.basicInfo.fullName,
        submissionData.basicInfo.email,
        submissionData.basicInfo.phone,
        claimLabels,
        parentFolderName,
        parentFolderId
      );

      if (notificationSent) {
        console.log('✅ Office notification sent successfully');
      } else {
        console.warn('⚠️  Failed to send office notification');
      }
    } catch (emailError) {
      // Don't fail the entire submission if email fails
      console.error('❌ Error sending office notification:', emailError);
    }

    // Build response with divorce routing info if applicable
    const response: {
      success: boolean;
      message: string;
      folderId: string;
      folderName: string;
      divorceRouting?: {
        courtType: string;
        courtTypeName: string;
        track: string;
        trackName: string;
        suggestedClaims: string[];
      };
    } = {
      success: true,
      message: 'הטופס נשלח בהצלחה!',
      folderId: parentFolderId,
      folderName: parentFolderName,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Submission error:', error);

    // Log full error details for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return NextResponse.json({
      success: false,
      message: 'אירעה שגיאה בשליחת הטופס',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
