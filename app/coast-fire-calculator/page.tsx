import type { Metadata } from 'next'
import CoastFIRECalculatorClient from './CoastFIRECalculatorClient'

export const metadata: Metadata = {
  title: 'Coast FIRE Calculator — Find Your Coast Number | UntilFire',
  description:
    'Calculate your Coast FIRE number instantly. Enter your current savings, target retirement age, and expected return — see exactly how much you need invested today to never save another dollar.',
  keywords:
    'coast fire calculator, coast FIRE number, how to calculate coast fire, coast fire, financial independence coast fire',
  openGraph: {
    title: 'Coast FIRE Calculator — Find Your Coast Number',
    description:
      'How much do you need invested today to coast to retirement without saving another dollar? Calculate in seconds.',
    url: 'https://untilfire.com/coast-fire-calculator',
    siteName: 'UntilFire',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Coast FIRE Calculator',
    description:
      'Find your Coast FIRE number — the amount you need invested today to never save another dollar.',
  },
  alternates: {
    canonical: 'https://untilfire.com/coast-fire-calculator',
  },
}

export default function CoastFIREPage() {
  return <CoastFIRECalculatorClient />
}
