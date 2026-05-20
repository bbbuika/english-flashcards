import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
};

export const metadata: Metadata = {
  title: 'English Flashcards',
  description: 'Learn English vocabulary with interactive flashcards — flip cards, track progress, study anytime.',
  applicationName: 'English Flashcards',
  appleWebApp: {
    capable: true,
    title: 'Flashcards',
    statusBarStyle: 'default',
  },
  formatDetection: { telephone: false },
  keywords: ['english', 'flashcards', 'vocabulary', 'learning', 'turkish'],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
