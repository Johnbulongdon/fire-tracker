import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Script from 'next/script'
import { AuthProvider } from '../lib/auth-context'
import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ['latin'] })

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'UntilFire FIRE Calculator',
  url: 'https://untilfire.com',
  description: 'Calculate exactly when you can retire. Find your FIRE number adjusted for your city, income, and actual spending.',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'FIRE number calculator',
    'City-adjusted cost of living for 263 cities',
    'After-tax income calculation by US state',
    'Savings rate benchmarking',
    'Retirement year projection',
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is a FIRE number?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Your FIRE number is the total investment portfolio size you need to retire early. It is calculated as 25 times your annual expenses, based on the 4% safe withdrawal rate — the amount research shows you can withdraw each year without running out of money over a 30-year retirement.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I calculate my FIRE number?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Multiply your expected annual retirement expenses by 25. For example, if you plan to spend $50,000 per year in retirement, your FIRE number is $1,250,000. UntilFire adjusts this for your specific city\'s cost of living across 263 cities worldwide.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the 4% rule for retirement?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The 4% rule states that you can safely withdraw 4% of your investment portfolio each year in retirement without depleting it over 30 years. It comes from the 1994 Trinity Study. Your FIRE number is your target portfolio — typically 25x your annual expenses.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does it take to reach financial independence?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Time to financial independence depends almost entirely on your savings rate, not your income. Saving 10% of income takes roughly 40+ years; saving 50% takes around 17 years; saving 70% can get you there in under 9 years, assuming a 7% annual return.',
      },
    },
  ],
}

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Calculate Your FIRE Number',
  description: 'Calculate your financial independence number in 3 steps using your city, income, and savings rate.',
  step: [
    {
      '@type': 'HowToStep',
      name: 'Enter your retirement city',
      text: 'Choose the city where you plan to retire. UntilFire uses real cost-of-living data for 263 cities worldwide to calculate your actual annual expenses.',
    },
    {
      '@type': 'HowToStep',
      name: 'Enter your income',
      text: 'Enter your annual gross salary. UntilFire calculates your after-tax take-home income using real federal and state tax rates for US cities.',
    },
    {
      '@type': 'HowToStep',
      name: 'Enter your monthly savings',
      text: 'Enter how much you save each month. UntilFire projects your FIRE date based on 7% compound annual growth on your invested savings.',
    },
  ],
}

export const metadata: Metadata = {
  title: 'Free FIRE Calculator — Find Your FIRE Number & Retire Early | UntilFire',
  description:
    'Calculate exactly when you can retire. Find your FIRE number, track expenses, and see how small changes compound into years of freedom. Free FIRE calculator.',
  keywords:
    'FIRE calculator, financial independence, retire early, FIRE number, savings rate calculator',
  alternates: {
    canonical: 'https://untilfire.com',
  },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
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
