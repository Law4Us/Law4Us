import { google } from 'googleapis';
import { Readable } from 'stream';

// Don't cache env var at module level - it might not be loaded yet!
function getSharedDriveId() {
  return process.env.GOOGLE_DRIVE_FOLDER_ID;
}

// Singleton Drive client
let driveClient: ReturnType<typeof google.drive> | null = null;

/**
 * Initialize Google Drive client using service account (singleton)
 */
function getDriveClient() {
  if (driveClient) {
    console.log('♻️  Reusing existing Drive client');
    return driveClient;
  }

  console.log('🔑 Creating new Drive client with scope: https://www.googleapis.com/auth/drive');
  console.log(`   Service Account: ${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}`);
  console.log(`   Shared Drive ID: ${getSharedDriveId()}`);

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive'], // Full drive access for Shared Drives
  });

  driveClient = google.drive({ version: 'v3', auth });
  return driveClient;
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

  const parentId = folderId || getSharedDriveId();
  console.log(`📤 Uploading file "${fileName}" (${buffer.length} bytes) to parent: ${parentId}`);

  // Convert buffer to stream
  const bufferStream = new Readable();
  bufferStream.push(buffer);
  bufferStream.push(null);

  const fileMetadata: any = {
    name: fileName,
  };

  if (parentId) {
    fileMetadata.parents = [parentId];
  }

  const media = {
    mimeType,
    body: bufferStream,
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: 'id, webViewLink, webContentLink, parents',
    supportsAllDrives: true,
  });

  console.log(`✅ File uploaded with ID: ${response.data.id}`);

  return response.data.id || '';
}

/**
 * Create a folder in Google Drive
 */
export async function createFolder(folderName: string, parentFolderId?: string): Promise<string> {
  const drive = getDriveClient();

  const parentId = parentFolderId || getSharedDriveId();
  console.log(`📂 Creating folder "${folderName}" in parent: ${parentId}`);

  const fileMetadata: any = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };

  if (parentId) {
    fileMetadata.parents = [parentId];
  }

  const response = await drive.files.create({
    requestBody: fileMetadata,
    fields: 'id, name, parents',
    supportsAllDrives: true,
  });

  console.log(`✅ Folder created with ID: ${response.data.id}`);
  console.log(`   Parents: ${response.data.parents}`);

  return response.data.id || '';
}

/**
 * List files in a folder
 */
export async function listFiles(folderId?: string) {
  const drive = getDriveClient();

  const query = folderId || getSharedDriveId()
    ? `'${folderId || getSharedDriveId()}' in parents and trashed=false`
    : 'trashed=false';

  const response = await drive.files.list({
    q: query,
    fields: 'files(id, name, mimeType, createdTime, webViewLink, webContentLink)',
    orderBy: 'createdTime desc',
    pageSize: 100,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  return response.data.files || [];
}

/**
 * Search for folders by name pattern
 */
export async function searchFolders(namePattern: string, parentFolderId?: string): Promise<Array<{id: string, name: string}>> {
  const drive = getDriveClient();

  const parentId = parentFolderId || getSharedDriveId();

  // Search for folders with name containing pattern
  const query = parentId
    ? `name contains '${namePattern}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
    : `name contains '${namePattern}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

  console.log(`🔍 Searching for folders with pattern: "${namePattern}" in parent: ${parentId}`);

  const response = await drive.files.list({
    q: query,
    fields: 'files(id, name)',
    orderBy: 'createdTime desc',
    pageSize: 10,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  const folders = (response.data.files || []).map(f => ({ id: f.id!, name: f.name! }));
  console.log(`   Found ${folders.length} matching folders`);

  return folders;
}

/**
 * Get file metadata
 */
export async function getFileMetadata(fileId: string) {
  const drive = getDriveClient();

  const response = await drive.files.get({
    fileId,
    fields: 'id, name, mimeType, createdTime, modifiedTime, size, webViewLink, webContentLink',
    supportsAllDrives: true,
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
      supportsAllDrives: true,
    },
    { responseType: 'arraybuffer' }
  );

  return Buffer.from(response.data as ArrayBuffer);
}
