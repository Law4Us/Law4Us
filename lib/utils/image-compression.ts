/**
 * Client-side image compression utility
 * Compresses images before base64 encoding to reduce payload size
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1 for JPEG/WebP
  maxSizeKB?: number; // Target max size in KB
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.7,
  maxSizeKB: 500, // Target 500KB per image
};

/**
 * Check if a file is an image that can be compressed
 */
export function isCompressibleImage(file: File): boolean {
  const compressibleTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
  ];
  return compressibleTypes.includes(file.type.toLowerCase());
}

/**
 * Compress an image file
 * Returns a compressed File or the original if compression fails/not needed
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Skip if not a compressible image
  if (!isCompressibleImage(file)) {
    console.log(`📄 Skipping compression for non-image: ${file.name} (${file.type})`);
    return file;
  }

  // Skip if already small enough
  const targetBytes = (opts.maxSizeKB || 500) * 1024;
  if (file.size <= targetBytes) {
    console.log(`✅ File already small enough: ${file.name} (${formatSize(file.size)})`);
    return file;
  }

  console.log(`🔄 Compressing image: ${file.name} (${formatSize(file.size)})`);

  try {
    const compressedBlob = await compressImageBlob(file, opts);

    // Create a new File from the compressed blob
    const compressedFile = new File([compressedBlob], file.name, {
      type: 'image/jpeg', // We convert all to JPEG for better compression
      lastModified: file.lastModified,
    });

    const savings = ((file.size - compressedFile.size) / file.size * 100).toFixed(1);
    console.log(`✅ Compressed: ${formatSize(file.size)} → ${formatSize(compressedFile.size)} (${savings}% reduction)`);

    return compressedFile;
  } catch (error) {
    console.error(`❌ Compression failed for ${file.name}:`, error);
    return file; // Return original on failure
  }
}

/**
 * Internal compression using Canvas API
 */
async function compressImageBlob(
  file: File,
  options: CompressionOptions
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      const maxWidth = options.maxWidth || 1920;
      const maxHeight = options.maxHeight || 1920;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      // Draw image with white background (for PNGs with transparency)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Try to hit target size with adaptive quality
      const targetBytes = (options.maxSizeKB || 500) * 1024;
      let quality = options.quality || 0.7;

      const tryCompress = (q: number): Promise<Blob> => {
        return new Promise((res, rej) => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                res(blob);
              } else {
                rej(new Error('Canvas toBlob failed'));
              }
            },
            'image/jpeg',
            q
          );
        });
      };

      // Adaptive quality reduction to hit target size
      const compressWithTargetSize = async (): Promise<Blob> => {
        let blob = await tryCompress(quality);

        // If still too large, reduce quality progressively
        while (blob.size > targetBytes && quality > 0.2) {
          quality -= 0.1;
          blob = await tryCompress(quality);
        }

        // If still too large, reduce dimensions
        if (blob.size > targetBytes && (width > 1280 || height > 1280)) {
          const scale = 0.7;
          canvas.width = Math.round(width * scale);
          canvas.height = Math.round(height * scale);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          blob = await tryCompress(quality);
        }

        return blob;
      };

      compressWithTargetSize().then(resolve).catch(reject);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Create object URL for the file
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Compress multiple files
 */
export async function compressFiles(
  files: File[],
  options?: CompressionOptions
): Promise<File[]> {
  return Promise.all(files.map((file) => compressImage(file, options)));
}

/**
 * Format bytes to human-readable size
 */
function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Estimate total payload size after base64 encoding
 * Base64 increases size by ~33%
 */
export function estimateBase64Size(files: File[]): number {
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  return Math.ceil(totalBytes * 1.33);
}

/**
 * Check if files would exceed payload limit
 */
export function wouldExceedPayloadLimit(
  files: File[],
  limitMB: number = 4.0
): boolean {
  const estimatedSize = estimateBase64Size(files);
  const limitBytes = limitMB * 1024 * 1024;
  return estimatedSize > limitBytes;
}
