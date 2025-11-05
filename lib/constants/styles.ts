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
  h2: {
    fontSize: '48px',
    fontWeight: 'bold' as const,
    lineHeight: '100%',
    letterSpacing: '-0.04em',
    color: '#0C1719',
    maxWidth: '500px',
    margin: '0 auto 24px',
  },
  h3: {
    fontSize: '24px',
    fontWeight: 500,
    letterSpacing: '-0.02em',
    lineHeight: '1.1em',
    color: '#0C1719',
    textAlign: 'right' as const,
    margin: 0,
    width: '100%',
  },
  subtitle: {
    fontSize: '20px',
    fontWeight: 500,
    lineHeight: '130%',
    letterSpacing: '-0.04em',
    color: '#515F61',
    maxWidth: '450px',
    margin: '0 auto',
  },
  bodyLarge: {
    fontSize: '18px',
    fontWeight: 500,
    lineHeight: '1.5em',
    color: '#515F61',
    textAlign: 'right' as const,
    margin: '0',
    width: '100%',
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

// Step Box Styles
export const STEP_BOX_STYLES = {
  container: {
    paddingTop: '24px',
    backgroundColor: '#F9FAFB',
    borderRadius: '12px',
    gap: '24px',
    boxShadow: 'inset 0 1px 5px -5px rgba(19, 22, 22, 0.7), 0 0 0 1px rgba(34, 50, 53, 0.078), 0 4px 8px rgba(34, 50, 53, 0.05)',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  numberBadge: {
    backgroundColor: '#e5e7eb',
    borderRadius: '100px',
    width: '38px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    color: '#0C1719',
    fontSize: '14px',
  },
  contentArea: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
  },
  headerSection: {
    paddingLeft: '24px',
    paddingRight: '24px',
    gap: '8px',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  imageAreaStep1: {
    borderRadius: '0 0 12px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingTop: '0',
    paddingBottom: '0',
    paddingRight: '48px',
    paddingLeft: '0',
  },
  imageAreaStep2: {
    borderRadius: '0 0 12px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingTop: '0',
    paddingBottom: '0',
    paddingRight: '24px',
    paddingLeft: '24px',
  },
  imageAreaStep3: {
    borderRadius: '0 0 12px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingTop: '0',
    paddingBottom: '0',
    paddingRight: '24px',
    paddingLeft: '24px',
  },
  textArea: {
    marginTop: '24px',
    backgroundColor: '#EEF2F3',
    borderRadius: '12px',
    padding: '16px',
    paddingLeft: '24px',
    paddingRight: '24px',
  },
} as const;

// Card Styles (reusable for any card-based section: benefits, testimonials, etc.)
export const CARD_STYLES = {
  container: {
    backgroundColor: '#F9FAFB',
    borderRadius: '12px',
    boxShadow: 'inset 0 1px 5px -5px rgba(19, 22, 22, 0.7), 0 0 0 1px rgba(34, 50, 53, 0.078), 0 4px 8px rgba(34, 50, 53, 0.05)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'start',
    gap: '24px',
  },
  iconCircle: {
    width: '48px',
    height: '48px',
    backgroundColor: '#F9FAFB',
    borderRadius: '100px',
    boxShadow: 'rgba(12, 23, 25, 0.2) 0px 1px 2px 1px, rgba(1, 159, 183, 0.1) 0px 0px 0px 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'start',
    gap: '8px',
  },
} as const;

// Backward compatibility alias (deprecated - use CARD_STYLES instead)
export const BENEFIT_CARD_STYLES = CARD_STYLES;

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
