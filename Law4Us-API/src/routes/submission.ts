import { Router, Request, Response } from 'express';
import { generateDocument } from '../services/document-generator';
import { uploadToDrive, createFolder, searchFolders } from '../services/google-drive';
import { loadLawyerSignature } from '../utils/load-signature';

const router = Router();

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

/**
 * POST /api/submission/submit
 * Handle full form submission, generate documents, and save to Google Drive
 */
router.post('/submit', async (req: Request, res: Response) => {
  try {
    const submissionData: SubmissionData = req.body;

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
    const lawyerSignature = submissionData.lawyerSignature || loadLawyerSignature();
    if (!submissionData.lawyerSignature) {
      console.log('📷 Using default lawyer signature (Ariel Dror)');
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

    res.json({
      success: true,
      message: 'הטופס נשלח בהצלחה!',
      folderId: parentFolderId,
      folderName: parentFolderName,
    });

  } catch (error) {
    console.error('❌ Submission error:', error);

    res.status(500).json({
      success: false,
      message: 'אירעה שגיאה בשליחת הטופס',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
