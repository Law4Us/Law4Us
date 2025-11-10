import fs from 'fs';
import path from 'path';
import https from 'https';

const FONT_FILE_NAME = 'Assistant-Regular.ttf';
const FALLBACK_FONT_URL = 'https://github.com/google/fonts/raw/main/ofl/assistant/Assistant-Regular.ttf';

const candidateFolders = [
  path.join(process.cwd(), 'public', 'fonts'),
  path.join(process.cwd(), 'fonts'),
  path.join(process.cwd(), 'assets', 'fonts'),
  path.join(process.cwd(), 'lib', 'assets', 'fonts'),
  process.cwd(),
  __dirname,
];

let resolvedFontPathPromise: Promise<string> | null = null;

function fileExists(filePath: string) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function isValidFont(filePath: string): boolean {
  try {
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(4);
    fs.readSync(fd, buffer, 0, 4, 0);
    fs.closeSync(fd);
    const header = buffer.toString('ascii');
    return header === 'OTTO' || buffer.equals(Buffer.from([0x00, 0x01, 0x00, 0x00]));
  } catch {
    return false;
  }
}

function downloadWithRedirect(url: string, targetPath: string, redirects = 3): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        if (redirects <= 0) {
          reject(new Error('Too many redirects while downloading font'));
          return;
        }
        const nextUrl = new URL(response.headers.location, url).toString();
        downloadWithRedirect(nextUrl, targetPath, redirects - 1).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode && response.statusCode >= 400) {
        reject(new Error(`Failed to download font. HTTP ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(targetPath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close(() => resolve(targetPath));
      });

      fileStream.on('error', (error) => {
        fs.promises.unlink(targetPath).catch(() => {});
        reject(error);
      });
    });

    request.on('error', (error) => {
      fs.promises.unlink(targetPath).catch(() => {});
      reject(error);
    });
  });
}

async function downloadFont(targetPath: string): Promise<string> {
  await fs.promises.mkdir(path.dirname(targetPath), { recursive: true });
  const downloadedPath = await downloadWithRedirect(FALLBACK_FONT_URL, targetPath);
  if (!isValidFont(downloadedPath)) {
    await fs.promises.unlink(downloadedPath).catch(() => {});
    throw new Error('Downloaded font file is invalid');
  }
  return downloadedPath;
}

async function resolveFontPathInternal(): Promise<string> {
  for (const folder of candidateFolders) {
    const candidate = path.join(folder, FONT_FILE_NAME);
    if (fileExists(candidate) && isValidFont(candidate)) {
      return candidate;
    }
  }

  const tmpPath = path.join('/tmp', FONT_FILE_NAME);
  if (fileExists(tmpPath)) {
    if (isValidFont(tmpPath)) {
      return tmpPath;
    }
    await fs.promises.unlink(tmpPath).catch(() => {});
  }

  return downloadFont(tmpPath);
}

export async function ensureHebrewFontPath(): Promise<string> {
  if (!resolvedFontPathPromise) {
    resolvedFontPathPromise = resolveFontPathInternal();
  }
  return resolvedFontPathPromise;
}
