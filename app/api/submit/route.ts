import { NextRequest, NextResponse } from "next/server";

/**
 * API route for form submission
 * NOW HANDLES EVERYTHING LOCALLY - No Railway backend needed!
 *
 * This endpoint delegates to /api/submission which:
 * - Generates documents
 * - Uploads to Google Drive
 * - Returns success/failure response
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const data = await request.json();

    // Basic validation
    if (!data.basicInfo || !data.selectedClaims || !data.signature) {
      return NextResponse.json(
        { success: false, error: "חסרים שדות חובה" },
        { status: 400 }
      );
    }

    // Call our local submission API route (no external backend!)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    const response = await fetch(`${baseUrl}/api/submission`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        submittedAt: new Date().toISOString(),
        source: "law4us-wizard",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Submission API error response:', errorText);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: 'Unknown error', rawError: errorText };
      }

      throw new Error(errorData.error || errorData.message || `Submission failed with status ${response.status}`);
    }

    const result = await response.json();

    // Log success
    console.log("✅ Submission successful:", {
      applicant: data.basicInfo.fullName,
      claims: data.selectedClaims,
      folderId: result.folderId,
      folderName: result.folderName,
    });

    return NextResponse.json({
      success: true,
      message: result.message || "הטופס נשלח בהצלחה",
      folderId: result.folderId,
      folderName: result.folderName,
    });
  } catch (error) {
    console.error("❌ Submission error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "שגיאה בעיבוד הבקשה",
      },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/submit",
    methods: ["POST"],
  });
}
