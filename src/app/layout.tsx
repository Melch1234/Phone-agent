import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tour Agent AI — Never miss an after-hours call again',
  description: 'AI voice agent for adventure tour operators. Answers calls 24/7, captures leads, and delivers a morning briefing to your team.',
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
