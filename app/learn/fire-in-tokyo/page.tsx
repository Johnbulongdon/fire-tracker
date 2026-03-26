import type { Metadata } from "next";
import Link from "next/link";
import { StandardCalc } from "../_components/LearnCalc";

export const metadata: Metadata = {
  title: "FIRE in Tokyo: Cost of Living & Early Retirement Guide (2025)",
  description:
    "How much do you need to retire early in Tokyo? See real cost-of-living data, calculate your FIRE number for Japan, and compare Tokyo to other FIRE destinations.",
  keywords: "FIRE Tokyo, retire early Japan, financial independence Tokyo, cost of living Tokyo, FIRE number Japan",
  openGraph: {
    title: "FIRE in Tokyo: Your FIRE Number for Japan",
    description: "Calculate how much you need to retire early in Tokyo. Real cost data + instant calculator.",
    url: "https://untilfire.com/learn/fire-in-tokyo",
  },
  alternates: { canonical: "https://untilfire.com/learn/fire-in-tokyo" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How much do I need to retire early in Tokyo?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A comfortable single-person life in Tokyo costs roughly $4,500–$5,500/month (~$57,000/year). Using the 4% rule, your FIRE number is 25× annual expenses — approximately $1.4 million USD. Couples typically need $80,000–100,000/year, so $2–2.5M.",
      },
    },
    {
      "@type": "Question",
      name: "Is Tokyo a good city for FIRE?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tokyo is moderately FIRE-friendly. Rent is much cheaper than San Francisco or London for comparable quality, food is excellent value (ramen from $6, conveyor sushi under $20), and public transit is world-class at ~$100–130/month. Healthcare is affordable under the national health insurance system. The main challenge is the language barrier and 18% effective tax rate.",
      },
    },
    {
      "@type": "Question",
      name: "What is the monthly cost of living in Tokyo for a foreigner?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Typical monthly costs: Rent $1,200–2,200 (1BR, central Tokyo), Food $500–700 (mix of cooking and eating out), Transport $100–130 (IC card), Utilities $100–150, Entertainment/misc $300–500. Total: $2,200–3,700/month. Comfortable lifestyle: ~$4,000–4,800/month.",
      },
    },
    {
      "@type": "Question",
      name: "Can I retire in Tokyo on a $1 million portfolio?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A $1M portfolio at a 4% withdrawal rate generates $40,000/year — tight for central Tokyo but feasible with careful budgeting, especially in surrounding areas like Saitama or Kanagawa where rent drops 30–40%. Many early retirees in Tokyo supplement with part-time English teaching (~$20–30/hr) to bridge the gap.",
      },
    },
    {
      "@type": "Question",
      name: "What visa allows long-term residence in Japan for retirees?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Japan does not have a dedicated retirement visa. Common options include the Highly Skilled Professional Visa (if you qualify), the Business Manager Visa (if you run a business), or maintaining Permanent Residency after 10 years. Some early retirees cycle through tourist visas (90 days) or obtain residency via a spouse. Japan's immigration rules are strict — consult an immigration lawyer.",
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

function Section({ children }: { children: React.ReactNode }) {
  return <div style={{ marginBottom: 40 }}>{children}</div>;
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 16, marginTop: 0, letterSpacing: "-0.02em" }}>
      {children}
    </h2>
  );
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

