/**
 * Reusable style constants for the Law4Us application
 * Use these to maintain consistency across components
 */

import { CSSProperties } from 'react';

// Typography Styles
export const TYPOGRAPHY = {
  heroH1: {
    fontSize: '80px',
    fontWeight: 'bold' as const,
    lineHeight: '100%',
    letterSpacing: '-0.04em',
    color: '#0C1719',
  },
  heroSubtitle: {
    fontSize: '24px',
    fontWeight: 500,
    lineHeight: '130%',
    letterSpacing: '-0.04em',
    color: '#0C1719',
  },
  eyebrow: {
    fontSize: '16px',
    fontWeight: 600,
    lineHeight: '100%',
    letterSpacing: '-0.02em',
  },
  navLink: {
    fontSize: '16px',
    fontWeight: 'bold' as const,
    lineHeight: '100%',
    letterSpacing: '-0.02em',
    color: '#0C1719',
  },
  bannerText: {
    fontSize: '16px',
    fontWeight: 600,
    lineHeight: '100%',
    letterSpacing: '-0.02em',
    color: '#0C1719',
  },
} as const;

// CTA Button Styles
export const CTA_STYLES = {
  main: {
    backgroundColor: '#019FB7',
    border: '0.5px solid #018DA2',
    borderRadius: '6px',
    color: '#EEF2F3',
    paddingLeft: '32px',
    paddingRight: '32px',
    paddingTop: '16px',
    paddingBottom: '16px',
    fontSize: '18px',
    fontWeight: 600,
    lineHeight: '120%',
    letterSpacing: '0',
  },
  secondary: {
    backgroundColor: '#EEF2F3',
    border: '0.5px solid #018DA2',
    borderRadius: '6px',
    color: '#0C1719',
    paddingLeft: '32px',
    paddingRight: '32px',
    paddingTop: '16px',
    paddingBottom: '16px',
    fontSize: '18px',
    fontWeight: 600,
    lineHeight: '120%',
    letterSpacing: '0',
    boxShadow: '0 0 0 4px rgba(1, 159, 183, 0.2)',
  },
  nav: {
    backgroundColor: '#019FB7',
    border: '0.5px solid #018DA2',
    borderRadius: '4px',
    color: 'white',
    paddingLeft: '16px',
    paddingRight: '16px',
    paddingTop: '12px',
    paddingBottom: '12px',
    fontSize: '16px',
    fontWeight: 600,
    lineHeight: '110%',
    letterSpacing: '0',
  },
} as const satisfies Record<string, CSSProperties>;

// Banner/Badge Styles
export const BANNER_STYLES = {
  box: {
    backgroundColor: '#FFFFFF',
    border: '1px solid rgba(12, 23, 25, 0.1)',
    borderRadius: '2px',
    paddingLeft: '12px',
    paddingRight: '12px',
    paddingTop: '8px',
    paddingBottom: '8px',
  },
} as const;

// Color Palette
export const COLORS = {
  primary: {
    main: '#019FB7',
    dark: '#018DA2',
    light: '#B8D7DD',
  },
  neutral: {
    black: '#0C1719',
    darkGray: '#515F61',
    mediumGray: '#E3E6E8',
    lightGray: '#EEF2F3',
    lightestGray: '#F9FAFB',
  },
} as const;
