/**
 * Load lawyer signature on-demand
 * Now reads from environment variable instead of file system for serverless compatibility
 */

let cachedSignature: string | null = null;

/**
 * Load lawyer signature (Ariel Dror with stamp)
 * Returns base64 data URL format
 *
 * For Vercel deployment, set LAWYER_SIGNATURE_BASE64 environment variable
 */
export function loadLawyerSignature(): string {
  // Return cached version if available
  if (cachedSignature) {
    return cachedSignature;
  }

  try {
    // Read from environment variable
    const base64Signature = process.env.LAWYER_SIGNATURE_BASE64;

    if (!base64Signature) {
      throw new Error('LAWYER_SIGNATURE_BASE64 environment variable not set');
    }

    // If it already includes data URL prefix, use as-is
    if (base64Signature.startsWith('data:image/png;base64,')) {
      cachedSignature = base64Signature;
    } else {
      // Add data URL prefix
      cachedSignature = `data:image/png;base64,${base64Signature}`;
    }

    console.log(`✅ Loaded lawyer signature from environment variable (${base64Signature.length} characters)`);
    return cachedSignature;
  } catch (error) {
    console.error('❌ Failed to load lawyer signature:', error);
    throw new Error('Lawyer signature not available. Please set LAWYER_SIGNATURE_BASE64 environment variable.');
  }
}
