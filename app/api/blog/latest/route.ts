import { NextResponse } from 'next/server'
import { getAllPosts } from '@/lib/blog/get-posts'

export async function GET() {
  try {
    const posts = await getAllPosts(3)
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Failed to fetch blog posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}
