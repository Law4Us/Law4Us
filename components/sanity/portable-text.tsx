import { PortableText, PortableTextComponents } from '@portabletext/react'
import Image from 'next/image'
import Link from 'next/link'

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null
      return (
        <div className="relative w-full h-[400px] my-8 rounded-lg overflow-hidden">
          <Image
            src={value.asset.url}
            alt={value.alt || ''}
            fill
            className="object-cover"
          />
          {value.caption && (
            <p className="text-center text-sm text-neutral-dark mt-2">
              {value.caption}
            </p>
          )}
        </div>
      )
    },
  },
  block: {
    h1: ({ children }) => (
      <h1 className="text-4xl font-bold mt-8 mb-4 text-neutral-darkest">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-3xl font-bold mt-6 mb-3 text-neutral-darkest">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-2xl font-bold mt-5 mb-2 text-neutral-darkest">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-xl font-bold mt-4 mb-2 text-neutral-darkest">
        {children}
      </h4>
    ),
    normal: ({ children }) => (
      <p className="mb-4 leading-relaxed text-neutral-dark">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-r-4 border-primary pr-4 my-6 bg-neutral-light/50 py-4 text-neutral-dark italic">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-bold text-neutral-darkest">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => (
      <code className="bg-neutral-light px-1 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    ),
    link: ({ children, value }) => {
      const target = value?.blank ? '_blank' : undefined
      const rel = value?.blank ? 'noopener noreferrer' : undefined
      return (
        <Link
          href={value?.href || '#'}
          target={target}
          rel={rel}
          className="text-primary hover:text-primary-dark underline transition-colors"
        >
          {children}
        </Link>
      )
    },
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-inside mb-4 space-y-2 text-neutral-dark">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-inside mb-4 space-y-2 text-neutral-dark">
        {children}
      </ol>
    ),
  },
}

export function SanityPortableText({ value }: { value: any }) {
  return <PortableText value={value} components={components} />
}
