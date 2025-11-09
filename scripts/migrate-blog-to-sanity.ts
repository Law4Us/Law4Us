#!/usr/bin/env tsx

/**
 * Migration script to import existing MDX blog posts into Sanity CMS
 *
 * Usage:
 *   npm run migrate:blog-to-sanity
 *
 * This will:
 * 1. Read all MDX files from content/blog/
 * 2. Parse frontmatter and content
 * 3. Convert content to Sanity's block format
 * 4. Upload to Sanity
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { createClient } from '@sanity/client'
import { randomUUID } from 'crypto'

// Environment variables are automatically loaded by Node.js from .env.local

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-07',
  token: process.env.SANITY_API_TOKEN || '',
  useCdn: false,
})

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

interface BlogPost {
  title: string
  slug: string
  date: string
  category: string
  tags?: string[]
  excerpt: string
  featuredImage?: string
  author: string
  oldWordPressUrl?: string
  content: string
}

/**
 * Simple MDX to Sanity blocks converter
 * Converts markdown-style content to Sanity's block format
 */
function mdxToBlocks(content: string): any[] {
  const blocks: any[] = []

  // Remove MDX imports and exports
  content = content.replace(/^import .+$/gm, '')
  content = content.replace(/^export .+$/gm, '')

  // Split by paragraphs and headings
  const lines = content.split('\n')
  let currentBlock: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()

    if (!trimmed) {
      if (currentBlock.length > 0) {
        blocks.push(createTextBlock(currentBlock.join(' ')))
        currentBlock = []
      }
      continue
    }

    // Headings
    if (trimmed.startsWith('#')) {
      if (currentBlock.length > 0) {
        blocks.push(createTextBlock(currentBlock.join(' ')))
        currentBlock = []
      }

      const level = trimmed.match(/^#+/)?.[0].length || 1
      const text = trimmed.replace(/^#+\s*/, '')
      blocks.push(createHeadingBlock(text, level))
      continue
    }

    // Regular text
    currentBlock.push(trimmed)
  }

  // Add any remaining content
  if (currentBlock.length > 0) {
    blocks.push(createTextBlock(currentBlock.join(' ')))
  }

  return blocks.filter(Boolean)
}

function createTextBlock(text: string): any {
  if (!text.trim()) return null

  return {
    _type: 'block',
    _key: randomUUID(),
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: randomUUID(),
        text: text,
        marks: [],
      },
    ],
  }
}

function createHeadingBlock(text: string, level: number): any {
  const style = level === 1 ? 'h1' : level === 2 ? 'h2' : level === 3 ? 'h3' : 'h4'

  return {
    _type: 'block',
    _key: randomUUID(),
    style,
    children: [
      {
        _type: 'span',
        _key: randomUUID(),
        text: text,
        marks: [],
      },
    ],
  }
}

async function migratePosts() {
  console.log('🚀 Starting blog migration to Sanity...\n')

  // Check credentials
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID === 'your-project-id') {
    console.error('❌ Error: NEXT_PUBLIC_SANITY_PROJECT_ID not configured in .env.local')
    console.error('Please follow the setup instructions in SANITY_SETUP.md')
    process.exit(1)
  }

  if (!process.env.SANITY_API_TOKEN || process.env.SANITY_API_TOKEN === 'your-write-token-here') {
    console.error('❌ Error: SANITY_API_TOKEN not configured in .env.local')
    console.error('You need a write token from sanity.io/manage')
    process.exit(1)
  }

  // Check if blog directory exists
  if (!fs.existsSync(BLOG_DIR)) {
    console.error(`❌ Error: Blog directory not found at ${BLOG_DIR}`)
    process.exit(1)
  }

  // Read all MDX files
  const files = fs.readdirSync(BLOG_DIR).filter(file => file.endsWith('.mdx'))

  if (files.length === 0) {
    console.log('⚠️  No blog posts found to migrate')
    return
  }

  console.log(`📚 Found ${files.length} blog post(s) to migrate\n`)

  let successCount = 0
  let errorCount = 0

  for (const file of files) {
    try {
      const filePath = path.join(BLOG_DIR, file)
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const { data: frontmatter, content } = matter(fileContent)

      console.log(`📝 Migrating: ${frontmatter.title}`)

      // Convert content to Sanity blocks
      const blocks = mdxToBlocks(content)

      // Create Sanity document
      const doc: any = {
        _type: 'blogPost',
        title: frontmatter.title,
        slug: {
          _type: 'slug',
          current: frontmatter.slug,
        },
        date: frontmatter.date,
        category: frontmatter.category,
        tags: frontmatter.tags || [],
        excerpt: frontmatter.excerpt,
        author: frontmatter.author,
        oldWordPressUrl: frontmatter.oldWordPressUrl,
        content: blocks,
      }

      // Store featuredImage path for later upload
      if (frontmatter.featuredImage) {
        doc.featuredImage = frontmatter.featuredImage
      }

      // Upload to Sanity
      const result = await client.create(doc)
      console.log(`   ✅ Successfully migrated (ID: ${result._id})\n`)
      successCount++

    } catch (error: any) {
      console.error(`   ❌ Failed: ${error.message}\n`)
      errorCount++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log(`✨ Migration complete!`)
  console.log(`   ✅ Success: ${successCount}`)
  if (errorCount > 0) {
    console.log(`   ❌ Errors: ${errorCount}`)
  }
  console.log('='.repeat(50))
  console.log('\n💡 You can now view and edit your posts at:')
  console.log('   http://localhost:3000/studio')
}

// Run migration
migratePosts().catch((error) => {
  console.error('❌ Migration failed:', error)
  process.exit(1)
})
