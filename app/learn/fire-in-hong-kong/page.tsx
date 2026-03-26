import type { Metadata } from "next";
import Link from "next/link";
import { StandardCalc } from "../_components/LearnCalc";

export const metadata: Metadata = {
  title: "FIRE in Hong Kong: Cost of Living & Early Retirement Guide (2025)",
  description:
    "How much do you need to retire early in Hong Kong? Real cost-of-living data, FIRE number calculator for HK, and comparison to other Asian cities.",
  keywords: "FIRE Hong Kong, retire early HK, financial independence Hong Kong, cost of living Hong Kong",
  openGraph: {
    title: "FIRE in Hong Kong: Your FIRE Number for HK",
    description: "Calculate how much you need to retire early in Hong Kong. Real cost data + instant calculator.",
    url: "https://untilfire.com/learn/fire-in-hong-kong",
  },
  alternates: { canonical: "https://untilfire.com/learn/fire-in-hong-kong" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How much do I need to retire early in Hong Kong?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A comfortable single-person life in Hong Kong costs $5,000–7,000/month (~$72,000/year). Using the 4% rule (25× annual expenses), your FIRE number is approximately $1.8 million USD. Couples typically need $100,000–120,000/year, so $2.5–3M.",
      },
    },
    {
      "@type": "Question",
      name: "Is Hong Kong expensive for early retirees?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Hong Kong is one of the most expensive cities in Asia, primarily because of housing. A modest 400 sq ft apartment in Kowloon runs $1,800–2,500/month. However, food is surprisingly affordable — a full meal at a dai pai dong costs $5–8, and the MTR transit system is world-class at $150/month for unlimited travel.",
      },
    },
    {
      "@type": "Question",
      name: "What visa allows long-term stay in Hong Kong for retirees?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Hong Kong offers the Quality Migrant Admission Scheme (QMAS) for skilled professionals, and the Capital Investment Entrant Scheme requiring HK$30M (~$3.8M USD) investment. Many early retirees instead maintain BN(O) status (British National Overseas) if eligible, or cycle through 90-day visitor permits — though the latter is not technically legal for permanent residence.",
      },
    },
    {
      "@type": "Question",
      name: "How does Hong Kong's tax system benefit early retirees?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Hong Kong has a territorial tax system with no capital gains tax, no dividend tax, and no estate duty. If your income comes from investments held outside Hong Kong, you may owe zero HK tax. The standard salaries tax tops out at 15% for employment income. This makes HK very attractive for portfolio-income retirees.",
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
function CostRow({ item, low, high }: { item: string; low: string; high: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.border}`, alignItems: "center" }}>
      <span style={{ fontSize: 14, color: C.text }}>{item}</span>
      <span style={{ fontSize: 14, color: C.teal, fontWeight: 600 }}>{low} – {high}</span>
    </div>
  );
}

export default function FireInHongKong() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 12, color: C.accent, fontWeight: 600, marginBottom: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          🇭🇰 FIRE Destination Guide
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: C.text, lineHeight: 1.15, marginBottom: 14, marginTop: 0, letterSpacing: "-0.03em" }}>
          FIRE in Hong Kong: How Much Do You Actually Need?
        </h1>
        <p style={{ fontSize: 17, color: C.muted, lineHeight: 1.6, marginTop: 0 }}>
          Hong Kong offers zero capital gains tax, world-class infrastructure, and a gateway to Asia — but housing costs make it one of the priciest FIRE destinations. Here&apos;s the real breakdown.
        </p>
      </div>

      <StandardCalc
        defaultIncome={150_000}
        defaultExpenses={72_000}
        defaultSavings={0}
        title="🇭🇰 FIRE Calculator — Hong Kong Cost of Living"
      />

      <div style={{ marginBottom: 40 }}>
        <H2>Monthly Cost of Living in Hong Kong (2025)</H2>
        <P>
          Hong Kong&apos;s cost of living is defined by two extremes: expensive housing and affordable everything else. Food at street-level dai pai dong restaurants, public transit, and daily necessities are cheap by global standards. But rent in a livable apartment is brutally expensive.
        </P>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "4px 20px 4px", marginBottom: 20 }}>
          <CostRow item="🏠 Rent — 400 sq ft, Kowloon" low="$1,800" high="$2,800" />
          <CostRow item="🍜 Food & dining" low="$500" high="$900" />
          <CostRow item="🚇 MTR + bus (Octopus)" low="$130" high="$180" />
          <CostRow item="⚡ Utilities" low="$80" high="$140" />
          <CostRow item="📱 Phone + internet" low="$50" high="$80" />
          <CostRow item="🏥 Healthcare (private)" low="$200" high="$400" />
          <CostRow item="🎭 Entertainment & misc" low="$300" high="$600" />
        </div>
        <div style={{ background: "#0a1a12", border: `1px solid #166534`, borderRadius: 10, padding: "14px 18px" }}>
          <span style={{ color: C.teal, fontWeight: 700 }}>Total: $3,060–$5,100/month</span>
          <span style={{ color: C.muted, fontSize: 13 }}> · Comfortable lifestyle: ~$5,000–$6,500/month · Annual: $60,000–$78,000</span>
        </div>
      </div>

      <div style={{ marginBottom: 40 }}>
        <H2>Why Hong Kong Works for FIRE (Despite the Cost)</H2>
        <P>
          The tax regime is the killer feature. Hong Kong has no capital gains tax, no dividend tax, and no inheritance tax. If your FIRE portfolio generates returns outside HK, your effective tax rate may be zero. Compare this to the US (15–23.8% on qualified dividends) or the UK (10–20% CGT) — the savings compound dramatically over decades.
        </P>
        <P>
          The MTR subway is consistently ranked the world&apos;s best urban transit system. For $130–180/month, you can live anywhere in the New Territories or Kowloon, cut your rent by 30–40%, and still reach Central in 20 minutes. Many FIRE expats live in Sham Shui Po (authentic local neighborhood) or Tuen Mun (suburban, cheap) for this reason.
        </P>
        <P>
          Healthcare is a genuine wildcard. Public hospitals are heavily subsidized ($18/ER visit) but have long waits. Private care is expensive — budget $200–400/month for insurance covering private hospitals. Many FIRE expats maintain health insurance from their home country and use public care for routine matters.
        </P>
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
        <H2>Continue Exploring</H2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { href: "/learn/fire-in-tokyo", label: "🇯🇵 FIRE in Tokyo", sub: "$1.44M FIRE number" },
            { href: "/learn/fire-in-bali", label: "🇮🇩 FIRE in Bali", sub: "$600k FIRE number" },
            { href: "/learn/fire-in-lisbon", label: "🇵🇹 FIRE in Lisbon", sub: "$900k + D7 visa" },
            { href: "/learn/fire-calculator", label: "🔥 FIRE Calculator", sub: "Full projection tool" },
          ].map(({ href, label, sub }) => (
            <Link key={href} href={href} style={{ textDecoration: "none", background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", display: "block" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{sub}</div>
            </Link>
          ))}
        </div>
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28, textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>Track your path to FIRE in Hong Kong</div>
        <div style={{ color: C.muted, fontSize: 14, marginBottom: 20 }}>Log every dollar, watch your net worth grow, see your FIRE date in real-time.</div>
        <Link href="/dashboard" style={{ background: C.accent, color: "#fff", padding: "12px 28px", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 15, display: "inline-block" }}>
          Open Dashboard →
        </Link>
      </div>
    </>
  );
}
