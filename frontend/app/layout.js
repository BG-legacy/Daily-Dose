import { Nunito } from 'next/font/google';
import './globals.css';

import AuthProvider from './contexts/authContext/authIndex';
import ToastProvider from './contexts/toastContext/toastContext';

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
});

export const metadata = {
  title: 'Daily Dose | Mental Health & Wellness App',
  description:
    'Discover personalized tools to boost your mental health, track your mood, and stay motivated—all in one place.',
  openGraph: {
    title: 'Daily Dose | Mental Health & Wellness App',
    description:
      'Discover personalized tools to boost your mental health, track your mood, and stay motivated—all in one place.',
    image: '/social.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body
        className={`${nunito.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
