'use server'

import { client } from '@/sanity/client'
import { groq } from 'next-sanity'
import type { BlogCategory } from '@/lib/types/blog'

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

export interface PaginatedResponse {
  posts: BlogPostPreview[]
  hasMore: boolean
  nextCursor: number
}

const POSTS_PER_PAGE = 12

/**
 * Get paginated blog posts using cursor-based pagination
 */
export async function getPaginatedPosts(
  cursor: number = 0,
  pageSize: number = POSTS_PER_PAGE
): Promise<PaginatedResponse> {
  const start = cursor
  const end = cursor + pageSize

  // Fetch one extra post to determine if there are more
  const query = groq`*[_type == "blogPost"] | order(date desc) [${start}...${end + 1}] {
    title,
    "slug": slug.current,
    date,
    category,
    excerpt,
    "featuredImage": featuredImage.asset->url + "?w=800&h=450&fit=crop&auto=format",
    author
  }`

  const posts = await client.fetch(query)

  const hasMore = posts.length > pageSize
  const returnedPosts = hasMore ? posts.slice(0, pageSize) : posts

  return {
    posts: returnedPosts.map((post: any) => ({
      ...post,
      readingTime: calculateReadingTime(post.excerpt),
    })),
    hasMore,
    nextCursor: end,
  }
}

/**
 * Get all blog posts for search functionality
 */
export async function getAllPostsForSearch(): Promise<BlogPostPreview[]> {
  const query = groq`*[_type == "blogPost"] | order(date desc) {
    title,
    "slug": slug.current,
    date,
    category,
    excerpt,
    "featuredImage": featuredImage.asset->url + "?w=800&h=450&fit=crop&auto=format",
    author
  }`

  const posts = await client.fetch(query)

  return posts.map((post: any) => ({
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
