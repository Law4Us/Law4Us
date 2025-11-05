'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import { Search } from 'lucide-react'
import { BlogPostPreview, getCategorySlug } from '@/lib/types/blog'

interface BlogListingProps {
  posts: BlogPostPreview[]
  categories: Array<{ category: string; count: number }>
}

export function BlogListing({ posts, categories }: BlogListingProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter posts based on search query
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) {
      return posts
    }

    const query = searchQuery.toLowerCase()
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query)
    )
  }, [posts, searchQuery])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar */}
      <aside className="lg:col-span-1">
        {/* Search */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-h3 font-semibold mb-4">חיפוש</h2>
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
            <p className="text-body-small text-neutral-dark mt-2">
              נמצאו {filteredPosts.length} תוצאות
            </p>
          )}
        </div>

        {/* Categories */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-h3 font-semibold mb-4">קטגוריות</h2>
          <ul className="space-y-2">
            <li>
              <Link
                href="/blog"
                className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-neutral-light transition-colors"
              >
                <span className="text-body">הכל</span>
                <span className="text-body-small text-neutral-dark bg-neutral-light px-2 py-1 rounded">
                  {posts.length}
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
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-body-large text-neutral-dark">
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
              <article
                key={post.slug}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {post.featuredImage && (
                  <Link href={`/blog/${post.slug}`}>
                    <div className="relative h-48 w-full">
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </Link>
                )}
                <div className="p-6">
                  {/* Category Badge */}
                  <Link
                    href={`/blog/category/${getCategorySlug(post.category)}`}
                    className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-body-small font-medium mb-3 hover:bg-primary/20 transition-colors"
                  >
                    {post.category}
                  </Link>

                  {/* Title */}
                  <h2 className="text-h3 font-bold mb-2">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="hover:text-primary transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h2>

                  {/* Excerpt */}
                  <p className="text-body text-neutral-dark mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-body-small text-neutral-dark">
                    <div className="flex items-center gap-4">
                      <time dateTime={post.date}>
                        {format(new Date(post.date), 'd MMMM yyyy', {
                          locale: he,
                        })}
                      </time>
                      <span>•</span>
                      <span>{post.readingTime}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
