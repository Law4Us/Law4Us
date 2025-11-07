/**
 * Generate a tiny SVG data URL to use as a blur placeholder for images.
 * Kept separate from client components so it can be used safely in server modules.
 */
export function generatePlaceholderDataURL(
  width: number = 10,
  height: number = 10,
  color: string = '#EEF2F3'
): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${color}"/>
    </svg>
  `;

  const base64 =
    typeof window === 'undefined'
      ? Buffer.from(svg).toString('base64')
      : window.btoa(svg);

  return `data:image/svg+xml;base64,${base64}`;
}
