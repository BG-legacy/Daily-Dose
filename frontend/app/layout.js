import './globals.css';
import React from 'react';
import AuthProvider from './contexts/authContext/authIndex.js';
import ToastProvider from './contexts/toastContext/toastContext';

export const metadata = {
  title: 'Daily Dose',
  description: 'A daily dose of wellness and self-care',
  manifest: '/manifest.json',
  keywords: ['productivity', 'wellness', 'mental health'],
  openGraph: {
    title: 'Daily Dose',
    description: 'A daily dose of wellness and self-care',
    url: 'https://daily-dose.me',
    siteName: 'Daily Dose',
    images: [
      {
        url: 'https://daily-dose.me/og-image.png',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
};

// Web Vitals reporting function
export function reportWebVitals(metric) {
  // Check if we're in the browser
  if (typeof window !== 'undefined') {
    // Dynamically import to avoid SSR issues
    import('../lib/performance').then(({ trackWebVitals }) => {
      trackWebVitals(metric);
    }).catch(err => {
      console.error('Failed to load performance tracking:', err);
    });
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white">
        <ToastProvider>
        <AuthProvider>
            {children}
        </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
