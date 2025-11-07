'use client';

import { useEffect } from 'react';
import { animations } from '@/lib/utils/animations';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onClose: (id: string) => void;
}

const variantStyles = {
  success: {
    bg: '#10B981',
    border: '#059669',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" fill="white"/>
      </svg>
    ),
  },
  error: {
    bg: '#EF4444',
    border: '#DC2626',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z" fill="white"/>
      </svg>
    ),
  },
  info: {
    bg: '#019FB7',
    border: '#018DA2',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V9H11V15ZM11 7H9V5H11V7Z" fill="white"/>
      </svg>
    ),
  },
  warning: {
    bg: '#F59E0B',
    border: '#D97706',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M1 17H19L10 1L1 17ZM11 14H9V12H11V14ZM11 10H9V6H11V10Z" fill="white"/>
      </svg>
    ),
  },
};

export function Toast({ id, message, variant = 'info', duration = 5000, onClose }: ToastProps) {
  const styles = variantStyles[variant];

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg shadow-2xl animate-slide-in-right ${animations.cardHover}`}
      style={{
        backgroundColor: styles.bg,
        border: `1px solid ${styles.border}`,
        minWidth: '320px',
        maxWidth: '420px',
      }}
      role="alert"
      aria-live="polite"
    >
      <div className="flex-shrink-0 mt-0.5">
        {styles.icon}
      </div>

      <div className="flex-1 text-right">
        <p style={{
          color: 'white',
          fontSize: '16px',
          fontWeight: 500,
          lineHeight: '1.5',
          margin: 0,
        }}>
          {message}
        </p>
      </div>

      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 ml-2 hover:opacity-70 transition-opacity"
        aria-label="סגור התראה"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M12.5 3.5L3.5 12.5M3.5 3.5L12.5 12.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}
