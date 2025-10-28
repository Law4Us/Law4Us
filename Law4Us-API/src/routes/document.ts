/**
 * Document Generation Routes
 * Handles document generation requests with file uploads
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import {
  generateDocument,
  generateMultipleDocuments,
  saveDocument,
  templateExists,
} from '../services/document-generator';
import { ClaimType, UploadedFile } from '../types';

const router = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory for processing

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 20, // Max 20 files per request
  },
  fileFilter: (req, file, cb) => {
    // Accept PDFs and images
    const allowedMimes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Only PDF and images are allowed.`));
    }
  },
});

/**
 * POST /api/document/generate
 * Generate document with attachments
 *
 * Accepts multipart/form-data with:
 * - data: JSON string with basicInfo, formData, selectedClaims, claimType
 * - files: Multiple files with fieldnames like "attachment_0", "attachment_1", etc.
 */
router.post('/generate', upload.array('attachments', 20), async (req: Request, res: Response) => {
  try {
    console.log('\n' + '🔵'.repeat(40));
    console.log('📥 NEW DOCUMENT GENERATION REQUEST');
    console.log('🔵'.repeat(40));

    // Parse JSON data from request
    const data = typeof req.body.data === 'string'
      ? JSON.parse(req.body.data)
      : req.body.data || req.body;

    const {
      basicInfo,
      formData,
      selectedClaims,
      claimType,
      generateAll,
      signature,
    } = data;

    // Validate required fields
    if (!basicInfo || !formData || !selectedClaims) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: basicInfo, formData, selectedClaims',
      });
    }

    // Check Groq API key
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Groq API key not configured',
      });
    }

    console.log(`\n📋 Request details:`);
    console.log(`   Applicant: ${basicInfo.fullName}`);
    console.log(`   Claims: ${selectedClaims.join(', ')}`);
    console.log(`   Files uploaded: ${req.files ? (req.files as Express.Multer.File[]).length : 0}`);

    // Process uploaded files
    const attachments: Array<{ file: UploadedFile; label: string }> = [];

    if (req.files && Array.isArray(req.files)) {
      const files = req.files as Express.Multer.File[];

      // Map attachment labels (hebrew letters)
      const hebrewLetters = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר'];

      files.forEach((file, index) => {
        const uploadedFile: UploadedFile = {
          fieldname: file.fieldname,
          originalname: file.originalname,
          encoding: file.encoding,
          mimetype: file.mimetype,
          buffer: file.buffer,
          size: file.size,
        };

        const label = `נספח ${hebrewLetters[index] || index + 1}`;
        attachments.push({ file: uploadedFile, label });

        console.log(`   📎 ${label}: ${file.originalname} (${(file.size / 1024).toFixed(2)} KB)`);
      });
    }

    // Generate single document
    if (claimType && !generateAll) {
      if (!templateExists(claimType as ClaimType)) {
        return res.status(404).json({
          success: false,
          error: `Template not found for claim type: ${claimType}`,
        });
      }

      const buffer = await generateDocument({
        basicInfo,
        formData,
        selectedClaims,
        claimType: claimType as ClaimType,
        signature,
        attachments: attachments as any, // Type assertion for attachment compatibility
      });

      // Save document
      const timestamp = Date.now();
      const filename = `${claimType}_${timestamp}.docx`;
      const filePath = saveDocument(buffer, filename);

      // Return the document as download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      res.setHeader('X-File-Path', filePath);

      return res.send(buffer);
    }

    // Generate all documents
    if (generateAll) {
      const documentsMap = await generateMultipleDocuments({
        basicInfo,
        formData,
        selectedClaims,
        signature,
        attachments: attachments as any, // Type assertion for attachment compatibility
      });

      if (documentsMap.size === 0) {
        return res.status(404).json({
          success: false,
          error: 'No templates found for selected claim types',
        });
      }

      // Save all documents and return file paths
      const timestamp = Date.now();
      const filePaths: Record<string, string> = {};

      for (const [claim, buffer] of documentsMap.entries()) {
        const filename = `${claim}_${timestamp}.docx`;
        const filePath = saveDocument(buffer, filename);
        filePaths[claim] = filePath;
      }

      return res.json({
        success: true,
        message: `${documentsMap.size} documents generated successfully`,
        documents: filePaths,
        count: documentsMap.size,
      });
    }

    // If neither claimType nor generateAll specified
    return res.status(400).json({
      success: false,
      error: 'Must specify either "claimType" or "generateAll": true',
    });

  } catch (error) {
    console.error('❌ Document generation error:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Document generation failed',
      ...(process.env.NODE_ENV === 'development' && {
        stack: error instanceof Error ? error.stack : undefined,
      }),
    });
  }
});

/**
 * GET /api/document/templates
 * Check available templates
 */
router.get('/templates', (req: Request, res: Response) => {
  const claimTypes: ClaimType[] = [
    'property',
    'custody',
    'alimony',
    'divorce',
    'divorceAgreement',
  ];

  const availableTemplates: Record<string, boolean> = {};

  for (const claimType of claimTypes) {
    availableTemplates[claimType] = templateExists(claimType);
  }

  res.json({
    success: true,
    templates: availableTemplates,
    groqConfigured: !!process.env.GROQ_API_KEY,
  });
});

/**
 * GET /api/document/test
 * Test endpoint for quick checks
 */
router.get('/test', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Document generation API is running',
    capabilities: {
      fileUpload: true,
      pdfConversion: true,
      imageProcessing: true,
      aiTransformation: !!process.env.GROQ_API_KEY,
    },
  });
});

export default router;
