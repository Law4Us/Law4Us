import { NextResponse } from 'next/server'
import { client } from '@/sanity/client'
import { groq } from 'next-sanity'

export async function GET() {
  try {
    const query = groq`*[_type == "blogPost"] | order(date desc) [0...3] {
      title,
      "slug": slug.current,
      date,
      category,
      excerpt,
      "featuredImage": featuredImage.asset->url,
      author
    }`

    const posts = await client.fetch(query)

    // Add reading time
    const postsWithReadingTime = posts.map((post: any) => ({
      ...post,
      readingTime: calculateReadingTime(post.excerpt),
    }))

    return NextResponse.json(postsWithReadingTime)
  } catch (error) {
    console.error('Failed to fetch blog posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

function calculateReadingTime(text: string): string {
  const wordsPerMinute = 200
  const wordCount = text.split(/\s+/).length
  const minutes = Math.ceil(wordCount / wordsPerMinute)
  return `${minutes} דקות קריאה`
}
