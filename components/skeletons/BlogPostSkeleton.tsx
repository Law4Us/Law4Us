import { CARD_STYLES } from '@/lib/constants/styles';

/**
 * BlogPostSkeleton Component
 * Animated skeleton loader for blog post cards
 * Shows while blog posts are loading from API
 */
export function BlogPostSkeleton() {
  return (
    <div
      className="block overflow-hidden animate-pulse"
      style={{
        ...CARD_STYLES.container,
        padding: 0,
      }}
    >
      {/* Featured Image Skeleton */}
      <div className="relative aspect-video bg-neutral-300 w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-300 via-neutral-200 to-neutral-300 animate-shimmer" />
      </div>

      <div className="pb-6 px-6 text-right">
        {/* Category Badge Skeleton */}
        <div className="inline-block bg-neutral-300 rounded-full h-6 w-20 mb-3" />

        {/* Meta Skeleton */}
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-neutral-300 h-4 w-24 rounded" />
          <span className="text-neutral-400">•</span>
          <div className="bg-neutral-300 h-4 w-32 rounded" />
        </div>

        {/* Title Skeleton */}
        <div className="space-y-2 mb-3">
          <div className="bg-neutral-300 h-6 w-full rounded" />
          <div className="bg-neutral-300 h-6 w-3/4 rounded" />
        </div>

        {/* Excerpt Skeleton */}
        <div className="space-y-2">
          <div className="bg-neutral-300 h-4 w-full rounded" />
          <div className="bg-neutral-300 h-4 w-5/6 rounded" />
        </div>
      </div>
    </div>
  );
}

/**
 * BlogSectionSkeleton Component
 * Shows 3 blog post skeletons in a grid
 */
export function BlogSectionSkeleton() {
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
          <h2 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            lineHeight: '110%',
            letterSpacing: '-0.04em',
            color: '#0C1719',
          }}>
            הבלוג שלנו – ידע מקצועי, תובנות, וטיפים מעשיים
          </h2>
          {/* Subheader */}
          <p style={{
            fontSize: '20px',
            fontWeight: 500,
            lineHeight: '140%',
            letterSpacing: '-0.02em',
            color: '#515F61',
            marginTop: '12px',
          }}>
            התעדכנו במאמרים, מדריכים וטיפים שיעשו לכם סדר בנושאים משפטיים ודיגיטליים – בשפה פשוטה, בגובה העיניים, עם ערך אמיתי מהשטח.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BlogPostSkeleton />
          <BlogPostSkeleton />
          <BlogPostSkeleton />
        </div>
      </div>
    </section>
  );
}
