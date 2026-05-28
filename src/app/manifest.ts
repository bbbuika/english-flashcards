import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Gölgeli Sona Bir Adım',
    short_name: 'Akit',
    description: 'Kadim Türkler temalı çok oyunculu hikaye kartı oyunu',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0e0a07',
    theme_color: '#0e0a07',
    categories: ['games', 'entertainment'],
    icons: [
      { src: '/icon', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
    screenshots: [],
  };
}
