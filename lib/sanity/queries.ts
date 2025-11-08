import { client } from '@/sanity/client'
import { projectId } from '@/sanity/env'
import { groq } from 'next-sanity'
import type { BlogCategory } from '@/lib/types/blog'

export interface SanityBlogPost {
  _id: string
  title: string
  slug: {
    current: string
  }
  date: string
  category: BlogCategory
  tags?: string[]
  excerpt: string
  featuredImage?: {
    asset: {
      _ref: string
      url?: string
    }
    alt?: string
  }
  author: string
  oldWordPressUrl?: string
  content: any[]
}

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

// Type for what GROQ queries actually return (with slug.current already projected to string)
interface SanityBlogPostQueryResult {
  title: string
  slug: string
  date: string
  category: BlogCategory
  tags?: string[]
  excerpt: string
  featuredImage?: string
  author: string
  oldWordPressUrl?: string
  content?: any[]
}

export interface BlogPost extends BlogPostPreview {
  content: any[]
  tags?: string[]
  oldWordPressUrl?: string
}

/**
 * Get all blog posts
 */
export async function getAllPosts(limit?: number): Promise<BlogPostPreview[]> {
  // Return empty array if Sanity is not configured (e.g., during build)
  if (!projectId || projectId === 'placeholder') {
    return []
  }

  const query = limit
    ? groq`*[_type == "blogPost"] | order(date desc) [0...${limit}] {
        title,
        "slug": slug.current,
        date,
        category,
        excerpt,
        "featuredImage": featuredImage.asset->url + "?w=800&h=450&fit=crop&auto=format",
        author
      }`
    : groq`*[_type == "blogPost"] | order(date desc) {
        title,
        "slug": slug.current,
        date,
        category,
        excerpt,
        "featuredImage": featuredImage.asset->url + "?w=800&h=450&fit=crop&auto=format",
        author
      }`

  const posts = await client.fetch<SanityBlogPostQueryResult[]>(query)

  return posts.map((post) => ({
    ...post,
    readingTime: calculateReadingTime(post.excerpt),
  }))
}

/**
 * Get blog post by slug
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  // Return null if Sanity is not configured (e.g., during build)
  if (!projectId || projectId === 'placeholder') {
    return null
  }

  const query = groq`*[_type == "blogPost" && slug.current == $slug][0] {
    title,
    "slug": slug.current,
    date,
    category,
    tags,
    excerpt,
    "featuredImage": featuredImage.asset->url + "?w=1200&h=630&fit=crop&auto=format",
    author,
    oldWordPressUrl,
    content
  }`

  const post = await client.fetch<SanityBlogPostQueryResult | null>(query, { slug })

  if (!post) return null

  return {
    ...post,
    content: post.content || [],
    readingTime: calculateReadingTime(post.excerpt),
  }
}

/**
 * Get all post slugs for static generation
 */
export async function getAllPostSlugs(): Promise<string[]> {
  // Return empty array if Sanity is not configured (e.g., during build)
  if (!projectId || projectId === 'placeholder') {
    return []
  }

  const query = groq`*[_type == "blogPost"].slug.current`
  return client.fetch<string[]>(query)
}

/**
 * Get all categories with post counts
 */
export async function getCategories(): Promise<
  Array<{ category: BlogCategory; count: number }>
> {
  // Return empty array if Sanity is not configured (e.g., during build)
  if (!projectId || projectId === 'placeholder') {
    return []
  }

  const query = groq`*[_type == "blogPost" && defined(category)]{ category }`
  const categories = await client.fetch<Array<{ category: BlogCategory | null }>>(query)

  const counts = categories.reduce<Record<BlogCategory, number>>((acc, item) => {
    if (!item?.category) {
      return acc
    }
    acc[item.category] = (acc[item.category] || 0) + 1
    return acc
  }, {} as Record<BlogCategory, number>)

  return Object.entries(counts)
    .map(([category, count]) => ({ category: category as BlogCategory, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Get posts by category
 */
export async function getPostsByCategory(
  category: BlogCategory
): Promise<BlogPostPreview[]> {
  // Return empty array if Sanity is not configured (e.g., during build)
  if (!projectId || projectId === 'placeholder') {
    return []
  }

  const query = groq`*[_type == "blogPost" && category == $category] | order(date desc) {
    title,
    "slug": slug.current,
    date,
    category,
    excerpt,
    "featuredImage": featuredImage.asset->url + "?w=800&h=450&fit=crop&auto=format",
    author
  }`

  const posts = await client.fetch<SanityBlogPostQueryResult[]>(query, { category })

  return posts.map((post) => ({
    ...post,
    readingTime: calculateReadingTime(post.excerpt),
  }))
}

/**
 * Get related posts (same category, excluding current post)
 */
export async function getRelatedPosts(
  currentSlug: string,
  category: BlogCategory,
  limit: number = 3
): Promise<BlogPostPreview[]> {
  // Return empty array if Sanity is not configured (e.g., during build)
  if (!projectId || projectId === 'placeholder') {
    return []
  }

  const query = groq`*[_type == "blogPost" && category == $category && slug.current != $currentSlug] | order(date desc) [0...$limit] {
    title,
    "slug": slug.current,
    date,
    category,
    excerpt,
    "featuredImage": featuredImage.asset->url + "?w=600&h=400&fit=crop&auto=format",
    author
  }`

  const posts = await client.fetch<SanityBlogPostQueryResult[]>(query, {
    category,
    currentSlug,
    limit,
  })

  return posts.map((post) => ({
    ...post,
    readingTime: calculateReadingTime(post.excerpt),
  }))
}

/**
 * Calculate reading time (rough estimate)
 */
function calculateReadingTime(text: string): string {
  const wordsPerMinute = 200
  const wordCount = text.split(/\s+/).length
  const minutes = Math.ceil(wordCount / wordsPerMinute)
  return `${minutes} דקות קריאה`
}
