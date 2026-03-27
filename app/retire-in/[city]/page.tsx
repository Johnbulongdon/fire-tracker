import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { CITIES } from '@/lib/fire-data'
import FireWizard from '@/app/_components/FireWizard'

export async function generateStaticParams() {
  return CITIES.map((city) => ({ city: city.key }))
}

export async function generateMetadata({
  params,
}: {
  params: { city: string }
}): Promise<Metadata> {
  const city = CITIES.find((c) => c.key === params.city)
  if (!city) return {}

  const fireTarget = city.col * 25
  const fireTargetK = Math.round(fireTarget / 1000)
  const colK = Math.round(city.col / 1000)

  return {
    title: `FIRE Number Calculator for ${city.name} — Retire in ${city.name} | UntilFire`,
    description: `Calculate how much you need to retire in ${city.name}. Estimated annual cost of living: $${colK}k/yr. FIRE target: $${fireTargetK}k. Adjust for your income and savings rate — free, takes 60 seconds.`,
    alternates: {
      canonical: `https://untilfire.com/retire-in/${city.key}`,
    },
    openGraph: {
      title: `Retire in ${city.name} — FIRE Number Calculator`,
      description: `FIRE target for ${city.name}: $${fireTargetK}k. Free calculator adjusted for local cost of living.`,
      url: `https://untilfire.com/retire-in/${city.key}`,
      siteName: 'UntilFire',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Retire in ${city.name} — FIRE Calculator`,
      description: `How much do you need to retire in ${city.name}? FIRE target: $${fireTargetK}k. Free calculator.`,
    },
  }
}

export default function CityPage({ params }: { params: { city: string } }) {
  const city = CITIES.find((c) => c.key === params.city)
  if (!city) notFound()

  const fireTarget = city.col * 25
  const fireTargetFmt = '$' + Math.round(fireTarget).toLocaleString()
  const colFmt = '$' + Math.round(city.col).toLocaleString()

  return (
    <>
      {/* Server-rendered SEO content */}
      <div
        style={{
          background: '#08080e',
          padding: '48px 24px 0',
          maxWidth: 720,
          margin: '0 auto',
        }}
      >
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: '#e8e8f2',
            marginBottom: 12,
            letterSpacing: '-0.5px',
            lineHeight: 1.2,
          }}
        >
          {city.flag} FIRE Number Calculator for {city.name}
        </h1>
        <p style={{ fontSize: 15, color: '#9090b0', lineHeight: 1.6, marginBottom: 8 }}>
          To retire in <strong style={{ color: '#e8e8f2' }}>{city.name}</strong>, you need an
          estimated{' '}
          <strong style={{ color: '#f97316' }}>{fireTargetFmt}</strong> invested — based on{' '}
          <strong style={{ color: '#e8e8f2' }}>{colFmt}/year</strong> in living costs and the 4%
          withdrawal rule. Enter your income and savings below to get your exact retirement date.
        </p>
      </div>

      {/* Interactive wizard — client component */}
      <FireWizard />

      {/* City-specific FAQ — server-rendered */}
      <section
        aria-label={`FIRE calculator FAQ for ${city.name}`}
        style={{
          background: '#0d0d1a',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '64px 24px',
          maxWidth: 720,
          margin: '0 auto',
        }}
      >
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: '#e8e8f2',
            marginBottom: 32,
            letterSpacing: '-0.3px',
          }}
        >
          Retiring in {city.name} — Common questions
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#e8e8f2', marginBottom: 8 }}>
              How much do I need to retire in {city.name}?
            </h3>
            <p style={{ fontSize: 14, color: '#9090b0', lineHeight: 1.6, margin: 0 }}>
              Based on an estimated cost of living of {colFmt}/year in {city.name}, your FIRE
              target is approximately {fireTargetFmt} — calculated using the 25× rule (25 times
              annual expenses). Your actual number depends on your specific lifestyle and savings
              rate.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#e8e8f2', marginBottom: 8 }}>
              What is a FIRE number?
            </h3>
            <p style={{ fontSize: 14, color: '#9090b0', lineHeight: 1.6, margin: 0 }}>
              Your FIRE number is the total investment portfolio you need to retire early. It is
              calculated as 25 times your annual expenses, based on the 4% safe withdrawal rate —
              the amount research shows you can withdraw each year without running out of money over
              a 30-year retirement.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#e8e8f2', marginBottom: 8 }}>
              How does location affect my FIRE number?
            </h3>
            <p style={{ fontSize: 14, color: '#9090b0', lineHeight: 1.6, margin: 0 }}>
              Significantly. Cost of living varies by 3–4× between the most expensive and most
              affordable cities. {city.name} has an estimated annual cost of living of {colFmt},
              which directly sets your FIRE target. Choosing a lower cost-of-living city can cut
              years off your retirement timeline.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#e8e8f2', marginBottom: 8 }}>
              Is the UntilFire calculator free?
            </h3>
            <p style={{ fontSize: 14, color: '#9090b0', lineHeight: 1.6, margin: 0 }}>
              Yes. The FIRE number calculator is completely free with no account required. It takes
              about 60 seconds and is pre-loaded with cost-of-living data for {city.name}.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
