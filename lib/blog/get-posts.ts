import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import { BlogPost, BlogPostPreview, BlogFrontmatter } from '@/lib/types/blog'

const postsDirectory = path.join(process.cwd(), 'content/blog')

/**
 * Get all blog posts sorted by date (newest first)
 * @param limit Optional limit for number of posts to return
 * @returns Array of blog post previews
 */
export async function getAllPosts(limit?: number): Promise<BlogPostPreview[]> {
  // Check if posts directory exists
  if (!fs.existsSync(postsDirectory)) {
    console.warn('Blog posts directory does not exist yet:', postsDirectory)
    return []
  }

  // Get all MDX files
  const files = fs.readdirSync(postsDirectory)
  const mdxFiles = files.filter((file) => file.endsWith('.mdx'))

  // Parse each file
  const posts = mdxFiles.map((filename) => {
    const filePath = path.join(postsDirectory, filename)
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(fileContent)
    const frontmatter = data as BlogFrontmatter

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
 * Get all unique categories from existing posts
 * @returns Array of category names with post counts
 */
export async function getCategories(): Promise<Array<{ category: string; count: number }>> {
  const posts = await getAllPosts()
  const categoryCounts = new Map<string, number>()

  posts.forEach((post) => {
    const count = categoryCounts.get(post.category) || 0
    categoryCounts.set(post.category, count + 1)
  })

  return Array.from(categoryCounts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count) // Sort by count descending
}

/**
 * Get total number of blog posts
 * @returns Total post count
 */
export async function getPostCount(): Promise<number> {
  if (!fs.existsSync(postsDirectory)) {
    return 0
  }

  const files = fs.readdirSync(postsDirectory)
  return files.filter((file) => file.endsWith('.mdx')).length
}
