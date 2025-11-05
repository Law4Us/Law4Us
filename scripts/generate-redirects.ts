import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

async function generateRedirects() {
  console.log('🔄 Generating blog redirects...\n')

  const contentDir = path.join(process.cwd(), 'content', 'blog')
  const files = await fs.readdir(contentDir)
  const mdxFiles = files.filter((file) => file.endsWith('.mdx'))

  const redirects: Array<{ source: string; destination: string }> = []

  for (const filename of mdxFiles) {
    const filePath = path.join(contentDir, filename)
    const fileContent = await fs.readFile(filePath, 'utf8')
    const { data } = matter(fileContent)

    if (data.oldWordPressUrl && data.slug) {
      // Extract path from old WordPress URL
      const url = new URL(data.oldWordPressUrl)
      const source = url.pathname

      redirects.push({
        source,
        destination: `/blog/${data.slug}`,
      })
    }
  }

  console.log(`✅ Generated ${redirects.length} redirects\n`)

  // Generate Next.js config format
  const configCode = `
// Auto-generated blog redirects from WordPress
// Run: npm run generate:redirects to update this list

async redirects() {
  return [
${redirects.map((r) => `    { source: '${r.source}', destination: '${r.destination}', permanent: true },`).join('\n')}
  ]
},
`

  console.log('📝 Copy this code to your next.config.mjs:\n')
  console.log(configCode)

  // Also save to a file for reference
  const outputPath = path.join(process.cwd(), 'redirects-generated.js')
  await fs.writeFile(outputPath, configCode, 'utf8')
  console.log(`\n💾 Saved to: ${outputPath}`)
}

generateRedirects()
