import type { Metadata } from 'next'
import BaristaFIRECalculatorClient from './BaristaFIRECalculatorClient'

export const metadata: Metadata = {
  title: 'Barista FIRE Calculator — Part-Time Work + Portfolio | UntilFire',
  description:
    'Calculate your Barista FIRE number. Find out how much you need saved so part-time income covers your expenses gap — and your portfolio covers the rest. Free Barista FIRE calculator.',
  keywords:
    'barista fire calculator, barista FIRE number, barista fire financial independence, semi-retirement calculator, partial fire calculator',
  openGraph: {
    title: 'Barista FIRE Calculator — Semi-Retirement Planning',
    description:
      'How much do you need saved to go part-time and let your portfolio cover the rest? Calculate your Barista FIRE number in seconds.',
    url: 'https://untilfire.com/barista-fire-calculator',
    siteName: 'UntilFire',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Barista FIRE Calculator',
    description:
      'Find your Barista FIRE number — go part-time and let your portfolio cover the expenses gap.',
  },
  alternates: {
    canonical: 'https://untilfire.com/barista-fire-calculator',
  },
}

export default function BaristaFIREPage() {
  return <BaristaFIRECalculatorClient />
}
