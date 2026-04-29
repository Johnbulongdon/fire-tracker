import { Metadata } from 'next'
import Link from 'next/link'

interface Props {
  searchParams: Promise<{ city?: string; year?: string; years?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { city = 'Your City', year = '', years = '' } = await searchParams
  const safeCity = city.slice(0, 40)
  const ogUrl = `/api/og?city=${encodeURIComponent(safeCity)}&year=${encodeURIComponent(year)}&years=${encodeURIComponent(years)}`

  return {
    title: `FIRE timeline for ${safeCity} | UntilFire`,
    description: `${years} years away on a typical income. Free calculator - find out when you could retire in your city.`,
    openGraph: {
      title: `FIRE timeline for ${safeCity}`,
      description: `${years} years away on a typical income. Free calculator - find out when you could retire in your city.`,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: `Retire in ${safeCity} by ${year}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `FIRE timeline for ${safeCity}`,
      description: `${years} years away on a typical income. Free calculator - find out when you could retire in your city.`,
      images: [ogUrl],
    },
  }
}

export default async function SharePage({ searchParams }: Props) {
  const { city = 'Your City', year = '', years = '' } = await searchParams
  const safeCity = city.slice(0, 40)
  const yearsNum = parseInt(years, 10) || 0

  return (
    <main className="uf-app-frame">
      <div className="uf-app-shell" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <section
          className="uf-surface"
          style={{
            width: '100%',
            maxWidth: 700,
            padding: 40,
            textAlign: 'center',
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fcf9 100%)',
          }}
        >
          <div className="uf-chip" style={{ marginBottom: 18 }}>Shareable FIRE snapshot</div>
          <div style={{ fontSize: 14, color: 'var(--color-gray-500)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
            Retire in
          </div>
          <h1 style={{ margin: '12px 0 6px', fontSize: 'clamp(2.4rem, 5vw, 4.4rem)', letterSpacing: '-0.05em', lineHeight: 0.98 }}>
            {safeCity}
          </h1>
          <div style={{ fontSize: 'clamp(2rem, 5vw, 3.8rem)', fontWeight: 800, color: 'var(--color-primary-600)', letterSpacing: '-0.05em' }}>
            by {year || 'your target year'}
          </div>
          <p style={{ margin: '16px 0 30px', color: 'var(--color-gray-500)', fontSize: 17 }}>
            {yearsNum > 0 ? `${yearsNum} years away based on a typical income.` : 'See how city, savings rate, and expenses shape the timeline.'}
          </p>

          <div
            style={{
              margin: '0 auto 28px',
              maxWidth: 520,
              padding: 22,
              borderRadius: 20,
              background: 'linear-gradient(135deg, var(--color-primary-900), var(--color-primary-700))',
              color: '#ffffff',
            }}
          >
            <div style={{ fontSize: 13, opacity: 0.72, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
              UntilFire projection
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', marginTop: 10 }}>
              Your city. Your numbers. Your timeline.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/" className="uf-primary-button">Calculate yours</Link>
            <Link href="/learn" className="uf-secondary-button">Visit learning hub</Link>
          </div>
        </section>
      </div>
    </main>
  )
}
