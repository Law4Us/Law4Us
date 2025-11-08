import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import { getPostsByCategory } from '@/lib/sanity/queries'
import { CATEGORY_SLUGS, getCategoryFromSlug, getCategorySlug } from '@/lib/types/blog'
import { ArrowRight } from 'lucide-react'

interface CategoryPageProps {
  params: Promise<{
    category: string
  }>
}

// Generate static params for all categories
export async function generateStaticParams() {
  return Object.values(CATEGORY_SLUGS).map((slug) => ({ category: slug }))
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params

  if (!resolvedParams || !resolvedParams.category) {
    return {
      title: 'קטגוריה לא נמצאה | Law4Us',
    }
  }

  const hebrewCategory = getCategoryFromSlug(resolvedParams.category)

  if (!hebrewCategory) {
    return {
      title: 'קטגוריה לא נמצאה | Law4Us',
    }
  }

  return {
    title: `${hebrewCategory} | Law4Us בלוג`,
    description: `מאמרים בנושא ${hebrewCategory} - מידע מקצועי ועדכונים משפטיים מאת עו"ד אריאל דרור`,
    openGraph: {
      title: `${hebrewCategory} | Law4Us בלוג`,
      description: `מאמרים בנושא ${hebrewCategory}`,
      type: 'website',
    },
  }
}

// Revalidate every hour (ISR - Incremental Static Regeneration)
export const revalidate = 3600;

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params

  if (!resolvedParams || !resolvedParams.category) {
    notFound()
  }

  const hebrewCategory = getCategoryFromSlug(resolvedParams.category)

  if (!hebrewCategory) {
    notFound()
  }

  const posts = await getPostsByCategory(hebrewCategory)

  // JSON-LD structured data for category page
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${hebrewCategory} | Law4Us בלוג`,
    description: `מאמרים בנושא ${hebrewCategory} - מידע מקצועי ועדכונים משפטיים`,
    url: `https://law4us.co.il/blog/category/${resolvedParams.category}`,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'דף הבית',
          item: 'https://law4us.co.il',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'בלוג',
          item: 'https://law4us.co.il/blog',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: hebrewCategory,
          item: `https://law4us.co.il/blog/category/${resolvedParams.category}`,
        },
      ],
    },
    publisher: {
      '@type': 'Organization',
      name: 'Law4Us',
      url: 'https://law4us.co.il',
    },
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
        <div className="container mx-auto px-4 max-w-6xl py-4">
          <nav className="flex items-center gap-2 text-body-small text-neutral-dark">
            <Link href="/" className="hover:text-primary transition-colors">
              דף הבית
            </Link>
            <ArrowRight className="w-4 h-4 rotate-180" />
            <Link href="/blog" className="hover:text-primary transition-colors">
              בלוג
            </Link>
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span className="text-neutral-darkest">{hebrewCategory}</span>
          </nav>
        </div>
      </div>

      {/* Category Header */}
      <div className="bg-primary text-white py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-display font-bold mb-2">{hebrewCategory}</h1>
          <p className="text-body-large text-white/90">
            {posts.length} {posts.length === 1 ? 'מאמר' : 'מאמרים'} בקטגוריה זו
          </p>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="container mx-auto px-4 max-w-6xl py-12">
        {posts.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-body-large text-neutral-dark">
              טרם פורסמו מאמרים בקטגוריה זו. חזרו בקרוב!
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 mt-6 text-primary hover:text-primary-dark font-medium transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
              חזרה לכל המאמרים
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
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
                    <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-body-small font-medium mb-3">
                      {post.category}
                    </div>

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
                          {format(new Date(post.date), 'd MMMM yyyy', { locale: he })}
                        </time>
                        <span>•</span>
                        <span>{post.readingTime}</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Back to All Posts */}
            <div className="mt-12 text-center">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
                חזרה לכל המאמרים
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
    </>
  )
}
