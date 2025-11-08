export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-07'

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

// Use a placeholder project ID during build if not set
// This allows the build to succeed; real env vars will be used at runtime
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'placeholder'

export const useCdn = process.env.NODE_ENV === 'production'

// Used to generate URLs for images and documents
export const sanityConfig = {
  projectId,
  dataset,
  apiVersion,
  useCdn,
}
