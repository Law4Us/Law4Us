import { NextRequest, NextResponse } from "next/server";
import { POST as handleSubmission } from "@/app/api/submission/route";

/**
 * API route for form submission
 * Directly calls the submission handler (no HTTP fetch to avoid auth issues)
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

    // Add metadata
    const submissionData = {
      ...data,
      submittedAt: new Date().toISOString(),
      source: "law4us-wizard",
    };

    // Create a new Request object for the submission handler
    const submissionRequest = new NextRequest(request.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submissionData),
    });

    // Call submission handler directly (no HTTP fetch)
    const result = await handleSubmission(submissionRequest);
    const resultData = await result.json();

    if (!result.ok) {
      throw new Error(resultData.error || resultData.message || "Submission failed");
    }

    // Log success
    console.log("✅ Submission successful:", {
      applicant: data.basicInfo.fullName,
      claims: data.selectedClaims,
      folderId: resultData.folderId,
      folderName: resultData.folderName,
    });

    return NextResponse.json({
      success: true,
      message: resultData.message || "הטופס נשלח בהצלחה",
      folderId: resultData.folderId,
      folderName: resultData.folderName,
    });
  } catch (error) {
    console.error("❌ Submission error:", error);

    // Log full error details
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

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
