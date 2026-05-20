import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'English Flashcards',
    short_name: 'Flashcards',
    description: 'Learn English vocabulary with interactive flashcards',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f9fafb',
    theme_color: '#4f46e5',
    categories: ['education', 'utilities'],
    icons: [
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    screenshots: [],
  };
}
