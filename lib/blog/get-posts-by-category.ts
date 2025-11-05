import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import { BlogPostPreview, BlogFrontmatter, BlogCategory } from '@/lib/types/blog'

const postsDirectory = path.join(process.cwd(), 'content/blog')

/**
 * Get all blog posts in a specific category
 * @param category The category to filter by
 * @param limit Optional limit for number of posts to return
 * @returns Array of blog post previews in this category
 */
export async function getPostsByCategory(
  category: BlogCategory,
  limit?: number
): Promise<BlogPostPreview[]> {
  // Check if posts directory exists
  if (!fs.existsSync(postsDirectory)) {
    console.warn('Blog posts directory does not exist yet:', postsDirectory)
    return []
  }

  // Get all MDX files
  const files = fs.readdirSync(postsDirectory)
  const mdxFiles = files.filter((file) => file.endsWith('.mdx'))

  // Parse each file and filter by category
  const posts = mdxFiles
    .map((filename) => {
      const filePath = path.join(postsDirectory, filename)
      const fileContent = fs.readFileSync(filePath, 'utf8')
      const { data, content } = matter(fileContent)
      const frontmatter = data as BlogFrontmatter

      // Only include posts in this category
      if (frontmatter.category !== category) {
        return null
      }

      // Calculate reading time
      const stats = readingTime(content)

      return {
        title: frontmatter.title,
        slug: frontmatter.slug,
        date: frontmatter.date,
        category: frontmatter.category,
        excerpt: frontmatter.excerpt,
        featuredImage: frontmatter.featuredImage,
        author: frontmatter.author,
        readingTime: stats.text,
      } as BlogPostPreview
    })
    .filter((post): post is BlogPostPreview => post !== null)

  // Sort by date (newest first)
  const sortedPosts = posts.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  // Apply limit if specified
  if (limit) {
    return sortedPosts.slice(0, limit)
  }

  return sortedPosts
}

/**
 * Get related posts (same category, excluding current post)
 * @param slug The current post slug to exclude
 * @param category The category to filter by
 * @param limit Number of related posts to return (default: 3)
 * @returns Array of related blog post previews
 */
export async function getRelatedPosts(
  slug: string,
  category: BlogCategory,
  limit: number = 3
): Promise<BlogPostPreview[]> {
  const categoryPosts = await getPostsByCategory(category)

  // Filter out the current post
  const relatedPosts = categoryPosts.filter((post) => post.slug !== slug)

  // Return limited number of posts
  return relatedPosts.slice(0, limit)
}
