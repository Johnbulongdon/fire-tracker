import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const rawCity = searchParams.get('city') ?? 'Your City'
  const city = rawCity.slice(0, 40)
  const year = searchParams.get('year') ?? String(new Date().getFullYear() + 15)
  const rawYears = parseInt(searchParams.get('years') ?? '15', 10)
  const years = Math.max(1, Math.min(40, rawYears))

  return new ImageResponse(
    (
      <div
        style={{
          background: '#08080e',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
          padding: '52px 72px',
        }}
      >
        {/* Background glow — top-right */}
        <div
          style={{
            position: 'absolute',
            width: 700,
            height: 700,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 65%)',
            top: -200,
            right: -200,
            display: 'flex',
          }}
        />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#e8e8f2', fontSize: 22, fontWeight: 800, letterSpacing: '-1px' }}>
            Until
          </span>
          <span style={{ color: '#f97316', fontSize: 22, fontWeight: 800, letterSpacing: '-1px' }}>
            Fire
          </span>
        </div>

        {/* Main content — left-aligned */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: '#9090a8',
              textTransform: 'uppercase',
              letterSpacing: '3px',
              display: 'flex',
            }}
          >
            Retire in
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: '#e8e8f2',
              lineHeight: 1,
              display: 'flex',
            }}
          >
            {city}
          </div>
          <div
            style={{
              fontSize: 80,
              fontWeight: 800,
              color: '#f97316',
              lineHeight: 1,
              letterSpacing: '-3px',
              display: 'flex',
            }}
          >
            by {year}
          </div>
          <div
            style={{
              fontSize: 22,
              color: '#9090a8',
              marginTop: 12,
              display: 'flex',
            }}
          >
            {years} year{years !== 1 ? 's' : ''} away · free calculator
          </div>
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#22d3a5',
                display: 'flex',
              }}
            />
            <span style={{ color: '#e8e8f2', fontSize: 20 }}>
              What does your city look like?
            </span>
          </div>
          <span style={{ color: '#22d3a5', fontSize: 20, fontWeight: 600 }}>
            untilfire.com →
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
