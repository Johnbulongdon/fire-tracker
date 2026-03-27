import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'UntilFire — Find Your FIRE Number & Retire Early'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#08080e',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Background radial glow */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 700,
            height: 500,
            background:
              'radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 70%)',
            borderRadius: '50%',
            display: 'flex',
          }}
        />

        {/* Wordmark */}
        <div
          style={{
            position: 'absolute',
            top: 48,
            left: 64,
            fontSize: 24,
            fontWeight: 700,
            color: '#e8e8f2',
            display: 'flex',
          }}
        >
          Until
          <span style={{ color: '#f97316' }}>Fire</span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            color: '#e8e8f2',
            lineHeight: 1.05,
            letterSpacing: '-2px',
            textAlign: 'center',
            maxWidth: 900,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span>Find your</span>
          <span style={{ color: '#f97316' }}>FIRE number.</span>
        </div>

        {/* Subhead */}
        <div
          style={{
            marginTop: 28,
            fontSize: 28,
            color: '#6e6e8e',
            textAlign: 'center',
            display: 'flex',
          }}
        >
          Free calculator · 263 cities · 60 seconds
        </div>

        {/* CTA pill */}
        <div
          style={{
            marginTop: 52,
            padding: '16px 40px',
            background: '#f97316',
            borderRadius: 14,
            fontSize: 24,
            fontWeight: 600,
            color: '#fff',
            display: 'flex',
          }}
        >
          Calculate mine →
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 18,
            color: '#3a3a5a',
            display: 'flex',
          }}
        >
          untilfire.com
        </div>
      </div>
    ),
    { ...size }
  )
}
