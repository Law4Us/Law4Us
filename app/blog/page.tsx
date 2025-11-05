import { Metadata } from 'next'
import { getAllPosts, getCategories } from '@/lib/blog'
import { BlogListing } from '@/components/blog/blog-listing'

export const metadata: Metadata = {
  title: 'בלוג | Law4Us - מאמרים בנושאי משפחה',
  description: 'מאמרים מקצועיים בנושאי משפט משפחה: גירושין, משמורת, מזונות, רכוש משותף ועוד. מאת עו"ד אריאל דרור',
  openGraph: {
    title: 'בלוג Law4Us - מאמרים בנושאי משפט משפחה',
    description: 'מאמרים מקצועיים בנושאי משפט משפחה: גירושין, משמורת, מזונות, רכוש משותף ועוד',
    type: 'website',
  },
}

export default async function BlogPage() {
  const posts = await getAllPosts()
  const categories = await getCategories()

  // JSON-LD structured data for blog listing page
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'בלוג Law4Us - מאמרים בנושאי משפט משפחה',
    description: 'מאמרים מקצועיים בנושאי משפט משפחה: גירושין, משמורת, מזונות, רכוש משותף ועוד',
    url: 'https://law4us.co.il/blog',
    publisher: {
      '@type': 'Organization',
      name: 'Law4Us',
      url: 'https://law4us.co.il',
      logo: {
        '@type': 'ImageObject',
        url: 'https://law4us.co.il/law4uslogo-blac.svg',
      },
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
      {/* Hero Section */}
      <div className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-display font-bold mb-4">בלוג Law4Us</h1>
          <p className="text-body-large text-white/90 max-w-2xl">
            מאמרים מקצועיים, עדכונים משפטיים וטיפים שימושיים בנושאי משפט משפחה מאת עו"ד אריאל דרור
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl py-12">
        <BlogListing posts={posts} categories={categories} />
      </div>
    </div>
    </>
  )
}
