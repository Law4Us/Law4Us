import { NextRequest, NextResponse } from "next/server";

/**
 * API route for form submission
 * Validates data and forwards to Railway backend
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

    // Get backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://law4us-production.up.railway.app';

    if (!backendUrl) {
      console.warn("Backend URL not configured");
      // In development, simulate success
      if (process.env.NODE_ENV === "development") {
        console.log("=== SIMULATED SUBMISSION ===");
        console.log("Data:", JSON.stringify(data, null, 2));
        return NextResponse.json({
          success: true,
          message: "הטופס נשלח בהצלחה (סימולציה)",
          submissionId: `SIM-${Date.now()}`,
        });
      }

      return NextResponse.json(
        { success: false, error: "שגיאת הגדרות שרת" },
        { status: 500 }
      );
    }

    // Forward to Railway backend
    const response = await fetch(`${backendUrl}/api/submission/submit`, {
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
      throw new Error(`Backend returned ${response.status}`);
    }

    const result = await response.json();

    // Log success
    console.log("Submission successful:", {
      submissionId: result.id || Date.now(),
      applicant: data.basicInfo.fullName,
      claims: data.selectedClaims,
    });

    return NextResponse.json({
      success: true,
      message: "הטופס נשלח בהצלחה",
      submissionId: result.id || `SUB-${Date.now()}`,
    });
  } catch (error) {
    console.error("Submission error:", error);

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
