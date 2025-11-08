export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-07'

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''

export const useCdn = process.env.NODE_ENV === 'production'

// Used to generate URLs for images and documents
export const sanityConfig = {
  projectId,
  dataset,
  apiVersion,
  useCdn,
}
