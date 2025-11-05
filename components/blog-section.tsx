import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import { getAllPosts } from '@/lib/blog'
import { ArrowLeft } from 'lucide-react'

export async function BlogSection() {
  const posts = await getAllPosts(3) // Get latest 3 posts

  if (posts.length === 0) {
    return null // Don't show section if no posts
  }

  return (
    <section className="bg-[#EEF2F3] py-20">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">מאמרים אחרונים</h2>
          <p className="text-lg text-gray-600">
            עדכונים, טיפים ומידע משפטי שימושי מעולם משפט המשפחה
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
            >
              {post.featuredImage ? (
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                  <div className="text-primary text-center">
                    <div className="text-sm">עו"ד אריאל דרור</div>
                  </div>
                </div>
              )}
              <div className="p-6 text-right">
                {/* Category Badge */}
                <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-3">
                  {post.category}
                </div>

                {/* Title */}
                <h3 className="font-bold text-xl mb-3 line-clamp-2">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {post.excerpt}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span>{post.readingTime}</span>
                  <span>•</span>
                  <time dateTime={post.date}>
                    {format(new Date(post.date), 'd MMMM yyyy', { locale: he })}
                  </time>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Read More Button */}
        <div className="text-center mt-8">
          <Link
            href="/blog"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-primary text-primary text-lg font-medium rounded-lg hover:bg-primary hover:text-white transition-colors"
          >
            לכל המאמרים
            <ArrowLeft className="w-5 h-5 rotate-180" />
          </Link>
        </div>
      </div>
    </section>
  )
}
