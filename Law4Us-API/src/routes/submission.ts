import { Router, Request, Response } from 'express';
import { generateDocument } from '../services/document-generator';
import { uploadToDrive, createFolder } from '../services/google-drive';
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

    // Create a folder for this submission in Google Drive
    const folderName = `${submissionData.basicInfo.fullName}_${submissionData.basicInfo.idNumber}_${new Date().toISOString().split('T')[0]}`;
    const submissionFolderId = await createFolder(folderName);

    console.log('📁 Created Google Drive folder:', folderName);

    // Load lawyer signature if not provided by client
    const lawyerSignature = submissionData.lawyerSignature || loadLawyerSignature();
    if (!submissionData.lawyerSignature) {
      console.log('📷 Using default lawyer signature (Ariel Dror)');
    }

    // Save submission JSON
    const jsonBuffer = Buffer.from(JSON.stringify(submissionData, null, 2));
    await uploadToDrive({
      fileName: 'submission-data.json',
      mimeType: 'application/json',
      buffer: jsonBuffer,
      folderId: submissionFolderId,
    });

    // Generate documents for each selected claim
    for (const claimType of submissionData.selectedClaims) {
      console.log(`📄 Generating ${claimType} document...`);

      const claimDoc = await generateDocument({
        basicInfo: submissionData.basicInfo as any, // Type assertion for request data
        formData: submissionData.formData,
        selectedClaims: submissionData.selectedClaims as any,
        claimType: claimType as any,
        signature: submissionData.signature,
        lawyerSignature: lawyerSignature,
        attachments: submissionData.attachments,
      });

      // Use Hebrew filename
      const hebrewNames: Record<string, string> = {
        divorce: 'תביעת-גירושין',
        custody: 'תביעת-משמורת',
        property: 'תביעת-רכושית',
        alimony: 'תביעת-מזונות',
        divorceAgreement: 'הסכם-גירושין',
      };

      const fileName = `${hebrewNames[claimType] || claimType}.docx`;

      await uploadToDrive({
        fileName,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        buffer: claimDoc,
        folderId: submissionFolderId,
      });

      console.log(`✅ ${fileName} uploaded`);
    }

    // Handle attachments if any
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
            folderId: submissionFolderId,
          });
        }
      }

      console.log('✅ Attachments uploaded');
    }

    console.log('🎉 Submission completed successfully!');

    res.json({
      success: true,
      message: 'הטופס נשלח בהצלחה!',
      folderId: submissionFolderId,
      folderName,
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
