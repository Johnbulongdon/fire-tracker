import type { Metadata } from "next";
import Link from "next/link";
import { SavingsRateCalc } from "../_components/LearnCalc";

export const metadata: Metadata = {
  title: "Savings Rate Calculator — See How Fast You Can Reach FIRE (2025)",
  description:
    "Free savings rate calculator: see exactly how your savings rate determines your FIRE timeline. Compare 10% vs 50% vs 70% savings rates side by side.",
  keywords: "savings rate calculator, savings rate FIRE, how much to save, financial independence savings rate",
  openGraph: {
    title: "Savings Rate Calculator — How Your Rate Changes Everything",
    description: "See exactly how your savings rate determines when you can retire. Side-by-side comparison included.",
    url: "https://untilfire.com/learn/savings-rate-calculator",
  },
  alternates: { canonical: "https://untilfire.com/learn/savings-rate-calculator" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What savings rate do I need to retire early?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "To retire in under 20 years, you need a savings rate of 45–50% or higher. A 30% savings rate gets you there in about 28 years. The FIRE community often targets 50–70% savings rates, which creates timelines of 8–17 years. The key insight: a higher savings rate both increases your annual savings AND reduces your FIRE number (because you live on less).",
      },
    },
    {
      "@type": "Question",
      name: "How do I calculate my savings rate?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Savings rate = (Annual Savings ÷ Gross Annual Income) × 100. Annual Savings = Income − All Expenses. Example: $100,000 income, $60,000 expenses → $40,000 saved → 40% savings rate. Some FIRE practitioners calculate savings rate on take-home pay rather than gross income — both are valid, just be consistent.",
      },
    },
    {
      "@type": "Question",
      name: "Is a 50% savings rate realistic?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A 50% savings rate is achievable for many people, especially those with higher incomes in lower cost-of-living areas, couples with dual incomes, or those who are aggressive about housing and car costs (the two biggest expenses). In high cost-of-living cities like NYC or SF, 30–40% is more realistic for average earners. The geographic arbitrage strategy — earning a US salary while living abroad — makes 60–70%+ easily achievable.",
      },
    },
    {
      "@type": "Question",
      name: "Does it matter where I invest my savings?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes significantly. The order matters: (1) 401(k)/403(b) up to employer match — free money, (2) HSA if available — triple tax advantage, (3) Roth IRA — tax-free growth, (4) 401(k) to max — tax-deferred, (5) taxable brokerage. This sequence maximizes tax efficiency. The difference between random savings and optimized account placement can add years of tax-free compounding.",
      },
    },
  ],
};

const C = {
  border: "#1c1c2e",
  text: "#e8e8f2",
  muted: "#5e5e7a",
  accent: "#f97316",
  teal: "#22d3a5",
  card: "#13131e",
};

function H2({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 16, marginTop: 0, letterSpacing: "-0.02em" }}>{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p style={{ color: C.muted, lineHeight: 1.75, marginBottom: 14, marginTop: 0, fontSize: 15 }}>{children}</p>;
}

