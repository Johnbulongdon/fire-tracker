import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Script from 'next/script'
import { AuthProvider } from '../lib/auth-context'
import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'UntilFire — Find Your FIRE Number & Retire Early',
  description: 'Calculate exactly when you can retire. Find your FIRE number, track expenses, and see how small changes compound into years of freedom. Free FIRE calculator.',
  keywords: 'FIRE calculator, financial independence, retire early, FIRE number, savings rate calculator',
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
        <Script id="remove-extension-attributes" strategy="beforeInteractive">
          {`
            document.addEventListener('DOMContentLoaded', function() {
              document.body.removeAttribute('cz-shortcut-listen')
              document.body.removeAttribute('g_installed')
            })
          `}
        </Script>
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <AuthProvider>
          {children}
          <Toaster position="top-right" />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  )
}
