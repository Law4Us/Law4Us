import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

/**
 * API route for Vercel Blob client uploads
 * This generates secure tokens for direct client-to-blob uploads
 *
 * Benefits:
 * - Bypasses Vercel's 4.5MB serverless limit entirely
 * - Files upload directly from browser to Blob storage
 * - Supports files up to 5TB
 * - Progress tracking available
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Validate the upload - you can add authentication here
        // For now, allow all uploads but log them
        console.log(`📤 Generating upload token for: ${pathname}`);

        return {
          allowedContentTypes: [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/heic',
            'image/heif',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          ],
          // Set max file size to 50MB (plenty of room for documents)
          maximumSizeInBytes: 50 * 1024 * 1024,
          // Add metadata
          tokenPayload: JSON.stringify({
            uploadedAt: new Date().toISOString(),
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Called after successful upload (webhook from Vercel)
        console.log(`✅ Blob upload completed: ${blob.pathname}`);
        console.log(`   URL: ${blob.url}`);

        // You can store the blob URL in your database here
        // or trigger any post-upload processing
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('❌ Blob upload error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
