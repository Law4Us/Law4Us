import { defineType, defineField } from 'sanity'

export const blogPost = defineType({
  name: 'blogPost',
  title: 'Blog Posts (פוסטים)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title (כותרת)',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'The title of the blog post in Hebrew',
    }),
    defineField({
      name: 'slug',
      title: 'Slug (English URL)',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
      description: 'URL-friendly English slug (e.g., "divorce-guide-2024")',
    }),
    defineField({
      name: 'date',
      title: 'Publication Date (תאריך פרסום)',
      type: 'date',
      options: {
        dateFormat: 'YYYY-MM-DD',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category (קטגוריה)',
      type: 'string',
      options: {
        list: [
          { title: 'כללי (General)', value: 'כללי' },
          { title: 'ירושה (Inheritance)', value: 'ירושה' },
          { title: 'גירושין (Divorce)', value: 'גירושין' },
          { title: 'משמורת (Custody)', value: 'משמורת' },
          { title: 'ידועים בציבור (Common-law)', value: 'ידועים בציבור' },
          { title: 'אפוטרופסות (Guardianship)', value: 'אפוטרופסות' },
          { title: 'אבהות-אימוץ (Paternity/Adoption)', value: 'אבהות-אימוץ' },
          { title: 'הסכמים (Agreements)', value: 'הסכמים' },
          { title: 'מזונות (Alimony)', value: 'מזונות' },
          { title: 'צו הרחקה (Restraining Orders)', value: 'צו הרחקה' },
        ],
        layout: 'dropdown',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags (תגיות)',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
      description: 'Optional tags for the post',
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt (תקציר)',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required().min(50).max(300),
      description: 'Short summary of the post (2-3 sentences, 50-300 characters)',
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image (תמונה ראשית)',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text (טקסט חלופי)',
          description: 'Important for SEO and accessibility',
        },
      ],
      description: 'Main image for the post',
    }),
    defineField({
      name: 'author',
      title: 'Author (מחבר)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'oldWordPressUrl',
      title: 'Old WordPress URL (optional)',
      type: 'url',
      description: 'Original WordPress URL for redirect mapping',
    }),
    defineField({
      name: 'content',
      title: 'Content (תוכן)',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H1', value: 'h1' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
            { title: 'Quote', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              { title: 'Code', value: 'code' },
              { title: 'Underline', value: 'underline' },
              { title: 'Strike', value: 'strike-through' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                    validation: (Rule) =>
                      Rule.uri({
                        allowRelative: true,
                        scheme: ['http', 'https', 'mailto', 'tel'],
                      }),
                  },
                  {
                    name: 'blank',
                    type: 'boolean',
                    title: 'Open in new tab',
                    initialValue: false,
                  },
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
          ],
        },
      ],
      validation: (Rule) => Rule.required(),
      description: 'Main content of the blog post',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
      media: 'featuredImage',
      date: 'date',
    },
    prepare({ title, subtitle, media, date }) {
      return {
        title,
        subtitle: `${subtitle} • ${date}`,
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Publication Date, New',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' }],
    },
    {
      title: 'Publication Date, Old',
      name: 'dateAsc',
      by: [{ field: 'date', direction: 'asc' }],
    },
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
  ],
})
