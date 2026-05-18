export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ringo — Never miss an after-hours call again',
  description: 'Ringo answers your phone after hours, captures every booking enquiry, and delivers a morning briefing to your team. Built for tour operators.',
  metadataBase: new URL('https://ringo.travel'),
  openGraph: {
    title: 'Ringo — Never miss an after-hours call again',
    description: 'Your guests don\'t keep office hours. Now you don\'t have to either.',
    url: 'https://ringo.travel',
    siteName: 'Ringo',
    type: 'website',
    images: [{ url: 'https://ringo.travel/api/og', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ringo — Never miss an after-hours call again',
    description: 'Your guests don\'t keep office hours. Now you don\'t have to either.',
    images: ['https://ringo.travel/api/og'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,400&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
