import { NextRequest, NextResponse } from "next/server";
import { uploadToDrive, createFolder, searchFolders } from "@/lib/api/services/google-drive";

// Route config
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Vercel body size limit workaround: use streaming
export const runtime = 'nodejs';

/**
 * Upload a single file to Google Drive temporary folder
 * Returns the file ID for later reference in form submission
 *
 * This endpoint allows files to be uploaded separately from form submission,
 * bypassing Vercel's 4.5MB payload limit for the main form.
 */
export async function POST(request: NextRequest) {
  try {
    // Get form data with the file
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const sessionId = formData.get('sessionId') as string | null;
    const fieldName = formData.get('fieldName') as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "לא נבחר קובץ" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB per file)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "הקובץ גדול מדי. גודל מקסימלי: 10MB" },
        { status: 400 }
      );
    }

    console.log(`📤 Uploading file: ${file.name} (${formatSize(file.size)})`);

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Find or create temporary uploads folder
    const tempFolderName = "טיוטות-העלאות";
    const existingFolders = await searchFolders(tempFolderName);
    let tempFolderId: string;

    if (existingFolders.length > 0) {
      tempFolderId = existingFolders[0].id;
    } else {
      console.log("📁 Creating temporary uploads folder...");
      tempFolderId = await createFolder(tempFolderName);
    }

    // Generate unique filename with session prefix
    const timestamp = Date.now();
    const prefix = sessionId ? `${sessionId.slice(0, 8)}-` : '';
    const uniqueName = `${prefix}${timestamp}-${file.name}`;

    // Upload to Google Drive
    const fileId = await uploadToDrive({
      fileName: uniqueName,
      buffer,
      mimeType: file.type || 'application/octet-stream',
      folderId: tempFolderId,
    });

    console.log(`✅ File uploaded: ${file.name} -> ${fileId}`);

    return NextResponse.json({
      success: true,
      fileId,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      fieldName,
    });
  } catch (error) {
    console.error("❌ File upload error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "שגיאה בהעלאת הקובץ",
      },
      { status: 500 }
    );
  }
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}