export default function SavingsRateCalculatorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 12, color: C.accent, fontWeight: 600, marginBottom: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Free Calculator
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: C.text, lineHeight: 1.15, marginBottom: 14, marginTop: 0, letterSpacing: "-0.03em" }}>
          Savings Rate Calculator — Your Rate Determines Your Retirement Date
        </h1>
        <p style={{ fontSize: 17, color: C.muted, lineHeight: 1.6, marginTop: 0 }}>
          Your savings rate is the single most powerful variable in FIRE planning. Adjust the slider and watch your retirement date shift dramatically — see rates from 10% to 70% compared side by side.
        </p>
      </div>

      <SavingsRateCalc defaultIncome={100_000} defaultSavingsRate={30} />

      <div style={{ marginBottom: 40 }}>
        <H2>Why Savings Rate Matters More Than Income</H2>
        <P>
          Two people both earn $100,000. Person A saves 10% ($10k/year) and retires in 46 years. Person B saves 50% ($50k/year) and retires in 17 years — working 29 fewer years. Person A earns the same income but works nearly 3× as long.
        </P>
        <P>
          The mechanics: a higher savings rate works on both sides of the FIRE equation simultaneously. Saving more accelerates portfolio growth. Spending less reduces your FIRE number. These two effects compound on each other, producing non-linear improvements in retirement timeline.
        </P>
        <P>
          The two biggest levers are <strong style={{ color: C.text }}>housing</strong> and <strong style={{ color: C.text }}>transportation</strong>. In most US cities, housing alone consumes 30–40% of take-home pay. Optimizing here — buying vs. renting strategically, house hacking, geoarbitraging to a lower-COL city — can shift savings rate by 10–15 percentage points, shaving 5–10 years off your FIRE timeline.
        </P>
      </div>

      <div style={{ marginBottom: 40 }}>
        <H2>The Investment Account Order of Operations</H2>
        <P>
          Where you put your savings matters enormously for tax efficiency. The standard FIRE community order:
        </P>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[
            { step: "1", account: "401(k) — up to employer match", why: "Immediate 50–100% return on investment via matching. Never skip this." },
            { step: "2", account: "HSA (if eligible)", why: "Triple tax advantage: tax-deductible contributions, tax-free growth, tax-free withdrawals for medical." },
            { step: "3", account: "Roth IRA ($7,000/yr limit)", why: "Tax-free growth forever. Contributions can be withdrawn penalty-free anytime — excellent for early retirees." },
            { step: "4", account: "401(k) — up to annual max ($23,000)", why: "Tax-deferred growth. Use Rule 72(t) or Roth conversion ladder for early access." },
            { step: "5", account: "Taxable brokerage account", why: "Unlimited contributions. Long-term capital gains rates (0–20%) favor early retirees with low income." },
          ].map(({ step, account, why }) => (
            <div key={step} style={{ display: "flex", gap: 16, padding: "14px 0", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: C.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{step}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>{account}</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{why}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 40 }}>
        <H2>Frequently Asked Questions</H2>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {faqSchema.mainEntity.map((item, i) => (
            <details key={i} style={{ borderBottom: `1px solid ${C.border}`, padding: "16px 0" }}>
              <summary style={{ fontSize: 15, fontWeight: 600, color: C.text, cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between" }}>
                {item.name}
                <span style={{ color: C.accent, marginLeft: 8 }}>+</span>
              </summary>
              <p style={{ color: C.muted, lineHeight: 1.7, fontSize: 14, marginTop: 12, marginBottom: 0 }}>
                {item.acceptedAnswer.text}
              </p>
            </details>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 40 }}>
        <H2>Related Calculators</H2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { href: "/learn/fire-calculator", label: "🔥 FIRE Calculator", sub: "Full retirement timeline" },
            { href: "/learn/coast-fire-calculator", label: "🏄 Coast FIRE Calculator", sub: "Find your stop-saving milestone" },
            { href: "/learn/4-percent-rule", label: "📐 4% Rule Explained", sub: "Safe withdrawal science" },
            { href: "/learn/fire-in-bali", label: "🇮🇩 Geo Arbitrage: Bali", sub: "60%+ savings rate made easy" },
          ].map(({ href, label, sub }) => (
            <Link key={href} href={href} style={{ textDecoration: "none", background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", display: "block" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{sub}</div>
            </Link>
          ))}
        </div>
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28, textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>Track your savings rate in real-time</div>
        <div style={{ color: C.muted, fontSize: 14, marginBottom: 20 }}>Connect income and expense tracking. Watch your savings rate update live as you log transactions.</div>
        <Link href="/dashboard" style={{ background: C.accent, color: "#fff", padding: "12px 28px", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 15, display: "inline-block" }}>
          Open Dashboard →
        </Link>
      </div>
    </>
  );
}
