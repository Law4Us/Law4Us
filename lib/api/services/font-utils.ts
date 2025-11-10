import fs from 'fs';
import path from 'path';
import https from 'https';

const FONT_FILE_NAME = 'NotoSansHebrew-Regular.ttf';
const FALLBACK_FONT_URL = 'https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansHebrew/NotoSansHebrew-Regular.ttf';

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

async function downloadFont(targetPath: string): Promise<string> {
  await fs.promises.mkdir(path.dirname(targetPath), { recursive: true });

  return new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(targetPath);
    https.get(FALLBACK_FONT_URL, (response) => {
      if (response.statusCode && response.statusCode >= 400) {
        reject(new Error(`Failed to download font. HTTP ${response.statusCode}`));
        return;
      }

      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close(() => resolve(targetPath));
      });
    }).on('error', (error) => {
      fs.promises.unlink(targetPath).catch(() => {});
      reject(error);
    });
  });
}

async function resolveFontPathInternal(): Promise<string> {
  for (const folder of candidateFolders) {
    const candidate = path.join(folder, FONT_FILE_NAME);
    if (fileExists(candidate)) {
      return candidate;
    }
  }

  const tmpPath = path.join('/tmp', FONT_FILE_NAME);
  if (fileExists(tmpPath)) {
    return tmpPath;
  }

  return downloadFont(tmpPath);
}

export async function ensureHebrewFontPath(): Promise<string> {
  if (!resolvedFontPathPromise) {
    resolvedFontPathPromise = resolveFontPathInternal();
  }
  return resolvedFontPathPromise;
}
