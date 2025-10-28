/**
 * Load lawyer signature on-demand
 * This avoids module-level file reads that can crash tsx watch
 */

import { readFileSync } from 'fs';
import { join } from 'path';

let cachedSignature: string | null = null;

/**
 * Load lawyer signature (Ariel Dror with stamp)
 * Returns base64 data URL format
 */
export function loadLawyerSignature(): string {
  // Return cached version if available
  if (cachedSignature) {
    return cachedSignature;
  }

  try {
    // Try multiple possible paths
    const possiblePaths = [
      join(__dirname, '../../Signature.png'),
      join(__dirname, '../../../Signature.png'),
      '/Users/dortagger/Law4Us/Signature.png',
      '/Users/dortagger/Law4Us/Law4Us-API/Signature.png',
    ];

    for (const path of possiblePaths) {
      try {
        const buffer = readFileSync(path);
        cachedSignature = `data:image/png;base64,${buffer.toString('base64')}`;
        console.log(`✅ Loaded lawyer signature from: ${path} (${buffer.length} bytes)`);
        return cachedSignature;
      } catch {
        // Try next path
        continue;
      }
    }

    throw new Error('Could not find Signature.png in any expected location');
  } catch (error) {
    console.error('❌ Failed to load lawyer signature:', error);
    // Return empty string as fallback
    return '';
  }
}
