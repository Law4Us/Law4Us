import { Router, Request, Response } from 'express';
import { generateDocument } from '../services/document-generator';
import { uploadToDrive, createFolder } from '../services/google-drive';

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
  signature: string; // base64
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

    // Save submission JSON
    const jsonBuffer = Buffer.from(JSON.stringify(submissionData, null, 2));
    await uploadToDrive({
      fileName: 'submission-data.json',
      mimeType: 'application/json',
      buffer: jsonBuffer,
      folderId: submissionFolderId,
    });

    // Generate and upload Power of Attorney document
    if (submissionData.filledDocuments?.powerOfAttorney) {
      console.log('📄 Generating Power of Attorney document...');

      const poaDoc = await generateDocument({
        template: 'power-of-attorney',
        data: {
          ...submissionData.basicInfo,
          ...submissionData.formData,
          selectedClaims: submissionData.selectedClaims,
          signature: submissionData.signature,
        },
        claimType: submissionData.selectedClaims[0], // Use first claim for context
      });

      await uploadToDrive({
        fileName: 'ייפוי-כוח.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        buffer: poaDoc,
        folderId: submissionFolderId,
      });

      console.log('✅ Power of Attorney uploaded');
    }

    // Generate and upload Form 3 document
    if (submissionData.filledDocuments?.form3) {
      console.log('📄 Generating Form 3 document...');

      const form3Doc = await generateDocument({
        template: 'form-3',
        data: {
          ...submissionData.basicInfo,
          ...submissionData.formData,
          selectedClaims: submissionData.selectedClaims,
          signature: submissionData.signature,
        },
        claimType: submissionData.selectedClaims[0],
      });

      await uploadToDrive({
        fileName: 'טופס-3.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        buffer: form3Doc,
        folderId: submissionFolderId,
      });

      console.log('✅ Form 3 uploaded');
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
