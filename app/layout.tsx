import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Script from 'next/script'
import { AuthProvider } from '../lib/auth-context'
import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FIRE Calculator - Your Path to Financial Freedom',
  description: 'Calculate when you can achieve Financial Independence and Retire Early (FIRE) with our free calculator.',
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
