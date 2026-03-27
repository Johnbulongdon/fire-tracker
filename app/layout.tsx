import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Script from 'next/script'
import { AuthProvider } from '../lib/auth-context'
import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Until FIRE — Know When You Can Retire',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48', type: 'image/x-icon' },
      { url: '/icon.png',    sizes: '512x512',            type: 'image/png'    },
    ],
    shortcut: '/favicon.ico',
    apple:    '/icon.png',
  },
  description:
    'See how fast you can reach financial independence with real-time projections.',
  keywords:
    'FIRE calculator, financial independence, retire early, FIRE number, savings rate calculator',
  openGraph: {
    title: 'Until FIRE — Know When You Can Retire',
    description: 'See how fast you can reach financial independence with real-time projections.',
    url: 'https://untilfire.com',
    siteName: 'UntilFire',
    type: 'website',
    images: [{ url: '/api/og', width: 1200, height: 630, alt: 'Until FIRE — Retire in 12 Years' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Until FIRE — Know When You Can Retire',
    description: 'See how fast you can reach financial independence with real-time projections.',
    images: ['/api/og'],
  },
  metadataBase: new URL('https://untilfire.com'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Existing script (keep) */}
        <Script id="remove-extension-attributes" strategy="beforeInteractive">
          {`
            document.addEventListener('DOMContentLoaded', function() {
              document.body.removeAttribute('cz-shortcut-listen')
              document.body.removeAttribute('g_installed')
            })
          `}
        </Script>
      </head>

      <body
        className={`${inter.className} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          {children}

          <Toaster position="top-right" />

          {/* Vercel Analytics */}
          <Analytics />

          <Script
  src="https://www.googletagmanager.com/gtag/js?id=G-L8EQM1LL1S"
  strategy="afterInteractive"
/>

<Script id="ga4-init" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-L8EQM1LL1S');
  `}
</Script>

          {/* Ahrefs Analytics */}
          <Script
            src="https://analytics.ahrefs.com/analytics.js"
            data-key="FiPq4kEv/tSkbCGk1licIA"
            strategy="afterInteractive"
          />
        </AuthProvider>
      </body>
    </html>
  )
}
