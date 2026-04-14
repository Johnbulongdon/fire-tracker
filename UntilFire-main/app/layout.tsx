import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Script from 'next/script'
import { AuthProvider } from '../lib/auth-context'
import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Free FIRE Calculator — Find Your Financial Independence Number | UntilFire',
  description:
    'Free FIRE calculator. Find your exact FIRE number, see when you can retire early, and discover how city-adjusted cost of living changes your date by years. Takes 60 seconds.',
  keywords:
    'FIRE calculator, coast fire calculator, barista fire calculator, financial independence calculator, retire early calculator, FIRE number, savings rate calculator',
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
        className={`${inter.className} antialiased`}
        suppressHydrationWarning
      >
        {/* Structured Data: SoftwareApplication + WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'SoftwareApplication',
                  name: 'UntilFire FIRE Calculator',
                  applicationCategory: 'FinanceApplication',
                  operatingSystem: 'Web',
                  url: 'https://untilfire.com',
                  description:
                    'Free FIRE calculator. Find your financial independence number, track progress, and see how small changes move your retirement date by years.',
                  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
                  provider: {
                    '@type': 'Organization',
                    name: 'UntilFire',
                    url: 'https://untilfire.com',
                  },
                },
                {
                  '@type': 'WebSite',
                  name: 'UntilFire',
                  url: 'https://untilfire.com',
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: 'https://untilfire.com/learn/{search_term_string}',
                    'query-input': 'required name=search_term_string',
                  },
                },
              ],
            }),
          }}
        />
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
