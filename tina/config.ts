import { defineConfig } from 'tinacms'
import { BLOG_CATEGORIES } from '../lib/types/blog'

// Your hosting provider likely exposes this as an environment variable
const branch = process.env.NEXT_PUBLIC_TINA_BRANCH || 'main'

export default defineConfig({
  branch,

  // Get this from tina.io (free account)
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  // Get this from tina.io (free account)
  token: process.env.TINA_TOKEN,

  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: 'images/blog',
      publicFolder: 'public',
    },
  },
  // See docs on content modeling for more info on how to setup new content models: https://tina.io/docs/schema/
  schema: {
    collections: [
      {
        name: 'blog',
        label: 'Blog Posts',
        path: 'content/blog',
        format: 'mdx',
        ui: {
          // Default item configuration removed due to TinaCMS version compatibility
        },
        fields: [
          {
            type: 'string',
            name: 'title',
            label: 'Title (כותרת)',
            isTitle: true,
            required: true,
            description: 'The title of the blog post in Hebrew',
          },
          {
            type: 'string',
            name: 'slug',
            label: 'Slug (English URL)',
            required: true,
            description: 'URL-friendly English slug (e.g., "divorce-guide-2024")',
          },
          {
            type: 'datetime',
            name: 'date',
            label: 'Publication Date',
            required: true,
            ui: {
              dateFormat: 'YYYY-MM-DD',
            },
          },
          {
            type: 'string',
            name: 'category',
            label: 'Category (קטגוריה)',
            required: true,
            options: [...BLOG_CATEGORIES],
          },
          {
            type: 'string',
            name: 'tags',
            label: 'Tags (תגיות)',
            list: true,
            description: 'Optional tags for the post',
          },
          {
            type: 'string',
            name: 'excerpt',
            label: 'Excerpt (תקציר)',
            required: true,
            ui: {
              component: 'textarea',
            },
            description: 'Short summary of the post (2-3 sentences)',
          },
          {
            type: 'image',
            name: 'featuredImage',
            label: 'Featured Image (תמונה ראשית)',
            description: 'Main image for the post',
          },
          {
            type: 'string',
            name: 'author',
            label: 'Author (מחבר)',
            required: true,
          },
          {
            type: 'string',
            name: 'oldWordPressUrl',
            label: 'Old WordPress URL (optional)',
            description: 'Original WordPress URL for redirect mapping',
          },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Content (תוכן)',
            isBody: true,
            description: 'Main content of the blog post',
          },
        ],
      },
    ],
  },
})
