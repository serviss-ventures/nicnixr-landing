import './globals.css'
import type { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'NixR - Quit Nicotine with AI Recovery Coach | Break Free Today',
  description: 'Join thousands quitting nicotine with NixR\'s AI-powered recovery coach. Track progress, save money, connect with community. Available on iOS & Android. Start your nicotine-free journey today.',
  keywords: ['quit smoking', 'quit vaping', 'nicotine addiction', 'stop smoking app', 'quit nicotine', 'recovery coach', 'AI coach', 'cigarette tracker', 'vape tracker', 'nicotine replacement', 'smoking cessation', 'health tracking'],
  authors: [{ name: 'NixR Team' }],
  creator: 'NixR, Inc.',
  publisher: 'NixR, Inc.',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://nixr.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'NixR - Your AI-Powered Quit Coach',
    description: 'Break free from nicotine with personalized AI support, community, and real-time health tracking. Join thousands who\'ve reclaimed their freedom.',
    url: 'https://nixr.com',
    siteName: 'NixR',
    images: [
      {
        url: '/og-image.png', // You'll need to create this
        width: 1200,
        height: 630,
        alt: 'NixR - Quit Nicotine App',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NixR - Quit Nicotine with AI Recovery Coach',
    description: 'The AI-powered app that helps you quit nicotine for good. Track progress, save money, get 24/7 support.',
    site: '@nixrapp',
    creator: '@nixrapp',
    images: ['/twitter-image.png'], // You'll need to create this
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Add when you have it
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#667eea',
      },
    ],
  },
  manifest: '/manifest.json',
}

// Structured data for better SEO
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'MobileApplication',
  name: 'NixR',
  operatingSystem: 'iOS, Android',
  applicationCategory: 'HealthApplication',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '1250',
  },
  description: 'AI-powered nicotine recovery coach app with 24/7 support, progress tracking, and community features.',
  screenshot: 'https://nixr.com/screenshots/main.png',
  author: {
    '@type': 'Organization',
    name: 'NixR, Inc.',
    url: 'https://nixr.com',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#667eea" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-black via-[#0A0F1C] to-[#0F172A] text-white antialiased">
        {children}
      </body>
    </html>
  )
} 