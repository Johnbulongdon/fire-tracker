import FireWizard from './_components/FireWizard'

export default function Home() {
  return (
    <>
      <FireWizard />

      {/* FAQ section — server-rendered so Google indexes it. Visible below the wizard. */}
      <section
        aria-label="Frequently asked questions about FIRE"
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
          Frequently asked questions
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
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
              How do I calculate my FIRE number?
            </h3>
            <p style={{ fontSize: 14, color: '#9090b0', lineHeight: 1.6, margin: 0 }}>
              Multiply your expected annual retirement expenses by 25. For example, if you plan to
              spend $50,000 per year in retirement, your FIRE number is $1,250,000. UntilFire
              adjusts this for your specific city&apos;s cost of living across 263 cities worldwide.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#e8e8f2', marginBottom: 8 }}>
              What is the 4% rule for retirement?
            </h3>
            <p style={{ fontSize: 14, color: '#9090b0', lineHeight: 1.6, margin: 0 }}>
              The 4% rule states that you can safely withdraw 4% of your investment portfolio each
              year in retirement without depleting it over 30 years. It comes from the 1994 Trinity
              Study. Your FIRE number is your target portfolio — typically 25x your annual expenses.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#e8e8f2', marginBottom: 8 }}>
              How long does it take to reach financial independence?
            </h3>
            <p style={{ fontSize: 14, color: '#9090b0', lineHeight: 1.6, margin: 0 }}>
              Time to financial independence depends almost entirely on your savings rate, not your
              income. Saving 10% of income takes roughly 40+ years; saving 50% takes around 17
              years; saving 70% can get you there in under 9 years, assuming a 7% annual return.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#e8e8f2', marginBottom: 8 }}>
              Does cost of living really change my FIRE number?
            </h3>
            <p style={{ fontSize: 14, color: '#9090b0', lineHeight: 1.6, margin: 0 }}>
              Significantly. Someone retiring in Austin, TX needs roughly $1.2M; someone in San
              Francisco may need $2.5M+ for the same lifestyle. UntilFire uses real cost-of-living
              data for 263 cities so your projection reflects where you actually plan to live.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#e8e8f2', marginBottom: 8 }}>
              Is UntilFire free?
            </h3>
            <p style={{ fontSize: 14, color: '#9090b0', lineHeight: 1.6, margin: 0 }}>
              Yes. The FIRE number calculator is completely free with no account required. It takes
              about 60 seconds to get your personalised result. An optional paid FIRE adviser
              feature is coming soon for those who want a month-by-month action plan.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
