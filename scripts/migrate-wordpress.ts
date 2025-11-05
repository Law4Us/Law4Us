import axios from 'axios'
import TurndownService from 'turndown'
import slugify from 'slugify'
import fs from 'fs/promises'
import path from 'path'
import { createWriteStream } from 'fs'
import { pipeline } from 'stream/promises'

// WordPress REST API base URL
const WP_API_URL = 'https://divorcelaw.co.il/wp-json/wp/v2'

// Category mapping from WordPress to our Hebrew categories
const CATEGORY_MAP: Record<string, string> = {
  'כללי': 'כללי',
  'ירושה': 'ירושה',
  'גירושין': 'גירושין',
  'משמורת': 'משמורת',
  'ידועים בציבור': 'ידועים בציבור',
  'אפוטרופסות': 'אפוטרופסות',
  'אבהות-אימוץ': 'אבהות-אימוץ',
  'הסכמים': 'הסכמים',
  'מזונות': 'מזונות',
  'צו הרחקה': 'צו הרחקה',
}

// Initialize Turndown for HTML to Markdown conversion
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
})

// Configure Turndown to handle RTL Hebrew text properly
turndownService.addRule('preserveRTL', {
  filter: ['p', 'div', 'span'],
  replacement: (content) => content,
})

interface WordPressPost {
  id: number
  title: { rendered: string }
  content: { rendered: string }
  excerpt: { rendered: string }
  date: string
  categories: number[]
  featured_media: number
  link: string
  slug: string
}

interface WordPressCategory {
  id: number
  name: string
  slug: string
}

interface WordPressMedia {
  id: number
  source_url: string
  alt_text: string
  media_details: {
    width: number
    height: number
  }
}

async function fetchAllPosts(): Promise<WordPressPost[]> {
  console.log('📥 Fetching posts from WordPress...')
  const posts: WordPressPost[] = []
  let page = 1
  let hasMore = true

  while (hasMore) {
    try {
      const response = await axios.get(`${WP_API_URL}/posts`, {
        params: {
          page,
          per_page: 100,
          _embed: true,
        },
      })

      posts.push(...response.data)
      console.log(`   Fetched page ${page}: ${response.data.length} posts`)

      // Check if there are more pages
      const totalPages = parseInt(response.headers['x-wp-totalpages'] || '1')
      hasMore = page < totalPages
      page++
    } catch (error: any) {
      if (error.response?.status === 400) {
        // No more pages
        hasMore = false
      } else {
        throw error
      }
    }
  }

  console.log(`✅ Total posts fetched: ${posts.length}`)
  return posts
}

async function fetchCategories(): Promise<Map<number, string>> {
  console.log('📥 Fetching categories...')
  const response = await axios.get(`${WP_API_URL}/categories`, {
    params: { per_page: 100 },
  })

  const categoryMap = new Map<number, string>()
  response.data.forEach((cat: WordPressCategory) => {
    categoryMap.set(cat.id, cat.name)
  })

  console.log(`✅ Fetched ${categoryMap.size} categories`)
  return categoryMap
}

async function downloadImage(url: string, filename: string): Promise<string> {
  try {
    const imagePath = path.join(process.cwd(), 'public', 'images', 'blog', filename)
    const response = await axios.get(url, { responseType: 'stream' })

    await pipeline(response.data, createWriteStream(imagePath))
    return `/images/blog/${filename}`
  } catch (error) {
    console.error(`   ⚠️  Failed to download image: ${url}`)
    return ''
  }
}

function createEnglishSlug(hebrewTitle: string, wordpressSlug: string): string {
  // Try to create a meaningful English slug
  // For now, use WordPress slug as base or create from title
  if (wordpressSlug && !wordpressSlug.includes('%')) {
    return wordpressSlug
  }

  // Fallback: transliterate or use generic slug
  return slugify(hebrewTitle, {
    lower: true,
    strict: true,
    locale: 'en',
  }).substring(0, 60)
}

function cleanExcerpt(excerpt: string): string {
  // Remove HTML tags and clean up excerpt
  return excerpt
    .replace(/<[^>]*>/g, '')
    .replace(/\[&hellip;\]/g, '...')
    .trim()
}

