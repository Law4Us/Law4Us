import { google } from 'googleapis';
import { Readable } from 'stream';

const PRIVATE_KEY_BEGIN = '-----BEGIN PRIVATE KEY-----';
const PRIVATE_KEY_END = '-----END PRIVATE KEY-----';

/**
 * Normalize a service account private key into a PEM string that OpenSSL accepts.
 * Handles common deployment issues (double quotes, literal \n, missing line breaks, base64 wrappers).
 */
function normalizePrivateKey(rawKey: string): string {
  let key = rawKey.trim();

  // Strip surrounding quotes added by some hosting dashboards
  const firstChar = key[0];
  const lastChar = key[key.length - 1];
  if (firstChar && lastChar && ((firstChar === '"' && lastChar === '"') || (firstChar === "'" && lastChar === "'"))) {
    key = key.slice(1, -1);
  }

  // If the key is a JSON string, pull out the private_key field
  if (key.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(key);
      if (typeof parsed?.private_key === 'string') {
        key = parsed.private_key;
      }
    } catch (err) {
      console.warn('⚠️  Failed to parse GOOGLE_PRIVATE_KEY as JSON, continuing with original value');
    }
  }

  // Convert escaped newline / carriage-return sequences to real characters
  key = key.replace(/\\r/g, '\r').replace(/\\n/g, '\n');

  // Some dashboards double-escape the string and it becomes base64 encoded JSON; try to decode if needed
  if (!key.includes(PRIVATE_KEY_BEGIN) && /^[A-Za-z0-9+/=\s]+$/.test(key)) {
    try {
      const decoded = Buffer.from(key.replace(/\s+/g, ''), 'base64').toString('utf8');
      if (decoded.includes(PRIVATE_KEY_BEGIN)) {
        key = decoded;
      }
    } catch (err) {
      console.warn('⚠️  Failed to base64-decode GOOGLE_PRIVATE_KEY, continuing with original value');
    }
  }

  const beginIndex = key.indexOf(PRIVATE_KEY_BEGIN);
  const endIndex = key.indexOf(PRIVATE_KEY_END);

  if (beginIndex === -1 || endIndex === -1) {
    throw new Error('Invalid GOOGLE_PRIVATE_KEY format. Expected PEM block with BEGIN/END headers.');
  }

  // Extract and normalise the PEM body (remove stray whitespace, then chunk into 64-char lines)
  let body = key
    .slice(beginIndex + PRIVATE_KEY_BEGIN.length, endIndex)
    .replace(/\r/g, '\n')
    .replace(/[^A-Za-z0-9+/=]/g, '');

  if (!body) {
    throw new Error('Invalid GOOGLE_PRIVATE_KEY format. PEM body is empty after normalisation.');
  }

  const chunkedBody = body.match(/.{1,64}/g)?.join('\n');

  if (!chunkedBody) {
    throw new Error('Invalid GOOGLE_PRIVATE_KEY format. Unable to split PEM body into lines.');
  }

  const normalisedKey = `${PRIVATE_KEY_BEGIN}\n${chunkedBody}\n${PRIVATE_KEY_END}\n`;

  return normalisedKey;
}

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

  // Validate environment variables
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_EMAIL environment variable is not set');
  }
  if (!process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error('GOOGLE_PRIVATE_KEY environment variable is not set');
  }

  // Process private key - tolerate most environment-variable quirks automatically
  const privateKey = normalizePrivateKey(process.env.GOOGLE_PRIVATE_KEY);

  console.log('✅ Private key format validated');
  console.log(`Key length: ${privateKey.length} characters, lines: ${privateKey.split('\n').length}`);

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
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
