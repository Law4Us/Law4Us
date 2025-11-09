#!/usr/bin/env tsx

/**
 * Delete all blog posts from Sanity
 *
 * This script removes all blog posts so we can re-migrate cleanly
 *
 * Usage:
 *   npx tsx scripts/delete-blog-posts.ts
 */

import { createClient } from '@sanity/client'

// Environment variables are automatically loaded by Node.js from .env.local

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-07',
  token: process.env.SANITY_API_TOKEN || '',
  useCdn: false,
})

async function deleteAllBlogPosts() {
  console.log('🗑️  Starting deletion of all blog posts...\n')

  // Check credentials
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID === 'your-project-id') {
    console.error('❌ Error: NEXT_PUBLIC_SANITY_PROJECT_ID not configured in .env.local')
    process.exit(1)
  }

  if (!process.env.SANITY_API_TOKEN || process.env.SANITY_API_TOKEN === 'your-write-token-here') {
    console.error('❌ Error: SANITY_API_TOKEN not configured in .env.local')
    process.exit(1)
  }

  try {
    // Get all blog posts
    const posts = await client.fetch(`*[_type == "blogPost"] { _id, title }`)

    console.log(`📚 Found ${posts.length} blog posts to delete\n`)

    if (posts.length === 0) {
      console.log('✅ No posts to delete')
      return
    }

    // Delete all posts
    const transaction = client.transaction()
    posts.forEach((post: { _id: string; title: string }) => {
      transaction.delete(post._id)
      console.log(`   🗑️  Queued for deletion: ${post.title}`)
    })

    await transaction.commit()

    console.log('\n' + '='.repeat(50))
    console.log(`✅ Successfully deleted ${posts.length} blog posts`)
    console.log('='.repeat(50))
  } catch (error: any) {
    console.error('❌ Deletion failed:', error.message)
    process.exit(1)
  }
}

// Run deletion
deleteAllBlogPosts().catch((error) => {
  console.error('❌ Script failed:', error)
  process.exit(1)
})
