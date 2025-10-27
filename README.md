# Law4Us - Online Divorce Services Platform

A modern, accessible, and user-friendly platform for filing divorce and family law claims online in Israel.

## 📊 Development Progress

- ✅ **PROMPT 1**: Foundation - Setup, Design System & Core UI
- ✅ **PROMPT 2**: Static Website - All Marketing Pages
- ✅ **PROMPT 3**: Wizard Core - Form System, Layout & Steps 1-2
- ✅ **PROMPT 4**: Wizard Advanced - Repeaters, Tables & Steps 3-5
- ✅ **PROMPT 5**: Production Polish - Animations, Performance, Accessibility

**Current Status**: 🎉 **Production Ready!** All 5 prompts complete. Full-featured divorce services platform with wizard, forms, document signing, payment simulation, SEO optimization, error handling, and accessibility compliance.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## 📋 Prerequisites

- Node.js 18+
- npm or yarn

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (RTL-optimized)
- **Forms**: React Hook Form + Zod
- **State**: Zustand with localStorage
- **Animations**: Motion One (lightweight)
- **PDF Generation**: Puppeteer (server-side HTML→PDF)
- **Icons**: Lucide React

## 📁 Project Structure

```
├── app/              # Next.js pages and routes
├── components/       # Reusable React components
│   ├── ui/          # Base UI components
│   ├── wizard/      # Wizard-specific components
│   └── layout/      # Layout components
├── lib/             # Utilities and business logic
│   ├── schemas/     # Zod validation schemas
│   ├── utils/       # Helper functions
│   ├── types/       # TypeScript types
│   └── stores/      # Zustand stores
└── public/          # Static assets
```

## 🎨 Design System

The application uses a carefully crafted design system optimized for Hebrew/RTL:

- **Colors**: Teal primary (#019FB7), neutral grays
- **Typography**: Assistant font (300-800 weights)
- **Spacing**: Consistent 8px grid
- **Components**: Touch-friendly (min 44x44px)
- **Accessibility**: WCAG 2.1 AA compliant

## 🔐 Environment Variables

Create `.env.local` from `.env.local.example`:

```env
NEXT_PUBLIC_MAKE_WEBHOOK_URL=your_make_webhook_url
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

## 🌐 Platform Architecture

This divorce services module is designed to be part of a larger legal services platform:

- **Modular**: Can be integrated with other legal services
- **Shared Components**: Reusable UI components across services
- **Scalable**: Built for future expansion
- **API-Ready**: Structured for backend integration

## 📚 Documentation

See [claude.md](./claude.md) for comprehensive documentation including:
- Architecture details
- Component patterns
- Form system design
- API documentation
- Development guidelines

## 🤝 Contributing

This is a private project. For questions, contact the development team.

## 📄 License

Proprietary - All rights reserved

---

**Version**: 1.0.0
**Last Updated**: October 2024
