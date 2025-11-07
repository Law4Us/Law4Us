'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import { BlogPostPreview } from '@/lib/types/blog'
import { TYPOGRAPHY, CARD_STYLES } from '@/lib/constants/styles'
import { animations } from '@/lib/utils/animations'
import { BlogSectionSkeleton } from '@/components/skeletons/BlogPostSkeleton'
import { ProgressiveImage } from '@/components/ui/progressive-image'
import { generatePlaceholderDataURL } from '@/lib/utils/image-placeholders'

// Convert English reading time to Hebrew
function toHebrewReadingTime(readingTime: string): string {
  // Extract number from "X min read" format
  const match = readingTime.match(/(\d+)/)
  if (!match) return readingTime

  const minutes = parseInt(match[1])
  return `${minutes} דקות קריאה`
}

export function HomeBlogSection() {
  const [posts, setPosts] = useState<BlogPostPreview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPosts() {
      try {
        const response = await fetch('/api/blog/latest')
        if (!response.ok) {
          throw new Error('Failed to fetch posts')
        }
        const latestPosts = await response.json()
        setPosts(latestPosts)
      } catch (error) {
        console.error('Failed to load blog posts:', error)
      } finally {
        setLoading(false)
      }
    }
    loadPosts()
  }, [])

  if (loading) {
    return <BlogSectionSkeleton />
  }

  if (posts.length === 0) {
    return null // Don't show section if no posts
  }

  return (
    <section className="bg-[#EEF2F3] py-20" id="blog">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-12">
          {/* Eyebrow */}
          <p
            className="mb-6"
            style={{
              color: '#019FB7',
              fontSize: '16px',
              fontWeight: 600,
              lineHeight: '100%',
              letterSpacing: '-0.02em',
            }}
          >
            הבלוג שלנו
          </p>
          {/* H2 */}
          <h2 style={TYPOGRAPHY.h2}>
            הבלוג שלנו – ידע מקצועי, תובנות, וטיפים מעשיים
          </h2>
          {/* Subheader */}
          <p style={TYPOGRAPHY.subtitle}>
            התעדכנו במאמרים, מדריכים וטיפים שיעשו לכם סדר בנושאים משפטיים ודיגיטליים – בשפה פשוטה, בגובה העיניים, עם ערך אמיתי מהשטח.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className={`block overflow-hidden group ${animations.cardHover}`}
              style={{
                ...CARD_STYLES.container,
                padding: 0,
              }}
            >
              {/* Featured Image */}
              {post.featuredImage ? (
                <div className="relative w-full aspect-video overflow-hidden">
                  <ProgressiveImage
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                    placeholderSrc={generatePlaceholderDataURL(20, 12, '#C7CFD1')}
                    blurAmount={20}
                    transitionDuration={400}
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />
                </div>
              ) : (
                <div className="relative aspect-video bg-gradient-to-br from-gray-400 to-gray-500 overflow-hidden w-full">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-sm mb-2">עו"ד אריאל דרור</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pb-6 px-6 text-right">
                {/* Category Badge */}
                <div className={`inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-3 ${animations.badgeHover}`}>
                  {post.category}
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                  <span>{toHebrewReadingTime(post.readingTime)}</span>
                  <span>•</span>
                  <span>
                    {format(new Date(post.date), 'd בMMMM yyyy', {
                      locale: he,
                    })}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-xl mb-3 line-clamp-2">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-600 text-sm line-clamp-2">
                  {post.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Read More Button */}
        <div className="text-center mt-8">
          <Link
            href="/blog"
            className={`inline-flex items-center justify-center ${animations.secondaryCTAHover}`}
            style={{
              backgroundColor: '#EEF2F3',
              border: '0.5px solid #018DA2',
              borderRadius: '6px',
              color: '#0C1719',
              paddingLeft: '32px',
              paddingRight: '32px',
              paddingTop: '16px',
              paddingBottom: '16px',
              fontSize: '18px',
              fontWeight: 600,
              lineHeight: '120%',
              letterSpacing: '0',
              boxShadow: '0 0 0 4px rgba(1, 159, 183, 0.2)'
            }}
          >
            קראו עוד
          </Link>
        </div>
      </div>
    </section>
  )
}
