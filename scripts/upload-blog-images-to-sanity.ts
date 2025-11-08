#!/usr/bin/env tsx

/**
 * Bulk upload blog images to Sanity
 *
 * This script:
 * 1. Reads all blog images from /public/images/blog/
 * 2. Uploads them to Sanity's media library
 * 3. Updates each blog post to reference the Sanity-hosted images
 *
 * Usage:
 *   npm run upload:blog-images
 */

import fs from 'fs'
import path from 'path'
import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-07',
  token: process.env.SANITY_API_TOKEN || '',
  useCdn: false,
})

const IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'blog')

interface BlogPost {
  _id: string
  title: string
  featuredImage?: string | {
    _type: 'image'
    asset: {
      _type: 'reference'
      _ref: string
    }
  }
}

async function uploadImage(imagePath: string, filename: string): Promise<string | null> {
  try {
    const imageBuffer = fs.readFileSync(imagePath)
    const mimeType = filename.endsWith('.png') ? 'image/png' : 'image/jpeg'

    const asset = await client.assets.upload('image', imageBuffer, {
      filename,
      contentType: mimeType,
    })

    console.log(`   ✅ Uploaded: ${filename} (ID: ${asset._id})`)
    return asset._id
  } catch (error: any) {
    console.error(`   ❌ Failed to upload ${filename}:`, error.message)
    return null
  }
}

async function updatePostImage(postId: string, imageAssetId: string): Promise<boolean> {
  try {
    await client
      .patch(postId)
      .set({
        featuredImage: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: imageAssetId,
          },
        },
      })
      .commit()

    return true
  } catch (error: any) {
    console.error(`   ❌ Failed to update post:`, error.message)
    return false
  }
}

async function uploadBlogImages() {
  console.log('🚀 Starting bulk image upload to Sanity...\n')

  // Check credentials
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID === 'your-project-id') {
    console.error('❌ Error: NEXT_PUBLIC_SANITY_PROJECT_ID not configured in .env.local')
    process.exit(1)
  }

  if (!process.env.SANITY_API_TOKEN || process.env.SANITY_API_TOKEN === 'your-write-token-here') {
    console.error('❌ Error: SANITY_API_TOKEN not configured in .env.local')
    process.exit(1)
  }

  // Check if images directory exists
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`❌ Error: Images directory not found at ${IMAGES_DIR}`)
    process.exit(1)
  }

  // Get all blog posts from Sanity
  const posts: BlogPost[] = await client.fetch(
    `*[_type == "blogPost"] {
      _id,
      title,
      featuredImage
    }`
  )

  console.log(`📚 Found ${posts.length} blog posts in Sanity`)

  // Get all image files
  const imageFiles = fs.readdirSync(IMAGES_DIR).filter(file =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
  )

  console.log(`🖼️  Found ${imageFiles.length} images in ${IMAGES_DIR}\n`)

  let uploadedCount = 0
  let updatedCount = 0
  let skippedCount = 0
  let errorCount = 0

  for (const post of posts) {
    // Skip if already has a Sanity asset reference (object)
    if (typeof post.featuredImage === 'object' && post.featuredImage?.asset) {
      console.log(`⏭️  Skipping "${post.title}" - already has Sanity image`)
      skippedCount++
      continue
    }

    // Extract expected image filename from post
    // Assuming format like "post-3097-featured.jpg" or similar
    const expectedFilename = typeof post.featuredImage === 'string'
      ? post.featuredImage.split('/').pop()
      : null

    if (!expectedFilename) {
      console.log(`⏭️  Skipping "${post.title}" - no featuredImage URL`)
      skippedCount++
      continue
    }

    // Find the image file
    const imageFile = imageFiles.find(file => file === expectedFilename)

    if (!imageFile) {
      console.log(`⚠️  Image not found for "${post.title}" (expected: ${expectedFilename})`)
      skippedCount++
      continue
    }

    console.log(`📝 Processing: ${post.title}`)
    console.log(`   Image: ${imageFile}`)

    // Upload image to Sanity
    const imagePath = path.join(IMAGES_DIR, imageFile)
    const assetId = await uploadImage(imagePath, imageFile)

    if (!assetId) {
      errorCount++
      continue
    }

    uploadedCount++

    // Update post with Sanity-hosted image
    const updated = await updatePostImage(post._id, assetId)

    if (updated) {
      console.log(`   ✅ Updated post to use Sanity image\n`)
      updatedCount++
    } else {
      errorCount++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log(`✨ Bulk upload complete!`)
  console.log(`   ✅ Images uploaded: ${uploadedCount}`)
  console.log(`   ✅ Posts updated: ${updatedCount}`)
  if (skippedCount > 0) {
    console.log(`   ⏭️  Skipped: ${skippedCount}`)
  }
  if (errorCount > 0) {
    console.log(`   ❌ Errors: ${errorCount}`)
  }
  console.log('='.repeat(50))
  console.log('\n💡 All images are now hosted on Sanity CDN!')
  console.log('   You can view them at: http://localhost:3000/studio')
}

// Run upload
uploadBlogImages().catch((error) => {
  console.error('❌ Upload failed:', error)
  process.exit(1)
})
