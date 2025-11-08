'use client'

import { useState, useMemo, useRef, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import { Search } from 'lucide-react'
import { getCategorySlug } from '@/lib/types/blog'
import { CARD_STYLES, TYPOGRAPHY } from '@/lib/constants/styles'
import { animations } from '@/lib/utils/animations'
import { ProgressiveImage } from '@/components/ui/progressive-image'
import { generatePlaceholderDataURL } from '@/lib/utils/image-placeholders'
import { LoadingSpinner } from '@/components/blog/loading-spinner'
import { getPaginatedPosts, getAllPostsForSearch, type BlogPostPreview } from '@/lib/sanity/actions'

// Convert English reading time to Hebrew
function toHebrewReadingTime(readingTime: string): string {
  // Extract number from "X min read" format
  const match = readingTime.match(/(\d+)/)
  if (!match) return readingTime

  const minutes = parseInt(match[1])
  return `${minutes} דקות קריאה`
}

interface BlogListingProps {
  initialPosts: BlogPostPreview[]
  initialHasMore: boolean
  initialCursor: number
  categories: Array<{ category: string; count: number }>
}

export function BlogListing({
  initialPosts,
  initialHasMore,
  initialCursor,
  categories
}: BlogListingProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [cursor, setCursor] = useState(initialCursor)
  const [searchQuery, setSearchQuery] = useState('')
  const [isPending, startTransition] = useTransition()
  const [allPostsLoaded, setAllPostsLoaded] = useState(false)
  const [allPosts, setAllPosts] = useState<BlogPostPreview[]>([])

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  // Load all posts when search becomes active
  useEffect(() => {
    if (searchQuery.trim() && !allPostsLoaded) {
      startTransition(async () => {
        const all = await getAllPostsForSearch()
        setAllPosts(all)
        setAllPostsLoaded(true)
      })
    }
  }, [searchQuery, allPostsLoaded])

  // Filter posts based on search query
  const filteredPosts = useMemo(() => {
    const postsToFilter = searchQuery.trim() ? allPosts : posts

    if (!searchQuery.trim()) {
      return postsToFilter
    }

    const query = searchQuery.toLowerCase()
    return postsToFilter.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query)
    )
  }, [posts, allPosts, searchQuery])

  // Load more posts
  const loadMorePosts = async () => {
    if (!hasMore || isPending || searchQuery.trim()) return

    startTransition(async () => {
      const { posts: newPosts, hasMore: moreAvailable, nextCursor } =
        await getPaginatedPosts(cursor)

      setPosts((prev) => [...prev, ...newPosts])
      setHasMore(moreAvailable)
      setCursor(nextCursor)
    })
  }

  // Setup Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || searchQuery.trim()) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isPending) {
          loadMorePosts()
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, cursor, isPending, searchQuery])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar */}
      <aside className="lg:col-span-1">
        {/* Search */}
        <div style={{ ...CARD_STYLES.container, marginBottom: '24px' }}>
          <h2 style={{ ...TYPOGRAPHY.h3, fontSize: '20px' }}>חיפוש</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="חפש מאמר..."
              className="w-full px-4 py-2 pr-10 border border-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              id="blog-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark w-5 h-5" />
          </div>
          {searchQuery && (
            <p style={{ ...TYPOGRAPHY.bodyLarge, fontSize: '14px', marginTop: '8px' }}>
              נמצאו {filteredPosts.length} תוצאות
            </p>
          )}
        </div>

        {/* Categories */}
        <div style={CARD_STYLES.container}>
          <h2 style={{ ...TYPOGRAPHY.h3, fontSize: '20px' }}>קטגוריות</h2>
          <ul className="space-y-2">
            <li>
              <Link
                href="/blog"
                className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-neutral-light transition-colors"
              >
                <span className="text-body">הכל</span>
                <span className="text-body-small text-neutral-dark bg-neutral-light px-2 py-1 rounded">
                  {categories.reduce((sum, cat) => sum + cat.count, 0)}
                </span>
              </Link>
            </li>
            {categories.map(({ category, count }) => (
              <li key={category}>
                <Link
                  href={`/blog/category/${getCategorySlug(category as any)}`}
                  className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-neutral-light transition-colors"
                >
                  <span className="text-body">{category}</span>
                  <span className="text-body-small text-neutral-dark bg-neutral-light px-2 py-1 rounded">
                    {count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:col-span-3">
        {filteredPosts.length === 0 ? (
          <div style={{ ...CARD_STYLES.container, padding: '48px', textAlign: 'center' as const }}>
            <p style={{ ...TYPOGRAPHY.bodyLarge, fontSize: '18px' }}>
              {searchQuery
                ? 'לא נמצאו מאמרים התואמים את החיפוש'
                : 'טרם פורסמו מאמרים. חזרו בקרוב!'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-primary hover:text-primary-dark font-medium transition-colors"
              >
                נקה חיפוש
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPosts.map((post) => (
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
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
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
        )}

        {/* Infinite scroll trigger and loading indicator */}
        {hasMore && !searchQuery.trim() && (
          <div ref={loadMoreRef} className="py-8 text-center">
            {isPending && <LoadingSpinner />}
          </div>
        )}
      </main>
    </div>
  )
}
