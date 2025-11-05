import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import { BlogPost, BlogFrontmatter } from '@/lib/types/blog'

const postsDirectory = path.join(process.cwd(), 'content/blog')

/**
 * Get a single blog post by slug
 * @param slug The post slug (without .mdx extension)
 * @returns Blog post object or null if not found
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    // Find the MDX file with this slug
    const files = fs.readdirSync(postsDirectory)
    const mdxFiles = files.filter((file) => file.endsWith('.mdx'))

    // Look for file with matching slug in frontmatter
    for (const filename of mdxFiles) {
      const filePath = path.join(postsDirectory, filename)
      const fileContent = fs.readFileSync(filePath, 'utf8')
      const { data, content } = matter(fileContent)
      const frontmatter = data as BlogFrontmatter

      if (frontmatter.slug === slug) {
        // Calculate reading time
        const stats = readingTime(content)

        return {
          ...frontmatter,
          content,
          readingTime: stats.text,
        }
      }
    }

    // Post not found
    console.warn(`Blog post with slug "${slug}" not found`)
    return null
  } catch (error) {
    console.error(`Error reading blog post "${slug}":`, error)
    return null
  }
}

/**
 * Get all post slugs (for static generation)
 * @returns Array of post slugs
 */
export async function getAllPostSlugs(): Promise<string[]> {
  if (!fs.existsSync(postsDirectory)) {
    return []
  }

  const files = fs.readdirSync(postsDirectory)
  const mdxFiles = files.filter((file) => file.endsWith('.mdx'))

  const slugs: string[] = []

  for (const filename of mdxFiles) {
    const filePath = path.join(postsDirectory, filename)
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const { data } = matter(fileContent)
    const frontmatter = data as BlogFrontmatter

    if (frontmatter.slug) {
      slugs.push(frontmatter.slug)
    }
  }

  return slugs
}

/**
 * Check if a post exists with the given slug
 * @param slug The post slug to check
 * @returns True if post exists
 */
export async function postExists(slug: string): Promise<boolean> {
  const post = await getPostBySlug(slug)
  return post !== null
}
