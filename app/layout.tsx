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
  description: 'Calculate exactly when you can retire...',
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

          {/* Ahrefs (force load) */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  var s = document.createElement('script');
                  s.src = 'https://analytics.ahrefs.com/analytics.js';
                  s.setAttribute('data-key', 'FiPq4kEv/tSkbCGk1licIA');
                  s.async = true;
                  document.head.appendChild(s);
                })();
              `,
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
