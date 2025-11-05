import type { MDXComponents } from 'mdx/types'
import Image, { ImageProps } from 'next/image'
import Link from 'next/link'

// Custom components for MDX rendering with RTL support and Tailwind styling
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Headings with proper RTL alignment and spacing
    h1: ({ children }) => (
      <h1 className="text-h1 font-bold mb-6 mt-8 text-neutral-darkest">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-h2 font-bold mb-4 mt-6 text-neutral-darkest">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-h3 font-semibold mb-3 mt-5 text-neutral-darkest">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-body-large font-semibold mb-2 mt-4 text-neutral-darkest">
        {children}
      </h4>
    ),

    // Paragraphs with proper line height for Hebrew text
    p: ({ children }) => (
      <p className="text-body mb-4 leading-relaxed text-neutral-dark">
        {children}
      </p>
    ),

    // Lists with RTL-aware styling
    ul: ({ children }) => (
      <ul className="list-disc list-inside mb-4 mr-6 space-y-2 text-neutral-dark">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside mb-4 mr-6 space-y-2 text-neutral-dark">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="text-body leading-relaxed">
        {children}
      </li>
    ),

    // Links with primary color and hover effect
    a: ({ href, children }) => (
      <Link
        href={href || '#'}
        className="text-primary hover:text-primary-dark underline font-medium transition-colors"
      >
        {children}
      </Link>
    ),

    // Blockquotes with RTL border on the right
    blockquote: ({ children }) => (
      <blockquote className="border-r-4 border-primary pr-4 mr-4 mb-4 italic text-neutral-dark bg-neutral-light py-2">
        {children}
      </blockquote>
    ),

    // Code blocks with monospace font
    code: ({ children }) => (
      <code className="bg-neutral-light px-2 py-1 rounded text-sm font-mono text-neutral-darkest">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="bg-neutral-darkest text-neutral-lightest p-4 rounded-lg mb-4 overflow-x-auto">
        {children}
      </pre>
    ),

    // Tables with responsive styling
    table: ({ children }) => (
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full border-collapse border border-neutral">
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border border-neutral bg-neutral-light px-4 py-2 text-right font-semibold">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-neutral px-4 py-2 text-right">
        {children}
      </td>
    ),

    // Images with Next.js Image optimization
    img: (props) => (
      <Image
        {...(props as ImageProps)}
        alt={props.alt || ''}
        width={props.width ? Number(props.width) : 800}
        height={props.height ? Number(props.height) : 400}
        className="rounded-lg mb-4 w-full h-auto"
      />
    ),

    // Horizontal rule
    hr: () => (
      <hr className="border-t border-neutral my-8" />
    ),

    // Strong/bold text
    strong: ({ children }) => (
      <strong className="font-bold text-neutral-darkest">
        {children}
      </strong>
    ),

    // Emphasized text
    em: ({ children }) => (
      <em className="italic">
        {children}
      </em>
    ),

    ...components,
  }
}
