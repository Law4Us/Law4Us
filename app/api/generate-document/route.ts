import { NextRequest, NextResponse } from "next/server";
import {
  generateDocument,
  generateMultipleDocuments,
  templateExists,
  saveDocumentToTemp,
} from "@/lib/services/document-service";
import { ClaimType } from "@/lib/types";

/**
 * API route for document generation
 * POST /api/generate-document
 *
 * Body:
 * - claimType: (optional) specific claim type to generate document for
 * - basicInfo: basic information about applicant and respondent
 * - formData: form answers from the wizard
 * - selectedClaims: array of selected claim types
 * - generateAll: (optional) boolean to generate all documents at once
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const data = await request.json();
    const { claimType, basicInfo, formData, selectedClaims, generateAll } =
      data;

    // Validate required fields
    if (!basicInfo || !formData || !selectedClaims) {
      return NextResponse.json(
        {
          success: false,
          error: "חסרים שדות חובה: basicInfo, formData, selectedClaims",
        },
        { status: 400 }
      );
    }

    // Check if Groq API key is configured
    if (!process.env.GROQ_API_KEY) {
      console.warn("Groq API key not configured");
      return NextResponse.json(
        {
          success: false,
          error: "מפתח Groq API לא הוגדר. יש להוסיף GROQ_API_KEY לקובץ .env.local",
        },
        { status: 500 }
      );
    }

    const documentData = {
      basicInfo,
      formData,
      selectedClaims,
    };

    // Generate single document
    if (claimType && !generateAll) {
      // Check if template exists
      if (!templateExists(claimType as ClaimType)) {
        return NextResponse.json(
          {
            success: false,
            error: `תבנית לא נמצאה עבור סוג תביעה: ${claimType}`,
          },
          { status: 404 }
        );
      }

      console.log(`Generating document for claim type: ${claimType}`);

      const buffer = await generateDocument(
        documentData,
        claimType as ClaimType
      );

      // Save to temp directory
      const timestamp = Date.now();
      const filename = `${claimType}_${timestamp}.docx`;
      const filePath = saveDocumentToTemp(buffer, filename);

      console.log(`Document generated successfully: ${filePath}`);

      // Return the document as a downloadable file
      return new Response(Buffer.from(buffer), {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
          "X-File-Path": filePath,
        },
      });
    }

    // Generate all documents
    if (generateAll) {
      console.log(
        `Generating documents for all selected claims: ${selectedClaims.join(", ")}`
      );

      const documents = await generateMultipleDocuments(documentData);

      if (documents.size === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "לא נמצאו תבניות עבור סוגי התביעות שנבחרו",
          },
          { status: 404 }
        );
      }

      // Save all documents and return file paths
      const timestamp = Date.now();
      const filePaths: Record<string, string> = {};

      for (const [claim, buffer] of documents.entries()) {
        const filename = `${claim}_${timestamp}.docx`;
        const filePath = saveDocumentToTemp(buffer, filename);
        filePaths[claim] = filePath;
      }

      console.log(
        `Generated ${documents.size} documents successfully:`,
        filePaths
      );

      return NextResponse.json({
        success: true,
        message: `${documents.size} מסמכים נוצרו בהצלחה`,
        documents: filePaths,
        count: documents.size,
      });
    }

    // If neither claimType nor generateAll specified
    return NextResponse.json(
      {
        success: false,
        error: 'יש לציין "claimType" או "generateAll": true',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Document generation error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "שגיאה ביצירת המסמך",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.stack
              : String(error)
            : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check available templates
 */
export async function GET() {
  const claimTypes: ClaimType[] = [
    "property",
    "custody",
    "alimony",
    "divorce",
    "divorceAgreement",
  ];

  const availableTemplates: Record<string, boolean> = {};

  for (const claimType of claimTypes) {
    availableTemplates[claimType] = templateExists(claimType);
  }

  return NextResponse.json({
    status: "ok",
    endpoint: "/api/generate-document",
    methods: ["POST", "GET"],
    availableTemplates,
    groqConfigured: !!process.env.GROQ_API_KEY,
  });
}
