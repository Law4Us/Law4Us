import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        primary: {
          DEFAULT: "#019FB7",
          dark: "#018DA2",
          light: "#B8D7DD",
        },
        // Neutral colors
        neutral: {
          darkest: "#0C1719",
          dark: "#515F61",
          DEFAULT: "#E3E6E8",
          light: "#EEF2F3",
          lightest: "#F9FAFB",
        },
      },
      fontFamily: {
        sans: ["var(--font-assistant)", "Arial", "sans-serif"],
      },
      fontSize: {
        // Typography scale for Hebrew text
        "display-large": ["48px", { lineHeight: "1.1em", letterSpacing: "-0.02em" }],
        "display": ["40px", { lineHeight: "1.1em", letterSpacing: "-0.02em" }],
        "h1": ["32px", { lineHeight: "1.1em", letterSpacing: "-0.02em" }],
        "h2": ["24px", { lineHeight: "1.1em", letterSpacing: "-0.02em" }],
        "h3": ["20px", { lineHeight: "1.1em", letterSpacing: "-0.02em" }],
        "body-large": ["18px", { lineHeight: "1.2em", letterSpacing: "-0.02em" }],
        "body": ["16px", { lineHeight: "1.2em", letterSpacing: "-0.02em" }],
        "body-small": ["14px", { lineHeight: "1.2em", letterSpacing: "-0.02em" }],
        "caption": ["12px", { lineHeight: "1.2em", letterSpacing: "-0.01em" }],

        // Design System Typography
        "hero-h1": ["80px", { lineHeight: "100%", letterSpacing: "-0.04em", fontWeight: "700" }],
        "hero-subtitle": ["24px", { lineHeight: "130%", letterSpacing: "-0.04em", fontWeight: "500" }],
        "eyebrow": ["16px", { lineHeight: "100%", letterSpacing: "-0.02em", fontWeight: "600" }],
        "cta-main": ["18px", { lineHeight: "120%", letterSpacing: "0", fontWeight: "600" }],
        "cta-secondary": ["18px", { lineHeight: "120%", letterSpacing: "0", fontWeight: "600" }],
        "nav-link": ["16px", { lineHeight: "100%", letterSpacing: "-0.02em", fontWeight: "700" }],
        "nav-cta": ["16px", { lineHeight: "110%", letterSpacing: "0", fontWeight: "600" }],
        "banner-text": ["16px", { lineHeight: "100%", letterSpacing: "-0.02em", fontWeight: "600" }],
      },
      spacing: {
        // Consistent spacing scale
        "4.5": "1.125rem",
        "18": "4.5rem",
        "88": "22rem",
      },
      borderRadius: {
        DEFAULT: "6px",
        lg: "8px",
        xl: "12px",
      },
      boxShadow: {
        // Custom shadows matching Framer design
        card: "0 1px 5px -4px rgba(19,22,22,0.7) inset, 0 0 0 1px rgba(34,50,53,0.08), 0 4px 8px 0 rgba(34,50,53,0.05)",
        input: "0 0 0 1px #E3E6E8",
        "input-focus": "0 0 0 2px #019FB7",
      },
      maxWidth: {
        "8xl": "1440px",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "slide-in-left": "slideInLeft 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInRight: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
