import { Metadata } from 'next'
import FourPercentRuleCalculator from './FourPercentRuleCalculator'

export const metadata: Metadata = {
  title: '4% Rule Calculator — How Much Do You Need to Retire? | UntilFire',
  description:
    'Free 4% rule calculator. Enter your annual retirement expenses and see your exact FIRE number. Compare withdrawal rates from 3% to 5% and see how it affects how much you need to retire.',
  keywords:
    '4 percent rule calculator, FIRE number calculator, safe withdrawal rate calculator, how much do I need to retire, retirement calculator, 25x rule calculator, SWR calculator',
  alternates: { canonical: 'https://untilfire.com/calculators/4-percent-rule' },
  openGraph: {
    title: '4% Rule Calculator — How Much Do You Need to Retire? | UntilFire',
    description: 'Calculate your FIRE number using the safe withdrawal rate. Adjust the rate and see the impact.',
    url: 'https://untilfire.com/calculators/4-percent-rule',
    siteName: 'UntilFire',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '4% Rule Calculator | UntilFire',
    description: 'Calculate your FIRE number. Adjust the withdrawal rate and see how it changes.',
  },
}

export default function FourPercentRulePage() {
  return (
    <>
      <FourPercentRuleCalculator />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: '4% Rule Calculator',
            description: 'Calculate your FIRE number using safe withdrawal rates from 3% to 5%.',
            url: 'https://untilfire.com/calculators/4-percent-rule',
            applicationCategory: 'FinanceApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://untilfire.com' },
                { '@type': 'ListItem', position: 2, name: 'Calculators', item: 'https://untilfire.com/calculators' },
                { '@type': 'ListItem', position: 3, name: '4% Rule Calculator', item: 'https://untilfire.com/calculators/4-percent-rule' },
              ],
            },
          }),
        }}
      />
    </>
  )
}
