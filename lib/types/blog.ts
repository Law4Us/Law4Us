// Blog post types and interfaces

export type BlogCategory =
  | 'כללי'           // General
  | 'ירושה'          // Inheritance
  | 'גירושין'        // Divorce
  | 'משמורת'         // Custody
  | 'ידועים בציבור'  // Common-law couples
  | 'אפוטרופסות'     // Guardianship
  | 'אבהות-אימוץ'    // Paternity/Adoption
  | 'הסכמים'         // Agreements
  | 'מזונות'         // Alimony
  | 'צו הרחקה'       // Restraining orders

export const BLOG_CATEGORIES: readonly BlogCategory[] = [
  'כללי',
  'ירושה',
  'גירושין',
  'משמורת',
  'ידועים בציבור',
  'אפוטרופסות',
  'אבהות-אימוץ',
  'הסכמים',
  'מזונות',
  'צו הרחקה',
] as const

// English slugs for categories (for URLs)
export const CATEGORY_SLUGS: Record<BlogCategory, string> = {
  'כללי': 'general',
  'ירושה': 'inheritance',
  'גירושין': 'divorce',
  'משמורת': 'custody',
  'ידועים בציבור': 'common-law',
  'אפוטרופסות': 'guardianship',
  'אבהות-אימוץ': 'paternity-adoption',
  'הסכמים': 'agreements',
  'מזונות': 'alimony',
  'צו הרחקה': 'restraining-orders',
}

// Reverse mapping: English slug to Hebrew category
export const SLUG_TO_CATEGORY: Record<string, BlogCategory> = {
  'general': 'כללי',
  'inheritance': 'ירושה',
  'divorce': 'גירושין',
  'custody': 'משמורת',
  'common-law': 'ידועים בציבור',
  'guardianship': 'אפוטרופסות',
  'paternity-adoption': 'אבהות-אימוץ',
  'agreements': 'הסכמים',
  'alimony': 'מזונות',
  'restraining-orders': 'צו הרחקה',
}

// Frontmatter metadata for blog posts
export interface BlogFrontmatter {
  title: string
  slug: string
  date: string // ISO-8601 format (YYYY-MM-DD)
  category: BlogCategory
  tags?: string[]
  excerpt: string
  featuredImage?: string
  author: string
  oldWordPressUrl?: string // Original WordPress URL for redirects
}

// Full blog post with content
export interface BlogPost extends BlogFrontmatter {
  content: string
  readingTime: string
}

// Blog post preview for listing pages
export interface BlogPostPreview {
  title: string
  slug: string
  date: string
  category: BlogCategory
  excerpt: string
  featuredImage?: string
  author: string
  readingTime: string
}

// Helper function to get category slug
export function getCategorySlug(category: BlogCategory): string {
  return CATEGORY_SLUGS[category]
}

// Helper function to get category from slug
export function getCategoryFromSlug(slug: string): BlogCategory | undefined {
  return SLUG_TO_CATEGORY[slug]
}

// Helper function to validate category
export function isValidCategory(category: string): category is BlogCategory {
  return BLOG_CATEGORIES.includes(category as BlogCategory)
}
