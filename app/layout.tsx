import type { Metadata } from 'next'
import './globals.css'
import Script from 'next/script'
import { AuthProvider } from '../lib/auth-context'
import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/react'

export const metadata: Metadata = {
  title: 'UntilFire — Find Your FIRE Number & Retire Early',
  description:
    'Calculate exactly when you can retire. Find your FIRE number, track expenses, and see how small changes compound into years of freedom. Free FIRE calculator.',
  keywords:
    'FIRE calculator, financial independence, retire early, FIRE number, savings rate calculator',
  openGraph: {
    title: 'UntilFire — Find Your FIRE Number',
    description: 'Calculate exactly when you can retire. Takes 60 seconds.',
    url: 'https://untilfire.com',
    siteName: 'UntilFire',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UntilFire — Find Your FIRE Number',
    description: 'Calculate exactly when you can retire. Takes 60 seconds.',
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
        className="antialiased"
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
