import type { Metadata } from "next";
import Link from "next/link";
import { FireNumberCalc } from "../_components/LearnCalc";

export const metadata: Metadata = {
  title: "What Is Your FIRE Number? Calculate Financial Independence Target (2025)",
  description:
    "Calculate your personal FIRE number — the exact amount you need invested to retire early. Includes income-specific guides from $50k to $1M salary.",
  keywords: "FIRE number, what is FIRE number, financial independence number, how much to retire, FIRE target calculator",
  openGraph: {
    title: "What Is Your FIRE Number? Calculate It Now",
    description: "Find your exact FIRE number based on your income and lifestyle. Instant calculator + income-specific guides.",
    url: "https://untilfire.com/learn/fire-number",
  },
  alternates: { canonical: "https://untilfire.com/learn/fire-number" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a FIRE number?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Your FIRE number is the total amount of invested assets you need to retire early and live off portfolio income indefinitely. It's calculated using the 4% rule: FIRE number = annual expenses × 25. Example: if you spend $60,000/year, your FIRE number is $1,500,000. At this amount, a 4% annual withdrawal covers your expenses.",
      },
    },
    {
      "@type": "Question",
      name: "How long does it take to reach your FIRE number?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Timeline depends almost entirely on your savings rate. At 10% savings: ~46 years. At 30%: ~28 years. At 50%: ~17 years. At 70%: ~8 years. The math is counterintuitive: a higher savings rate both accelerates your portfolio growth AND reduces your FIRE number (because spending less means a lower target). Both effects compound on each other.",
      },
    },
    {
      "@type": "Question",
      name: "Is the 4% rule (25× expenses) accurate?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The 4% rule has strong historical support for 30-year retirements. For early retirees with 40–50 year horizons, 3.5% (28.6× expenses) provides more safety. The choice matters: at $60k/year, 4% → $1.5M FIRE number vs. 3.5% → $1.72M. The extra $220k substantially reduces failure risk over 50 years.",
      },
    },
    {
      "@type": "Question",
      name: "Should my FIRE number include my house?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No — your home equity should NOT count toward your FIRE number if you plan to live there. Your FIRE number represents liquid invested assets that generate the income you live on. Home equity is illiquid and doesn't produce cash flow. If you plan to downsize and release equity, or move to a lower cost-of-living area, you can factor that separately.",
      },
    },
    {
      "@type": "Question",
      name: "What counts toward my FIRE number?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Liquid invested assets count: 401(k), Roth IRA, traditional IRA, 403(b), HSA, taxable brokerage accounts, and rental property equity (if you plan to sell or count rental income). Cash and emergency funds are separate. Home equity (if you plan to stay) doesn't count. Rule of thumb: if it generates passive income or can be liquidated to fund retirement, it counts.",
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

export default function FireNumberPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 12, color: C.accent, fontWeight: 600, marginBottom: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          FIRE Fundamentals
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: C.text, lineHeight: 1.15, marginBottom: 14, marginTop: 0, letterSpacing: "-0.03em" }}>
          What Is Your FIRE Number? The Complete Guide
        </h1>
        <p style={{ fontSize: 17, color: C.muted, lineHeight: 1.6, marginTop: 0 }}>
          Your FIRE number is the single most important figure in financial independence planning. Enter your numbers below for a personalized calculation — then read the guide to understand exactly what it means and how to reach it faster.
        </p>
      </div>

      <FireNumberCalc defaultIncome={100_000} defaultExpenses={60_000} label="Calculate Your FIRE Number" />

      <div style={{ marginBottom: 40 }}>
        <H2>What the FIRE Number Means</H2>
        <P>
          Your FIRE number is the portfolio value at which a 4% annual withdrawal covers your living expenses indefinitely. The math: 4% of your portfolio = your annual spending. Rearranged: portfolio = annual spending ÷ 4% = annual spending × 25.
        </P>
        <P>
          The 4% withdrawal rate comes from the Trinity Study (1998), which found that portfolios of 50–75% stocks historically survived all 30-year periods at this rate. The portfolio doesn&apos;t deplete — in most historical scenarios, it grows substantially.
        </P>
        <P>
          The critical insight most people miss: <strong style={{ color: C.text }}>your FIRE number is determined by your spending, not your income.</strong> A person earning $300k but spending $200k needs a $5 million FIRE number. A person earning $80k but spending $40k needs a $1 million FIRE number — and gets there in a fraction of the time.
        </P>
      </div>

      <div style={{ marginBottom: 40 }}>
        <H2>FIRE Numbers by Income — Find Your Guide</H2>
        <P>Each guide below calculates FIRE numbers for specific income levels, including taxes, realistic savings rates, and timelines.</P>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
          {[
            { href: "/learn/fire-number/50000-income", income: "$50,000", fireNum: "$625k–$875k" },
            { href: "/learn/fire-number/75000-income", income: "$75,000", fireNum: "$625k–$1.1M" },
            { href: "/learn/fire-number/100000-income", income: "$100,000", fireNum: "$750k–$1.5M" },
            { href: "/learn/fire-number/125000-income", income: "$125,000", fireNum: "$875k–$1.875M" },
            { href: "/learn/fire-number/150000-income", income: "$150,000", fireNum: "$1M–$2.25M" },
            { href: "/learn/fire-number/175000-income", income: "$175,000", fireNum: "$1.1M–$2.6M" },
            { href: "/learn/fire-number/200000-income", income: "$200,000", fireNum: "$1.25M–$3M" },
            { href: "/learn/fire-number/250000-income", income: "$250,000", fireNum: "$1.5M–$3.75M" },
            { href: "/learn/fire-number/500000-income", income: "$500,000", fireNum: "$2.5M–$7.5M" },
            { href: "/learn/fire-number/1000000-income", income: "$1,000,000", fireNum: "$5M–$15M" },
          ].map(({ href, income, fireNum }) => (
            <Link key={href} href={href} style={{ textDecoration: "none", background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", display: "block" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.teal, marginBottom: 2 }}>{income} income</div>
              <div style={{ fontSize: 12, color: C.muted }}>FIRE: {fireNum}</div>
            </Link>
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
        <H2>More FIRE Tools</H2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { href: "/learn/fire-calculator", label: "🔥 FIRE Calculator", sub: "Full retirement timeline" },
            { href: "/learn/coast-fire-calculator", label: "🏄 Coast FIRE Calculator", sub: "Your stop-saving milestone" },
            { href: "/learn/savings-rate-calculator", label: "📊 Savings Rate", sub: "Rate vs. years comparison" },
            { href: "/learn/4-percent-rule", label: "📐 4% Rule Explained", sub: "Safe withdrawal science" },
          ].map(({ href, label, sub }) => (
            <Link key={href} href={href} style={{ textDecoration: "none", background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", display: "block" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{sub}</div>
            </Link>
          ))}
        </div>
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28, textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>Track your distance to your FIRE number</div>
        <div style={{ color: C.muted, fontSize: 14, marginBottom: 20 }}>Connect your real accounts. Watch the gap between your current net worth and your FIRE number close in real-time.</div>
        <Link href="/dashboard" style={{ background: C.accent, color: "#fff", padding: "12px 28px", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 15, display: "inline-block" }}>
          Open Dashboard →
        </Link>
      </div>
    </>
  );
}
