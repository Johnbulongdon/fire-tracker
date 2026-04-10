import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Free Financial Calculators — APY, FIRE, Compound Interest | UntilFire',
  description:
    'Free financial calculators for FIRE planning: APY calculator, compound interest calculator, savings rate calculator, Coast FIRE calculator, and 4% rule calculator. No login, no ads.',
  keywords:
    'financial calculators, APY calculator, compound interest calculator, savings rate calculator, coast FIRE calculator, 4 percent rule calculator, FIRE number calculator',
  alternates: { canonical: 'https://untilfire.com/calculators' },
  openGraph: {
    title: 'Free Financial Calculators | UntilFire',
    description: 'APY, compound interest, savings rate, Coast FIRE, and 4% rule calculators — all free.',
    url: 'https://untilfire.com/calculators',
    siteName: 'UntilFire',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Financial Calculators | UntilFire',
    description: 'APY, compound interest, savings rate, Coast FIRE, and 4% rule — all free.',
  },
}

const CALCULATORS = [
  {
    slug: 'apy',
    title: 'APY Calculator',
    description: 'Convert APR to APY and see exactly how compounding frequency affects your real return.',
    tag: 'Savings',
    color: '#22d3a5',
    label: '%',
  },
  {
    slug: 'compound-interest',
    title: 'Compound Interest Calculator',
    description: 'Project how your investments grow with regular contributions over any time horizon.',
    tag: 'Investing',
    color: '#f97316',
    label: '↗',
  },
  {
    slug: 'savings-rate',
    title: 'Savings Rate Calculator',
    description: 'Find your savings rate and see exactly how it shifts your FIRE date — the single most powerful FIRE lever.',
    tag: 'FIRE · Core',
    color: '#f97316',
    label: 'SR',
  },
  {
    slug: 'coast-fire',
    title: 'Coast FIRE Calculator',
    description: 'Find the magic number where you can stop saving and let compound growth carry you to retirement.',
    tag: 'FIRE · Strategy',
    color: '#8b5cf6',
    label: '~',
  },
  {
    slug: '4-percent-rule',
    title: 'FIRE Number Calculator',
    description: 'Calculate exactly how much you need to retire. Adjust the withdrawal rate and see how it changes your target.',
    tag: 'FIRE · Retirement',
    color: '#f97316',
    label: 'FI',
  },
]

const C = {
  bg: '#08080e',
  card: '#13131e',
  border: '#1c1c2e',
  text: '#e8e8f2',
  muted: '#5e5e7a',
  mutedLight: '#9090a8',
  accent: '#f97316',
  teal: '#22d3a5',
}

export default function CalculatorsPage() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text, fontFamily: 'sans-serif' }}>
      {/* Nav */}
      <nav
        style={{
          borderBottom: `1px solid ${C.border}`,
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: 1100,
          margin: '0 auto',
        }}
      >
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
          <span style={{ color: C.text, fontWeight: 800, fontSize: 18, letterSpacing: '-1px' }}>Until</span>
          <span style={{ color: C.accent, fontWeight: 800, fontSize: 18, letterSpacing: '-1px' }}>Fire</span>
        </Link>
        <Link
          href="/"
          style={{
            color: C.accent,
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 600,
            border: `1px solid ${C.accent}`,
            padding: '6px 14px',
            borderRadius: 6,
          }}
        >
          Get my FIRE number →
        </Link>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '56px 24px 32px', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-block',
            background: '#1a1a0e',
            border: `1px solid ${C.accent}22`,
            color: C.accent,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            padding: '4px 12px',
            borderRadius: 999,
            marginBottom: 20,
          }}
        >
          Free Tools
        </div>
        <h1
          style={{
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 800,
            letterSpacing: '-2px',
            margin: '0 0 16px',
            lineHeight: 1.1,
          }}
        >
          Financial Calculators
        </h1>
        <p style={{ fontSize: 18, color: C.mutedLight, maxWidth: 560, margin: '0 auto 48px', lineHeight: 1.6 }}>
          Every tool you need for your FIRE journey — from understanding compound interest
          to figuring out exactly when you can stop saving.
        </p>
      </div>

      {/* Calculator grid */}
      <div
        style={{
          maxWidth: 1000,
          margin: '0 auto',
          padding: '0 24px 80px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 20,
        }}
      >
        {CALCULATORS.map((calc) => (
          <Link
            key={calc.slug}
            href={`/calculators/${calc.slug}`}
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: '28px 24px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                transition: 'border-color 0.15s',
                cursor: 'pointer',
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: `${calc.color}18`,
                  border: `1px solid ${calc.color}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 15,
                  fontWeight: 800,
                  color: calc.color,
                  letterSpacing: '-1px',
                }}
              >
                {calc.label}
              </div>

              {/* Tag */}
              <div style={{ fontSize: 11, fontWeight: 700, color: calc.color, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                {calc.tag}
              </div>

              {/* Title */}
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: C.text, letterSpacing: '-0.5px' }}>
                {calc.title}
              </h2>

              {/* Description */}
              <p style={{ fontSize: 14, color: C.mutedLight, margin: 0, lineHeight: 1.6, flexGrow: 1 }}>
                {calc.description}
              </p>

              {/* CTA */}
              <div style={{ fontSize: 13, color: calc.color, fontWeight: 600, marginTop: 4 }}>
                Open calculator →
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom CTA */}
      <div
        style={{
          borderTop: `1px solid ${C.border}`,
          padding: '48px 24px',
          textAlign: 'center',
        }}
      >
        <p style={{ color: C.mutedLight, marginBottom: 20, fontSize: 16 }}>
          Want a personalised FIRE date adjusted for your city and income?
        </p>
        <Link
          href="/"
          style={{
            background: C.accent,
            color: '#fff',
            fontWeight: 700,
            fontSize: 16,
            padding: '14px 32px',
            borderRadius: 8,
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Get my FIRE number — free →
        </Link>
      </div>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Financial Calculators',
            description: 'Free financial calculators for FIRE planning',
            url: 'https://untilfire.com/calculators',
            itemListElement: CALCULATORS.map((calc, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: calc.title,
              url: `https://untilfire.com/calculators/${calc.slug}`,
            })),
          }),
        }}
      />
    </div>
  )
}
