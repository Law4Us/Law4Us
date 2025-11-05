import { NextRequest, NextResponse } from 'next/server';
import { generateDocument } from '@/Law4Us-API/src/services/document-generator';
import { uploadToDrive, createFolder, searchFolders, downloadFile } from '@/Law4Us-API/src/services/google-drive';

interface SubmissionData {
  basicInfo: {
    fullName: string;
    idNumber: string;
    email: string;
    phone: string;
    [key: string]: any;
  };
  formData: any;
  selectedClaims: string[];
  signature: string; // base64 - client signature
  lawyerSignature?: string; // base64 - lawyer signature with stamp
  attachments?: Array<{
    label: string;
    description: string;
    images: Buffer[];
  }>;
  paymentData: any;
  filledDocuments: any;
  submittedAt: string;
}

// Cache lawyer signature in memory (per serverless function instance)
let cachedLawyerSignature: string | null = null;

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

    // HIERARCHICAL FOLDER STRUCTURE:
    // Parent folder: [Name] תביעות [date]
    // Subfolders: תביעה רכושית, תביעת מזונות, תביעת משמורת

    const currentDate = new Date().toISOString().split('T')[0];
    const parentFolderPattern = `${submissionData.basicInfo.fullName} תביעות`;

    // Search for existing parent folder
    console.log(`🔍 Searching for existing parent folder: "${parentFolderPattern}"`);
    const existingFolders = await searchFolders(parentFolderPattern);

    let parentFolderId: string;
    let parentFolderName: string;

    if (existingFolders.length > 0) {
      // Reuse existing parent folder
      parentFolderId = existingFolders[0].id;
      parentFolderName = existingFolders[0].name;
      console.log(`♻️  Reusing existing parent folder: ${parentFolderName} (${parentFolderId})`);
    } else {
      // Create new parent folder
      parentFolderName = `${submissionData.basicInfo.fullName} תביעות ${currentDate}`;
      parentFolderId = await createFolder(parentFolderName);
      console.log(`📁 Created new parent folder: ${parentFolderName} (${parentFolderId})`);
    }

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
    };

    // Hebrew filenames for documents
    const hebrewDocNames: Record<string, string> = {
      divorce: 'תביעת-גירושין',
      custody: 'תביעת-משמורת',
      property: 'תביעת-רכושית',
      alimony: 'תביעת-מזונות',
      divorceAgreement: 'הסכם-גירושין',
    };

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

      const claimDoc = await generateDocument({
        basicInfo: submissionData.basicInfo as any, // Type assertion for request data
        formData: submissionData.formData,
        selectedClaims: submissionData.selectedClaims as any,
        claimType: claimType as any,
        signature: submissionData.signature,
        lawyerSignature: lawyerSignature,
        attachments: submissionData.attachments,
      });

      const fileName = `${hebrewDocNames[claimType] || claimType}.docx`;

      await uploadToDrive({
        fileName,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        buffer: claimDoc,
        folderId: claimFolderId, // Upload to claim subfolder
      });

      console.log(`✅ ${fileName} uploaded to ${claimFolderName}`);
    }

    // Handle attachments if any - upload to parent folder
    if (submissionData.formData.attachments && Array.isArray(submissionData.formData.attachments)) {
      console.log('📎 Processing attachments...');

      for (const attachment of submissionData.formData.attachments) {
        if (attachment.data && attachment.name) {
          // Assuming attachment.data is base64
          const buffer = Buffer.from(attachment.data, 'base64');

          await uploadToDrive({
            fileName: attachment.name,
            mimeType: attachment.mimeType || 'application/octet-stream',
            buffer,
            folderId: parentFolderId, // Upload attachments to parent folder
          });
        }
      }

      console.log('✅ Attachments uploaded to parent folder');
    }

    console.log('🎉 Submission completed successfully!');

    return NextResponse.json({
      success: true,
      message: 'הטופס נשלח בהצלחה!',
      folderId: parentFolderId,
      folderName: parentFolderName,
    });

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