export default function FireInTokyo() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 12, color: C.accent, fontWeight: 600, marginBottom: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          🇯🇵 FIRE Destination Guide
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: C.text, lineHeight: 1.15, marginBottom: 14, marginTop: 0, letterSpacing: "-0.03em" }}>
          FIRE in Tokyo: How Much Do You Actually Need?
        </h1>
        <p style={{ fontSize: 17, color: C.muted, lineHeight: 1.6, marginTop: 0 }}>
          Tokyo is world-class city living at a fraction of San Francisco or London prices — but how does it stack up for financial independence? Here&apos;s the real cost breakdown and your personalized FIRE number.
        </p>
      </div>

      {/* Calculator */}
      <StandardCalc
        defaultIncome={120_000}
        defaultExpenses={57_600}
        defaultSavings={0}
        title="🇯🇵 FIRE Calculator — Tokyo Cost of Living"
      />

      {/* Cost breakdown */}
      <Section>
        <H2>Monthly Cost of Living in Tokyo (2025)</H2>
        <P>
          Tokyo is expensive by Asian standards but genuinely affordable compared to Western mega-cities. A foreigner living comfortably in central Tokyo (Shibuya, Shinjuku, Minato) typically spends $3,800–$5,000/month. In outer wards like Suginami or Adachi, costs drop 20–30%.
        </P>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "4px 20px 4px", marginBottom: 20 }}>
          <CostRow item="🏠 Rent — 1BR central Tokyo" low="$1,200" high="$2,200" />
          <CostRow item="🍜 Food & dining" low="$500" high="$800" />
          <CostRow item="🚇 Transportation (IC card)" low="$100" high="$140" />
          <CostRow item="⚡ Utilities (electric, gas, water)" low="$90" high="$160" />
          <CostRow item="📱 Phone + internet" low="$60" high="$90" />
          <CostRow item="🏥 Health insurance (NHI)" low="$120" high="$200" />
          <CostRow item="🎌 Entertainment & misc" low="$300" high="$600" />
        </div>
        <div style={{ background: "#0a1a12", border: `1px solid #166534`, borderRadius: 10, padding: "14px 18px" }}>
          <span style={{ color: C.teal, fontWeight: 700 }}>Total: $2,370–$4,190/month</span>
          <span style={{ color: C.muted, fontSize: 13 }}> · Comfortable lifestyle: ~$4,000–$4,800/month · Annual: $48,000–$57,600</span>
        </div>
      </Section>

      {/* Context */}
      <Section>
        <H2>Is Tokyo Right for Your FIRE Plan?</H2>
        <P>
          Tokyo rewards the patient optimizer. The transit system is unmatched — your $120/month IC card gets you anywhere in the metropolitan area faster than a car. Groceries at a neighborhood supermarket are remarkably cheap: sashimi for $4, seasonal vegetables for cents, and the convenience store (konbini) culture means excellent ready-made meals for $3–5.
        </P>
        <P>
          The city&apos;s healthcare system is a genuine advantage for early retirees. Japan&apos;s National Health Insurance (Kokumin Kenkō Hoken) covers 70% of medical costs, with premiums income-tested — retirees with minimal declared income pay as little as $100–200/month. Compared to US out-of-pocket costs, this alone can justify the move.
        </P>
        <P>
          The main friction: residency. Japan has no retirement visa. Most long-term foreign residents maintain status through work visas, business registration, or marriage. Some early retirees structure a small consulting business (gyōmu itaku) to maintain legal status while living on portfolio income. Immigration law is strict — always consult a lawyer.
        </P>
        <P>
          The yen&apos;s weakness since 2022 has created an extraordinary window for dollar-denominated investors. At current exchange rates, the Tokyo lifestyle costs significantly less in USD terms than historical averages suggest. This may normalize — plan conservatively.
        </P>
      </Section>

      {/* Tokyo vs comparison */}
      <Section>
        <H2>Tokyo vs. Other FIRE Cities</H2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr>
                {["City", "Monthly Cost", "Annual Cost", "FIRE Number", "Visa Ease"].map((h) => (
                  <th key={h} style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, textAlign: "left", color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["🇯🇵 Tokyo", "$4,800", "$57,600", "$1.44M", "Difficult"],
                ["🇭🇰 Hong Kong", "$6,000", "$72,000", "$1.80M", "Moderate"],
                ["🇵🇹 Lisbon", "$3,000", "$36,000", "$900k", "Easy (D7)"],
                ["🇮🇩 Bali", "$2,000", "$24,000", "$600k", "Moderate"],
                ["🇨🇴 Medellín", "$2,000", "$24,000", "$600k", "Easy"],
              ].map(([city, mo, yr, fire, visa]) => (
                <tr key={city}>
                  {[city, mo, yr, fire, visa].map((cell, i) => (
                    <td key={i} style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, color: i === 0 ? C.text : i === 3 ? C.teal : C.muted }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* FAQ */}
      <Section>
        <H2>Frequently Asked Questions</H2>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {faqSchema.mainEntity.map((item, i) => (
            <details
              key={i}
              style={{ borderBottom: `1px solid ${C.border}`, padding: "16px 0" }}
            >
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
      </Section>

      {/* Internal links */}
      <Section>
        <H2>Continue Exploring</H2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { href: "/learn/fire-in-bali", label: "🇮🇩 FIRE in Bali", sub: "$600k FIRE number" },
            { href: "/learn/fire-in-lisbon", label: "🇵🇹 FIRE in Lisbon", sub: "$900k FIRE number + D7 visa" },
            { href: "/learn/fire-in-hong-kong", label: "🇭🇰 FIRE in Hong Kong", sub: "$1.8M FIRE number" },
            { href: "/learn/fire-in-medellin", label: "🇨🇴 FIRE in Medellín", sub: "$600k FIRE number" },
            { href: "/learn/fire-calculator", label: "🔥 FIRE Calculator", sub: "Full projection tool" },
            { href: "/learn/4-percent-rule", label: "📐 The 4% Rule Explained", sub: "Safe withdrawal rate guide" },
          ].map(({ href, label, sub }) => (
            <Link key={href} href={href} style={{ textDecoration: "none", background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", display: "block" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{sub}</div>
            </Link>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28, textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>Track your progress to FIRE in Tokyo</div>
        <div style={{ color: C.muted, fontSize: 14, marginBottom: 20 }}>Log income and expenses, watch your net worth grow, and see your FIRE date move closer in real-time.</div>
        <Link href="/dashboard" style={{ background: C.accent, color: "#fff", padding: "12px 28px", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 15, display: "inline-block" }}>
          Open Dashboard →
        </Link>
      </div>
    </>
  );
}
