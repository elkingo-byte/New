import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'NovaMovies — Premium Streaming', template: '%s | NovaMovies' },
  description: 'Watch the latest movies in HD, 4K and more. NovaMovies — Your premium streaming destination.',
  keywords: ['movies', 'streaming', 'watch online', 'HD', '4K', 'NovaMovies'],
  authors: [{ name: 'NovaMovies' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://novamoviess.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'NovaMovies',
    title: 'NovaMovies — Premium Streaming',
    description: 'Watch the latest movies in HD quality.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NovaMovies',
    description: 'Premium movie streaming platform',
    images: ['/og-image.jpg'],
  },
  manifest: '/manifest.json',
  themeColor: '#000000',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="bg-nova-black text-nova-text antialiased">
        {children}
      </body>
    </html>
  );
}
