import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import { getPostBySlug, getAllPostSlugs, getRelatedPosts } from '@/lib/sanity/queries'
import { SanityPortableText } from '@/components/sanity/portable-text'
import { getCategorySlug } from '@/lib/types/blog'
import { ArrowRight, Calendar, Clock } from 'lucide-react'

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  const slugs = await getAllPostSlugs()
  return slugs.map((slug) => ({ slug }))
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    return {
      title: 'מאמר לא נמצא | Law4Us',
    }
  }

  return {
    title: `${post.title} | Law4Us בלוג`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      images: post.featuredImage ? [post.featuredImage] : [],
    },
  }
}

// Revalidate every hour (ISR - Incremental Static Regeneration)
export const revalidate = 3600;

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  // Get related posts (same category, exclude current post)
  const relatedPosts = await getRelatedPosts(post.slug, post.category, 3)

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImage ? `https://law4us.co.il${post.featuredImage}` : undefined,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Person',
      name: post.author,
      url: 'https://law4us.co.il/about',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Law4Us',
      url: 'https://law4us.co.il',
      logo: {
        '@type': 'ImageObject',
        url: 'https://law4us.co.il/law4uslogo-blac.svg',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://law4us.co.il/blog/${post.slug}`,
    },
    articleSection: post.category,
    inLanguage: 'he',
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-neutral-lightest">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-neutral">
        <div className="container mx-auto px-4 max-w-4xl py-4">
          <nav className="flex items-center gap-2 text-body-small text-neutral-dark">
            <Link href="/" className="hover:text-primary transition-colors">
              דף הבית
            </Link>
            <ArrowRight className="w-4 h-4 rotate-180" />
            <Link href="/blog" className="hover:text-primary transition-colors">
              בלוג
            </Link>
            <ArrowRight className="w-4 h-4 rotate-180" />
            <Link
              href={`/blog/category/${getCategorySlug(post.category)}`}
              className="hover:text-primary transition-colors"
            >
              {post.category}
            </Link>
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span className="text-neutral-darkest">{post.title}</span>
          </nav>
        </div>
      </div>

      <article className="container mx-auto px-4 max-w-4xl py-12">
        {/* Article Header */}
        <header className="mb-8">
          {/* Category Badge */}
          <Link
            href={`/blog/category/${getCategorySlug(post.category)}`}
            className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-body-small font-semibold mb-4 hover:bg-primary/20 transition-colors"
          >
            {post.category}
          </Link>

          {/* Title */}
          <h1 className="text-display font-bold text-neutral-darkest mb-4">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-6 text-body-small text-neutral-dark mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <time dateTime={post.date}>
                {format(new Date(post.date), 'd MMMM yyyy', { locale: he })}
              </time>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{post.readingTime}</span>
            </div>
            <div>
              <span className="font-medium">מאת:</span> {post.author}
            </div>
          </div>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="relative w-full h-[400px] rounded-lg overflow-hidden mb-8">
              <Image
                src={post.featuredImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Excerpt */}
          <p className="text-body-large text-neutral-dark font-medium leading-relaxed border-r-4 border-primary pr-4 bg-neutral-light/50 py-4">
            {post.excerpt}
          </p>
        </header>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none bg-white rounded-lg p-8 md:p-12 shadow-sm">
          <SanityPortableText value={post.content} />
        </div>

        {/* Author Box */}
        <div className="bg-white rounded-lg p-8 mt-12 border border-neutral">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-h2">
              א
            </div>
            <div>
              <h3 className="text-h3 font-bold text-neutral-darkest mb-1">
                עו"ד אריאל דרור
              </h3>
              <p className="text-body text-neutral-dark">
                עורך דין מומחה בתחום משפט המשפחה, מתמחה בגירושין, משמורת ורכוש משותף
              </p>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-white py-16 mt-12">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-h2 font-bold text-neutral-darkest mb-8">
              מאמרים נוספים בנושא {post.category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <article
                  key={relatedPost.slug}
                  className="bg-neutral-lightest rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {relatedPost.featuredImage && (
                    <Link href={`/blog/${relatedPost.slug}`}>
                      <div className="relative h-40 w-full">
                        <Image
                          src={relatedPost.featuredImage}
                          alt={relatedPost.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </Link>
                  )}
                  <div className="p-6">
                    <h3 className="text-body-large font-bold mb-2">
                      <Link
                        href={`/blog/${relatedPost.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {relatedPost.title}
                      </Link>
                    </h3>
                    <p className="text-body-small text-neutral-dark line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back to Blog */}
      <div className="container mx-auto px-4 max-w-4xl pb-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
          חזרה לבלוג
        </Link>
      </div>
    </div>
    </>
  )
}
