# Sanity CMS Setup Guide

## What You Have Now

✅ **Sanity is installed and configured!**

Your blog CMS is now powered by Sanity.io - a professional, marketer-friendly content management system used by companies like Nike, Figma, and more.

## Next Steps to Complete Setup

### 1. Create a Free Sanity Account

1. Go to [https://www.sanity.io/](https://www.sanity.io/)
2. Click "Get Started" or "Sign Up"
3. Sign up with GitHub or Google (easiest)
4. It's completely **FREE** for up to 3 users!

### 2. Create a New Project

1. Once logged in, click **"Create Project"**
2. Project name: `Law4Us Blog` (or whatever you prefer)
3. Dataset: `production`
4. Keep other defaults

### 3. Get Your Credentials

After creating the project, you'll need two things:

#### **Project ID:**
- On your project dashboard at [sanity.io/manage](https://www.sanity.io/manage)
- It looks like: `abc123xyz`

#### **API Token** (for write access):
1. Go to **API** section in your project
2. Click **"Add API Token"**
3. Name it: `Law4Us Write Token`
4. Permissions: **Editor** (allows creating/editing content)
5. Copy the token (you'll only see it once!)

### 4. Update Environment Variables

Open your `.env.local` file and update these values:

```bash
# Replace 'your-project-id' with your actual Project ID
NEXT_PUBLIC_SANITY_PROJECT_ID=abc123xyz

# Replace 'your-write-token-here' with your actual API token
SANITY_API_TOKEN=sk1234567890abcdef
```

The other values are already set correctly:
- `NEXT_PUBLIC_SANITY_DATASET=production` ✓
- `NEXT_PUBLIC_SANITY_API_VERSION=2024-11-07` ✓

### 5. Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 6. Access Your CMS Admin

Once configured, your marketer can access the CMS at:

**Local:** [http://localhost:3000/studio](http://localhost:3000/studio)

**Production:** `https://yourdomain.com/studio`

## For Your Marketer 🎨

The Sanity Studio is super user-friendly:

- **Beautiful visual editor** - WYSIWYG editing
- **Rich text formatting** - Headings, bold, italic, links, images
- **Media library** - Drag & drop images, automatic optimization
- **Live preview** - See changes as you type
- **Draft/Publish workflow** - Save drafts before publishing
- **No coding needed** - Everything is visual and intuitive

## Migrate Existing Blog Posts

To migrate your existing MDX blog posts to Sanity:

```bash
npm run migrate:blog-to-sanity
```

This will:
1. Read all your existing blog posts from `content/blog/`
2. Convert them to Sanity format
3. Upload them to your Sanity project

## Need Help?

- [Sanity Documentation](https://www.sanity.io/docs)
- [Sanity Community Slack](https://slack.sanity.io/)
- Sanity has excellent, fast support!

## What Makes Sanity Great for Marketers

✅ **Intuitive UI** - Non-technical users love it
✅ **Real-time publishing** - Click publish, it's live instantly
✅ **Collaborative** - Multiple people can edit at once
✅ **Media management** - Built-in image optimization & CDN
✅ **Version history** - See and restore previous versions
✅ **Mobile-friendly** - Edit from anywhere
✅ **No git knowledge needed** - Pure visual interface

## Structure

```
/sanity
  /schemas
    blog-post.ts        # Blog post schema definition
    index.ts           # Schema exports
  env.ts               # Environment config
  client.ts            # Sanity client

/app/studio
  [[...tool]]
    page.tsx           # Studio route (yoursite.com/studio)
  layout.tsx           # Studio layout

sanity.config.ts       # Main Sanity configuration
```

---

**Ready to go!** Just add your credentials and you're all set! 🚀
