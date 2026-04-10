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
    title: `FIRE timeline for ${safeCity} — retire by ${year}`,
    description: `${years} years away on a typical income. Free calculator — find out when you could retire in your city.`,
    openGraph: {
      title: `FIRE timeline for ${safeCity} — retire by ${year}`,
      description: `${years} years away on a typical income. Free calculator — find out when you could retire in your city.`,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: `Retire in ${safeCity} by ${year}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `FIRE timeline for ${safeCity} — retire by ${year}`,
      description: `${years} years away on a typical income. Free calculator — find out when you could retire in your city.`,
      images: [ogUrl],
    },
  }
}

export default async function SharePage({ searchParams }: Props) {
  const { city = 'Your City', year = '', years = '' } = await searchParams
  const safeCity = city.slice(0, 40)
  const yearsNum = parseInt(years, 10) || 0

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#08080e',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
        padding: '40px 24px',
        color: '#e8e8f2',
      }}
    >
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
        {/* Logo */}
        <div style={{ marginBottom: 48, fontSize: 20, fontWeight: 800, letterSpacing: '-1px' }}>
          <span style={{ color: '#e8e8f2' }}>Until</span>
          <span style={{ color: '#f97316' }}>Fire</span>
        </div>

        {/* City label */}
        <p style={{ fontSize: 14, color: '#9090a8', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8 }}>
          Retire in
        </p>
        <h1 style={{ fontSize: 48, fontWeight: 800, margin: '0 0 4px', color: '#e8e8f2' }}>
          {safeCity}
        </h1>
        <p style={{ fontSize: 64, fontWeight: 800, color: '#f97316', margin: '0 0 12px', letterSpacing: '-2px' }}>
          by {year}
        </p>
        <p style={{ fontSize: 18, color: '#9090a8', margin: '0 0 48px' }}>
          {yearsNum > 0 ? `${yearsNum} years away` : ''} · based on a typical income
        </p>

        {/* Divider */}
        <div style={{ height: 1, background: '#1e1e2e', marginBottom: 40 }} />

        {/* CTA */}
        <p style={{ fontSize: 18, color: '#9090a8', marginBottom: 24 }}>
          What does your city look like?
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            background: '#f97316',
            color: '#fff',
            fontWeight: 700,
            fontSize: 18,
            padding: '14px 36px',
            borderRadius: 8,
            textDecoration: 'none',
          }}
        >
          Calculate yours — free →
        </Link>
        <p style={{ fontSize: 13, color: '#5e5e7a', marginTop: 16 }}>
          No login required. Takes 60 seconds.
        </p>
      </div>
    </main>
  )
}
