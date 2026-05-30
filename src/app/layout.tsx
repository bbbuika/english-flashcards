import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { DiscordProvider } from '@/components/DiscordProvider';
import { LanguageProvider } from '@/components/LanguageContext';

const serif = Cormorant_Garamond({
  variable: '--font-serif',
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
});

const mono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  themeColor: '#0e0a07',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
};

export const metadata: Metadata = {
  title: 'Gölgeli Sona Bir Adım',
  description:
    'Kadim Türkler temalı çok oyunculu hikaye kartı oyunu. A multiplayer storytelling card game with Ancient Turkish mythology.',
  applicationName: 'Gölgeli Sona Bir Adım',
  appleWebApp: {
    capable: true,
    title: 'Akit',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: { telephone: false },
  keywords: ['storytelling', 'card game', 'turkish mythology', 'hikaye', 'tarot'],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`${serif.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-stone-950 text-amber-50">
        <DiscordProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </DiscordProvider>
      </body>
    </html>
  );
}
