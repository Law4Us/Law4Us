import { NextRequest, NextResponse } from 'next/server';
import { generateDocument, DocumentGenerationOptions } from '@/lib/api/services/document-generator';
import { uploadToDrive, createFolder, searchFolders, downloadFile } from '@/lib/api/services/google-drive';
import { sendSubmissionConfirmation, sendSubmissionNotification } from '@/lib/services/email-service';
import { CLAIMS } from '@/lib/constants/claims';
import { DivorceRoutingResult, getCourtTypeName, getTrackName } from '@/lib/utils/divorce-court-router';

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
    file: string; // base64
    name: string;
    mimeType: string;
    label: string;
    description?: string;
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

    const currentDate = new Date().toISOString().split('T')[0];
    const folderNameBase = submissionData.folderNameOverride || submissionData.basicInfo.fullName;
    const parentFolderPattern = `${folderNameBase} תביעות`;

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
      parentFolderName = `${folderNameBase} תביעות ${currentDate}`;
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

    // Process attachments if any - convert base64 to UploadedFile format
    let processedAttachments: Array<{
      label: string;
      description: string;
      images: Buffer[];
    }> = [];

    if (submissionData.attachments && submissionData.attachments.length > 0) {
      console.log(`📎 Processing ${submissionData.attachments.length} attachments for document insertion...`);

      const { processAttachments } = await import('@/lib/api/services/pdf-converter');

      const uploadedFiles = submissionData.attachments.map((att: any) => {
        // Convert base64 to Buffer
        const base64Data = att.file.split(',')[1] || att.file; // Remove data URL prefix if present
        const buffer = Buffer.from(base64Data, 'base64');

        return {
          file: {
            buffer,
            originalname: att.name,
            mimetype: att.mimeType,
            size: buffer.length,
          } as any,
          label: att.label,
          description: att.description || '',
        };
      });

      processedAttachments = await processAttachments(uploadedFiles);
      console.log(`✅ Processed ${processedAttachments.length} attachments into ${processedAttachments.reduce((sum, att) => sum + att.images.length, 0)} pages`);
    }

    // Track divorce routing result (for family court suggestions)
    let divorceRouting: DivorceRoutingResult | undefined;

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

      // Capture divorce routing result (set by generateDocument for divorce claims)
      if (claimType === 'divorce' && generationOptions.divorceRouting) {
        divorceRouting = generationOptions.divorceRouting;
        console.log(`📍 Divorce routed to: ${getCourtTypeName(divorceRouting.courtType)} (${divorceRouting.track})`);
        if (divorceRouting.suggestedClaims.length > 0) {
          console.log(`💡 Suggested additional claims: ${divorceRouting.suggestedClaims.join(', ')}`);
        }
      }

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
        // Convert base64 back to buffer
        const base64Data = attachment.file.split(',')[1] || attachment.file;
        const buffer = Buffer.from(base64Data, 'base64');

        await uploadToDrive({
          fileName: attachment.name,
          mimeType: attachment.mimeType || 'application/octet-stream',
          buffer,
          folderId: backupFolderId,
        });
      }

      console.log('✅ User files uploaded to backup folder');
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

    // Add divorce routing info for family court path (with suggested claims)
    if (divorceRouting) {
      response.divorceRouting = {
        courtType: divorceRouting.courtType,
        courtTypeName: getCourtTypeName(divorceRouting.courtType),
        track: divorceRouting.track,
        trackName: getTrackName(divorceRouting.track),
        suggestedClaims: divorceRouting.suggestedClaims,
      };
    }

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
