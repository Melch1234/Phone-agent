export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ringo — Never miss an after-hours call again',
  description: 'Ringo answers your phone after hours, captures every booking enquiry, and delivers a morning briefing to your team. Built for tour operators.',
  metadataBase: new URL('https://www.ringo.travel'),
  openGraph: {
    title: 'Ringo — Never miss an after-hours call again',
    description: 'Your guests don\'t keep office hours. Now you don\'t have to either.',
    url: 'https://www.ringo.travel',
    siteName: 'Ringo',
    type: 'website',
    images: [{ url: 'https://raw.githubusercontent.com/Melch1234/Phone-agent/main/public/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ringo — Never miss an after-hours call again',
    description: 'Your guests don\'t keep office hours. Now you don\'t have to either.',
    images: ['https://raw.githubusercontent.com/Melch1234/Phone-agent/main/public/og-image.jpg'],
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
      <body>
        {children}
        <Script id="tawk-to" strategy="afterInteractive">{`
          var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
          Tawk_API.onLoad = function(){
            Tawk_API.hideWidget();
            Tawk_API.setAttributes({'site': 'ringo.travel'}, function(){});
          };
          (function(){
            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='https://embed.tawk.to/67dc977d113676190b1f4092/1imqqvgn0';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
          })();
        `}</Script>
      </body>
    </html>
  )
}
