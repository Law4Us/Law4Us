import { google } from 'googleapis';
import { Readable } from 'stream';

const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

/**
 * Initialize Google Drive client using service account
 */
function getDriveClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  return google.drive({ version: 'v3', auth });
}

interface UploadFileOptions {
  fileName: string;
  mimeType: string;
  buffer: Buffer;
  folderId?: string;
}

/**
 * Upload a file to Google Drive
 */
export async function uploadToDrive(options: UploadFileOptions): Promise<string> {
  const { fileName, mimeType, buffer, folderId } = options;

  const drive = getDriveClient();

  // Convert buffer to stream
  const bufferStream = new Readable();
  bufferStream.push(buffer);
  bufferStream.push(null);

  const fileMetadata: any = {
    name: fileName,
  };

  if (folderId || GOOGLE_DRIVE_FOLDER_ID) {
    fileMetadata.parents = [folderId || GOOGLE_DRIVE_FOLDER_ID];
  }

  const media = {
    mimeType,
    body: bufferStream,
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: 'id, webViewLink, webContentLink',
  });

  return response.data.id || '';
}

/**
 * Create a folder in Google Drive
 */
export async function createFolder(folderName: string, parentFolderId?: string): Promise<string> {
  const drive = getDriveClient();

  const fileMetadata: any = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };

  if (parentFolderId || GOOGLE_DRIVE_FOLDER_ID) {
    fileMetadata.parents = [parentFolderId || GOOGLE_DRIVE_FOLDER_ID];
  }

  const response = await drive.files.create({
    requestBody: fileMetadata,
    fields: 'id',
  });

  return response.data.id || '';
}

/**
 * List files in a folder
 */
export async function listFiles(folderId?: string) {
  const drive = getDriveClient();

  const query = folderId || GOOGLE_DRIVE_FOLDER_ID
    ? `'${folderId || GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed=false`
    : 'trashed=false';

  const response = await drive.files.list({
    q: query,
    fields: 'files(id, name, mimeType, createdTime, webViewLink, webContentLink)',
    orderBy: 'createdTime desc',
    pageSize: 100,
  });

  return response.data.files || [];
}

/**
 * Get file metadata
 */
export async function getFileMetadata(fileId: string) {
  const drive = getDriveClient();

  const response = await drive.files.get({
    fileId,
    fields: 'id, name, mimeType, createdTime, modifiedTime, size, webViewLink, webContentLink',
  });

  return response.data;
}

/**
 * Download file from Drive
 */
export async function downloadFile(fileId: string): Promise<Buffer> {
  const drive = getDriveClient();

  const response = await drive.files.get(
    {
      fileId,
      alt: 'media',
    },
    { responseType: 'arraybuffer' }
  );

  return Buffer.from(response.data as ArrayBuffer);
}
