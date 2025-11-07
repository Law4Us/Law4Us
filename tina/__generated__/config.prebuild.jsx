// tina/config.ts
import { defineConfig } from "tinacms";

// lib/types/blog.ts
var BLOG_CATEGORIES = [
  "\u05DB\u05DC\u05DC\u05D9",
  "\u05D9\u05E8\u05D5\u05E9\u05D4",
  "\u05D2\u05D9\u05E8\u05D5\u05E9\u05D9\u05DF",
  "\u05DE\u05E9\u05DE\u05D5\u05E8\u05EA",
  "\u05D9\u05D3\u05D5\u05E2\u05D9\u05DD \u05D1\u05E6\u05D9\u05D1\u05D5\u05E8",
  "\u05D0\u05E4\u05D5\u05D8\u05E8\u05D5\u05E4\u05E1\u05D5\u05EA",
  "\u05D0\u05D1\u05D4\u05D5\u05EA-\u05D0\u05D9\u05DE\u05D5\u05E5",
  "\u05D4\u05E1\u05DB\u05DE\u05D9\u05DD",
  "\u05DE\u05D6\u05D5\u05E0\u05D5\u05EA",
  "\u05E6\u05D5 \u05D4\u05E8\u05D7\u05E7\u05D4"
];

// tina/config.ts
var branch = process.env.NEXT_PUBLIC_TINA_BRANCH || "main";
var isLocal = process.env.TINA_PUBLIC_IS_LOCAL === "true";
var config_default = defineConfig({
  branch,
  // Only use cloud config if not in local mode
  ...isLocal ? {} : {
    clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
    token: process.env.TINA_TOKEN
  },
  build: {
    outputFolder: "admin",
    publicFolder: "public"
  },
  media: {
    tina: {
      mediaRoot: "images/blog",
      publicFolder: "public"
    }
  },
  // See docs on content modeling for more info on how to setup new content models: https://tina.io/docs/schema/
  schema: {
    collections: [
      {
        name: "blog",
        label: "Blog Posts",
        path: "content/blog",
        format: "mdx",
        ui: {
          // Default item configuration removed due to TinaCMS version compatibility
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title (\u05DB\u05D5\u05EA\u05E8\u05EA)",
            isTitle: true,
            required: true,
            description: "The title of the blog post in Hebrew"
          },
          {
            type: "string",
            name: "slug",
            label: "Slug (English URL)",
            required: true,
            description: 'URL-friendly English slug (e.g., "divorce-guide-2024")'
          },
          {
            type: "datetime",
            name: "date",
            label: "Publication Date",
            required: true,
            ui: {
              dateFormat: "YYYY-MM-DD"
            }
          },
          {
            type: "string",
            name: "category",
            label: "Category (\u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D4)",
            required: true,
            options: [...BLOG_CATEGORIES]
          },
          {
            type: "string",
            name: "tags",
            label: "Tags (\u05EA\u05D2\u05D9\u05D5\u05EA)",
            list: true,
            description: "Optional tags for the post"
          },
          {
            type: "string",
            name: "excerpt",
            label: "Excerpt (\u05EA\u05E7\u05E6\u05D9\u05E8)",
            required: true,
            ui: {
              component: "textarea"
            },
            description: "Short summary of the post (2-3 sentences)"
          },
          {
            type: "image",
            name: "featuredImage",
            label: "Featured Image (\u05EA\u05DE\u05D5\u05E0\u05D4 \u05E8\u05D0\u05E9\u05D9\u05EA)",
            description: "Main image for the post"
          },
          {
            type: "string",
            name: "author",
            label: "Author (\u05DE\u05D7\u05D1\u05E8)",
            required: true
          },
          {
            type: "string",
            name: "oldWordPressUrl",
            label: "Old WordPress URL (optional)",
            description: "Original WordPress URL for redirect mapping"
          },
          {
            type: "rich-text",
            name: "body",
            label: "Content (\u05EA\u05D5\u05DB\u05DF)",
            isBody: true,
            description: "Main content of the blog post"
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