function mapCategory(wpCategoryName: string): string {
  // Map WordPress category to our Hebrew categories
  return CATEGORY_MAP[wpCategoryName] || 'כללי'
}

async function migratePost(
  post: WordPressPost,
  categoryMap: Map<number, string>,
  index: number
): Promise<void> {
  try {
    console.log(`\n📝 Migrating post ${index + 1}: ${post.title.rendered}`)

    // Get category
    const wpCategoryId = post.categories[0]
    const wpCategoryName = categoryMap.get(wpCategoryId) || 'כללי'
    const hebrewCategory = mapCategory(wpCategoryName)

    // Create English slug
    const englishSlug = createEnglishSlug(post.title.rendered, post.slug) || `post-${post.id}`

    // Convert HTML content to Markdown
    const markdown = turndownService.turndown(post.content.rendered)

    // Clean excerpt
    const excerpt = cleanExcerpt(post.excerpt.rendered) || markdown.substring(0, 200) + '...'

    // Download featured image if exists
    let featuredImagePath = ''
    if (post.featured_media) {
      try {
        const mediaResponse = await axios.get(`${WP_API_URL}/media/${post.featured_media}`)
        const media: WordPressMedia = mediaResponse.data
        const imageFilename = `${englishSlug}-featured.jpg`
        featuredImagePath = await downloadImage(media.source_url, imageFilename)
        console.log(`   ✅ Downloaded featured image`)
      } catch (error) {
        console.log(`   ⚠️  No featured image found`)
      }
    }

    // Format date
    const postDate = new Date(post.date).toISOString().split('T')[0]

    // Create frontmatter
    const frontmatter = `---
title: "${post.title.rendered.replace(/"/g, '\\"')}"
slug: "${englishSlug}"
date: "${postDate}"
category: "${hebrewCategory}"
tags: []
excerpt: "${excerpt.replace(/"/g, '\\"')}"
${featuredImagePath ? `featuredImage: "${featuredImagePath}"` : '# featuredImage: ""'}
author: "אריאל דרור"
oldWordPressUrl: "${post.link}"
---

`

    // Create full MDX content
    const mdxContent = frontmatter + markdown

    // Create filename: YYYY-MM-DD-slug.mdx
    const filename = `${postDate}-${englishSlug}.mdx`
    const filepath = path.join(process.cwd(), 'content', 'blog', filename)

    // Write MDX file
    await fs.writeFile(filepath, mdxContent, 'utf8')
    console.log(`   ✅ Created: ${filename}`)

    // Return the old URL for redirect mapping
    return
  } catch (error: any) {
    console.error(`   ❌ Error migrating post ${post.id}:`, error.message)
  }
}

async function main() {
  console.log('🚀 Starting WordPress to MDX migration...\n')

  try {
    // Fetch data from WordPress
    const [posts, categoryMap] = await Promise.all([
      fetchAllPosts(),
      fetchCategories(),
    ])

    console.log(`\n📊 Migration Summary:`)
    console.log(`   Total posts to migrate: ${posts.length}`)
    console.log(`   Categories: ${categoryMap.size}\n`)

    // Ensure directories exist
    await fs.mkdir(path.join(process.cwd(), 'content', 'blog'), { recursive: true })
    await fs.mkdir(path.join(process.cwd(), 'public', 'images', 'blog'), { recursive: true })

    // Migrate posts one by one (to avoid rate limiting)
    for (let i = 0; i < posts.length; i++) {
      await migratePost(posts[i], categoryMap, i)
      // Small delay to avoid overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    console.log(`\n✅ Migration complete!`)
    console.log(`\n📁 Created ${posts.length} MDX files in content/blog/`)
    console.log(`\n🔄 Next steps:`)
    console.log(`   1. Review the migrated posts in content/blog/`)
    console.log(`   2. Check for any formatting issues`)
    console.log(`   3. Run the dev server: npm run dev`)
    console.log(`   4. Visit http://localhost:3000/blog to see your posts!`)
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message)
    process.exit(1)
  }
}

// Run migration
main()
